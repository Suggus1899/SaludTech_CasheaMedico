package patient

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// ─── Triage ──────────────────────────────────────────────────────────────

func (h *PatientHandler) GetTriageList(w http.ResponseWriter, r *http.Request) {
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

	rows, err := h.DB.GetTriageByUser(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch triage records", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		recommendation := ""
		if row.Recommendation.Valid {
			recommendation = row.Recommendation.String
		}
		result = append(result, map[string]interface{}{
			"id":                row.ID.String(),
			"symptoms":          row.Symptoms,
			"perceivedSeverity": row.PerceivedSeverity,
			"priority":          row.Priority,
			"status":            row.Status,
			"createdAt":         formatTimestamp(row.CreatedAt),
			"recommendation":    recommendation,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

type CreateTriageRequest struct {
	Symptoms          string `json:"symptoms"`
	PerceivedSeverity int16  `json:"perceivedSeverity"`
}

func (h *PatientHandler) CreateTriage(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateTriageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Symptoms) == "" {
		http.Error(w, `{"error":"Symptoms is required"}`, http.StatusBadRequest)
		return
	}
	if len(req.Symptoms) > 2000 {
		http.Error(w, `{"error":"Symptoms must not exceed 2000 characters"}`, http.StatusBadRequest)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	severity := req.PerceivedSeverity
	if severity < 1 {
		severity = 1
	}
	if severity > 10 {
		severity = 10
	}

	priority := severityToPriority(severity)

	triage, err := h.DB.CreateTriage(r.Context(), database.CreateTriageParams{
		UserID:            uid,
		Symptoms:          req.Symptoms,
		PerceivedSeverity: severity,
		Priority:          priority,
	})
	if err != nil {
		http.Error(w, "Failed to create triage record", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":                triage.ID.String(),
		"symptoms":          triage.Symptoms,
		"perceivedSeverity": triage.PerceivedSeverity,
		"priority":          triage.Priority,
		"status":            triage.Status,
		"createdAt":         formatTimestamp(triage.CreatedAt),
	})
}

func (h *PatientHandler) GetRecommendedMerchants(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	merchants, err := h.DB.GetAllActiveMerchants(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch merchants", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(merchants))
	for _, m := range merchants {
		city := ""
		if m.City.Valid {
			city = m.City.String
		}
		result = append(result, map[string]interface{}{
			"id":        m.ID.String(),
			"tradeName": m.TradeName,
			"category":  m.Category,
			"city":      city,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
