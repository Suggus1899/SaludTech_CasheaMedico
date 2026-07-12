-- name: GetMerchantPayouts :many
SELECT 
    m.id AS merchant_id,
    m.trade_name AS merchant_name,
    COUNT(t.id) AS total_transactions,
    SUM(t.financed_amount) AS total_financed,
    SUM(t.mdr_fee) AS total_fees,
    (SUM(t.financed_amount) - SUM(t.mdr_fee)) AS net_payout
FROM merchants m
JOIN transactions t ON m.id = t.merchant_id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY m.id, m.trade_name;

-- name: GetMerchantByID :one
SELECT * FROM merchants WHERE id = $1;
