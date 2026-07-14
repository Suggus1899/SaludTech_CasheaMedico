package admin

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// ─── CSV Export endpoints ────────────────────────────────────────────────────

func (h *AdminHandler) ExportUsersCSV(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	users, err := h.DB.ExportAllUsers(ctx)
	if err != nil {
		http.Error(w, `{"error":"Failed to export users"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=users_%s.csv", time.Now().Format("20060102")))

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"ID", "Phone", "Email", "Full Name", "National ID", "Role", "Level", "Points", "Total Paid", "Installments Paid", "Active", "Created At"})

	for _, u := range users {
		writer.Write([]string{
			u.ID.String(),
			u.Phone,
			textVal(u.Email),
			u.FullName,
			textVal(u.NationalID),
			u.Role,
			strconv.Itoa(int(u.Level)),
			strconv.Itoa(int(u.Points)),
			numericStr(u.TotalPaid),
			strconv.Itoa(int(u.InstallmentsPaidCount)),
			strconv.FormatBool(u.IsActive),
			u.CreatedAt.Time.Format("2006-01-02 15:04:05"),
		})
	}
}

func (h *AdminHandler) ExportTransactionsCSV(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	txns, err := h.DB.ExportAllTransactions(ctx)
	if err != nil {
		http.Error(w, `{"error":"Failed to export transactions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=transactions_%s.csv", time.Now().Format("20060102")))

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"ID", "User Name", "User Email", "Merchant", "Category", "Total Amount", "Down Payment", "Financed Amount", "Installments", "Status", "MDR Fee", "Description", "Created At"})

	for _, t := range txns {
		writer.Write([]string{
			t.ID.String(),
			t.UserName,
			textVal(t.UserEmail),
			t.MerchantName,
			t.MerchantCategory,
			numericStr(t.TotalAmount),
			numericStr(t.DownPayment),
			numericStr(t.FinancedAmount),
			strconv.Itoa(int(t.NumInstallments)),
			t.Status,
			numericStr(t.MdrFee),
			textVal(t.Description),
			t.CreatedAt.Time.Format("2006-01-02 15:04:05"),
		})
	}
}

func (h *AdminHandler) ExportInstallmentsCSV(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	installs, err := h.DB.ExportAllInstallments(ctx)
	if err != nil {
		http.Error(w, `{"error":"Failed to export installments"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=installments_%s.csv", time.Now().Format("20060102")))

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"ID", "User Name", "User Email", "Installment Num", "Amount", "Due Date", "Paid At", "Status", "Reactivation Fee", "Days Overdue", "Created At"})

	for _, i := range installs {
		paidAt := ""
		if i.PaidAt.Valid {
			paidAt = i.PaidAt.Time.Format("2006-01-02 15:04:05")
		}
		dueDate := ""
		if i.DueDate.Valid {
			dueDate = i.DueDate.Time.Format("2006-01-02")
		}
		writer.Write([]string{
			i.ID.String(),
			i.UserName,
			textVal(i.UserEmail),
			strconv.Itoa(int(i.InstallmentNum)),
			numericStr(i.Amount),
			dueDate,
			paidAt,
			i.Status,
			numericStr(i.ReactivationFee),
			strconv.Itoa(int(i.DaysOverdue)),
			i.CreatedAt.Time.Format("2006-01-02 15:04:05"),
		})
	}
}

// ─── Helpers ────────────────────────────────────────────────────────────────

func textVal(t pgtype.Text) string {
	if !t.Valid {
		return ""
	}
	return t.String
}

func numericStr(n pgtype.Numeric) string {
	if !n.Valid {
		return "0"
	}
	f, err := n.Float64Value()
	if err != nil {
		return "0"
	}
	return fmt.Sprintf("%.2f", f.Float64)
}
