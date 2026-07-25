package monitoring

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/getsentry/sentry-go"
)

func InitSentry(dsn string) error {
	if dsn == "" {
		return nil
	}

	if err := sentry.Init(sentry.ClientOptions{
		Dsn:              dsn,
		AttachStacktrace: true,
		SendDefaultPII:   false,
	}); err != nil {
		return fmt.Errorf("sentry init: %w", err)
	}

	return nil
}

func FlushSentry() {
	sentry.Flush(0)
}

func SentryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				hub := sentry.GetHubFromContext(r.Context())
				if hub == nil {
					hub = sentry.CurrentHub()
				}
				if hub != nil {
					hub.Recover(rec)
				}
				debug.PrintStack()
				http.Error(w, `{"error":"Internal server error"}`, http.StatusInternalServerError)
			}
		}()

		hub := sentry.CurrentHub().Clone()
		ctx := sentry.SetHubOnContext(r.Context(), hub)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func CaptureError(err error) {
	if err == nil {
		return
	}
	sentry.CaptureException(err)
}
