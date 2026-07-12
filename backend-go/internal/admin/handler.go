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
	mux.HandleFunc("GET /users", h.ListUsers)
	mux.HandleFunc("GET /users/{id}", h.GetUser)
	mux.HandleFunc("PATCH /users/{id}/status", h.UpdateUserStatus)
	mux.HandleFunc("PATCH /users/{id}/role", h.UpdateUserRole)
	mux.HandleFunc("GET /merchants", h.ListMerchants)
	mux.HandleFunc("PATCH /merchants/{id}/status", h.UpdateMerchantStatus)
	mux.HandleFunc("GET /credit-lines", h.ListCreditLines)
	mux.HandleFunc("PATCH /credit-lines/{id}/limit", h.UpdateCreditLineLimit)
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

	if err := h.DB.UpdateUserStatus(ctx, database.UpdateUserStatusParams{
		ID:       uuid,
		IsActive: req.IsActive,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update user status"}`, http.StatusInternalServerError)
		return
	}

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

	if err := h.DB.UpdateMerchantStatus(ctx, database.UpdateMerchantStatusParams{
		ID:       uuid,
		IsActive: req.IsActive,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update merchant status"}`, http.StatusInternalServerError)
		return
	}

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
var _ = auth.GetRole
