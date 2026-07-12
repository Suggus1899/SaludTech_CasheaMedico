package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/bcv"
	"github.com/saludtech/backend-go/internal/config"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/admin"
	"github.com/saludtech/backend-go/internal/fakepay"
	"github.com/saludtech/backend-go/internal/merchant"
	"github.com/saludtech/backend-go/internal/patient"
	"github.com/saludtech/backend-go/internal/payment"
	"github.com/saludtech/backend-go/internal/user"
	"github.com/saludtech/backend-go/internal/worker"
)

func main() {
	cfg := config.Load()

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}

	if err := database.EnsureMigrations(context.Background(), pool, "sql/schema"); err != nil {
		log.Fatalf("Migration error: %v", err)
	}

	queries := database.New(pool)

	authHandler := &auth.AuthHandler{DB: queries, Cfg: cfg}

	scanner := &worker.InstallmentScanner{Pool: pool}
	scanner.Start()

	// Parse CORS origins from config
	allowedOrigins := strings.Split(cfg.CORSAllowedOrigins, ",")
	for i := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
	}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Auth middleware — extracts JWT and injects user_id into context
	r.Use(auth.Middleware(cfg))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK - Go Backend Running"))
	})

	// Auth routes (public)
	r.Post("/api/v1/auth/login", authHandler.Login)
	r.Post("/api/v1/auth/register", registerWithCreditLines(queries, authHandler))

	// Patient routes (protected)
	bcvClient := bcv.NewClient(cfg.DolarVZLAKey)
	fakePayClient := fakepay.NewClient(cfg.FakePayKey)
	patientHandler := &patient.PatientHandler{DB: queries, BCVClient: bcvClient, FakePay: fakePayClient}
	r.Route("/api/v1/patient", patientHandler.Routes())

	// Payment routes (protected — legacy endpoint)
	paymentHandler := &payment.PaymentHandler{DB: queries}
	r.With(auth.RequireAuth).Post("/api/v1/payments", paymentHandler.ProcessPayment)

	// Merchant routes (MERCHANT + ADMIN only)
	merchantHandler := &merchant.MerchantHandler{DB: queries}
	r.Group(func(mux chi.Router) {
		mux.Use(auth.RequireAuth, auth.RequireRole("MERCHANT", "ADMIN"))
		mux.Mount("/api/v1/merchant", merchantHandler.Routes())
	})

	// Admin routes (ADMIN only)
	adminHandler := &admin.AdminHandler{DB: queries}
	r.Group(func(mux chi.Router) {
		mux.Use(auth.RequireAuth, auth.RequireRole("ADMIN"))
		mux.Mount("/api/v1/admin", adminHandler.Routes())
	})

	// User routes (protected)
	userHandler := &user.UserHandler{DB: queries}
	r.With(auth.RequireAuth).Get("/api/v1/users/profile", userHandler.GetProfile)
	r.With(auth.RequireAuth).Patch("/api/v1/users/password", userHandler.ChangePassword)

	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

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

// registerWithCreditLines wraps the auth register handler and creates
// default credit lines for the new patient user.
func registerWithCreditLines(queries *database.Queries, h *auth.AuthHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Capture the response to get the user ID
		rec := &responseRecorder{ResponseWriter: w, statusCode: 200}
		h.Register(rec, r)

		if rec.statusCode != 201 {
			return
		}

		// Extract user ID from the response body
		var resp struct {
			User struct {
				ID string `json:"id"`
			} `json:"user"`
		}
		if err := json.Unmarshal(rec.body, &resp); err != nil || resp.User.ID == "" {
			return
		}

		uid, err := parseUUIDSafe(resp.User.ID)
		if err != nil {
			return
		}

		// Create default credit lines for the new patient
		defaultLines := []struct {
			typ   string
			limit float64
		}{
			{"ESPECIALIDAD_PRINCIPAL", 500},
			{"SALUD_COTIDIANA", 200},
			{"MAYOR_CUIDADO", 0},
		}

		for _, line := range defaultLines {
			var limitNumeric pgtype.Numeric
			limitNumeric.Scan(fmt.Sprintf("%.2f", line.limit))
			_, _ = queries.CreateCreditLine(r.Context(), database.CreateCreditLineParams{
				UserID:   uid,
				Type:     line.typ,
				LimitUsd: limitNumeric,
			})
		}

		log.Printf("✅ Created default credit lines for user %s", resp.User.ID)
	}
}

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
	body       []byte
}

func (r *responseRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	r.body = append(r.body, b...)
	return r.ResponseWriter.Write(b)
}

func parseUUIDSafe(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	err := u.Scan(s)
	return u, err
}
