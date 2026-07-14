package worker

import (
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
)

func TestNumericToFloat(t *testing.T) {
	tests := []struct {
		name    string
		input   pgtype.Numeric
		want    float64
	}{
		{
			name:  "valid 100.00",
			input: mustScanNumeric("100.00"),
			want:  100.0,
		},
		{
			name:  "valid 4.50",
			input: mustScanNumeric("4.50"),
			want:  4.5,
		},
		{
			name:  "valid 0",
			input: mustScanNumeric("0"),
			want:  0,
		},
		{
			name:  "invalid (null)",
			input: pgtype.Numeric{Valid: false},
			want:  0,
		},
		{
			name:  "large number 999999.99",
			input: mustScanNumeric("999999.99"),
			want:  999999.99,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := numericToFloat(tt.input)
			if got != tt.want {
				t.Errorf("numericToFloat() = %.2f, want %.2f", got, tt.want)
			}
		})
	}
}

func mustScanNumeric(s string) pgtype.Numeric {
	var n pgtype.Numeric
	if err := n.Scan(s); err != nil {
		panic(err)
	}
	return n
}
