package patient

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

// ─── Transactions ────────────────────────────────────────────────────────

type PreviewRequest struct {
	MerchantID            string  `json:"merchantId"`
	Amount                float64 `json:"amount"`
	RequestedInstallments int     `json:"requestedInstallments"`
	QRToken               string  `json:"qrToken"`
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
	downPaymentPct := downPaymentPctForLevel(level)

	downPayment := math.Round((req.Amount*downPaymentPct)*100) / 100
	financedAmount := req.Amount - downPayment

	creditLineType := "ESPECIALIDAD_PRINCIPAL"
	numInst, intervalDays := resolveInstallments(creditLineType, level, req.RequestedInstallments)
	if rejectIfInvalidInstallments(w, level, req.Amount, numInst, creditLineType) {
		return
	}
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100

	bcvRate := h.getBCVRateCached(r)

	installments := make([]map[string]interface{}, 0, numInst)
	for i := 1; i <= numInst; i++ {
		dueDate := installmentDueDate(i, intervalDays)
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
	downPaymentPct := downPaymentPctForLevel(level)

	downPayment := math.Round((req.Amount*downPaymentPct)*100) / 100
	financedAmount := req.Amount - downPayment

	numInst, intervalDays := resolveInstallments(creditLineType, level, req.RequestedInstallments)
	if rejectIfInvalidInstallments(w, level, req.Amount, numInst, creditLineType) {
		return
	}

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

	tx, err := h.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	q, ok := h.DB.(*database.Queries)
	if !ok {
		http.Error(w, "DB layer does not support transactions", http.StatusInternalServerError)
		return
	}
	txQueries := q.WithTx(tx)

	trx, err := txQueries.CreateTransaction(ctx, database.CreateTransactionParams{
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

	// Create installments
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100
	bcvRate := h.getBCVRateCached(r)
	installments := make([]map[string]interface{}, 0, numInst)
	for i := 1; i <= numInst; i++ {
		var numAmt pgtype.Numeric
		numAmt.Scan(fmt.Sprintf("%.2f", installmentAmount))

		dueDate := installmentDueDate(i, intervalDays)
		var pgDate pgtype.Date
		pgDate.Scan(dueDate)

		inst, err := txQueries.CreateInstallment(ctx, database.CreateInstallmentParams{
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
			"id":                inst.ID.String(),
			"installmentNumber": i,
			"amount":            installmentAmount,
			"dueDate":           dueDate.Format("2006-01-02"),
		}
		if bcvRate > 0 {
			entry["amountVES"] = math.Round(installmentAmount*bcvRate*100) / 100
		}
		installments = append(installments, entry)
	}

	// Update credit line usage
	var newUsed pgtype.Numeric
	newUsed.Scan(fmt.Sprintf("%.2f", usedUSD+financedAmount))
	_, err = txQueries.UpdateCreditLineUsage(ctx, database.UpdateCreditLineUsageParams{
		UserID:  uid,
		Type:    creditLineType,
		UsedUsd: newUsed,
		Status:  "ACTIVE",
	})
	if err != nil {
		http.Error(w, "Failed to update credit line: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"id":              trx.ID.String(),
		"status":          "APPROVED",
		"installments":    installments,
		"numInstallments": numInst,
	}
	if len(installments) > 0 {
		resp["firstInstallmentId"] = installments[0]["id"]
	}
	if bcvRate > 0 {
		resp["bcvRate"] = bcvRate
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// ─── Checkout (multi-item purchase) ──────────────────────────────────────

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
	downPaymentPct := downPaymentPctForLevel(level)

	downPayment := math.Round((totalAmount*downPaymentPct)*100) / 100
	financedAmount := totalAmount - downPayment

	numInst, intervalDays := resolveInstallments(creditLineType, level, req.RequestedInstallments)
	if rejectIfInvalidInstallments(w, level, totalAmount, numInst, creditLineType) {
		return
	}

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

	// ─── Atomic DB transaction ───────────────────────────────────────────
	// CreateTransaction + CreateTransactionItem + DecrementSupplyStock
	// + CreateInstallment + UpdateCreditLineUsage all run inside a single
	// BEGIN/COMMIT. If any step fails, everything rolls back — no orphan
	// transactions, no inconsistent stock, no double-charged credit.
	tx, err := h.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx) // safe to call after Commit (no-op)

	// WithTx is on *Queries (not the Querier interface), so we assert.
	q, ok := h.DB.(*database.Queries)
	if !ok {
		http.Error(w, "DB layer does not support transactions", http.StatusInternalServerError)
		return
	}
	txQueries := q.WithTx(tx)

	// Create transaction
	var numTotal, numDown, numFin, numMDR pgtype.Numeric
	numTotal.Scan(fmt.Sprintf("%.2f", totalAmount))
	numDown.Scan(fmt.Sprintf("%.2f", downPayment))
	numFin.Scan(fmt.Sprintf("%.2f", financedAmount))
	numMDR.Scan(fmt.Sprintf("%.2f", mdrFee))

	// Generate a random QR token for checkout transactions
	qrToken := generateCheckoutToken()

	trx, err := txQueries.CreateTransaction(ctx, database.CreateTransactionParams{
		UserID:          uid,
		MerchantID:      merchantUUID,
		CreditLineID:    line.ID,
		TotalAmount:     numTotal,
		DownPayment:     numDown,
		FinancedAmount:  numFin,
		NumInstallments: int16(numInst),
		QrCodeToken:     pgtype.Text{String: qrToken, Valid: true},
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

		_, err := txQueries.CreateTransactionItem(ctx, database.CreateTransactionItemParams{
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
			if err := txQueries.DecrementSupplyStock(ctx, database.DecrementSupplyStockParams{
				ID:    info.supID,
				Stock: int32(info.qty),
			}); err != nil {
				log.Printf("DecrementSupplyStock failed for supply %s: %v", info.supID, err)
				http.Error(w, "Failed to decrement stock for "+info.name, http.StatusInternalServerError)
				return
			}
		}
	}

	// Create installments
	installmentAmount := math.Round((financedAmount/float64(numInst))*100) / 100
	installments := make([]map[string]interface{}, 0, numInst)
	for i := 1; i <= numInst; i++ {
		var numAmt pgtype.Numeric
		numAmt.Scan(fmt.Sprintf("%.2f", installmentAmount))

		dueDate := installmentDueDate(i, intervalDays)
		var pgDate pgtype.Date
		pgDate.Scan(dueDate)

		_, err = txQueries.CreateInstallment(ctx, database.CreateInstallmentParams{
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
	_, err = txQueries.UpdateCreditLineUsage(ctx, database.UpdateCreditLineUsageParams{
		UserID:  uid,
		Type:    creditLineType,
		UsedUsd: newUsed,
		Status:  "ACTIVE",
	})
	if err != nil {
		http.Error(w, "Failed to update credit line: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "Failed to commit checkout transaction", http.StatusInternalServerError)
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
		"transactionId":   trx.ID.String(),
		"status":          "APPROVED",
		"totalAmount":     totalAmount,
		"downPayment":     downPayment,
		"financedAmount":  financedAmount,
		"numInstallments": numInst,
		"installments":    installments,
		"items":           itemNames,
		"creditLineType":  creditLineType,
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

// generateCheckoutToken creates a random hex token for checkout transactions
// (the qr_code_token column has a NOT NULL constraint).
func generateCheckoutToken() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return hex.EncodeToString([]byte(fmt.Sprintf("%d", 0)))
	}
	return "checkout_" + hex.EncodeToString(b)
}
