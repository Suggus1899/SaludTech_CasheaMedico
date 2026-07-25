package logging

import (
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"
)

type contextKey string

const loggerKey contextKey = "logger"
const requestIDKey contextKey = "request_id"

func NewLogger(level string) *slog.Logger {
	var lvl slog.Level
	switch strings.ToUpper(level) {
	case "DEBUG":
		lvl = slog.LevelDebug
	case "WARN":
		lvl = slog.LevelWarn
	case "ERROR":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{Level: lvl}

	var handler slog.Handler
	if os.Getenv("APP_ENV") == "production" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)
	slog.SetDefault(logger)
	return logger
}

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func LoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			requestID := r.Header.Get("X-Request-ID")
			if requestID == "" {
				requestID = generateRequestID()
			}

			ctx := WithRequestID(r.Context(), requestID)
			ctx = WithLogger(ctx, logger)
			r = r.WithContext(ctx)

			rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}

			next.ServeHTTP(rec, r)

			duration := time.Since(start)

			logger.Info("http request",
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", rec.statusCode),
				slog.Duration("duration", duration),
				slog.String("request_id", requestID),
			)
		})
	}
}

func generateRequestID() string {
	return time.Now().Format("20060102150405.000000") + "-" + randomHex(8)
}
