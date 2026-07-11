package worker

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/robfig/cron/v3"
	"github.com/saludtech/backend-go/internal/database"
)

type InstallmentScanner struct {
	DB    database.Querier
	Redis *redis.Client
}

func (s *InstallmentScanner) Start() {
	c := cron.New()
	
	// Correr todos los días a las 00:00 (o cada minuto para pruebas)
	_, err := c.AddFunc("@daily", func() {
		ctx := context.Background()
		lockKey := "lock:installment_scanner"
		
		// 1. Intentar adquirir el Lock Distribuido (ShedLock equivalente)
		// SetNX = Set if Not eXists, expirando en 10 minutos
		locked, err := s.Redis.SetNX(ctx, lockKey, "locked", 10*time.Minute).Result()
		if err != nil || !locked {
			log.Println("Scanner task locked by another instance. Skipping...")
			return
		}
		
		// 2. Ejecutar la lógica de negocio
		log.Println("Running Installment Scanner...")
		
		overdue, err := s.DB.GetOverdueInstallments(ctx)
		if err != nil {
			log.Printf("Error fetching overdue installments: %v", err)
			return
		}

		for _, inst := range overdue {
			// Aplicar cargo de reactivación ($4)
			_, err := s.DB.ApplyReactivationFee(ctx, inst.ID)
			if err != nil {
				log.Printf("Failed to apply fee for installment %s: %v", inst.ID, err)
				continue
			}

			// Pausar las líneas de crédito del paciente (Mora Ética)
			err = s.DB.PauseUserCreditLines(ctx, inst.UserID)
			if err != nil {
				log.Printf("Failed to pause credit lines for user %s: %v", inst.UserID, err)
			}
			
			log.Printf("Processed overdue installment %s for user %s", inst.ID, inst.UserID)
		}
		
		log.Println("Installment Scanner completed successfully.")
	})
	
	if err != nil {
		log.Fatalf("Error scheduling scanner: %v", err)
	}
	
	c.Start()
	log.Println("⏱️  Installment Scanner Cron Job started")
}
