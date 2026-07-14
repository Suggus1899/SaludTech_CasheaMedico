package worker

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/email"
)

// Advisory lock keys for the installment scanner.
// Unique within this application — any other cron job would use different keys.
const (
	scannerLockKey1 int32 = 0x53414C44 // "SALD"
	scannerLockKey2 int32 = 0x53434E31 // "SCN1"
)

type InstallmentScanner struct {
	Pool      *pgxpool.Pool
	Sender    *email.Sender
	Schedule  string
}

func (s *InstallmentScanner) Start() {
	c := cron.New()

	schedule := s.Schedule
	if schedule == "" {
		schedule = "@daily"
	}

	_, err := c.AddFunc(schedule, func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()

		// 1. Iniciar transacción — el advisory lock se libera al hacer commit/rollback
		tx, err := s.Pool.Begin(ctx)
		if err != nil {
			log.Printf("Error starting transaction for scanner: %v", err)
			return
		}
		defer tx.Rollback(ctx)

		// 2. Intentar adquirir el Advisory Lock (ShedLock equivalente)
		// pg_try_advisory_xact_lock: retorna true si se adquirió, false si ya está tomado
		locked, err := database.New(tx).TryScannerLock(ctx, database.TryScannerLockParams{
			PgTryAdvisoryXactLock:   scannerLockKey1,
			PgTryAdvisoryXactLock_2: scannerLockKey2,
		})
		if err != nil {
			log.Printf("Error acquiring advisory lock: %v", err)
			return
		}
		if !locked {
			log.Println("Scanner task locked by another instance. Skipping...")
			return
		}

		// 3. Ejecutar la lógica de negocio dentro de la misma transacción
		log.Println("Running Installment Scanner...")
		qtx := database.New(tx)

		overdue, err := qtx.GetOverdueInstallments(ctx)
		if err != nil {
			log.Printf("Error fetching overdue installments: %v", err)
			return
		}

		for _, inst := range overdue {
			// Aplicar cargo de reactivación ($4)
			_, err := qtx.ApplyReactivationFee(ctx, inst.ID)
			if err != nil {
				log.Printf("Failed to apply fee for installment %s: %v", inst.ID, err)
				continue
			}

			// Pausar las líneas de crédito del paciente (Mora Ética)
			err = qtx.PauseUserCreditLines(ctx, inst.UserID)
			if err != nil {
				log.Printf("Failed to pause credit lines for user %s: %v", inst.UserID, err)
			}

			// Send overdue notice email
			if s.Sender != nil {
				user, err := database.New(s.Pool).GetUserByID(ctx, inst.UserID)
				if err == nil && user.Email.Valid {
					amount := numericToFloat(inst.Amount)
					dueDate := ""
					if inst.DueDate.Valid {
						dueDate = inst.DueDate.Time.Format("02/01/2006")
					}
					html := email.OverdueNoticeEmail(
						user.FullName,
						amount,
						inst.ID.String(),
						dueDate,
						4.00, // reactivation fee
					)
					if err := s.Sender.Send(user.Email.String, "Cuota vencida - SaludTech", html); err != nil {
						log.Printf("Failed to send overdue email to %s: %v", user.Email.String, err)
					}
				}
			}

			log.Printf("Processed overdue installment %s for user %s", inst.ID, inst.UserID)
		}

		// 4. Commit — libera el advisory lock automáticamente
		if err := tx.Commit(ctx); err != nil {
			log.Printf("Error committing scanner transaction: %v", err)
			return
		}

		log.Println("Installment Scanner completed successfully.")
	})

	if err != nil {
		log.Fatalf("Error scheduling scanner: %v", err)
	}

	c.Start()
	log.Println("⏱️  Installment Scanner Cron Job started")
}
