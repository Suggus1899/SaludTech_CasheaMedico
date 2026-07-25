package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
)

const csrfCookieName = "csrf_token"
const csrfHeaderName = "X-CSRF-Token"

func GenerateCSRFToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func CSRFMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isBearerAuthRequest(r) {
			next.ServeHTTP(w, r)
			return
		}

		switch r.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			cookie, err := r.Cookie(csrfCookieName)
			if err != nil || cookie.Value == "" {
				token, err := GenerateCSRFToken()
				if err != nil {
					http.Error(w, "Failed to generate CSRF token", http.StatusInternalServerError)
					return
				}
				http.SetCookie(w, &http.Cookie{
					Name:     csrfCookieName,
					Value:    token,
					Path:     "/",
					MaxAge:   60 * 60 * 24,
					HttpOnly: false,
					SameSite: http.SameSiteLaxMode,
				})
			}
			next.ServeHTTP(w, r)
			return

		case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
			cookie, err := r.Cookie(csrfCookieName)
			if err != nil || cookie.Value == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"Missing CSRF cookie"}`))
				return
			}

			headerToken := r.Header.Get(csrfHeaderName)
			if headerToken == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"Missing X-CSRF-Token header"}`))
				return
			}

			if !strings.EqualFold(cookie.Value, headerToken) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"CSRF token mismatch"}`))
				return
			}

			next.ServeHTTP(w, r)
			return

		default:
			next.ServeHTTP(w, r)
			return
		}
	})
}

func isBearerAuthRequest(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return false
	}
	parts := strings.SplitN(authHeader, " ", 2)
	return len(parts) == 2 && strings.EqualFold(parts[0], "Bearer")
}
