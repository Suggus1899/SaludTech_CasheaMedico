package patient

import (
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func TestFormatNumeric(t *testing.T) {
	tests := []struct {
		name  string
		input pgtype.Numeric
		want  float64
	}{
		{"100.005 rounds to 100.01", mustScanNum("100.005"), 100.01},
		{"100.004 rounds to 100.00", mustScanNum("100.004"), 100.0},
		{"4.505 rounds to 4.51", mustScanNum("4.505"), 4.51},
		{"0 stays 0", mustScanNum("0"), 0},
		{"invalid returns 0", pgtype.Numeric{Valid: false}, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatNumeric(tt.input)
			if got != tt.want {
				t.Errorf("formatNumeric() = %.2f, want %.2f", got, tt.want)
			}
		})
	}
}

func TestFormatDate(t *testing.T) {
	tests := []struct {
		name  string
		input pgtype.Date
		want  string
	}{
		{"valid date", pgtype.Date{Time: time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC), Valid: true}, "2026-01-15"},
		{"invalid date", pgtype.Date{Valid: false}, ""},
		{"another date", pgtype.Date{Time: time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC), Valid: true}, "2026-12-31"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatDate(tt.input)
			if got != tt.want {
				t.Errorf("formatDate() = %s, want %s", got, tt.want)
			}
		})
	}
}

func TestFormatTimestamp(t *testing.T) {
	ts := time.Date(2026, 1, 15, 10, 30, 0, 0, time.UTC)
	tests := []struct {
		name  string
		input pgtype.Timestamptz
		want  string
	}{
		{"valid timestamp", pgtype.Timestamptz{Time: ts, Valid: true}, "2026-01-15T10:30:00Z"},
		{"invalid timestamp", pgtype.Timestamptz{Valid: false}, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatTimestamp(tt.input)
			if got != tt.want {
				t.Errorf("formatTimestamp() = %s, want %s", got, tt.want)
			}
		})
	}
}

func TestParseUUID(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		wantErr bool
	}{
		{"valid UUID", "123e4567-e89b-12d3-a456-426614174000", false},
		{"invalid UUID", "not-a-uuid", true},
		{"empty string", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := parseUUID(tt.input)
			if tt.wantErr {
				if err == nil {
					t.Fatal("parseUUID() expected error, got nil")
				}
				if u.Valid {
					t.Fatal("UUID should be invalid on error")
				}
			} else {
				if err != nil {
					t.Fatalf("parseUUID() unexpected error: %v", err)
				}
				if !u.Valid {
					t.Fatal("UUID should be valid")
				}
			}
		})
	}
}

func TestSeverityToPriority(t *testing.T) {
	tests := []struct {
		name     string
		severity int16
		want     string
	}{
		{"severity 1 = LOW", 1, "LOW"},
		{"severity 2 = LOW", 2, "LOW"},
		{"severity 3 = MEDIUM", 3, "MEDIUM"},
		{"severity 4 = MEDIUM", 4, "MEDIUM"},
		{"severity 5 = HIGH", 5, "HIGH"},
		{"severity 7 = HIGH", 7, "HIGH"},
		{"severity 8 = EMERGENCY", 8, "EMERGENCY"},
		{"severity 10 = EMERGENCY", 10, "EMERGENCY"},
		{"severity 0 = LOW", 0, "LOW"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := severityToPriority(tt.severity)
			if got != tt.want {
				t.Errorf("severityToPriority(%d) = %s, want %s", tt.severity, got, tt.want)
			}
		})
	}
}

func mustScanNum(s string) pgtype.Numeric {
	var n pgtype.Numeric
	if err := n.Scan(s); err != nil {
		panic(err)
	}
	return n
}
