package patient

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/bcv"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/fakepay"
)

type PatientHandler struct {
	DB        database.Querier
	BCVClient *bcv.Client
	FakePay   *fakepay.Client
}

func numericToFloat(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0
	}
	f, err := n.Float64Value()
	if err != nil {
		return 0
	}
	return f.Float64
}

func formatNumeric(n pgtype.Numeric) float64 {
	return math.Round(numericToFloat(n)*100) / 100
}

func formatDate(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format("2006-01-02")
}

func formatTimestamp(t pgtype.Timestamptz) string {
	if !t.Valid {
		return ""
	}
	return t.Time.Format(time.RFC3339)
}

func parseUUID(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	err := u.Scan(s)
	return u, err
}

func severityToPriority(severity int16) string {
	if severity >= 8 {
		return "EMERGENCY"
	}
	if severity >= 5 {
		return "HIGH"
	}
	if severity >= 3 {
		return "MEDIUM"
	}
	return "LOW"
}

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
	uid, err := parseUUID(instID)
	if err != nil {
		http.Error(w, "Invalid installment ID", http.StatusBadRequest)
		return
	}

	row, err := h.DB.GetInstallmentWithDetails(r.Context(), uid)
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

// ─── Transactions ────────────────────────────────────────────────────────

type PreviewRequest struct {
	MerchantID           string  `json:"merchantId"`
	Amount               float64 `json:"amount"`
	RequestedInstallments int     `json:"requestedInstallments"`
	QRToken              string  `json:"qrToken"`
}

func (h *PatientHandler) PreviewTransaction(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req PreviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.MerchantID == "" || req.Amount <= 0 {
		http.Error(w, "merchantId and amount are required", http.StatusBadRequest)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.DB.GetUserByID(r.Context(), uid)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Down payment based on level
	level := int(user.Level)
	var downPaymentPct float64
	switch level {
	case 1:
		downPaymentPct = 0.60
	case 2:
		downPaymentPct = 0.50
	default:
		downPaymentPct = 0.40
	}

	downPayment := math.Round((req.Amount*downPaymentPct)*100) / 100
	financedAmount := req.Amount - downPayment
	numInst := req.RequestedInstallments
	if numInst <= 0 {
		numInst = 3
	}
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100

	bcvRate := h.getBCVRateCached(r)

	installments := make([]map[string]interface{}, 0, numInst)
	for i := 1; i <= numInst; i++ {
		dueDate := time.Now().AddDate(0, 0, i*15)
		entry := map[string]interface{}{
			"amount":            installmentAmount,
			"dueDate":           dueDate.Format("2006-01-02"),
			"installmentNumber": i,
		}
		if bcvRate > 0 {
			entry["amountVES"] = math.Round(installmentAmount*bcvRate*100) / 100
		}
		installments = append(installments, entry)
	}

	resp := map[string]interface{}{
		"merchantId":            req.MerchantID,
		"amount":                req.Amount,
		"requestedInstallments": numInst,
		"downPayment":           downPayment,
		"financedAmount":        financedAmount,
		"installments":          installments,
		"total":                 req.Amount,
	}
	if bcvRate > 0 {
		resp["bcvRate"] = bcvRate
		resp["amountVES"] = math.Round(req.Amount*bcvRate*100) / 100
		resp["downPaymentVES"] = math.Round(downPayment*bcvRate*100) / 100
		resp["financedAmountVES"] = math.Round(financedAmount*bcvRate*100) / 100
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type CreateTransactionRequest struct {
	MerchantID            string  `json:"merchantId"`
	Amount                float64 `json:"amount"`
	RequestedInstallments int     `json:"requestedInstallments"`
	QRToken               string  `json:"qrToken"`
}

func (h *PatientHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.MerchantID == "" || req.Amount <= 0 {
		http.Error(w, "merchantId and amount are required", http.StatusBadRequest)
		return
	}

	numInst := req.RequestedInstallments
	if numInst <= 0 {
		numInst = 3
	}

	// Use the credit service via a direct DB call
	// Default to ESPECIALIDAD_PRINCIPAL credit line
	creditLineType := "ESPECIALIDAD_PRINCIPAL"

	// We need to call the credit service, but it's in a different package.
	// For now, we'll do a simplified version here.
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

	// Get user
	user, err := h.DB.GetUserByID(ctx, uid)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Get credit line
	line, err := h.DB.GetCreditLineByUser(ctx, database.GetCreditLineByUserParams{
		UserID: uid,
		Type:   creditLineType,
	})
	if err != nil {
		http.Error(w, "Credit line not found", http.StatusBadRequest)
		return
	}

	if line.Status != "ACTIVE" {
		http.Error(w, "Credit line is not active", http.StatusBadRequest)
		return
	}

	// Validate limit
	limitUSD := numericToFloat(line.LimitUsd)
	usedUSD := numericToFloat(line.UsedUsd)
	available := limitUSD - usedUSD

	// Calculate down payment
	level := int(user.Level)
	var downPaymentPct float64
	switch level {
	case 1:
		downPaymentPct = 0.60
	case 2:
		downPaymentPct = 0.50
	default:
		downPaymentPct = 0.40
	}

	downPayment := math.Round((req.Amount*downPaymentPct)*100) / 100
	financedAmount := req.Amount - downPayment

	if financedAmount > available {
		http.Error(w, fmt.Sprintf("Insufficient credit: available %.2f, financed %.2f", available, financedAmount), http.StatusBadRequest)
		return
	}

	// Get merchant for MDR
	merchant, err := h.DB.GetMerchantByID(ctx, merchantUUID)
	if err != nil {
		http.Error(w, "Merchant not found", http.StatusBadRequest)
		return
	}

	mdrRate := numericToFloat(merchant.MdrRate)
	mdrFee := math.Round((financedAmount*mdrRate)*100) / 100

	// Create transaction
	var numericTotal, numericDown, numericFin, numericMDR pgtype.Numeric
	numericTotal.Scan(fmt.Sprintf("%.2f", req.Amount))
	numericDown.Scan(fmt.Sprintf("%.2f", downPayment))
	numericFin.Scan(fmt.Sprintf("%.2f", financedAmount))
	numericMDR.Scan(fmt.Sprintf("%.2f", mdrFee))

	trx, err := h.DB.CreateTransaction(ctx, database.CreateTransactionParams{
		UserID:          uid,
		MerchantID:      merchantUUID,
		CreditLineID:    line.ID,
		TotalAmount:     numericTotal,
		DownPayment:     numericDown,
		FinancedAmount:  numericFin,
		NumInstallments: int16(numInst),
		QrCodeToken:     pgtype.Text{String: req.QRToken, Valid: req.QRToken != ""},
		MdrFee:          numericMDR,
		Description:     pgtype.Text{String: "BNPL Purchase", Valid: true},
	})
	if err != nil {
		http.Error(w, "Failed to create transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create installments every 15 days
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100
	for i := 1; i <= numInst; i++ {
		var numAmt pgtype.Numeric
		numAmt.Scan(fmt.Sprintf("%.2f", installmentAmount))

		dueDate := time.Now().AddDate(0, 0, i*15)
		var pgDate pgtype.Date
		pgDate.Scan(dueDate)

		_, err = h.DB.CreateInstallment(ctx, database.CreateInstallmentParams{
			TransactionID:  trx.ID,
			UserID:         uid,
			InstallmentNum: int16(i),
			Amount:         numAmt,
			DueDate:        pgDate,
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create installment %d: %v", i, err), http.StatusInternalServerError)
			return
		}
	}

	// Update credit line usage
	var newUsed pgtype.Numeric
	newUsed.Scan(fmt.Sprintf("%.2f", usedUSD+financedAmount))
	_, err = h.DB.UpdateCreditLineUsage(ctx, database.UpdateCreditLineUsageParams{
		UserID:  uid,
		Type:    creditLineType,
		UsedUsd: newUsed,
		Status:  "ACTIVE",
	})
	if err != nil {
		http.Error(w, "Failed to update credit line: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":     trx.ID.String(),
		"status": "APPROVED",
	})
}

// ─── Payments ────────────────────────────────────────────────────────────

type PaymentRequest struct {
	InstallmentID string `json:"installmentId"`
	Method        string `json:"method"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Reference     string `json:"reference"`

	// Card data for fakePayment API
	CardNumber      string `json:"cardNumber"`
	CVV             string `json:"cvv"`
	ExpirationMonth string `json:"expirationMonth"`
	ExpirationYear  string `json:"expirationYear"`
	FullName        string `json:"fullName"`
}

func (h *PatientHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.InstallmentID == "" {
		http.Error(w, "installmentId is required", http.StatusBadRequest)
		return
	}

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	instUUID, err := parseUUID(req.InstallmentID)
	if err != nil {
		http.Error(w, "Invalid installment ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Get installment to know the amount
	inst, err := h.DB.GetInstallmentWithDetails(ctx, instUUID)
	if err != nil {
		http.Error(w, "Installment not found", http.StatusNotFound)
		return
	}

	amountUSD := formatNumeric(inst.Amount)

	// ─── Call fakePayment API ────────────────────────────────────────────
	// Determine currency: use VES if BCV rate is available, otherwise USD
	currency := "USD"
	description := fmt.Sprintf("Cuota #%d - SaludTech", inst.InstallmentNum)
	ref := req.Reference
	if ref == "" {
		ref = fmt.Sprintf("installment:%s", instUUID.String())
	}

	var fakePayTxn *fakepay.PaymentData
	if h.FakePay != nil && req.CardNumber != "" {
		payReq := fakepay.PaymentRequest{
			Amount:          fmt.Sprintf("%.2f", amountUSD),
			CardNumber:      req.CardNumber,
			CVV:             req.CVV,
			ExpirationMonth: req.ExpirationMonth,
			ExpirationYear:  req.ExpirationYear,
			FullName:        req.FullName,
			Currency:        currency,
			Description:     description,
			Reference:       ref,
		}

		fakePayTxn, err = h.FakePay.ProcessPayment(ctx, payReq)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPaymentRequired)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":  "REJECTED",
				"message": "Payment gateway rejected: " + err.Error(),
			})
			return
		}
	}

	// Create payment record in DB
	var amountPaid pgtype.Numeric
	amountPaid.Scan(fmt.Sprintf("%.2f", amountUSD))

	refText := pgtype.Text{String: ref, Valid: ref != ""}
	if fakePayTxn != nil {
		refText = pgtype.Text{String: fakePayTxn.TransactionID, Valid: true}
	}

	_, err = h.DB.CreatePaymentRecord(ctx, database.CreatePaymentRecordParams{
		InstallmentID: instUUID,
		UserID:        uid,
		AmountPaid:    amountPaid,
		PaymentMethod: req.Method,
		ReferenceCode: refText,
	})
	if err != nil {
		http.Error(w, "Failed to record payment", http.StatusInternalServerError)
		return
	}

	// Mark installment as paid
	_, err = h.DB.ProcessInstallmentPayment(ctx, instUUID)
	if err != nil {
		http.Error(w, "Failed to process payment", http.StatusInternalServerError)
		return
	}

	// Add gamification points
	_ = h.DB.AddUserPoints(ctx, database.AddUserPointsParams{
		ID:     uid,
		Points: 10,
	})

	// Check and level up
	_ = h.DB.CheckAndLevelUpUser(ctx, uid)

	bcvRate := h.getBCVRateCached(r)

	resp := map[string]interface{}{
		"status":  "PAID",
		"message": "Payment processed successfully",
		"amount":  amountUSD,
	}
	if fakePayTxn != nil {
		resp["gatewayTransactionId"] = fakePayTxn.TransactionID
	}
	if bcvRate > 0 {
		resp["amountVES"] = math.Round(amountUSD*bcvRate*100) / 100
		resp["bcvRate"] = bcvRate
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

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
			"id":           row.ID.String(),
			"status":       row.Status,
			"plan":         row.ProductName,
			"monthlyAmount": formatNumeric(row.Amount),
			"nextBilling":  formatTimestamp(row.NextBillingDate),
			"merchant": map[string]interface{}{
				"tradeName": merchantName,
			},
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

type CreateSubscriptionRequest struct {
	MerchantID     string `json:"merchantId"`
	CreditLineType string `json:"creditLineType"`
	ProductName    string `json:"productName"`
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
		"id":             sub.ID.String(),
		"status":         sub.Status,
		"plan":           sub.ProductName,
		"monthlyAmount":  formatNumeric(sub.Amount),
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
	uid, err := parseUUID(subID)
	if err != nil {
		http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
		return
	}

	err = h.DB.CancelSubscription(r.Context(), uid)
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
	uid, err := parseUUID(subID)
	if err != nil {
		http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
		return
	}

	err = h.DB.CancelElderCareSub(r.Context(), uid)
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
		http.Error(w, "symptoms is required", http.StatusBadRequest)
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

// ─── BCV / Exchange Rates ────────────────────────────────────────────────

func (h *PatientHandler) GetBCVRate(w http.ResponseWriter, r *http.Request) {
	if h.BCVClient == nil {
		http.Error(w, "BCV client not configured", http.StatusServiceUnavailable)
		return
	}

	rate, err := h.BCVClient.GetCurrentBCV(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch BCV rate: "+err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"current": map[string]interface{}{
			"usd":  rate.Current.USD,
			"eur":  rate.Current.EUR,
			"date": rate.Current.Date,
		},
		"previous": map[string]interface{}{
			"usd":  rate.Previous.USD,
			"eur":  rate.Previous.EUR,
			"date": rate.Previous.Date,
		},
		"changePercentage": map[string]interface{}{
			"usd": rate.ChangePercentage.USD,
			"eur": rate.ChangePercentage.EUR,
		},
	})
}

func (h *PatientHandler) GetUSDTRate(w http.ResponseWriter, r *http.Request) {
	if h.BCVClient == nil {
		http.Error(w, "BCV client not configured", http.StatusServiceUnavailable)
		return
	}

	rate, err := h.BCVClient.GetCurrentUSDT(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch USDT rate: "+err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"current": map[string]interface{}{
			"buy":     rate.Current.Buy,
			"sell":    rate.Current.Sell,
			"average": rate.Current.Average,
			"date":    rate.Current.Date,
		},
		"previous": map[string]interface{}{
			"buy":     rate.Previous.Buy,
			"sell":    rate.Previous.Sell,
			"average": rate.Previous.Average,
			"date":    rate.Previous.Date,
		},
		"changePercentage": map[string]interface{}{
			"buy":     rate.ChangePercentage.Buy,
			"sell":    rate.ChangePercentage.Sell,
			"average": rate.ChangePercentage.Average,
		},
	})
}

// getBCVRateCached fetches the BCV USD rate for VES conversion.
// Returns 0 if the client is not configured or the fetch fails.
func (h *PatientHandler) getBCVRateCached(r *http.Request) float64 {
	if h.BCVClient == nil {
		return 0
	}
	rate, err := h.BCVClient.GetCurrentBCV(r.Context())
	if err != nil || rate == nil {
		return 0
	}
	return rate.Current.USD
}

// ─── Medical Catalog ─────────────────────────────────────────────────────

func (h *PatientHandler) GetMerchants(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")

	merchants, err := h.DB.GetMerchantsByCategory(r.Context(), category)
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
		subcat := ""
		if m.Subcategory.Valid {
			subcat = m.Subcategory.String
		}
		result = append(result, map[string]interface{}{
			"id":          m.ID.String(),
			"tradeName":   m.TradeName,
			"category":    m.Category,
			"subcategory": subcat,
			"city":        city,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) GetMerchantServices(w http.ResponseWriter, r *http.Request) {
	merchantID := chi.URLParam(r, "id")
	mid, err := parseUUID(merchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	services, err := h.DB.GetServicesByMerchant(r.Context(), mid)
	if err != nil {
		http.Error(w, "Failed to fetch services", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(services))
	for _, s := range services {
		price := formatNumeric(s.PriceUsd)
		entry := map[string]interface{}{
			"id":          s.ID.String(),
			"name":        s.Name,
			"description": s.Description.String,
			"category":    s.Category,
			"subcategory": s.Subcategory.String,
			"priceUsd":    price,
			"durationMin": s.DurationMin,
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) GetMerchantSupplies(w http.ResponseWriter, r *http.Request) {
	merchantID := chi.URLParam(r, "id")
	mid, err := parseUUID(merchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	supplies, err := h.DB.GetSuppliesByMerchant(r.Context(), mid)
	if err != nil {
		http.Error(w, "Failed to fetch supplies", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(supplies))
	for _, s := range supplies {
		price := formatNumeric(s.PriceUsd)
		entry := map[string]interface{}{
			"id":                   s.ID.String(),
			"name":                 s.Name,
			"description":          s.Description.String,
			"category":             s.Category,
			"subcategory":          s.Subcategory.String,
			"priceUsd":             price,
			"unit":                 s.Unit,
			"stock":                s.Stock,
			"requiresPrescription": s.RequiresPrescription,
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) SearchCatalogServices(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")

	rows, err := h.DB.SearchServices(r.Context(), database.SearchServicesParams{
		Column1: category,
		Column2: search,
	})
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(rows))
	for _, s := range rows {
		price := formatNumeric(s.PriceUsd)
		city := ""
		if s.MerchantCity.Valid {
			city = s.MerchantCity.String
		}
		entry := map[string]interface{}{
			"id":            s.ID.String(),
			"name":          s.Name,
			"description":   s.Description.String,
			"category":      s.Category,
			"subcategory":   s.Subcategory.String,
			"priceUsd":      price,
			"durationMin":   s.DurationMin,
			"merchantName":  s.MerchantName,
			"merchantCity":  city,
			"merchantId":    s.MerchantID.String(),
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) SearchCatalogSupplies(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")

	rows, err := h.DB.SearchSupplies(r.Context(), database.SearchSuppliesParams{
		Column1: category,
		Column2: search,
	})
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(rows))
	for _, s := range rows {
		price := formatNumeric(s.PriceUsd)
		city := ""
		if s.MerchantCity.Valid {
			city = s.MerchantCity.String
		}
		entry := map[string]interface{}{
			"id":                   s.ID.String(),
			"name":                 s.Name,
			"description":          s.Description.String,
			"category":             s.Category,
			"subcategory":          s.Subcategory.String,
			"priceUsd":             price,
			"unit":                 s.Unit,
			"requiresPrescription": s.RequiresPrescription,
			"merchantName":         s.MerchantName,
			"merchantCity":         city,
			"merchantId":           s.MerchantID.String(),
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ─── Checkout (multi-item purchase) ──────────────────────────────────────

type CheckoutItem struct {
	Type     string `json:"type"`     // "SERVICE" or "SUPPLY"
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}

type CheckoutRequest struct {
	MerchantID         string         `json:"merchantId"`
	Items              []CheckoutItem `json:"items"`
	RequestedInstallments int         `json:"requestedInstallments"`
	CreditLineType     string         `json:"creditLineType"`
}

func (h *PatientHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.MerchantID == "" || len(req.Items) == 0 {
		http.Error(w, "merchantId and items are required", http.StatusBadRequest)
		return
	}

	creditLineType := req.CreditLineType
	if creditLineType == "" {
		creditLineType = "ESPECIALIDAD_PRINCIPAL"
	}

	numInst := req.RequestedInstallments
	if numInst <= 0 {
		numInst = 3
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

	// Get user for down payment calculation
	user, err := h.DB.GetUserByID(ctx, uid)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Get credit line
	line, err := h.DB.GetCreditLineByUser(ctx, database.GetCreditLineByUserParams{
		UserID: uid,
		Type:   creditLineType,
	})
	if err != nil {
		http.Error(w, "Credit line not found", http.StatusBadRequest)
		return
	}

	if line.Status != "ACTIVE" {
		http.Error(w, "Credit line is not active", http.StatusBadRequest)
		return
	}

	// Validate items and calculate total
	limitUSD := numericToFloat(line.LimitUsd)
	usedUSD := numericToFloat(line.UsedUsd)
	available := limitUSD - usedUSD

	var totalAmount float64
	type itemInfo struct {
		name     string
		price    float64
		qty      int
		svcID    pgtype.UUID
		supID    pgtype.UUID
		isSupply bool
	}
	items := make([]itemInfo, 0, len(req.Items))

	for _, ci := range req.Items {
		if ci.Quantity <= 0 {
			ci.Quantity = 1
		}
		var info itemInfo
		info.qty = ci.Quantity

		if ci.Type == "SERVICE" {
			svcID, err := parseUUID(ci.ID)
			if err != nil {
				http.Error(w, "Invalid service ID: "+ci.ID, http.StatusBadRequest)
				return
			}
			svc, err := h.DB.GetServiceByID(ctx, svcID)
			if err != nil {
				http.Error(w, "Service not found: "+ci.ID, http.StatusNotFound)
				return
			}
			if !svc.IsActive {
				http.Error(w, "Service not available: "+svc.Name, http.StatusBadRequest)
				return
			}
			info.name = svc.Name
			info.price = formatNumeric(svc.PriceUsd)
			info.svcID = svc.ID
		} else if ci.Type == "SUPPLY" {
			supID, err := parseUUID(ci.ID)
			if err != nil {
				http.Error(w, "Invalid supply ID: "+ci.ID, http.StatusBadRequest)
				return
			}
			sup, err := h.DB.GetSupplyByID(ctx, supID)
			if err != nil {
				http.Error(w, "Supply not found: "+ci.ID, http.StatusNotFound)
				return
			}
			if !sup.IsActive {
				http.Error(w, "Supply not available: "+sup.Name, http.StatusBadRequest)
				return
			}
			if int(sup.Stock) < ci.Quantity {
				http.Error(w, fmt.Sprintf("Insufficient stock for %s: have %d, need %d", sup.Name, sup.Stock, ci.Quantity), http.StatusBadRequest)
				return
			}
			info.name = sup.Name
			info.price = formatNumeric(sup.PriceUsd)
			info.supID = sup.ID
			info.isSupply = true
		} else {
			http.Error(w, "Invalid item type: "+ci.Type, http.StatusBadRequest)
			return
		}

		items = append(items, info)
		totalAmount += info.price * float64(info.qty)
	}

	totalAmount = math.Round(totalAmount*100) / 100

	// Down payment based on level
	level := int(user.Level)
	var downPaymentPct float64
	switch level {
	case 1:
		downPaymentPct = 0.60
	case 2:
		downPaymentPct = 0.50
	default:
		downPaymentPct = 0.40
	}

	downPayment := math.Round((totalAmount*downPaymentPct)*100) / 100
	financedAmount := totalAmount - downPayment

	if financedAmount > available {
		http.Error(w, fmt.Sprintf("Insufficient credit: available %.2f, financed %.2f", available, financedAmount), http.StatusBadRequest)
		return
	}

	// Get merchant for MDR
	merchant, err := h.DB.GetMerchantByID(ctx, merchantUUID)
	if err != nil {
		http.Error(w, "Merchant not found", http.StatusBadRequest)
		return
	}

	mdrRate := numericToFloat(merchant.MdrRate)
	mdrFee := math.Round((financedAmount*mdrRate)*100) / 100

	// Create transaction
	var numTotal, numDown, numFin, numMDR pgtype.Numeric
	numTotal.Scan(fmt.Sprintf("%.2f", totalAmount))
	numDown.Scan(fmt.Sprintf("%.2f", downPayment))
	numFin.Scan(fmt.Sprintf("%.2f", financedAmount))
	numMDR.Scan(fmt.Sprintf("%.2f", mdrFee))

	trx, err := h.DB.CreateTransaction(ctx, database.CreateTransactionParams{
		UserID:          uid,
		MerchantID:      merchantUUID,
		CreditLineID:    line.ID,
		TotalAmount:     numTotal,
		DownPayment:     numDown,
		FinancedAmount:  numFin,
		NumInstallments: int16(numInst),
		MdrFee:          numMDR,
		Description:     pgtype.Text{String: fmt.Sprintf("Compra de %d item(s)", len(items)), Valid: true},
	})
	if err != nil {
		http.Error(w, "Failed to create transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create transaction items + decrement stock
	for _, info := range items {
		var numPrice pgtype.Numeric
		numPrice.Scan(fmt.Sprintf("%.2f", info.price))

		_, err := h.DB.CreateTransactionItem(ctx, database.CreateTransactionItemParams{
			TransactionID: trx.ID,
			ServiceID:     info.svcID,
			SupplyID:      info.supID,
			ItemName:      info.name,
			Quantity:      int16(info.qty),
			UnitPriceUsd:  numPrice,
		})
		if err != nil {
			http.Error(w, "Failed to create transaction item: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if info.isSupply {
			_ = h.DB.DecrementSupplyStock(ctx, database.DecrementSupplyStockParams{
				ID:     info.supID,
				Stock:  int32(info.qty),
			})
		}
	}

	// Create installments every 15 days
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100
	installments := make([]map[string]interface{}, 0, numInst)
	for i := 1; i <= numInst; i++ {
		var numAmt pgtype.Numeric
		numAmt.Scan(fmt.Sprintf("%.2f", installmentAmount))

		dueDate := time.Now().AddDate(0, 0, i*15)
		var pgDate pgtype.Date
		pgDate.Scan(dueDate)

		_, err = h.DB.CreateInstallment(ctx, database.CreateInstallmentParams{
			TransactionID:  trx.ID,
			UserID:         uid,
			InstallmentNum: int16(i),
			Amount:         numAmt,
			DueDate:        pgDate,
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create installment %d: %v", i, err), http.StatusInternalServerError)
			return
		}

		entry := map[string]interface{}{
			"amount":            installmentAmount,
			"dueDate":           dueDate.Format("2006-01-02"),
			"installmentNumber": i,
		}
		installments = append(installments, entry)
	}

	// Update credit line usage
	var newUsed pgtype.Numeric
	newUsed.Scan(fmt.Sprintf("%.2f", usedUSD+financedAmount))
	_, err = h.DB.UpdateCreditLineUsage(ctx, database.UpdateCreditLineUsageParams{
		UserID:  uid,
		Type:    creditLineType,
		UsedUsd: newUsed,
		Status:  "ACTIVE",
	})
	if err != nil {
		http.Error(w, "Failed to update credit line: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Build response
	bcvRate := h.getBCVRateCached(r)

	itemNames := make([]map[string]interface{}, 0, len(items))
	for _, info := range items {
		itemNames = append(itemNames, map[string]interface{}{
			"name":     info.name,
			"quantity": info.qty,
			"priceUsd": info.price,
		})
	}

	resp := map[string]interface{}{
		"transactionId":       trx.ID.String(),
		"status":              "APPROVED",
		"totalAmount":         totalAmount,
		"downPayment":         downPayment,
		"financedAmount":      financedAmount,
		"numInstallments":     numInst,
		"installments":        installments,
		"items":               itemNames,
		"creditLineType":      creditLineType,
	}
	if bcvRate > 0 {
		resp["bcvRate"] = bcvRate
		resp["totalAmountVES"] = math.Round(totalAmount*bcvRate*100) / 100
		resp["downPaymentVES"] = math.Round(downPayment*bcvRate*100) / 100
		resp["financedAmountVES"] = math.Round(financedAmount*bcvRate*100) / 100
		for i := range installments {
			installments[i]["amountVES"] = math.Round(installmentAmount*bcvRate*100) / 100
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// ─── Routes ──────────────────────────────────────────────────────────────

func (h *PatientHandler) Routes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.RequireAuth)

		r.Get("/credit-lines", h.GetCreditLines)
		r.Get("/transactions/my/installments/pending", h.GetPendingInstallments)
		r.Post("/transactions/preview", h.PreviewTransaction)
		r.Post("/transactions", h.CreateTransaction)

		r.Get("/installments/{id}", h.GetInstallmentByID)
		r.Post("/payments", h.ProcessPayment)

		r.Get("/subscriptions", h.GetSubscriptions)
		r.Post("/subscriptions", h.CreateSubscription)
		r.Delete("/subscriptions/{id}", h.CancelSubscription)

		r.Get("/elder-care/subscriptions", h.GetElderCareSubs)
		r.Post("/elder-care/subscriptions", h.CreateElderCareSub)
		r.Delete("/elder-care/subscriptions/{id}", h.CancelElderCareSub)

		r.Get("/triage", h.GetTriageList)
		r.Post("/triage", h.CreateTriage)
		r.Get("/triage/{id}/recommended-merchants", h.GetRecommendedMerchants)

		r.Get("/bcv-rate", h.GetBCVRate)
		r.Get("/usdt-rate", h.GetUSDTRate)

		// Medical catalog
		r.Get("/merchants", h.GetMerchants)
		r.Get("/merchants/{id}/services", h.GetMerchantServices)
		r.Get("/merchants/{id}/supplies", h.GetMerchantSupplies)
		r.Get("/catalog/services", h.SearchCatalogServices)
		r.Get("/catalog/supplies", h.SearchCatalogSupplies)
		r.Post("/transactions/checkout", h.Checkout)
	}
}
