package patient

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestValidateInstallments_EdgeCases(t *testing.T) {
	tests := []struct {
		name           string
		level          int
		amount         float64
		numInst        int
		creditLineType string
		wantError      bool
	}{
		{"amount=0 with 3 installments valid", 1, 0, 3, "ESPECIALIDAD_PRINCIPAL", false},
		{"amount=0 with 6 installments invalid (min $300)", 3, 0, 6, "ESPECIALIDAD_PRINCIPAL", true},
		{"negative amount with 3 installments invalid", 1, -50, 3, "ESPECIALIDAD_PRINCIPAL", true},
		{"very high amount with 12 installments valid", 6, 999999, 12, "MAYOR_CUIDADO", false},
		{"level 0 with 3 installments valid", 0, 100, 3, "ESPECIALIDAD_PRINCIPAL", false},
		{"level 0 with 6 installments invalid", 0, 500, 6, "ESPECIALIDAD_PRINCIPAL", true},
		{"negative level with 3 installments valid", -1, 100, 3, "ESPECIALIDAD_PRINCIPAL", false},
		{"negative installments clamped to valid", 3, 100, -5, "ESPECIALIDAD_PRINCIPAL", false},
		{"zero installments valid (no min check)", 3, 100, 0, "ESPECIALIDAD_PRINCIPAL", false},
		{"SALUD_COTIDIANA with any amount valid", 1, 0, 1, "SALUD_COTIDIANA", false},
		{"SALUD_COTIDIANA ignores level", 1, 100, 99, "SALUD_COTIDIANA", false},
		{"unknown credit line type uses standard rules", 1, 100, 3, "UNKNOWN_TYPE", false},
		{"exact min amount for 6 installments valid", 3, 300, 6, "ESPECIALIDAD_PRINCIPAL", false},
		{"one cent below min for 6 installments invalid", 3, 299.99, 6, "ESPECIALIDAD_PRINCIPAL", true},
		{"exact min amount for 9 installments valid", 5, 450, 9, "MAYOR_CUIDADO", false},
		{"one cent below min for 9 installments invalid", 5, 449.99, 9, "MAYOR_CUIDADO", true},
		{"exact min amount for 12 installments valid", 6, 600, 12, "MAYOR_CUIDADO", false},
		{"one cent below min for 12 installments invalid", 6, 599.99, 12, "MAYOR_CUIDADO", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := validateInstallments(tt.level, tt.amount, tt.numInst, tt.creditLineType)
			if tt.wantError && msg == "" {
				t.Errorf("validateInstallments() expected error, got none")
			}
			if !tt.wantError && msg != "" {
				t.Errorf("validateInstallments() expected no error, got: %s", msg)
			}
		})
	}
}

func TestResolveInstallments_AllCreditLineTypes(t *testing.T) {
	tests := []struct {
		name           string
		creditLineType string
		level          int
		requestedInst  int
		wantNum        int
		wantInterval   int
	}{
		{"SALUD_COTIDIANA overrides everything", "SALUD_COTIDIANA", 6, 12, 1, 14},
		{"SALUD_COTIDIANA with level 1", "SALUD_COTIDIANA", 1, 3, 1, 14},
		{"ESPECIALIDAD_PRINCIPAL level 1 default", "ESPECIALIDAD_PRINCIPAL", 1, 0, 3, 14},
		{"ESPECIALIDAD_PRINCIPAL level 3 max 6", "ESPECIALIDAD_PRINCIPAL", 3, 10, 6, 14},
		{"MAYOR_CUIDADO level 5 max 9", "MAYOR_CUIDADO", 5, 10, 9, 14},
		{"MAYOR_CUIDADO level 6 max 12", "MAYOR_CUIDADO", 6, 20, 12, 14},
		{"unknown type defaults to standard rules", "UNKNOWN", 1, 5, 3, 14},
		{"empty type defaults to standard rules", "", 1, 5, 3, 14},
		{"request exactly max is allowed", "ESPECIALIDAD_PRINCIPAL", 3, 6, 6, 14},
		{"request 1 installment", "ESPECIALIDAD_PRINCIPAL", 1, 1, 1, 14},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			num, interval := resolveInstallments(tt.creditLineType, tt.level, tt.requestedInst)
			if num != tt.wantNum {
				t.Errorf("resolveInstallments() num = %d, want %d", num, tt.wantNum)
			}
			if interval != tt.wantInterval {
				t.Errorf("resolveInstallments() interval = %d, want %d", interval, tt.wantInterval)
			}
		})
	}
}

func TestMaxInstallmentsForLevel_Boundaries(t *testing.T) {
	tests := []struct {
		name  string
		level int
		want  int
	}{
		{"negative level = 3 (default)", -5, 3},
		{"level 0 = 3 (default)", 0, 3},
		{"level 1 boundary = 3", 1, 3},
		{"level 2 boundary = 3", 2, 3},
		{"level 3 boundary = 6", 3, 6},
		{"level 4 = 6", 4, 6},
		{"level 5 boundary = 9", 5, 9},
		{"level 6 boundary = 12", 6, 12},
		{"level 10 capped at 12", 10, 12},
		{"level 100 capped at 12", 100, 12},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := maxInstallmentsForLevel(tt.level)
			if got != tt.want {
				t.Errorf("maxInstallmentsForLevel(%d) = %d, want %d", tt.level, got, tt.want)
			}
		})
	}
}

func TestMinAmountForInstallments_EdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		numInst int
		want    float64
	}{
		{"0 installments = $0", 0, 0},
		{"1 installment = $0", 1, 0},
		{"2 installments = $0", 2, 0},
		{"3 installments = $0", 3, 0},
		{"4 installments = $0", 4, 0},
		{"5 installments = $0", 5, 0},
		{"6 installments boundary = $300", 6, 300},
		{"7 installments = $300", 7, 300},
		{"8 installments = $300", 8, 300},
		{"9 installments boundary = $450", 9, 450},
		{"10 installments = $450", 10, 450},
		{"11 installments = $450", 11, 450},
		{"12 installments boundary = $600", 12, 600},
		{"13 installments = $600 (capped)", 13, 600},
		{"20 installments = $600 (capped)", 20, 600},
		{"negative installments = $0", -1, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := minAmountForInstallments(tt.numInst)
			if got != tt.want {
				t.Errorf("minAmountForInstallments(%d) = %.2f, want %.2f", tt.numInst, got, tt.want)
			}
		})
	}
}

func TestDownPaymentPctForLevel_EdgeCases(t *testing.T) {
	tests := []struct {
		name  string
		level int
		want  float64
	}{
		{"negative level = 40% (default)", -1, 0.40},
		{"level 0 = 40% (default)", 0, 0.40},
		{"level 1 boundary = 60%", 1, 0.60},
		{"level 2 boundary = 50%", 2, 0.50},
		{"level 3 = 40%", 3, 0.40},
		{"level 10 = 40%", 10, 0.40},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := downPaymentPctForLevel(tt.level)
			if got != tt.want {
				t.Errorf("downPaymentPctForLevel(%d) = %.2f, want %.2f", tt.level, got, tt.want)
			}
		})
	}
}

func TestInstallmentDueDate(t *testing.T) {
	interval := 14
	now := time.Now()

	tests := []struct {
		name      string
		i         int
		interval  int
		wantDays  int
	}{
		{"installment 1 = 14 days", 1, interval, 14},
		{"installment 2 = 28 days", 2, interval, 28},
		{"installment 3 = 42 days", 3, interval, 42},
		{"installment 6 = 84 days", 6, interval, 84},
		{"installment 12 = 168 days", 12, interval, 168},
		{"installment 0 = 0 days", 0, interval, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			due := installmentDueDate(tt.i, tt.interval)
			expected := now.AddDate(0, 0, tt.wantDays)
			diff := due.Sub(expected)
			if diff < -time.Minute || diff > time.Minute {
				t.Errorf("installmentDueDate(%d, %d) diff = %v, want within 1 minute of %v", tt.i, tt.interval, diff, expected)
			}
		})
	}
}

func TestRejectIfInvalidInstallments(t *testing.T) {
	tests := []struct {
		name           string
		level          int
		amount         float64
		numInst        int
		creditLineType string
		wantRejected   bool
		wantStatus     int
	}{
		{"valid config not rejected", 3, 300, 6, "ESPECIALIDAD_PRINCIPAL", false, 0},
		{"invalid config rejected with 400", 1, 100, 6, "ESPECIALIDAD_PRINCIPAL", true, http.StatusBadRequest},
		{"SALUD_COTIDIANA always valid", 1, 10, 1, "SALUD_COTIDIANA", false, 0},
		{"amount below min rejected", 3, 200, 6, "ESPECIALIDAD_PRINCIPAL", true, http.StatusBadRequest},
		{"level too low for installments rejected", 1, 500, 6, "ESPECIALIDAD_PRINCIPAL", true, http.StatusBadRequest},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			rejected := rejectIfInvalidInstallments(w, tt.level, tt.amount, tt.numInst, tt.creditLineType)
			if rejected != tt.wantRejected {
				t.Errorf("rejectIfInvalidInstallments() rejected = %v, want %v", rejected, tt.wantRejected)
			}
			if tt.wantRejected && w.Code != tt.wantStatus {
				t.Errorf("rejectIfInvalidInstallments() status = %d, want %d", w.Code, tt.wantStatus)
			}
			if !tt.wantRejected && w.Code != http.StatusOK {
				t.Errorf("rejectIfInvalidInstallments() should not write response, got status %d", w.Code)
			}
		})
	}
}
