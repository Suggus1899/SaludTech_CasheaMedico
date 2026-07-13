package patient

import (
	"math"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saludtech/backend-go/internal/bcv"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/fakepay"
)

type PatientHandler struct {
	DB        database.Querier
	Pool      *pgxpool.Pool
	BCVClient *bcv.Client
	FakePay   *fakepay.Client
}

func numericToFloat(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0
	}
	f, err := n.Float64Value()
	if err != nil {
		return 0
	}
	return f.Float64
}

func formatNumeric(n pgtype.Numeric) float64 {
	return math.Round(numericToFloat(n)*100) / 100
}

func formatDate(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format("2006-01-02")
}

func formatTimestamp(t pgtype.Timestamptz) string {
	if !t.Valid {
		return ""
	}
	return t.Time.Format(time.RFC3339)
}

func parseUUID(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	err := u.Scan(s)
	return u, err
}

func severityToPriority(severity int16) string {
	if severity >= 8 {
		return "EMERGENCY"
	}
	if severity >= 5 {
		return "HIGH"
	}
	if severity >= 3 {
		return "MEDIUM"
	}
	return "LOW"
}
