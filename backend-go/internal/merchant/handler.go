package merchant

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// floatToNumeric converts a float64 to pgtype.Numeric via string scanning.
func floatToNumeric(f float64) pgtype.Numeric {
	var n pgtype.Numeric
	_ = n.Scan(fmt.Sprintf("%.2f", f))
	return n
}

// textToPgText converts a string to pgtype.Text.
func textToPgText(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}

// intToInt2 converts an int to pgtype.Int2.
func intToInt2(v int) pgtype.Int2 {
	return pgtype.Int2{Int16: int16(v), Valid: true}
}

// intToInt4 converts an int to pgtype.Int4.
func intToInt4(v int) pgtype.Int4 {
	return pgtype.Int4{Int32: int32(v), Valid: true}
}

type MerchantHandler struct {
	DB database.Querier
}

func (h *MerchantHandler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /profile", h.GetProfile)
	mux.HandleFunc("GET /dashboard", h.GetDashboardStats)
	mux.HandleFunc("GET /transactions", h.ListTransactions)
	mux.HandleFunc("GET /payouts", h.GetPayouts)
	mux.HandleFunc("GET /services", h.ListServices)
	mux.HandleFunc("POST /services", h.CreateService)
	mux.HandleFunc("PUT /services/{id}", h.UpdateService)
	mux.HandleFunc("DELETE /services/{id}", h.DeleteService)
	mux.HandleFunc("GET /supplies", h.ListSupplies)
	mux.HandleFunc("POST /supplies", h.CreateSupply)
	mux.HandleFunc("PUT /supplies/{id}", h.UpdateSupply)
	mux.HandleFunc("DELETE /supplies/{id}", h.DeleteSupply)
	mux.HandleFunc("POST /qr/generate", h.GenerateQR)
	mux.HandleFunc("GET /qr/{token}/status", h.GetQRStatus)
	mux.HandleFunc("GET /elder-care/subscriptions", h.ListElderCareSubs)
	return mux
}

// getMerchantID extracts the merchant_id for the authenticated user.
// Returns "" if the user is not linked to a merchant.
func (h *MerchantHandler) getMerchantID(ctx context.Context) (pgtype.UUID, error) {
	userID := auth.GetUserID(ctx)
	var uid pgtype.UUID
	if err := uid.Scan(userID); err != nil {
		return pgtype.UUID{}, err
	}
	merchant, err := h.DB.GetMerchantByUserID(ctx, uid)
	if err != nil {
		return pgtype.UUID{}, err
	}
	return merchant.ID, nil
}

// ─── Profile ──────────────────────────────────────────────────────────────

func (h *MerchantHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	merchant, err := h.DB.GetMerchantByID(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Merchant not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(merchant)
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

func (h *MerchantHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	stats, err := h.DB.GetMerchantDashboardStats(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch dashboard stats"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// ─── Transactions ─────────────────────────────────────────────────────────

func (h *MerchantHandler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	limit, offset := parsePagination(r, 50)

	transactions, err := h.DB.GetMerchantTransactions(ctx, database.GetMerchantTransactionsParams{
		MerchantID: merchantID,
		Limit:      int32(limit),
		Offset:     int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch transactions"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountMerchantTransactions(ctx, merchantID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"transactions": transactions,
		"total":        total,
		"limit":        limit,
		"offset":       offset,
	})
}

// ─── Payouts (filtered by merchant) ───────────────────────────────────────

func (h *MerchantHandler) GetPayouts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	payouts, err := h.DB.GetMerchantPayoutsFiltered(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch payouts"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"payouts": payouts,
	})
}

// ─── Services CRUD ────────────────────────────────────────────────────────

func (h *MerchantHandler) ListServices(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	services, err := h.DB.GetServicesByMerchant(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch services"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"services": services,
	})
}

type ServiceRequest struct {
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Category     string  `json:"category"`
	Subcategory  string  `json:"subcategory"`
	PriceUSD     float64 `json:"priceUSD"`
	DurationMin  int     `json:"durationMin"`
	IsActive     bool    `json:"isActive"`
}

func (h *MerchantHandler) CreateService(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	var req ServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.PriceUSD <= 0 {
		http.Error(w, `{"error":"Name and price are required"}`, http.StatusBadRequest)
		return
	}

	duration := int16(30)
	if req.DurationMin > 0 {
		duration = int16(req.DurationMin)
	}

	service, err := h.DB.CreateMedicalService(ctx, database.CreateMedicalServiceParams{
		MerchantID:   merchantID,
		Name:         req.Name,
		Description:  textToPgText(req.Description),
		Category:     req.Category,
		Subcategory:  textToPgText(req.Subcategory),
		PriceUsd:     floatToNumeric(req.PriceUSD),
		DurationMin:  intToInt2(int(duration)),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create service"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(service)
}

func (h *MerchantHandler) UpdateService(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	id := r.PathValue("id")
	var serviceID pgtype.UUID
	if err := serviceID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid service ID"}`, http.StatusBadRequest)
		return
	}

	var req ServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	duration := int16(30)
	if req.DurationMin > 0 {
		duration = int16(req.DurationMin)
	}

	if err := h.DB.UpdateMedicalService(ctx, database.UpdateMedicalServiceParams{
		ID:          serviceID,
		Name:        req.Name,
		Description: textToPgText(req.Description),
		Category:    req.Category,
		Subcategory: textToPgText(req.Subcategory),
		PriceUsd:    floatToNumeric(req.PriceUSD),
		DurationMin: intToInt2(int(duration)),
		IsActive:    req.IsActive,
		MerchantID:  merchantID,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update service"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Service updated"})
}

func (h *MerchantHandler) DeleteService(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	id := r.PathValue("id")
	var serviceID pgtype.UUID
	if err := serviceID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid service ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.DeleteMedicalService(ctx, database.DeleteMedicalServiceParams{
		ID:         serviceID,
		MerchantID: merchantID,
	}); err != nil {
		http.Error(w, `{"error":"Failed to delete service"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Service deleted"})
}

// ─── Supplies CRUD ────────────────────────────────────────────────────────

func (h *MerchantHandler) ListSupplies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	supplies, err := h.DB.GetSuppliesByMerchant(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch supplies"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"supplies": supplies,
	})
}

type SupplyRequest struct {
	Name                string  `json:"name"`
	Description         string  `json:"description"`
	Category            string  `json:"category"`
	Subcategory         string  `json:"subcategory"`
	PriceUSD            float64 `json:"priceUSD"`
	Unit                string  `json:"unit"`
	Stock               int     `json:"stock"`
	MinStock            int     `json:"minStock"`
	RequiresPrescription bool    `json:"requiresPrescription"`
	IsActive            bool    `json:"isActive"`
}

func (h *MerchantHandler) CreateSupply(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	var req SupplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.PriceUSD <= 0 {
		http.Error(w, `{"error":"Name and price are required"}`, http.StatusBadRequest)
		return
	}

	unit := req.Unit
	if unit == "" {
		unit = "unidad"
	}

	minStock := int32(10)
	if req.MinStock > 0 {
		minStock = int32(req.MinStock)
	}

	supply, err := h.DB.CreateMedicalSupply(ctx, database.CreateMedicalSupplyParams{
		MerchantID:           merchantID,
		Name:                 req.Name,
		Description:          textToPgText(req.Description),
		Category:             req.Category,
		Subcategory:          textToPgText(req.Subcategory),
		PriceUsd:             floatToNumeric(req.PriceUSD),
		Unit:                 textToPgText(unit),
		Stock:                int32(req.Stock),
		MinStock:             intToInt4(int(minStock)),
		RequiresPrescription: req.RequiresPrescription,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create supply"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(supply)
}

func (h *MerchantHandler) UpdateSupply(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	id := r.PathValue("id")
	var supplyID pgtype.UUID
	if err := supplyID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid supply ID"}`, http.StatusBadRequest)
		return
	}

	var req SupplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	unit := req.Unit
	if unit == "" {
		unit = "unidad"
	}

	minStock := int32(10)
	if req.MinStock > 0 {
		minStock = int32(req.MinStock)
	}

	if err := h.DB.UpdateMedicalSupply(ctx, database.UpdateMedicalSupplyParams{
		ID:                   supplyID,
		Name:                 req.Name,
		Description:          textToPgText(req.Description),
		Category:             req.Category,
		Subcategory:          textToPgText(req.Subcategory),
		PriceUsd:             floatToNumeric(req.PriceUSD),
		Unit:                 textToPgText(unit),
		Stock:                int32(req.Stock),
		MinStock:             intToInt4(int(minStock)),
		RequiresPrescription: req.RequiresPrescription,
		IsActive:             req.IsActive,
		MerchantID:           merchantID,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update supply"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Supply updated"})
}

func (h *MerchantHandler) DeleteSupply(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	id := r.PathValue("id")
	var supplyID pgtype.UUID
	if err := supplyID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid supply ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.DeleteMedicalSupply(ctx, database.DeleteMedicalSupplyParams{
		ID:         supplyID,
		MerchantID: merchantID,
	}); err != nil {
		http.Error(w, `{"error":"Failed to delete supply"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Supply deleted"})
}

// ─── Helpers ──────────────────────────────────────────────────────────────

func parsePagination(r *http.Request, defaultLimit int) (int, int) {
	limit := defaultLimit
	offset := 0
	if l := r.URL.Query().Get("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 && v <= 200 {
			limit = v
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if v, err := strconv.Atoi(o); err == nil && v >= 0 {
			offset = v
		}
	}
	return limit, offset
}

// ─── QR Token Generation ───────────────────────────────────────────────────

func (h *MerchantHandler) GenerateQR(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	var req struct {
		Amount      float64 `json:"amount"`
		Description string  `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		http.Error(w, `{"error":"Amount must be positive"}`, http.StatusBadRequest)
		return
	}

	var desc pgtype.Text
	if req.Description != "" {
		desc = pgtype.Text{String: req.Description, Valid: true}
	}

	token, err := h.DB.CreateQRToken(ctx, database.CreateQRTokenParams{
		MerchantID:  merchantID,
		Amount:      floatToNumeric(req.Amount),
		Description: desc,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to generate QR token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"qrToken":   token.Token,
		"amount":    req.Amount,
		"expiresAt": token.ExpiresAt,
	})
}

func (h *MerchantHandler) GetQRStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	token := r.PathValue("token")
	if token == "" {
		http.Error(w, `{"error":"Token required"}`, http.StatusBadRequest)
		return
	}

	qr, err := h.DB.GetQRToken(ctx, token)
	if err != nil {
		http.Error(w, `{"error":"QR token not found or expired"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   qr.Status,
		"amount":   qr.Amount,
		"token":    qr.Token,
	})
}

// ─── Elder Care Subscriptions ──────────────────────────────────────────────

func (h *MerchantHandler) ListElderCareSubs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	merchantID, err := h.getMerchantID(ctx)
	if err != nil {
		http.Error(w, `{"error":"No merchant profile linked to this user"}`, http.StatusNotFound)
		return
	}

	subs, err := h.DB.ListElderCareSubsByMerchant(ctx, merchantID)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch elder care subscriptions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}
