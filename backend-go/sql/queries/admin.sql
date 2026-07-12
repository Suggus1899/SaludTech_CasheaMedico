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

-- name: UpdateUserStatus :exec
UPDATE users SET is_active = $2 WHERE id = $1;

-- name: UpdateUserRole :exec
UPDATE users SET role = $2 WHERE id = $1;

-- name: ListAllMerchants :many
SELECT * FROM merchants ORDER BY created_at DESC;

-- name: CountMerchants :one
SELECT COUNT(*) FROM merchants;

-- name: CountActiveMerchants :one
SELECT COUNT(*) FROM merchants WHERE is_active = true;

-- name: UpdateMerchantStatus :exec
UPDATE merchants SET is_active = $2 WHERE id = $1;

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
