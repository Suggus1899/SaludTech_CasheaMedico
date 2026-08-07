package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
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

	"github.com/saludtech/backend-go/internal/admin"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/bcv"
	"github.com/saludtech/backend-go/internal/config"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/docs"
	"github.com/saludtech/backend-go/internal/fakepay"
	"github.com/saludtech/backend-go/internal/logging"
	appmw "github.com/saludtech/backend-go/internal/middleware"
	"github.com/saludtech/backend-go/internal/merchant"
	"github.com/saludtech/backend-go/internal/monitoring"
	"github.com/saludtech/backend-go/internal/patient"
	"github.com/saludtech/backend-go/internal/user"
	"github.com/saludtech/backend-go/internal/worker"
)

func main() {
	cfg := config.Load()

	logger := logging.NewLogger(cfg.LogLevel)
	slog.SetDefault(logger)

	if cfg.SentryDSN != "" {
		if err := monitoring.InitSentry(cfg.SentryDSN); err != nil {
			slog.Error("Failed to init Sentry", "error", err)
		} else {
			slog.Info("Sentry initialized")
		}
	}

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		slog.Error("Unable to connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		slog.Error("Database ping failed", "error", err)
		os.Exit(1)
	}

	if err := database.EnsureMigrations(context.Background(), pool, "sql/schema", cfg.DBEncryptionKey); err != nil {
		slog.Error("Migration error", "error", err)
		os.Exit(1)
	}

	queries := database.New(pool)
	tokenRevoker := auth.NewMemoryTokenRevoker()

	authHandler := &auth.AuthHandler{DB: queries, Cfg: cfg, Revoker: tokenRevoker}

	scanner := &worker.InstallmentScanner{Pool: pool, Schedule: cfg.ScannerCronSchedule}
	scanner.Start()

	retentionWorker := &worker.RetentionWorker{Pool: pool, Schedule: cfg.RetentionCronSchedule}
	retentionWorker.Start()

	// Parse CORS origins from config
	allowedOrigins := strings.Split(cfg.CORSAllowedOrigins, ",")
	for i := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
	}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // Required for httpOnly cookies
		MaxAge:           300,
	}))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(logging.LoggingMiddleware(logger))
	r.Use(monitoring.SentryMiddleware)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(appmw.CSRFMiddleware)

	// Auth middleware — extracts JWT and injects user_id into context
	r.Use(auth.Middleware(cfg))
	r.Use(auth.RevocationMiddleware(tokenRevoker, cfg))

	// Audit logging for state-changing requests
	r.Use(appmw.AuditMiddleware(queries))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK - Go Backend Running"))
	})

	// Root handler for Render health checks (HEAD / and GET /)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("SaludTech API"))
	})

	// Rate limiters for sensitive endpoints
	authLimiter := appmw.NewRateLimiter(5, time.Minute)   // 5 login/register attempts per minute per IP
	adminLimiter := appmw.NewRateLimiter(30, time.Minute) // 30 admin requests per minute per IP

	// Auth routes (public) — rate limited to prevent brute force
	r.With(authLimiter.Middleware).Post("/api/v1/auth/login", authHandler.Login)
	r.With(authLimiter.Middleware).Post("/api/v1/auth/register", registerWithCreditLines(queries, authHandler, cfg))
	r.Post("/api/v1/auth/logout", authHandler.Logout)

	// Patient routes (protected)
	bcvClient := bcv.NewClient(cfg.DolarVZLAKey)
	fakePayClient := fakepay.NewClient(cfg.FakePayKey)
	patientHandler := &patient.PatientHandler{DB: queries, Pool: pool, BCVClient: bcvClient, FakePay: fakePayClient}
	r.Route("/api/v1/patient", patientHandler.Routes())

	// Merchant routes (MERCHANT + ADMIN only)
	merchantHandler := &merchant.MerchantHandler{DB: queries}
	r.Group(func(mux chi.Router) {
		mux.Use(auth.RequireAuth, auth.RequireRole("MERCHANT", "ADMIN"))
		mux.Mount("/api/v1/merchant", merchantHandler.Routes())
	})

	// Admin routes (ADMIN only) — rate limited
	adminHandler := &admin.AdminHandler{DB: queries}
	r.Group(func(mux chi.Router) {
		mux.Use(auth.RequireAuth, auth.RequireRole("ADMIN"), adminLimiter.Middleware)
		mux.Mount("/api/v1/admin", adminHandler.Routes())
	})

	// User routes (protected)
	userHandler := &user.UserHandler{DB: queries}
	r.With(auth.RequireAuth).Get("/api/v1/auth/me", userHandler.GetProfile)
	r.With(auth.RequireAuth).Get("/api/v1/users/profile", userHandler.GetProfile)
	r.With(auth.RequireAuth).Put("/api/v1/users/profile-photo", userHandler.UpdateProfilePhoto)
	r.With(auth.RequireAuth).Patch("/api/v1/users/password", userHandler.ChangePassword)

	// OpenAPI documentation
	r.Get("/api/v1/docs", docs.SpecHandler())
	r.Get("/api/v1/docs/ui", docs.SwaggerUIHandler())

	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	go func() {
		slog.Info("SaludTech Go Backend running", "addr", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	monitoring.FlushSentry()
	slog.Info("Server exiting")
}

// registerWithCreditLines wraps the auth register handler and creates
// default credit lines for the new patient user.
func registerWithCreditLines(queries *database.Queries, h *auth.AuthHandler, cfg *config.Config) http.HandlerFunc {
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
			{"ESPECIALIDAD_PRINCIPAL", cfg.DefaultCreditLimitMain},
			{"SALUD_COTIDIANA", cfg.DefaultCreditLimitDaily},
			{"MAYOR_CUIDADO", 0},
		}

		for _, line := range defaultLines {
			var limitNumeric pgtype.Numeric
			limitNumeric.Scan(fmt.Sprintf("%.2f", line.limit))
			if _, err := queries.CreateCreditLine(r.Context(), database.CreateCreditLineParams{
				UserID:   uid,
				Type:     line.typ,
				LimitUsd: limitNumeric,
			}); err != nil {
				slog.Error("Failed to create credit line", "type", line.typ, "user", resp.User.ID, "error", err)
			}
		}

		slog.Info("Created default credit lines for user", "user", resp.User.ID)
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
