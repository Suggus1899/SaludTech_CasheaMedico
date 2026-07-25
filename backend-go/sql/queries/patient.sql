-- name: GetPendingInstallmentsWithDetails :many
SELECT
    i.id AS installment_id,
    i.transaction_id,
    i.user_id,
    i.installment_num,
    i.amount,
    i.due_date,
    i.paid_at,
    i.status,
    i.reactivation_fee,
    i.days_overdue,
    t.id AS transaction_id,
    t.total_amount,
    t.num_installments,
    t.merchant_id,
    m.trade_name AS merchant_name
FROM installments i
JOIN transactions t ON i.transaction_id = t.id
LEFT JOIN merchants m ON t.merchant_id = m.id
WHERE i.user_id = $1 AND i.status IN ('PENDING', 'OVERDUE')
ORDER BY i.due_date ASC;

-- name: GetPaidInstallmentsWithDetails :many
SELECT
    i.id AS installment_id,
    i.transaction_id,
    i.user_id,
    i.installment_num,
    i.amount,
    i.due_date,
    i.paid_at,
    i.status,
    i.reactivation_fee,
    i.days_overdue,
    t.id AS transaction_id,
    t.total_amount,
    t.num_installments,
    t.merchant_id,
    m.trade_name AS merchant_name
FROM installments i
JOIN transactions t ON i.transaction_id = t.id
LEFT JOIN merchants m ON t.merchant_id = m.id
WHERE i.user_id = $1 AND i.status = 'PAID'
ORDER BY i.paid_at DESC;

-- name: GetInstallmentWithDetails :one
SELECT
    i.id AS installment_id,
    i.transaction_id,
    i.user_id,
    i.installment_num,
    i.amount,
    i.due_date,
    i.paid_at,
    i.status,
    i.reactivation_fee,
    i.days_overdue,
    t.id AS transaction_id,
    t.total_amount,
    t.num_installments,
    t.merchant_id,
    t.credit_line_id,
    m.trade_name AS merchant_name
FROM installments i
JOIN transactions t ON i.transaction_id = t.id
LEFT JOIN merchants m ON t.merchant_id = m.id
WHERE i.id = $1 AND i.user_id = $2;

-- name: GetPaymentByReference :one
SELECT * FROM payments WHERE reference_code = $1 LIMIT 1;

-- name: GetSubscriptionsByUser :many
SELECT
    s.id, s.user_id, s.merchant_id, s.credit_line_id, s.amount,
    s.product_name, s.status, s.next_billing_date, s.created_at, s.updated_at,
    m.trade_name AS merchant_name
FROM subscriptions s
LEFT JOIN merchants m ON s.merchant_id = m.id
WHERE s.user_id = $1
ORDER BY s.created_at DESC;

-- name: CreateSubscription :one
INSERT INTO subscriptions (
    user_id, merchant_id, credit_line_id, amount, product_name, status, next_billing_date
) VALUES (
    $1, $2, $3, $4, $5, 'ACTIVE', NOW() + INTERVAL '30 days'
) RETURNING *;

-- name: CancelSubscription :exec
UPDATE subscriptions SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2;

-- name: GetElderCareSubsByUser :many
SELECT
    e.id, e.user_id, e.merchant_id, e.credit_line_id, e.service_type,
    e.monthly_amount, e.status, e.next_billing_date, e.created_at, e.updated_at,
    m.trade_name AS merchant_name
FROM elder_care_subscriptions e
LEFT JOIN merchants m ON e.merchant_id = m.id
WHERE e.user_id = $1
ORDER BY e.created_at DESC;

-- name: CreateElderCareSub :one
INSERT INTO elder_care_subscriptions (
    user_id, merchant_id, credit_line_id, service_type, monthly_amount, status, next_billing_date
) VALUES (
    $1, $2, $3, $4, $5, 'ACTIVE', NOW() + INTERVAL '30 days'
) RETURNING *;

-- name: CancelElderCareSub :exec
UPDATE elder_care_subscriptions SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2;

-- name: GetTransactionsByUser :many
SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC;

-- name: GetTransactionByID :one
SELECT * FROM transactions WHERE id = $1;

-- name: GetInstallmentsByTransaction :many
SELECT * FROM installments WHERE transaction_id = $1 ORDER BY installment_num ASC;

-- name: GetAllActiveMerchants :many
SELECT id, trade_name, category, city FROM merchants WHERE is_active = true ORDER BY trade_name;

-- name: CreatePaymentRecord :one
INSERT INTO payments (
    installment_id, user_id, amount_paid, payment_method, reference_code, verified, paid_at
) VALUES (
    $1, $2, $3, $4, $5, false, NOW()
) RETURNING *;

-- ════════════════════════════════════════════════════════════
-- Consent Tracking
-- ════════════════════════════════════════════════════════════

-- name: ListUserConsents :many
SELECT id, user_id, consent_type, consent_version, granted, granted_at, revoked_at, created_at, updated_at
FROM user_consents
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: CreateUserConsent :one
INSERT INTO user_consents (user_id, consent_type, consent_version, granted, granted_at)
VALUES ($1, $2, $3, $4, NOW())
RETURNING id, user_id, consent_type, consent_version, granted, granted_at, revoked_at, created_at, updated_at;

-- name: RevokeUserConsent :exec
UPDATE user_consents
SET granted = false, revoked_at = NOW(), updated_at = NOW()
WHERE id = $1 AND user_id = $2;
