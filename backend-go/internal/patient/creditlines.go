package patient

import (
	"encoding/json"
	"net/http"

	"github.com/saludtech/backend-go/internal/auth"
)

// ─── Credit Lines ────────────────────────────────────────────────────────

func (h *PatientHandler) GetCreditLines(w http.ResponseWriter, r *http.Request) {
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

	lines, err := h.DB.GetCreditLinesByUser(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch credit lines", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(lines))
	for _, line := range lines {
		limit := numericToFloat(line.LimitUsd)
		used := numericToFloat(line.UsedUsd)
		result = append(result, map[string]interface{}{
			"id":          line.ID.String(),
			"type":        line.Type,
			"limitAmount": limit,
			"available":   limit - used,
			"status":      line.Status,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
