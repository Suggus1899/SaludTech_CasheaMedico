package patient

import (
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/saludtech/backend-go/internal/auth"
	appmw "github.com/saludtech/backend-go/internal/middleware"
)

// ─── Shared checkout types ───────────────────────────────────────────────

type CheckoutItem struct {
	Type     string `json:"type"` // "SERVICE" or "SUPPLY"
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}

type CheckoutRequest struct {
	MerchantID            string         `json:"merchantId"`
	Items                 []CheckoutItem `json:"items"`
	RequestedInstallments int            `json:"requestedInstallments"`
	CreditLineType        string         `json:"creditLineType"`
}

// ─── Routes ──────────────────────────────────────────────────────────────

func (h *PatientHandler) Routes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.RequireAuth)

		// Rate limiters for sensitive endpoints
		payLimiter := appmw.NewRateLimiter(10, time.Minute)       // 10 financial ops/min per IP
		subLimiter := appmw.NewRateLimiter(10, time.Minute)       // 10 subscriptions/min per IP
		healthLimiter := appmw.NewRateLimiter(20, time.Minute)    // 20 health writes/min per IP

		r.Get("/credit-lines", h.GetCreditLines)
		r.Get("/transactions/my/installments/pending", h.GetPendingInstallments)
		r.Get("/transactions/my/installments/paid", h.GetPaidInstallments)
		r.Post("/transactions/preview", h.PreviewTransaction)
		r.With(payLimiter.Middleware).Post("/transactions", h.CreateTransaction)

		r.Get("/installments/{id}", h.GetInstallmentByID)

		// Payment endpoint — rate limited to prevent abuse
		r.With(payLimiter.Middleware).Post("/payments", h.ProcessPayment)

		r.Get("/subscriptions", h.GetSubscriptions)
		r.With(subLimiter.Middleware).Post("/subscriptions", h.CreateSubscription)
		r.Delete("/subscriptions/{id}", h.CancelSubscription)

		r.Get("/elder-care/subscriptions", h.GetElderCareSubs)
		r.With(subLimiter.Middleware).Post("/elder-care/subscriptions", h.CreateElderCareSub)
		r.Delete("/elder-care/subscriptions/{id}", h.CancelElderCareSub)

		r.Get("/triage", h.GetTriageList)
		r.Post("/triage", h.CreateTriage)
		r.Get("/triage/{id}/recommended-merchants", h.GetRecommendedMerchants)

		r.Get("/bcv-rate", h.GetBCVRate)
		r.Get("/usdt-rate", h.GetUSDTRate)

		// Medical catalog
		r.Get("/merchants", h.GetMerchants)
		r.Get("/merchants/{id}/services", h.GetMerchantServices)
		r.Get("/merchants/{id}/supplies", h.GetMerchantSupplies)
		r.Get("/catalog/services", h.SearchCatalogServices)
		r.Get("/catalog/supplies", h.SearchCatalogSupplies)
		r.With(payLimiter.Middleware).Post("/transactions/checkout", h.Checkout)

		// Health profile
		r.Get("/health-profile", h.GetHealthProfile)
		r.With(healthLimiter.Middleware).Put("/health-profile", h.UpsertHealthProfile)

		// Medical records
		r.Get("/medical-records", h.ListMedicalRecords)
		r.With(healthLimiter.Middleware).Post("/medical-records", h.CreateMedicalRecord)
		r.Delete("/medical-records/{id}", h.DeleteMedicalRecord)

		// Appointments
		r.Get("/appointments", h.ListAppointments)
		r.With(healthLimiter.Middleware).Post("/appointments", h.CreateAppointment)
		r.Delete("/appointments/{id}", h.CancelAppointment)

		// Medication reminders
		r.Get("/medication-reminders", h.ListMedicationReminders)
		r.With(healthLimiter.Middleware).Post("/medication-reminders", h.CreateMedicationReminder)
		r.Delete("/medication-reminders/{id}", h.DeleteMedicationReminder)

		// Family / caregiver
		r.Get("/family-members", h.ListFamilyMembers)
		r.Get("/caregivers", h.ListCaregivers)
		r.With(healthLimiter.Middleware).Post("/family-members", h.InviteFamilyMember)
		r.Patch("/family-members/{id}", h.RespondFamilyMember)
		r.Delete("/family-members/{id}", h.RemoveFamilyMember)
	}
}
