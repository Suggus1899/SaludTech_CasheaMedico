package patient

import (
	"testing"
)

func TestDownPaymentPctForLevel(t *testing.T) {
	tests := []struct {
		name  string
		level int
		want  float64
	}{
		{"level 1 = 60%", 1, 0.60},
		{"level 2 = 50%", 2, 0.50},
		{"level 3 = 40%", 3, 0.40},
		{"level 4 = 40%", 4, 0.40},
		{"level 6 = 40%", 6, 0.40},
		{"level 0 = 40% (default)", 0, 0.40},
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

func TestMaxInstallmentsForLevel(t *testing.T) {
	tests := []struct {
		name  string
		level int
		want  int
	}{
		{"level 1 = 3", 1, 3},
		{"level 2 = 3", 2, 3},
		{"level 3 = 6", 3, 6},
		{"level 4 = 6", 4, 6},
		{"level 5 = 9", 5, 9},
		{"level 6 = 12", 6, 12},
		{"level 7 = 12 (capped)", 7, 12},
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

func TestMinAmountForInstallments(t *testing.T) {
	tests := []struct {
		name    string
		numInst int
		want    float64
	}{
		{"1 installment = $0", 1, 0},
		{"3 installments = $0", 3, 0},
		{"6 installments = $300", 6, 300},
		{"9 installments = $450", 9, 450},
		{"12 installments = $600", 12, 600},
		{"15 installments = $600 (capped)", 15, 600},
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

func TestValidateInstallments(t *testing.T) {
	tests := []struct {
		name           string
		level          int
		amount         float64
		numInst        int
		creditLineType string
		wantError      bool
	}{
		{"SALUD_COTIDIANA always valid", 1, 10, 1, "SALUD_COTIDIANA", false},
		{"level 1, 3 installments, $100 = valid", 1, 100, 3, "ESPECIALIDAD_PRINCIPAL", false},
		{"level 1, 6 installments = invalid (max 3)", 1, 500, 6, "ESPECIALIDAD_PRINCIPAL", true},
		{"level 3, 6 installments, $300 = valid", 3, 300, 6, "ESPECIALIDAD_PRINCIPAL", false},
		{"level 3, 6 installments, $200 = invalid (min $300)", 3, 200, 6, "ESPECIALIDAD_PRINCIPAL", true},
		{"level 5, 9 installments, $450 = valid", 5, 450, 9, "MAYOR_CUIDADO", false},
		{"level 5, 9 installments, $400 = invalid (min $450)", 5, 400, 9, "MAYOR_CUIDADO", true},
		{"level 6, 12 installments, $600 = valid", 6, 600, 12, "MAYOR_CUIDADO", false},
		{"level 6, 12 installments, $500 = invalid (min $600)", 6, 500, 12, "MAYOR_CUIDADO", true},
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

func TestResolveInstallments(t *testing.T) {
	tests := []struct {
		name             string
		creditLineType   string
		level            int
		requestedInst    int
		wantNum          int
		wantInterval     int
	}{
		{"SALUD_COTIDIANA = 1 installment, 14 days", "SALUD_COTIDIANA", 1, 5, 1, 14},
		{"default to 3 if not specified", "ESPECIALIDAD_PRINCIPAL", 1, 0, 3, 14},
		{"level 1, request 6 = clamped to 3", "ESPECIALIDAD_PRINCIPAL", 1, 6, 3, 14},
		{"level 3, request 6 = 6", "ESPECIALIDAD_PRINCIPAL", 3, 6, 6, 14},
		{"level 6, request 12 = 12", "MAYOR_CUIDADO", 6, 12, 12, 14},
		{"negative request = 3 (default)", "ESPECIALIDAD_PRINCIPAL", 1, -1, 3, 14},
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
