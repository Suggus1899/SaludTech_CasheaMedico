package credit

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saludtech/backend-go/internal/database"
)

type CreditService struct {
	Pool *pgxpool.Pool
}

func (s *CreditService) CalculateDownPaymentPercentage(level int) float64 {
	switch level {
	case 1:
		return 0.60
	case 2:
		return 0.50
	case 3, 4, 5, 6:
		return 0.40
	default:
		return 0.60
	}
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

func (s *CreditService) CreateBNPLTransaction(ctx context.Context, userID, merchantID, creditLineType string, totalAmount float64, numInstallments int) error {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %v", err)
	}
	defer tx.Rollback(ctx)

	q := database.New(tx)

	var userUUID, merchantUUID pgtype.UUID
	userUUID.Scan(userID)
	merchantUUID.Scan(merchantID)

	// 1. Obtener usuario
	user, err := q.GetUserByID(ctx, userUUID)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	// 2. Calcular down payment según nivel
	downPaymentPct := s.CalculateDownPaymentPercentage(int(user.Level))
	downPayment := math.Round((totalAmount*downPaymentPct)*100) / 100
	financedAmount := totalAmount - downPayment

	// 3. Obtener línea de crédito
	line, err := q.GetCreditLineByUser(ctx, database.GetCreditLineByUserParams{
		UserID: userUUID,
		Type:   creditLineType,
	})
	if err != nil {
		return fmt.Errorf("credit line not found")
	}

	if line.Status != "ACTIVE" {
		return fmt.Errorf("credit line is not active")
	}

	// 4. Validar límite disponible
	limitUSD := numericToFloat(line.LimitUsd)
	usedUSD := numericToFloat(line.UsedUsd)
	available := limitUSD - usedUSD
	if financedAmount > available {
		return fmt.Errorf("insufficient credit: available %.2f, financed %.2f", available, financedAmount)
	}

	// 5. Obtener merchant para calcular MDR
	merchant, err := q.GetMerchantByID(ctx, merchantUUID)
	if err != nil {
		return fmt.Errorf("merchant not found")
	}

	mdrRate := numericToFloat(merchant.MdrRate)
	mdrFee := math.Round((financedAmount*mdrRate)*100) / 100

	// 6. Crear transacción
	var numericTotal, numericDown, numericFin, numericMDR pgtype.Numeric
	numericTotal.Scan(fmt.Sprintf("%.2f", totalAmount))
	numericDown.Scan(fmt.Sprintf("%.2f", downPayment))
	numericFin.Scan(fmt.Sprintf("%.2f", financedAmount))
	numericMDR.Scan(fmt.Sprintf("%.2f", mdrFee))

	trx, err := q.CreateTransaction(ctx, database.CreateTransactionParams{
		UserID:          userUUID,
		MerchantID:      merchantUUID,
		CreditLineID:    line.ID,
		TotalAmount:     numericTotal,
		DownPayment:     numericDown,
		FinancedAmount:  numericFin,
		NumInstallments: int16(numInstallments),
		QrCodeToken:     pgtype.Text{String: "generated-token", Valid: true},
		MdrFee:          numericMDR,
		Description:     pgtype.Text{String: "BNPL Purchase", Valid: true},
	})
	if err != nil {
		return fmt.Errorf("failed to insert transaction: %v", err)
	}

	// 7. Crear cuotas cada 15 días (modelo Cashea)
	installmentAmount := math.Round((financedAmount/float64(numInstallments))*100) / 100
	for i := 1; i <= numInstallments; i++ {
		var numAmt pgtype.Numeric
		numAmt.Scan(fmt.Sprintf("%.2f", installmentAmount))

		dueDate := time.Now().AddDate(0, 0, i*15)
		var pgDate pgtype.Date
		pgDate.Scan(dueDate)

		_, err = q.CreateInstallment(ctx, database.CreateInstallmentParams{
			TransactionID:  trx.ID,
			UserID:         userUUID,
			InstallmentNum: int16(i),
			Amount:         numAmt,
			DueDate:        pgDate,
		})
		if err != nil {
			return fmt.Errorf("failed to insert installment %d: %v", i, err)
		}
	}

	// 8. Actualizar línea de crédito
	var newUsed pgtype.Numeric
	newUsed.Scan(fmt.Sprintf("%.2f", usedUSD+financedAmount))
	_, err = q.UpdateCreditLineUsage(ctx, database.UpdateCreditLineUsageParams{
		UserID:  userUUID,
		Type:    creditLineType,
		UsedUsd: newUsed,
		Status:  "ACTIVE",
	})
	if err != nil {
		return fmt.Errorf("failed to update credit line usage: %v", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit tx: %v", err)
	}

	return nil
}
