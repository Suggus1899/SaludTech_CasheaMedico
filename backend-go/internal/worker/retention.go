package worker

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
	"github.com/saludtech/backend-go/internal/database"
)

// Advisory lock keys for the retention worker.
// Unique within this application — distinct from the installment scanner.
const (
	retentionLockKey1 int32 = 0x52454E54 // "RENT"
	retentionLockKey2 int32 = 0x524E3031 // "RN01"
)

type RetentionWorker struct {
	Pool     *pgxpool.Pool
	Schedule string
}

func (w *RetentionWorker) Start() {
	c := cron.New()

	schedule := w.Schedule
	if schedule == "" {
		schedule = "@daily"
	}

	_, err := c.AddFunc(schedule, func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()

		tx, err := w.Pool.Begin(ctx)
		if err != nil {
			log.Printf("Error starting transaction for retention worker: %v", err)
			return
		}
		defer tx.Rollback(ctx)

		locked, err := database.New(tx).TryScannerLock(ctx, database.TryScannerLockParams{
			PgTryAdvisoryXactLock:   retentionLockKey1,
			PgTryAdvisoryXactLock_2: retentionLockKey2,
		})
		if err != nil {
			log.Printf("Error acquiring advisory lock for retention: %v", err)
			return
		}
		if !locked {
			log.Println("Retention worker locked by another instance. Skipping...")
			return
		}

		log.Println("Running Retention Worker...")
		qtx := database.New(tx)

		if err := qtx.DeleteExpiredQrTokens(ctx); err != nil {
			log.Printf("Failed to delete expired QR tokens: %v", err)
			return
		}

		if err := qtx.DeleteRevokedConsents(ctx); err != nil {
			log.Printf("Failed to delete revoked consents: %v", err)
			return
		}

		if err := qtx.DeleteOldAuditLogs(ctx); err != nil {
			log.Printf("Failed to delete old audit logs: %v", err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			log.Printf("Error committing retention worker transaction: %v", err)
			return
		}

		log.Println("Retention Worker completed successfully.")
	})

	if err != nil {
		log.Fatalf("Error scheduling retention worker: %v", err)
	}

	c.Start()
	log.Println("⏱️  Retention Worker Cron Job started")
}
