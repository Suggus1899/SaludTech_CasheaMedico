package credit

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreditHandler struct {
	Service *CreditService
}

type TransactionRequest struct {
	UserID         string  `json:"user_id"`
	MerchantID     string  `json:"merchant_id"`
	CreditLineType string  `json:"credit_line_type"`
	Amount         float64 `json:"amount"`
}

func (h *CreditHandler) ProcessTransaction(w http.ResponseWriter, r *http.Request) {
	var req TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// 1. Validar UUIDs
	var userUUID pgtype.UUID
	userUUID.Scan(req.UserID)
	
	// 3. Ejecutar Transacción ACID
	err := h.Service.CreateBNPLTransaction(ctx, req.UserID, req.MerchantID, req.CreditLineType, req.Amount, 3) // Hardcoded 3 installments for now
	if err != nil {
		http.Error(w, "Transaction failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "APPROVED",
		"message": "BNPL Transaction Created Successfully",
	})
}
