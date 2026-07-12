-- name: GetServicesByMerchant :many
SELECT * FROM medical_services
WHERE merchant_id = $1 AND is_active = true
ORDER BY category, name;

-- name: GetSuppliesByMerchant :many
SELECT * FROM medical_supplies
WHERE merchant_id = $1 AND is_active = true
ORDER BY category, name;

-- name: GetServiceByID :one
SELECT * FROM medical_services WHERE id = $1;

-- name: GetSupplyByID :one
SELECT * FROM medical_supplies WHERE id = $1;

-- name: SearchServices :many
SELECT
    s.id, s.merchant_id, s.name, s.description, s.category, s.subcategory,
    s.price_usd, s.duration_min, s.is_active,
    m.trade_name AS merchant_name, m.city AS merchant_city
FROM medical_services s
JOIN merchants m ON s.merchant_id = m.id
WHERE s.is_active = true AND m.is_active = true
AND ($1::text = '' OR s.category = $1)
AND ($2::text = '' OR s.name ILIKE '%' || $2 || '%')
ORDER BY s.price_usd ASC;

-- name: SearchSupplies :many
SELECT
    s.id, s.merchant_id, s.name, s.description, s.category, s.subcategory,
    s.price_usd, s.unit, s.stock, s.requires_prescription, s.is_active,
    m.trade_name AS merchant_name, m.city AS merchant_city
FROM medical_supplies s
JOIN merchants m ON s.merchant_id = m.id
WHERE s.is_active = true AND m.is_active = true
AND ($1::text = '' OR s.category = $1)
AND ($2::text = '' OR s.name ILIKE '%' || $2 || '%')
ORDER BY s.price_usd ASC;

-- name: CreateTransactionItem :one
INSERT INTO transaction_items (transaction_id, service_id, supply_id, item_name, quantity, unit_price_usd)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetTransactionItems :many
SELECT * FROM transaction_items WHERE transaction_id = $1;

-- name: DecrementSupplyStock :exec
UPDATE medical_supplies SET stock = stock - $2 WHERE id = $1 AND stock >= $2;

-- name: GetMerchantsByCategory :many
SELECT * FROM merchants
WHERE is_active = true AND ($1::text = '' OR category = $1)
ORDER BY trade_name;

-- name: CreateSubscriptionItem :one
INSERT INTO subscription_items (subscription_id, supply_id, item_name, quantity, unit_price_usd)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetSubscriptionItems :many
SELECT * FROM subscription_items WHERE subscription_id = $1;
