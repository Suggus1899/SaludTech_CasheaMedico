package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"math"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/fakepay"
)

var (
	ErrInstallmentNotFound  = errors.New("installment not found")
	ErrAlreadyPaid          = errors.New("installment is already paid")
	ErrPaymentRejected      = errors.New("payment gateway rejected")
	ErrIdempotentDuplicate  = errors.New("payment already processed (idempotent)")
	ErrInvalidUserID        = errors.New("invalid user ID")
	ErrInvalidInstallmentID = errors.New("invalid installment ID")
)

type PaymentMethod string

const (
	PaymentMethodCard   PaymentMethod = "CARD"
	PaymentMethodMobile PaymentMethod = "MOBILE"
	PaymentMethodBank   PaymentMethod = "BANK"
	PaymentMethodCash   PaymentMethod = "CASH"
)

type PaymentInput struct {
	InstallmentID    string
	Method           string
	Reference        string
	CardNumber       string
	CVV              string
	ExpirationMonth  string
	ExpirationYear   string
	FullName         string
	FakePayClient    *fakepay.Client
}

type PaymentResult struct {
	Status              string  `json:"status"`
	Message             string  `json:"message"`
	Amount              float64 `json:"amount"`
	AmountVES           float64 `json:"amountVES,omitempty"`
	BCVRate             float64 `json:"bcvRate,omitempty"`
	GatewayTransactionID string `json:"gatewayTransactionId,omitempty"`
	CreditReactivated   bool    `json:"creditReactivated,omitempty"`
}

type PaymentService struct {
	DB   *database.Queries
	Pool *pgxpool.Pool
}

func NewPaymentService(db *database.Queries, pool *pgxpool.Pool) *PaymentService {
	return &PaymentService{DB: db, Pool: pool}
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
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

func (s *PaymentService) ProcessPayment(ctx context.Context, userID string, input PaymentInput) (*PaymentResult, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrInvalidUserID
	}

	instUUID, err := parseUUID(input.InstallmentID)
	if err != nil {
		return nil, ErrInvalidInstallmentID
	}

	inst, err := s.DB.GetInstallmentWithDetails(ctx, database.GetInstallmentWithDetailsParams{
		ID:     instUUID,
		UserID: uid,
	})
	if err != nil {
		return nil, ErrInstallmentNotFound
	}

	if inst.Status != "PENDING" && inst.Status != "OVERDUE" {
		return nil, ErrAlreadyPaid
	}

	amountUSD := formatNumeric(inst.Amount)
	wasOverdue := inst.Status == "OVERDUE"

	ref := input.Reference
	if ref == "" {
		ref = fmt.Sprintf("installment:%s", instUUID.String())
	}

	refText := pgtype.Text{String: ref, Valid: ref != ""}

	currency := "USD"
	description := fmt.Sprintf("Cuota #%d - SaludTech", inst.InstallmentNum)

	var fakePayTxn *fakepay.PaymentData
	if input.FakePayClient != nil && input.CardNumber != "" {
		payReq := fakepay.PaymentRequest{
			Amount:          fmt.Sprintf("%.2f", amountUSD),
			CardNumber:      input.CardNumber,
			CVV:             input.CVV,
			ExpirationMonth: input.ExpirationMonth,
			ExpirationYear:  input.ExpirationYear,
			FullName:        input.FullName,
			Currency:        currency,
			Description:     description,
			Reference:       ref,
		}

		fakePayTxn, err = input.FakePayClient.ProcessPayment(ctx, payReq)
		if err != nil {
			return nil, fmt.Errorf("%w: %v", ErrPaymentRejected, err)
		}
	}

	if fakePayTxn != nil {
		refText = pgtype.Text{String: fakePayTxn.TransactionID, Valid: true}
	}

	tx, err := s.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	txQueries := s.DB.WithTx(tx)

	var amountPaid pgtype.Numeric
	amountPaid.Scan(fmt.Sprintf("%.2f", amountUSD))

	_, err = txQueries.CreatePaymentRecord(ctx, database.CreatePaymentRecordParams{
		InstallmentID: instUUID,
		UserID:        uid,
		AmountPaid:    amountPaid,
		PaymentMethod: input.Method,
		ReferenceCode: refText,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return &PaymentResult{
				Status:  "PAID",
				Message: "Payment already processed (idempotent)",
				Amount:  amountUSD,
			}, nil
		}
		return nil, fmt.Errorf("failed to record payment: %w", err)
	}

	_, err = txQueries.ProcessInstallmentPayment(ctx, instUUID)
	if err != nil {
		return nil, fmt.Errorf("installment was already paid by a concurrent request: %w", err)
	}

	releaseAmount := pgtype.Numeric{}
	releaseAmount.Scan(fmt.Sprintf("%.2f", amountUSD))
	if _, err := txQueries.ReleaseCreditLineUsage(ctx, database.ReleaseCreditLineUsageParams{
		ID:      inst.CreditLineID,
		UsedUsd: releaseAmount,
	}); err != nil {
		slog.Warn("ReleaseCreditLineUsage failed", "creditLineID", inst.CreditLineID, "error", err)
	}

	amountNumeric := pgtype.Numeric{}
	amountNumeric.Scan(fmt.Sprintf("%.2f", amountUSD))
	if err := txQueries.IncrementUserTotalPaid(ctx, database.IncrementUserTotalPaidParams{
		ID:        uid,
		TotalPaid: amountNumeric,
	}); err != nil {
		slog.Warn("IncrementUserTotalPaid failed", "userID", uid, "error", err)
	}

	if err := txQueries.AddUserPoints(ctx, database.AddUserPointsParams{
		ID:     uid,
		Points: 10,
	}); err != nil {
		slog.Warn("AddUserPoints failed", "userID", uid, "error", err)
	}
	if err := txQueries.CheckAndLevelUpUser(ctx, uid); err != nil {
		slog.Warn("CheckAndLevelUpUser failed", "userID", uid, "error", err)
	}

	creditReactivated := false
	if wasOverdue {
		remainingOverdue, err := txQueries.CountOverdueByUser(ctx, uid)
		if err != nil {
			slog.Warn("CountOverdueByUser failed", "userID", uid, "error", err)
		} else if remainingOverdue == 0 {
			if err := txQueries.ReactivateUserCreditLines(ctx, uid); err != nil {
				slog.Warn("ReactivateUserCreditLines failed", "userID", uid, "error", err)
			} else {
				creditReactivated = true
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit payment transaction: %w", err)
	}

	result := &PaymentResult{
		Status:  "PAID",
		Message: "Payment processed successfully",
		Amount:  amountUSD,
	}
	if fakePayTxn != nil {
		result.GatewayTransactionID = fakePayTxn.TransactionID
	}
	if creditReactivated {
		result.CreditReactivated = true
	}

	return result, nil
}

func (r *PaymentResult) ApplyBCVRate(bcvRate float64) {
	if bcvRate > 0 {
		r.AmountVES = math.Round(r.Amount*bcvRate*100) / 100
		r.BCVRate = bcvRate
	}
}
