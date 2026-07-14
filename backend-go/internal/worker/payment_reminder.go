package worker

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/email"
)

// PaymentReminder sends email reminders for upcoming installment due dates.
type PaymentReminder struct {
	Pool   *pgxpool.Pool
	Sender *email.Sender
}

func (r *PaymentReminder) Start() {
	if r.Sender == nil {
		log.Println("⚠️  PaymentReminder disabled — no email sender configured")
		return
	}

	c := cron.New()

	// Run daily at 09:00 AM
	_, err := c.AddFunc("0 9 * * *", func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()

		queries := database.New(r.Pool)

		installments, err := queries.GetUpcomingInstallmentsForReminder(ctx)
		if err != nil {
			log.Printf("Error fetching upcoming installments: %v", err)
			return
		}

		if len(installments) == 0 {
			log.Println("No upcoming installments due in the next 3 days.")
			return
		}

		sent := 0
		for _, inst := range installments {
			if !inst.Email.Valid || inst.Email.String == "" {
				continue
			}

			amount := numericToFloat(inst.Amount)
			dueDate := ""
			if inst.DueDate.Valid {
				dueDate = inst.DueDate.Time.Format("02/01/2006")
			}
			installmentNum := fmt.Sprintf("%d", inst.InstallmentNum)

			html := email.PaymentReminderEmail(
				inst.FullName,
				amount,
				dueDate,
				installmentNum,
			)

			subject := fmt.Sprintf("Recordatorio: Cuota #%s vence el %s", installmentNum, dueDate)

			if err := r.Sender.Send(inst.Email.String, subject, html); err != nil {
				log.Printf("Failed to send reminder to %s: %v", inst.Email.String, err)
				continue
			}
			sent++
		}

		log.Printf("📧 Payment reminders: %d/%d emails sent", sent, len(installments))
	})

	if err != nil {
		log.Fatalf("Error scheduling payment reminder: %v", err)
	}

	c.Start()
	log.Println("⏱️  Payment Reminder Cron Job started (daily at 09:00)")
}

// numericToFloat converts a pgtype.Numeric to float64.
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
