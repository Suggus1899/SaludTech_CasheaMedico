package admin

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

type AdminHandler struct {
	DB database.Querier
}

func (h *AdminHandler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /dashboard", h.GetDashboardStats)
	mux.HandleFunc("GET /analytics", h.GetAnalytics)
	mux.HandleFunc("GET /users", h.ListUsers)
	mux.HandleFunc("GET /users/{id}", h.GetUser)
	mux.HandleFunc("PATCH /users/{id}/status", h.UpdateUserStatus)
	mux.HandleFunc("PATCH /users/{id}/role", h.UpdateUserRole)
	mux.HandleFunc("GET /merchants", h.ListMerchants)
	mux.HandleFunc("PATCH /merchants/{id}/status", h.UpdateMerchantStatus)
	mux.HandleFunc("GET /credit-lines", h.ListCreditLines)
	mux.HandleFunc("PATCH /credit-lines/{id}/limit", h.UpdateCreditLineLimit)
	mux.HandleFunc("GET /triage/pending", h.ListPendingTriage)
	mux.HandleFunc("PUT /triage/{id}/respond", h.RespondTriage)
	mux.HandleFunc("GET /subscriptions/all", h.ListAllSubscriptions)
	mux.HandleFunc("GET /elder-care", h.ListAllElderCare)
	// CSV exports
	mux.HandleFunc("GET /export/users", h.ExportUsersCSV)
	mux.HandleFunc("GET /export/transactions", h.ExportTransactionsCSV)
	mux.HandleFunc("GET /export/installments", h.ExportInstallmentsCSV)
	return mux
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

func (h *AdminHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	totalUsers, _ := h.DB.CountUsers(ctx)
	totalPatients, _ := h.DB.CountUsersByRole(ctx, "PATIENT")
	totalMerchants, _ := h.DB.CountMerchants(ctx)
	activeMerchants, _ := h.DB.CountActiveMerchants(ctx)
	totalTransactions, _ := h.DB.CountTransactions(ctx)
	totalRevenue, _ := h.DB.SumTotalTransactionAmount(ctx)
	overdueCount, _ := h.DB.CountOverdueInstallments(ctx)
	pendingAmount, _ := h.DB.SumPendingInstallments(ctx)
	totalCreditLines, _ := h.DB.CountCreditLines(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users":               totalUsers,
		"patients":            totalPatients,
		"merchants":           totalMerchants,
		"activeMerchants":     activeMerchants,
		"transactions":        totalTransactions,
		"totalRevenue":        totalRevenue,
		"overdueInstallments": overdueCount,
		"pendingAmount":       pendingAmount,
		"creditLines":         totalCreditLines,
	})
}

// ─── User Management ──────────────────────────────────────────────────────

func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	limit, offset := parsePagination(r, 50)

	users, err := h.DB.ListUsers(ctx, database.ListUsersParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch users"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountUsers(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *AdminHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")

	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	user, err := h.DB.GetUserByIDAdmin(ctx, uuid)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AdminHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")

	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		IsActive bool `json:"isActive"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updated, err := h.DB.UpdateUserStatus(ctx, database.UpdateUserStatusParams{
		ID:       uuid,
		IsActive: req.IsActive,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to update user status"}`, http.StatusInternalServerError)
		return
	}
	_ = updated

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User status updated"})
}

func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")

	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Role != "PATIENT" && req.Role != "MERCHANT" && req.Role != "ADMIN" {
		http.Error(w, `{"error":"Invalid role. Must be PATIENT, MERCHANT, or ADMIN"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.UpdateUserRole(ctx, database.UpdateUserRoleParams{
		ID:   uuid,
		Role: req.Role,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update user role"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User role updated"})
}

// ─── Merchant Management ──────────────────────────────────────────────────

func (h *AdminHandler) ListMerchants(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	merchants, err := h.DB.ListAllMerchants(ctx)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch merchants"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountMerchants(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"merchants": merchants,
		"total":     total,
	})
}

func (h *AdminHandler) UpdateMerchantStatus(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")

	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid merchant ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		IsActive bool `json:"isActive"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updated, err := h.DB.UpdateMerchantStatus(ctx, database.UpdateMerchantStatusParams{
		ID:       uuid,
		IsActive: req.IsActive,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to update merchant status"}`, http.StatusInternalServerError)
		return
	}
	_ = updated

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Merchant status updated"})
}

// ─── Credit Line Management ───────────────────────────────────────────────

func (h *AdminHandler) ListCreditLines(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	limit, offset := parsePagination(r, 50)

	lines, err := h.DB.ListAllCreditLines(ctx, database.ListAllCreditLinesParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch credit lines"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountCreditLines(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"creditLines": lines,
		"total":       total,
		"limit":       limit,
		"offset":      offset,
	})
}

func (h *AdminHandler) UpdateCreditLineLimit(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")

	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid credit line ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		LimitUSD float64 `json:"limitUSD"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.LimitUSD <= 0 {
		http.Error(w, `{"error":"Limit must be greater than 0"}`, http.StatusBadRequest)
		return
	}
	if req.LimitUSD > 100000 {
		http.Error(w, `{"error":"Limit must not exceed $100,000"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.UpdateCreditLineLimit(ctx, database.UpdateCreditLineLimitParams{
		ID:       uuid,
		LimitUsd: floatToNumeric(req.LimitUSD),
	}); err != nil {
		http.Error(w, `{"error":"Failed to update credit line limit"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Credit line limit updated"})
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

// Ensure unused import is referenced

// ─── Triage Management ────────────────────────────────────────────────────

func (h *AdminHandler) ListPendingTriage(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	limit, offset := parsePagination(r, 50)

	triage, err := h.DB.ListPendingTriage(ctx, database.ListPendingTriageParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch triage"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountPendingTriage(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"triage": triage,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *AdminHandler) RespondTriage(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id := r.PathValue("id")
	var triageID pgtype.UUID
	if err := triageID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid triage ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Status         string `json:"status"`
		Recommendation string `json:"recommendation"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Status == "" {
		req.Status = "RESOLVED"
	}

	var rec pgtype.Text
	if req.Recommendation != "" {
		rec = pgtype.Text{String: req.Recommendation, Valid: true}
	}

	updated, err := h.DB.RespondTriage(ctx, database.RespondTriageParams{
		ID:             triageID,
		ID_2:           triageID,
		Status:         req.Status,
		Recommendation: rec,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to respond to triage"}`, http.StatusInternalServerError)
		return
	}
	_ = updated

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Triage updated"})
}

// ─── All Subscriptions ─────────────────────────────────────────────────────

func (h *AdminHandler) ListAllSubscriptions(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	limit, offset := parsePagination(r, 50)

	subs, err := h.DB.ListAllSubscriptions(ctx, database.ListAllSubscriptionsParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch subscriptions"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountAllSubscriptions(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"subscriptions": subs,
		"total":         total,
		"limit":         limit,
		"offset":        offset,
	})
}

// ─── All Elder Care ─────────────────────────────────────────────────────────

func (h *AdminHandler) ListAllElderCare(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	limit, offset := parsePagination(r, 50)

	subs, err := h.DB.ListAllElderCareSubs(ctx, database.ListAllElderCareSubsParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch elder care subscriptions"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountAllElderCareSubs(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"subscriptions": subs,
		"total":          total,
		"limit":          limit,
		"offset":          offset,
	})
}
// ─── Analytics ──────────────────────────────────────────────────────────────

func (h *AdminHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	revenueByMonth, _ := h.DB.GetRevenueByMonth(ctx)
	txnStatus, _ := h.DB.GetTransactionStatusBreakdown(ctx)
	installmentStatus, _ := h.DB.GetInstallmentStatusBreakdown(ctx)
	topMerchants, _ := h.DB.GetTopMerchantsByRevenue(ctx)
	categoryDist, _ := h.DB.GetMerchantCategoryDistribution(ctx)
	triageConversion, _ := h.DB.GetTriageConversion(ctx)

	// Reverse revenueByMonth so oldest is first (for line chart)
	for i, j := 0, len(revenueByMonth)-1; i < j; i, j = i+1, j-1 {
		revenueByMonth[i], revenueByMonth[j] = revenueByMonth[j], revenueByMonth[i]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"revenueByMonth":       revenueByMonth,
		"transactionStatus":    txnStatus,
		"installmentStatus":    installmentStatus,
		"topMerchants":         topMerchants,
		"categoryDistribution": categoryDist,
		"triageConversion":     triageConversion,
	})
}

var _ = auth.GetRole
