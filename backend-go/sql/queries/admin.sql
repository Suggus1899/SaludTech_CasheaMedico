-- name: ListUsers :many
SELECT id, phone, email, full_name, national_id, role,
       level, points, total_paid, installments_paid_count, is_active,
       created_at, updated_at
FROM users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: CountUsersByRole :one
SELECT COUNT(*) FROM users WHERE role = $1;

-- name: GetUserByIDAdmin :one
SELECT id, phone, email, full_name, national_id, role,
       level, points, total_paid, installments_paid_count, is_active,
       created_at, updated_at
FROM users WHERE id = $1;

-- name: UpdateUserStatus :one
UPDATE users SET is_active = $2 WHERE id = $1
RETURNING id, email, full_name, is_active;

-- name: UpdateUserRole :exec
UPDATE users SET role = $2 WHERE id = $1;

-- name: ListAllMerchants :many
SELECT * FROM merchants ORDER BY created_at DESC;

-- name: CountMerchants :one
SELECT COUNT(*) FROM merchants;

-- name: CountActiveMerchants :one
SELECT COUNT(*) FROM merchants WHERE is_active = true;

-- name: UpdateMerchantStatus :one
UPDATE merchants SET is_active = $2 WHERE id = $1
RETURNING id, legal_name, trade_name, is_active;

-- name: CountTransactions :one
SELECT COUNT(*) FROM transactions;

-- name: SumTotalTransactionAmount :one
SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE status != 'CANCELLED';

-- name: CountOverdueInstallments :one
SELECT COUNT(*) FROM installments WHERE status = 'OVERDUE';

-- name: SumPendingInstallments :one
SELECT COALESCE(SUM(amount), 0) FROM installments WHERE status IN ('PENDING', 'OVERDUE');

-- name: ListAllCreditLines :many
SELECT cl.*, u.full_name as user_name, u.phone as user_phone
FROM credit_lines cl
JOIN users u ON cl.user_id = u.id
ORDER BY cl.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountCreditLines :one
SELECT COUNT(*) FROM credit_lines;

-- name: UpdateCreditLineLimit :exec
UPDATE credit_lines SET limit_usd = $2 WHERE id = $1;

-- name: GetMerchantByUserID :one
SELECT m.* FROM merchants m
JOIN merchant_users mu ON m.id = mu.merchant_id
WHERE mu.user_id = $1
LIMIT 1;

-- name: GetMerchantTransactions :many
SELECT t.*, u.full_name as user_name, u.phone as user_phone
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.merchant_id = $1
ORDER BY t.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountMerchantTransactions :one
SELECT COUNT(*) FROM transactions WHERE merchant_id = $1;

-- name: SumMerchantRevenue :one
SELECT COALESCE(SUM(total_amount), 0) FROM transactions
WHERE merchant_id = $1 AND status != 'CANCELLED';

-- name: GetMerchantPayoutsFiltered :many
SELECT * FROM merchant_payouts
WHERE merchant_id = $1
ORDER BY created_at DESC;

-- name: CreateMedicalService :one
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateMedicalService :exec
UPDATE medical_services
SET name = $2, description = $3, category = $4, subcategory = $5,
    price_usd = $6, duration_min = $7, is_active = $8
WHERE id = $1 AND merchant_id = $9;

-- name: DeleteMedicalService :exec
DELETE FROM medical_services WHERE id = $1 AND merchant_id = $2;

-- name: CreateMedicalSupply :one
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, min_stock, requires_prescription)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: UpdateMedicalSupply :exec
UPDATE medical_supplies
SET name = $2, description = $3, category = $4, subcategory = $5,
    price_usd = $6, unit = $7, stock = $8, min_stock = $9,
    requires_prescription = $10, is_active = $11
WHERE id = $1 AND merchant_id = $12;

-- name: DeleteMedicalSupply :exec
DELETE FROM medical_supplies WHERE id = $1 AND merchant_id = $2;

-- name: GetMerchantDashboardStats :one
SELECT
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(t.total_amount), 0) as total_revenue,
  COUNT(DISTINCT t.user_id) as unique_customers,
  COALESCE(SUM(t.mdr_fee), 0) as total_mdr
FROM transactions t
WHERE t.merchant_id = $1 AND t.status != 'CANCELLED';

-- ─── Analytics queries ──────────────────────────────────────────────────────

-- name: GetRevenueByMonth :many
SELECT
  TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
  COALESCE(SUM(total_amount), 0) AS revenue,
  COUNT(*) AS transaction_count
FROM transactions
WHERE status != 'CANCELLED'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC
LIMIT 12;

-- name: GetTransactionStatusBreakdown :many
SELECT
  status,
  COUNT(*) AS count,
  COALESCE(SUM(total_amount), 0) AS total_amount
FROM transactions
GROUP BY status
ORDER BY count DESC;

-- name: GetInstallmentStatusBreakdown :many
SELECT
  status,
  COUNT(*) AS count,
  COALESCE(SUM(amount), 0) AS total_amount
FROM installments
GROUP BY status
ORDER BY count DESC;

-- name: GetTopMerchantsByRevenue :many
SELECT
  m.trade_name AS merchant_name,
  m.category,
  COALESCE(SUM(t.total_amount), 0) AS revenue,
  COUNT(t.id) AS transaction_count
FROM merchants m
LEFT JOIN transactions t ON m.id = t.merchant_id AND t.status != 'CANCELLED'
GROUP BY m.id, m.trade_name, m.category
ORDER BY revenue DESC
LIMIT 5;

-- name: GetMerchantCategoryDistribution :many
SELECT
  category,
  COUNT(*) AS merchant_count
FROM merchants
WHERE is_active = true
GROUP BY category
ORDER BY merchant_count DESC;

-- name: GetTriageConversion :one
SELECT
  COUNT(DISTINCT CASE WHEN status = 'PENDING' THEN id END) AS pending_count,
  COUNT(DISTINCT CASE WHEN status = 'REVIEWING' THEN id END) AS reviewing_count,
  COUNT(DISTINCT CASE WHEN status = 'RESOLVED' THEN id END) AS resolved_count,
  COUNT(DISTINCT CASE WHEN status = 'REFERRED' THEN id END) AS referred_count,
  COUNT(DISTINCT CASE WHEN status = 'COMPLETED' THEN id END) AS completed_count
FROM triage;

-- ─── Export queries (paginated, for CSV) ────────────────────────────────────

-- name: ExportAllUsers :many
SELECT id, phone, email, full_name, national_id, role,
       level, points, total_paid, installments_paid_count, is_active,
       created_at, updated_at
FROM users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ExportAllTransactions :many
SELECT
  t.id, t.total_amount, t.down_payment, t.financed_amount,
  t.num_installments, t.status, t.mdr_fee, t.description, t.created_at,
  u.full_name AS user_name, u.email AS user_email,
  m.trade_name AS merchant_name, m.category AS merchant_category
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN merchants m ON t.merchant_id = m.id
ORDER BY t.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ExportAllInstallments :many
SELECT
  i.id, i.installment_num, i.amount, i.due_date, i.paid_at,
  i.status, i.reactivation_fee, i.days_overdue, i.created_at,
  u.full_name AS user_name, u.email AS user_email
FROM installments i
JOIN users u ON i.user_id = u.id
ORDER BY i.due_date DESC
LIMIT $1 OFFSET $2;
