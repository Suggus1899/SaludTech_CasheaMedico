package patient

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

var validConsentTypes = map[string]bool{
	"HEALTH_DATA_PROCESSING":  true,
	"DATA_SHARING_MERCHANTS":  true,
	"MARKETING_COMMUNICATIONS": true,
	"TERMS_AND_CONDITIONS":    true,
}

// ─── Consent Tracking ───────────────────────────────────────────────────────

func (h *PatientHandler) GetConsents(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	consents, err := h.DB.ListUserConsents(ctx, uid)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch consents"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"consents": consents,
	})
}

type ConsentRequest struct {
	ConsentType    string `json:"consentType"`
	ConsentVersion string `json:"consentVersion"`
	Granted        bool   `json:"granted"`
}

func (h *PatientHandler) GrantConsent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req ConsentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if !validConsentTypes[req.ConsentType] {
		http.Error(w, `{"error":"Invalid consentType"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.ConsentVersion) == "" {
		http.Error(w, `{"error":"consentVersion is required"}`, http.StatusBadRequest)
		return
	}

	consent, err := h.DB.CreateUserConsent(ctx, database.CreateUserConsentParams{
		UserID:         uid,
		ConsentType:    req.ConsentType,
		ConsentVersion: req.ConsentVersion,
		Granted:        req.Granted,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to grant consent: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(consent)
}

func (h *PatientHandler) RevokeConsent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var consentID pgtype.UUID
	if err := consentID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid consent ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.RevokeUserConsent(ctx, database.RevokeUserConsentParams{
		ID:     consentID,
		UserID: uid,
	}); err != nil {
		http.Error(w, `{"error":"Failed to revoke consent"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Consent revoked"})
}
