package middleware

import (
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// AuditMiddleware logs sensitive operations to the audit_log table.
//
// It records every state-changing request (POST, PUT, PATCH, DELETE)
// issued by an authenticated user, capturing the user id, the action
// (HTTP method + path), the affected resource id (when available as an
// `id` URL parameter), the client IP and the User-Agent.
//
// The audit insert runs after the downstream handler completes and is
// best-effort: a logging failure never fails the user request.
func AuditMiddleware(db database.Querier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			next.ServeHTTP(w, r)

			if !isAuditable(r.Method) {
				return
			}

			userID := auth.GetUserID(r.Context())
			if userID == "" {
				return
			}

			var uid pgtype.UUID
			if err := uid.Scan(userID); err != nil {
				return
			}

			var resourceID pgtype.UUID
			if id := r.PathValue("id"); id != "" {
				_ = resourceID.Scan(id)
			}

			ipAddress := pgtype.Text{String: clientIP(r), Valid: true}
			userAgent := pgtype.Text{String: r.Header.Get("User-Agent"), Valid: true}
			if userAgent.String == "" {
				userAgent.Valid = false
			}

			action := r.Method + " " + r.URL.Path

			_ = db.InsertAuditLog(r.Context(), database.InsertAuditLogParams{
				UserID:     uid,
				Action:     action,
				ResourceID: resourceID,
				IpAddress:  ipAddress,
				UserAgent:  userAgent,
			})
		})
	}
}

// isAuditable returns true for state-changing HTTP methods.
func isAuditable(method string) bool {
	switch strings.ToUpper(method) {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return true
	default:
		return false
	}
}

// clientIP extracts the client IP, honouring X-Forwarded-For when present.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if idx := strings.Index(xff, ","); idx > 0 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}
	return r.RemoteAddr
}
