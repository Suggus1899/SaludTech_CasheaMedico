package patient

import (
	"fmt"
	"net/http"
	"time"
)

// ─── BNPL Business Logic (shared by Preview, CreateTransaction, Checkout) ──

// installmentIntervalDays is the number of days between installments.
// Cashea uses 14 days (biweekly). We align with that standard.
const installmentIntervalDays = 14

// downPaymentPctForLevel returns the down payment percentage based on user level.
// Level 1: 60%, Level 2: 50%, Level 3+: 40%
func downPaymentPctForLevel(level int) float64 {
	switch level {
	case 1:
		return 0.60
	case 2:
		return 0.50
	default:
		return 0.40
	}
}

// maxInstallmentsForLevel returns the maximum number of installments allowed
// for a given user level (Modo Más Cuotas).
//   Level 1-2: 3 installments (standard)
//   Level 3-4: up to 6 installments (for purchases $300+)
//   Level 5:   up to 9 installments (for purchases $450+)
//   Level 6:   up to 12 installments (for purchases $600+)
func maxInstallmentsForLevel(level int) int {
	switch {
	case level >= 6:
		return 12
	case level >= 5:
		return 9
	case level >= 3:
		return 6
	default:
		return 3
	}
}

// minAmountForInstallments returns the minimum purchase amount required
// to use a given number of installments (Modo Más Cuotas thresholds).
//   3 installments:  $0 (no minimum)
//   6 installments:  $300
//   9 installments:  $450
//   12 installments: $600
func minAmountForInstallments(numInst int) float64 {
	switch {
	case numInst >= 12:
		return 600
	case numInst >= 9:
		return 450
	case numInst >= 6:
		return 300
	default:
		return 0
	}
}

// validateInstallments checks that the requested number of installments is
// valid for the user's level and the purchase amount. Returns an error
// message if invalid, or empty string if valid.
func validateInstallments(level int, amount float64, numInst int, creditLineType string) string {
	// SALUD_COTIDIANA always uses 1 installment, 14 days
	if creditLineType == "SALUD_COTIDIANA" {
		return "" // handled separately, always valid
	}

	maxInst := maxInstallmentsForLevel(level)
	if numInst > maxInst {
		return fmt.Sprintf("Your level (%d) allows a maximum of %d installments. Requested: %d", level, maxInst, numInst)
	}

	minAmt := minAmountForInstallments(numInst)
	if amount < minAmt {
		return fmt.Sprintf("Purchase of $%.2f does not meet the $%.2f minimum for %d installments", amount, minAmt, numInst)
	}

	return ""
}

// resolveInstallments determines the final number of installments and interval
// based on credit line type, user level, and request.
func resolveInstallments(creditLineType string, level int, requestedInstallments int) (numInst int, intervalDays int) {
	// SALUD_COTIDIANA: always 1 installment, 14 days (interest-free)
	if creditLineType == "SALUD_COTIDIANA" {
		return 1, 14
	}

	// Default to 3 if not specified
	numInst = requestedInstallments
	if numInst <= 0 {
		numInst = 3
	}

	// Clamp to max allowed by level
	maxInst := maxInstallmentsForLevel(level)
	if numInst > maxInst {
		numInst = maxInst
	}

	// Minimum is always 1
	if numInst < 1 {
		numInst = 1
	}

	return numInst, installmentIntervalDays
}

// installmentDueDate calculates the due date for installment i (1-based).
func installmentDueDate(i int, intervalDays int) time.Time {
	return time.Now().AddDate(0, 0, i*intervalDays)
}

// rejectIfInvalidInstallments writes a 400 error if the installment config is invalid.
// Returns true if the request was rejected (so the caller can return early).
func rejectIfInvalidInstallments(w http.ResponseWriter, level int, amount float64, numInst int, creditLineType string) bool {
	if msg := validateInstallments(level, amount, numInst, creditLineType); msg != "" {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, msg), http.StatusBadRequest)
		return true
	}
	return false
}
