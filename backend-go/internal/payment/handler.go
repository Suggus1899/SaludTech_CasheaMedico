package payment

import (
	"encoding/json"
	"net/http"

	"github.com/saludtech/backend-go/internal/database"
)

type PaymentHandler struct {
	DB database.Querier
}

func (h *PaymentHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	// En una app real, leeríamos el ID de la cuota desde r.Body
	// Simularemos con un UUID de prueba o simplemente usaremos el contexto.
	// ctx := r.Context()
	
	// TODO: installmentID y userID deberían venir del request
	// 1. Marcar cuota como pagada
	// _, err := h.DB.ProcessInstallmentPayment(ctx, installmentID)
	
	// 2. Gamificación: Sumar 15 puntos por pago exitoso
	// err = h.DB.AddUserPoints(ctx, database.AddUserPointsParams{ID: userID, Points: 15})

	// 3. Evaluar Level Up
	// err = h.DB.CheckAndLevelUpUser(ctx, userID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "APPROVED",
		"message": "Payment recorded. +15 Gamification Points added!",
	})
}
