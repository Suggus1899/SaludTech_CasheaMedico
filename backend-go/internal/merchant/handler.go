package merchant

import (
	"encoding/json"
	"net/http"

	"github.com/saludtech/backend-go/internal/database"
)

type MerchantHandler struct {
	DB database.Querier
}

func (h *MerchantHandler) GetPayouts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	payouts, err := h.DB.GetMerchantPayouts(ctx)
	if err != nil {
		http.Error(w, "Failed to calculate payouts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data": payouts,
	})
}
