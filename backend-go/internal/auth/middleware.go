package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/saludtech/backend-go/internal/config"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const RoleKey contextKey = "role"

// Middleware extracts the JWT from the httpOnly cookie (preferred) or the
// Authorization header (backward compatibility) and injects the user_id
// and role into the request context.
func Middleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := ""

			// Prefer httpOnly cookie
			if cookie, err := r.Cookie("jwt_token"); err == nil && cookie.Value != "" {
				tokenString = cookie.Value
			}

			// Fall back to Authorization header (backward compatibility)
			if tokenString == "" {
				authHeader := r.Header.Get("Authorization")
				if authHeader != "" {
					parts := strings.SplitN(authHeader, " ", 2)
					if len(parts) == 2 && parts[0] == "Bearer" {
						tokenString = parts[1]
					}
				}
			}

			if tokenString == "" {
				next.ServeHTTP(w, r)
				return
			}

			claims, err := ValidateToken(tokenString, cfg)
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
			http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// GetRole extracts the role from the context, or returns "" if not present.
func GetRole(ctx context.Context) string {
	if v, ok := ctx.Value(RoleKey).(string); ok {
		return v
	}
	return ""
}

// RequireRole returns 403 if the authenticated user does not have one of the
// allowed roles. Must be used after RequireAuth (or within a group that
// includes RequireAuth).
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := GetRole(r.Context())
			if role == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
				return
			}
			if _, ok := allowed[role]; !ok {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{"error": "Forbidden: insufficient role"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireAdmin is a convenience wrapper for RequireRole("ADMIN").
func RequireAdmin(next http.Handler) http.Handler {
	return RequireRole("ADMIN")(next)
}

// RequireMerchant is a convenience wrapper for RequireRole("MERCHANT", "ADMIN").
// Admins can access merchant endpoints too (useful for support/debugging).
func RequireMerchant(next http.Handler) http.Handler {
	return RequireRole("MERCHANT", "ADMIN")(next)
}
