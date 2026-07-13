package patient

import (
	"encoding/json"
	"math"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// ─── Installments ────────────────────────────────────────────────────────

func (h *PatientHandler) GetPendingInstallments(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	rows, err := h.DB.GetPendingInstallmentsWithDetails(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch installments", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)

	result := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		merchantName := ""
		if row.MerchantName.Valid {
			merchantName = row.MerchantName.String
		}
		amountUSD := formatNumeric(row.Amount)
		entry := map[string]interface{}{
			"id":                row.InstallmentID.String(),
			"dueDate":           formatDate(row.DueDate),
			"amount":            amountUSD,
			"status":            row.Status,
			"installmentNumber": row.InstallmentNum,
			"totalInstallments": row.NumInstallments,
			"transaction": map[string]interface{}{
				"id": row.TransactionID.String(),
				"merchant": map[string]interface{}{
					"tradeName": merchantName,
				},
			},
		}
		if bcvRate > 0 {
			entry["amountVES"] = math.Round(amountUSD*bcvRate*100) / 100
			entry["bcvRate"] = bcvRate
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) GetInstallmentByID(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	instID := chi.URLParam(r, "id")
	instUUID, err := parseUUID(instID)
	if err != nil {
		http.Error(w, "Invalid installment ID", http.StatusBadRequest)
		return
	}

	userUUID, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	row, err := h.DB.GetInstallmentWithDetails(r.Context(), database.GetInstallmentWithDetailsParams{
		ID:     instUUID,
		UserID: userUUID,
	})
	if err != nil {
		http.Error(w, "Installment not found", http.StatusNotFound)
		return
	}

	merchantName := ""
	if row.MerchantName.Valid {
		merchantName = row.MerchantName.String
	}

	amountUSD := formatNumeric(row.Amount)
	bcvRate := h.getBCVRateCached(r)

	resp := map[string]interface{}{
		"id":                row.InstallmentID.String(),
		"dueDate":           formatDate(row.DueDate),
		"amount":            amountUSD,
		"status":            row.Status,
		"installmentNumber": row.InstallmentNum,
		"totalInstallments": row.NumInstallments,
		"transaction": map[string]interface{}{
			"id": row.TransactionID.String(),
			"merchant": map[string]interface{}{
				"tradeName": merchantName,
			},
		},
	}
	if bcvRate > 0 {
		resp["amountVES"] = math.Round(amountUSD*bcvRate*100) / 100
		resp["bcvRate"] = bcvRate
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
