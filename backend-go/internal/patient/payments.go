package patient

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/fakepay"
)

// ─── Payments ────────────────────────────────────────────────────────────

// isUniqueViolation returns true if err is a PostgreSQL unique constraint violation.
func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}

type PaymentRequest struct {
	InstallmentID string `json:"installmentId"`
	Method        string `json:"method"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Reference     string `json:"reference"`

	// Card data for fakePayment API
	CardNumber      string `json:"cardNumber"`
	CVV             string `json:"cvv"`
	ExpirationMonth string `json:"expirationMonth"`
	ExpirationYear  string `json:"expirationYear"`
	FullName        string `json:"fullName"`
}

func (h *PatientHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.InstallmentID == "" {
		http.Error(w, "installmentId is required", http.StatusBadRequest)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	instUUID, err := parseUUID(req.InstallmentID)
	if err != nil {
		http.Error(w, "Invalid installment ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// ─── 1. Ownership + existence check ──────────────────────────────────
	// GetInstallmentWithDetails now filters by user_id too, so a user
	// cannot access another user's installment.
	inst, err := h.DB.GetInstallmentWithDetails(ctx, database.GetInstallmentWithDetailsParams{
		ID:     instUUID,
		UserID: uid,
	})
	if err != nil {
		http.Error(w, "Installment not found", http.StatusNotFound)
		return
	}

	// ─── 2. Status validation ────────────────────────────────────────────
	if inst.Status != "PENDING" && inst.Status != "OVERDUE" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "ALREADY_PAID",
			"message": "Installment is already paid",
		})
		return
	}

	amountUSD := formatNumeric(inst.Amount)
	wasOverdue := inst.Status == "OVERDUE"

	// ─── 3. Build idempotency reference ──────────────────────────────────
	// A deterministic reference so retries don't create duplicate payments.
	// The actual duplicate check happens INSIDE the transaction (step 5a)
	// via a partial unique index on payments.reference_code.
	ref := req.Reference
	if ref == "" {
		ref = fmt.Sprintf("installment:%s", instUUID.String())
	}

	refText := pgtype.Text{String: ref, Valid: ref != ""}

	// ─── 4. Call FakePay gateway ─────────────────────────────────────────
	currency := "USD"
	description := fmt.Sprintf("Cuota #%d - SaludTech", inst.InstallmentNum)

	var fakePayTxn *fakepay.PaymentData
	if h.FakePay != nil && req.CardNumber != "" {
		payReq := fakepay.PaymentRequest{
			Amount:          fmt.Sprintf("%.2f", amountUSD),
			CardNumber:      req.CardNumber,
			CVV:             req.CVV,
			ExpirationMonth: req.ExpirationMonth,
			ExpirationYear:  req.ExpirationYear,
			FullName:        req.FullName,
			Currency:        currency,
			Description:     description,
			Reference:       ref,
		}

		fakePayTxn, err = h.FakePay.ProcessPayment(ctx, payReq)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPaymentRequired)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":  "REJECTED",
				"message": "Payment gateway rejected: " + err.Error(),
			})
			return
		}
	}

	if fakePayTxn != nil {
		refText = pgtype.Text{String: fakePayTxn.TransactionID, Valid: true}
	}

	// ─── 5. Atomic DB transaction ───────────────────────────────────────
	// CreatePaymentRecord + ProcessInstallmentPayment + ReleaseCreditLineUsage
	// + AddUserPoints + CheckAndLevelUpUser + ReactivateUserCreditLines
	// all run inside a single BEGIN/COMMIT. If any step fails, everything
	// rolls back — no orphan payments, no double gamification.
	// The idempotency check is enforced by a partial unique index on
	// payments.reference_code (V15 migration), so concurrent requests
	// that race past the application check are rejected by the DB.
	tx, err := h.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx) // safe to call after Commit (no-op)

	// WithTx is on *Queries (not the Querier interface), so we assert.
	q, ok := h.DB.(*database.Queries)
	if !ok {
		http.Error(w, "DB layer does not support transactions", http.StatusInternalServerError)
		return
	}
	txQueries := q.WithTx(tx)

	// 5a. Record payment — the unique index on reference_code enforces
	// idempotency at the DB level. If a concurrent request already inserted
	// this reference, we get a unique violation and return idempotent response.
	var amountPaid pgtype.Numeric
	amountPaid.Scan(fmt.Sprintf("%.2f", amountUSD))

	_, err = txQueries.CreatePaymentRecord(ctx, database.CreatePaymentRecordParams{
		InstallmentID: instUUID,
		UserID:        uid,
		AmountPaid:    amountPaid,
		PaymentMethod: req.Method,
		ReferenceCode: refText,
	})
	if err != nil {
		// Check for unique constraint violation (duplicate reference)
		if isUniqueViolation(err) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":  "PAID",
				"message": "Payment already processed (idempotent)",
				"amount":  amountUSD,
			})
			return
		}
		log.Printf("CreatePaymentRecord failed: %v", err)
		http.Error(w, "Failed to record payment", http.StatusInternalServerError)
		return
	}

	// 5b. Mark installment as PAID (only if PENDING/OVERDUE — enforced in SQL)
	_, err = txQueries.ProcessInstallmentPayment(ctx, instUUID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "ALREADY_PAID",
			"message": "Installment was already paid by a concurrent request",
		})
		return
	}

	// 5c. Release used_usd on the credit line (liberate credit proportionally)
	releaseAmount := pgtype.Numeric{}
	releaseAmount.Scan(fmt.Sprintf("%.2f", amountUSD))
	if _, err := txQueries.ReleaseCreditLineUsage(ctx, database.ReleaseCreditLineUsageParams{
		ID:      inst.CreditLineID,
		UsedUsd: releaseAmount,
	}); err != nil {
		log.Printf("ReleaseCreditLineUsage failed for line %s: %v", inst.CreditLineID, err)
	}

	// 5d. Gamification: +10 points + level-up check
	if err := txQueries.AddUserPoints(ctx, database.AddUserPointsParams{
		ID:     uid,
		Points: 10,
	}); err != nil {
		log.Printf("AddUserPoints failed for user %s: %v", uid, err)
	}
	if err := txQueries.CheckAndLevelUpUser(ctx, uid); err != nil {
		log.Printf("CheckAndLevelUpUser failed for user %s: %v", uid, err)
	}

	// 5e. If the installment was OVERDUE, check if user has any remaining
	// overdue installments. If none, reactivate all paused credit lines.
	creditReactivated := false
	if wasOverdue {
		remainingOverdue, err := txQueries.CountOverdueByUser(ctx, uid)
		if err != nil {
			log.Printf("CountOverdueByUser failed for user %s: %v", uid, err)
		} else if remainingOverdue == 0 {
			if err := txQueries.ReactivateUserCreditLines(ctx, uid); err != nil {
				log.Printf("ReactivateUserCreditLines failed for user %s: %v", uid, err)
			} else {
				creditReactivated = true
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "Failed to commit payment transaction", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)

	resp := map[string]interface{}{
		"status":  "PAID",
		"message": "Payment processed successfully",
		"amount":  amountUSD,
	}
	if fakePayTxn != nil {
		resp["gatewayTransactionId"] = fakePayTxn.TransactionID
	}
	if bcvRate > 0 {
		resp["amountVES"] = math.Round(amountUSD*bcvRate*100) / 100
		resp["bcvRate"] = bcvRate
	}
	if creditReactivated {
		resp["creditReactivated"] = true
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
