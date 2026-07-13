package patient

// This file has been split into domain-specific files:
//   - helpers.go        (PatientHandler struct + shared helpers)
//   - creditlines.go    (credit line handlers)
//   - installments.go   (installment handlers)
//   - transactions.go   (transaction + checkout handlers)
//   - payments.go       (ProcessPayment + isUniqueViolation)
//   - subscriptions.go  (subscription + elder care handlers)
//   - triage.go         (triage handlers)
//   - catalog.go        (catalog/search handlers)
//   - exchange.go       (BCV/USDT rate handlers + getBCVRateCached)
//   - routes.go         (Routes() + shared checkout types)
//   - bnpl.go           (BNPL business logic helpers)
//   - health_handler.go (health profile, medical records, appointments, etc.)
