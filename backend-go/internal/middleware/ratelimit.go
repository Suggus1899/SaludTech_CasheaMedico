package middleware

import (
	"net/http"
	"sync"
	"time"
)

// rateLimitEntry tracks request timestamps for a single client (by IP).
type rateLimitEntry struct {
	mu       sync.Mutex
	requests []time.Time
}

// RateLimiter is a simple in-memory sliding-window rate limiter.
// It limits the number of requests per window per client IP.
// Not suitable for multi-instance deployments without a shared store
// (Redis, etc.), but sufficient for single-instance production.
type RateLimiter struct {
	mu      sync.RWMutex
	entries map[string]*rateLimitEntry
	limit   int
	window  time.Duration
}

// NewRateLimiter creates a RateLimiter that allows `limit` requests per `window`.
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		entries: make(map[string]*rateLimitEntry),
		limit:   limit,
		window:  window,
	}
	go rl.cleanupLoop()
	return rl
}

// Middleware returns an HTTP middleware that enforces the rate limit.
// It uses the client IP (set by middleware.RealIP) as the key.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		entry := rl.getEntry(ip)
		entry.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-rl.window)

		// Drop expired timestamps
		valid := entry.requests[:0]
		for _, t := range entry.requests {
			if t.After(cutoff) {
				valid = append(valid, t)
			}
		}

		if len(valid) >= rl.limit {
			entry.requests = valid
			entry.mu.Unlock()
			w.Header().Set("Retry-After", "60")
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		entry.requests = append(valid, now)
		entry.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) getEntry(ip string) *rateLimitEntry {
	rl.mu.RLock()
	entry, ok := rl.entries[ip]
	rl.mu.RUnlock()
	if ok {
		return entry
	}

	rl.mu.Lock()
	defer rl.mu.Unlock()
	// Double-check after acquiring write lock
	if entry, ok := rl.entries[ip]; ok {
		return entry
	}
	entry = &rateLimitEntry{}
	rl.entries[ip] = entry
	return entry
}

// cleanupLoop periodically removes stale entries to prevent memory growth.
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window)
		for ip, entry := range rl.entries {
			entry.mu.Lock()
			if len(entry.requests) == 0 || entry.requests[len(entry.requests)-1].Before(cutoff) {
				delete(rl.entries, ip)
			}
			entry.mu.Unlock()
		}
		rl.mu.Unlock()
	}
}
