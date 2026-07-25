package service

import (
	"fmt"
	"math"
	"time"
)

const installmentIntervalDays = 14

func downPaymentPctForLevel(level int) float64 {
	switch level {
	case 1:
		return 0.60
	case 2:
		return 0.50
	default:
		return 0.40
	}
}

func maxInstallmentsForLevel(level int) int {
	switch {
	case level >= 6:
		return 12
	case level >= 5:
		return 9
	case level >= 3:
		return 6
	default:
		return 3
	}
}

func minAmountForInstallments(numInst int) float64 {
	switch {
	case numInst >= 12:
		return 600
	case numInst >= 9:
		return 450
	case numInst >= 6:
		return 300
	default:
		return 0
	}
}

func resolveInstallments(creditLineType string, level int, requestedInstallments int) (numInst int, intervalDays int) {
	if creditLineType == "SALUD_COTIDIANA" {
		return 1, 14
	}

	numInst = requestedInstallments
	if numInst <= 0 {
		numInst = 3
	}

	maxInst := maxInstallmentsForLevel(level)
	if numInst > maxInst {
		numInst = maxInst
	}

	if numInst < 1 {
		numInst = 1
	}

	return numInst, installmentIntervalDays
}

type InstallmentItem struct {
	Amount          float64   `json:"amount"`
	DueDate         time.Time `json:"dueDate"`
	InstallmentNum  int       `json:"installmentNumber"`
	AmountVES       float64   `json:"amountVES,omitempty"`
}

type InstallmentPlan struct {
	DownPayment       float64           `json:"downPayment"`
	FinancedAmount    float64           `json:"financedAmount"`
	NumInstallments   int               `json:"numInstallments"`
	IntervalDays      int               `json:"intervalDays"`
	InstallmentAmount float64           `json:"installmentAmount"`
	Installments      []InstallmentItem `json:"installments"`
}

type BNPLService struct{}

func NewBNPLService() *BNPLService {
	return &BNPLService{}
}

func (s *BNPLService) CalculateInstallments(amount float64, numInstallments int, level int) (*InstallmentPlan, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than 0")
	}
	if numInstallments < 0 {
		numInstallments = 0
	}

	creditLineType := "ESPECIALIDAD_PRINCIPAL"
	resolvedNum, intervalDays := resolveInstallments(creditLineType, level, numInstallments)

	if err := s.ValidateTransaction(amount, level, creditLineType); err != nil {
		return nil, err
	}

	downPaymentPct := downPaymentPctForLevel(level)
	downPayment := math.Round((amount*downPaymentPct)*100) / 100
	financedAmount := amount - downPayment

	installmentAmount := math.Round((financedAmount/float64(resolvedNum))*100) / 100

	installments := make([]InstallmentItem, 0, resolvedNum)
	for i := 1; i <= resolvedNum; i++ {
		dueDate := installmentDueDate(i, intervalDays)
		installments = append(installments, InstallmentItem{
			Amount:         installmentAmount,
			DueDate:        dueDate,
			InstallmentNum: i,
		})
	}

	return &InstallmentPlan{
		DownPayment:       downPayment,
		FinancedAmount:    financedAmount,
		NumInstallments:   resolvedNum,
		IntervalDays:      intervalDays,
		InstallmentAmount: installmentAmount,
		Installments:      installments,
	}, nil
}

func (s *BNPLService) ValidateTransaction(amount float64, level int, creditLineType string) error {
	if creditLineType == "SALUD_COTIDIANA" {
		return nil
	}

	maxInst := maxInstallmentsForLevel(level)
	minAmt := minAmountForInstallments(maxInst)
	if amount < minAmt && minAmt > 0 {
		return fmt.Errorf("purchase of $%.2f does not meet the $%.2f minimum for level %d", amount, minAmt, level)
	}

	return nil
}

func installmentDueDate(i int, intervalDays int) time.Time {
	return time.Now().AddDate(0, 0, i*intervalDays)
}
