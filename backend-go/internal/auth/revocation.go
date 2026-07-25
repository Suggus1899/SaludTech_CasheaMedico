package auth

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/saludtech/backend-go/internal/config"
)

type TokenRevoker interface {
	IsRevoked(jti string) bool
	Revoke(jti string, expiresAt time.Time) error
}

type revocationEntry struct {
	expiresAt time.Time
}

type MemoryTokenRevoker struct {
	mu      sync.RWMutex
	entries map[string]revocationEntry
}

func NewMemoryTokenRevoker() *MemoryTokenRevoker {
	r := &MemoryTokenRevoker{
		entries: make(map[string]revocationEntry),
	}
	go r.cleanupLoop()
	return r
}

func (r *MemoryTokenRevoker) IsRevoked(jti string) bool {
	if jti == "" {
		return false
	}
	r.mu.RLock()
	entry, ok := r.entries[jti]
	r.mu.RUnlock()
	if !ok {
		return false
	}
	if time.Now().After(entry.expiresAt) {
		return false
	}
	return true
}

func (r *MemoryTokenRevoker) Revoke(jti string, expiresAt time.Time) error {
	if jti == "" {
		return nil
	}
	r.mu.Lock()
	r.entries[jti] = revocationEntry{expiresAt: expiresAt}
	r.mu.Unlock()
	return nil
}

func (r *MemoryTokenRevoker) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		r.mu.Lock()
		now := time.Now()
		for jti, entry := range r.entries {
			if now.After(entry.expiresAt) {
				delete(r.entries, jti)
			}
		}
		r.mu.Unlock()
	}
}

func RevocationMiddleware(revoker TokenRevoker, cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := ""

			if cookie, err := r.Cookie("jwt_token"); err == nil && cookie.Value != "" {
				tokenString = cookie.Value
			}

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

			if claims.ID != "" && revoker.IsRevoked(claims.ID) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error":"Token has been revoked"}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
