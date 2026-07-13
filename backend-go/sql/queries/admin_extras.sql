-- ════════════════════════════════════════════════════════════
-- Admin: Triage management
-- ════════════════════════════════════════════════════════════

-- name: ListPendingTriage :many
SELECT t.*, u.full_name AS user_name, u.phone AS user_phone
FROM triage t
JOIN users u ON t.user_id = u.id
WHERE t.status IN ('PENDING', 'REVIEWING')
ORDER BY
    CASE t.priority
        WHEN 'EMERGENCY' THEN 0
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
    END,
    t.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountPendingTriage :one
SELECT COUNT(*) FROM triage WHERE status IN ('PENDING', 'REVIEWING');

-- name: RespondTriage :exec
UPDATE triage
SET status = $3, recommendation = $4
WHERE id = $1 AND id = $2;

-- name: ListAllTriage :many
SELECT t.*, u.full_name AS user_name
FROM triage t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllTriage :one
SELECT COUNT(*) FROM triage;

-- ════════════════════════════════════════════════════════════
-- Admin: All subscriptions
-- ════════════════════════════════════════════════════════════

-- name: ListAllSubscriptions :many
SELECT
    s.id, s.user_id, s.merchant_id, s.credit_line_id, s.amount,
    s.product_name, s.status, s.next_billing_date, s.created_at, s.updated_at,
    u.full_name AS user_name,
    m.trade_name AS merchant_name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
LEFT JOIN merchants m ON s.merchant_id = m.id
ORDER BY s.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllSubscriptions :one
SELECT COUNT(*) FROM subscriptions;

-- ════════════════════════════════════════════════════════════
-- Admin: All elder care subscriptions
-- ════════════════════════════════════════════════════════════

-- name: ListAllElderCareSubs :many
SELECT
    e.id, e.user_id, e.merchant_id, e.credit_line_id, e.service_type,
    e.monthly_amount, e.status, e.next_billing_date, e.created_at, e.updated_at,
    u.full_name AS user_name,
    m.trade_name AS merchant_name
FROM elder_care_subscriptions e
JOIN users u ON e.user_id = u.id
LEFT JOIN merchants m ON e.merchant_id = m.id
ORDER BY e.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllElderCareSubs :one
SELECT COUNT(*) FROM elder_care_subscriptions;

-- ════════════════════════════════════════════════════════════
-- Merchant: Elder care subscriptions for this merchant
-- ════════════════════════════════════════════════════════════

-- name: ListElderCareSubsByMerchant :many
SELECT
    e.id, e.user_id, e.merchant_id, e.credit_line_id, e.service_type,
    e.monthly_amount, e.status, e.next_billing_date, e.created_at, e.updated_at,
    u.full_name AS user_name
FROM elder_care_subscriptions e
JOIN users u ON e.user_id = u.id
WHERE e.merchant_id = $1
ORDER BY e.created_at DESC;

-- ════════════════════════════════════════════════════════════
-- Merchant: QR tokens
-- ════════════════════════════════════════════════════════════

-- name: CreateQRToken :one
INSERT INTO qr_tokens (merchant_id, amount, description, status, expires_at)
VALUES ($1, $2, $3, 'PENDING', NOW() + INTERVAL '10 minutes')
RETURNING *;

-- name: GetQRToken :one
SELECT * FROM qr_tokens WHERE token = $1;

-- name: UpdateQRTokenStatus :exec
UPDATE qr_tokens SET status = $2, updated_at = NOW() WHERE token = $1;

-- name: ListMerchantTransactionsToday :many
SELECT t.*, u.full_name AS user_name
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.merchant_id = $1 AND DATE(t.created_at) = CURRENT_DATE
ORDER BY t.created_at DESC;
