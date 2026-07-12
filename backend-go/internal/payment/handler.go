package payment

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/database"
)

type PaymentHandler struct {
	DB database.Querier
}

type ProcessPaymentRequest struct {
	InstallmentID   string  `json:"installment_id"`
	Method          string  `json:"method"`
	Amount          float64 `json:"amount"`
	ReferenceCode   string  `json:"reference_code"`
	Phone           string  `json:"phone"`
	Email           string  `json:"email"`
}

func (h *PaymentHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	var req ProcessPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.InstallmentID == "" || req.Amount <= 0 {
		http.Error(w, "Missing required fields: installment_id, amount", http.StatusBadRequest)
		return
	}

	var instUUID pgtype.UUID
	if err := instUUID.Scan(req.InstallmentID); err != nil {
		http.Error(w, "Invalid installment_id", http.StatusBadRequest)
		return
	}

	_, err := h.DB.ProcessInstallmentPayment(context.Background(), instUUID)
	if err != nil {
		http.Error(w, "Failed to process payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "PAID",
		"message": "Payment processed successfully",
	})
}
