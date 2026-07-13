package patient

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// ─── Subscriptions ───────────────────────────────────────────────────────

func (h *PatientHandler) GetSubscriptions(w http.ResponseWriter, r *http.Request) {
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

	rows, err := h.DB.GetSubscriptionsByUser(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch subscriptions", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		merchantName := ""
		if row.MerchantName.Valid {
			merchantName = row.MerchantName.String
		}
		result = append(result, map[string]interface{}{
			"id":            row.ID.String(),
			"status":        row.Status,
			"plan":          row.ProductName,
			"monthlyAmount": formatNumeric(row.Amount),
			"nextBilling":   formatTimestamp(row.NextBillingDate),
			"merchant": map[string]interface{}{
				"tradeName": merchantName,
			},
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

type CreateSubscriptionRequest struct {
	MerchantID     string  `json:"merchantId"`
	CreditLineType string  `json:"creditLineType"`
	ProductName    string  `json:"productName"`
	Amount         float64 `json:"amount"`
}

func (h *PatientHandler) CreateSubscription(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.MerchantID == "" || req.Amount <= 0 || req.ProductName == "" {
		http.Error(w, "merchantId, productName, and amount are required", http.StatusBadRequest)
		return
	}

	creditLineType := req.CreditLineType
	if creditLineType == "" {
		creditLineType = "SALUD_COTIDIANA"
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	merchantUUID, err := parseUUID(req.MerchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	line, err := h.DB.GetCreditLineByUser(ctx, database.GetCreditLineByUserParams{
		UserID: uid,
		Type:   creditLineType,
	})
	if err != nil {
		http.Error(w, "Credit line not found", http.StatusBadRequest)
		return
	}

	var numAmt pgtype.Numeric
	numAmt.Scan(fmt.Sprintf("%.2f", req.Amount))

	sub, err := h.DB.CreateSubscription(ctx, database.CreateSubscriptionParams{
		UserID:       uid,
		MerchantID:   merchantUUID,
		CreditLineID: line.ID,
		Amount:       numAmt,
		ProductName:  req.ProductName,
	})
	if err != nil {
		http.Error(w, "Failed to create subscription: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"id":              sub.ID.String(),
		"status":          sub.Status,
		"plan":            sub.ProductName,
		"monthlyAmount":   formatNumeric(sub.Amount),
		"nextBillingDate": formatTimestamp(sub.NextBillingDate),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *PatientHandler) CancelSubscription(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	subID := chi.URLParam(r, "id")
	subUUID, err := parseUUID(subID)
	if err != nil {
		http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
		return
	}

	userUUID, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	err = h.DB.CancelSubscription(r.Context(), database.CancelSubscriptionParams{
		ID:     subUUID,
		UserID: userUUID,
	})
	if err != nil {
		http.Error(w, "Failed to cancel subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "CANCELLED",
		"message": "Subscription cancelled",
	})
}

// ─── Elder Care Subscriptions ────────────────────────────────────────────

func (h *PatientHandler) GetElderCareSubs(w http.ResponseWriter, r *http.Request) {
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

	rows, err := h.DB.GetElderCareSubsByUser(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch elder care subscriptions", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		merchantName := ""
		if row.MerchantName.Valid {
			merchantName = row.MerchantName.String
		}
		result = append(result, map[string]interface{}{
			"id":            row.ID.String(),
			"status":        row.Status,
			"serviceType":   row.ServiceType,
			"monthlyAmount": formatNumeric(row.MonthlyAmount),
			"nextBilling":   formatTimestamp(row.NextBillingDate),
			"merchant": map[string]interface{}{
				"tradeName": merchantName,
			},
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

type CreateElderCareRequest struct {
	MerchantID    string  `json:"merchantId"`
	ServiceType   string  `json:"serviceType"`
	MonthlyAmount float64 `json:"monthlyAmount"`
}

func (h *PatientHandler) CreateElderCareSub(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateElderCareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.ServiceType == "" || req.MerchantID == "" {
		http.Error(w, "serviceType and merchantId are required", http.StatusBadRequest)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	merchantUUID, err := parseUUID(req.MerchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	// Get the MAYOR_CUIDADO credit line
	line, err := h.DB.GetCreditLineByUser(r.Context(), database.GetCreditLineByUserParams{
		UserID: uid,
		Type:   "MAYOR_CUIDADO",
	})
	var creditLineID pgtype.UUID
	if err == nil {
		creditLineID = line.ID
	}

	var amountNumeric pgtype.Numeric
	amountNumeric.Scan(fmt.Sprintf("%.2f", req.MonthlyAmount))

	sub, err := h.DB.CreateElderCareSub(r.Context(), database.CreateElderCareSubParams{
		UserID:        uid,
		MerchantID:    merchantUUID,
		CreditLineID:  creditLineID,
		ServiceType:   req.ServiceType,
		MonthlyAmount: amountNumeric,
	})
	if err != nil {
		http.Error(w, "Failed to create subscription: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":          sub.ID.String(),
		"status":      sub.Status,
		"serviceType": sub.ServiceType,
	})
}

func (h *PatientHandler) CancelElderCareSub(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	subID := chi.URLParam(r, "id")
	subUUID, err := parseUUID(subID)
	if err != nil {
		http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
		return
	}

	userUUID, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	err = h.DB.CancelElderCareSub(r.Context(), database.CancelElderCareSubParams{
		ID:     subUUID,
		UserID: userUUID,
	})
	if err != nil {
		http.Error(w, "Failed to cancel subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "CANCELLED",
		"message": "Elder care subscription cancelled",
	})
}
