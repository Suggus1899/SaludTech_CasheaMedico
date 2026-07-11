package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/config"
	"github.com/saludtech/backend-go/internal/credit"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/merchant"
	"github.com/saludtech/backend-go/internal/payment"
	"github.com/saludtech/backend-go/internal/user"
	"github.com/saludtech/backend-go/internal/worker"
)

func main() {
	// 1. Cargar Configuración
	cfg := config.Load()

	// 2. Conectar a PostgreSQL local
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	// 3. Conectar a Redis
	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Invalid Redis URL: %v", err)
	}
	rdb := redis.NewClient(opt)
	defer rdb.Close()
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Redis ping failed: %v", err)
	}
	log.Println("✅ Connected to Redis natively")

	// 4. Inicializar Repositorios (sqlc) y Handlers
	queries := database.New(pool)
	
	authHandler := &auth.AuthHandler{DB: queries, Cfg: cfg}
	creditService := &credit.CreditService{Pool: pool}
	creditHandler := &credit.CreditHandler{Service: creditService}

	// 5. Iniciar Background Workers (Cron)
	scanner := &worker.InstallmentScanner{DB: queries, Redis: rdb}
	scanner.Start()

	// 6. Configurar Router (go-chi)
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK - Go Backend Running"))
	})

	// Rutas de Autenticación
	r.Post("/api/v1/auth/login", authHandler.Login)
	r.Post("/api/v1/auth/register", authHandler.Register)

	// Rutas Financieras (Crédito)
	r.Post("/api/v1/credit/transaction", creditHandler.ProcessTransaction)

	// Rutas de Pagos
	paymentHandler := &payment.PaymentHandler{DB: queries}
	r.Post("/api/v1/payments", paymentHandler.ProcessPayment)

	// Rutas Merchant
	merchantHandler := &merchant.MerchantHandler{DB: queries}
	r.Get("/api/v1/merchant/payouts", merchantHandler.GetPayouts)

	// Rutas Usuarios
	userHandler := &user.UserHandler{DB: queries}
	r.Get("/api/v1/users/profile", userHandler.GetProfile)

	// 4. Levantar el Servidor
	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// Graceful Shutdown
	go func() {
		log.Printf("🚀 SaludTech Go Backend running on http://localhost%s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}
