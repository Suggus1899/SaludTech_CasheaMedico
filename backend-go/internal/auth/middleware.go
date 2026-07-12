package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/saludtech/backend-go/internal/config"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const RoleKey contextKey = "role"

// Middleware extracts the JWT from the Authorization header and injects
// the user_id and role into the request context.
func Middleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				next.ServeHTTP(w, r)
				return
			}

			claims, err := ValidateToken(parts[1], cfg)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, RoleKey, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID extracts the user_id from the context, or returns "" if not present.
func GetUserID(ctx context.Context) string {
	if v, ok := ctx.Value(UserIDKey).(string); ok {
		return v
	}
	return ""
}

// RequireAuth returns 401 if the request has no authenticated user.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		if userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
