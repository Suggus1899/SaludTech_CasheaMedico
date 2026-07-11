-- name: GetCreditLineByUser :one
SELECT * FROM credit_lines 
WHERE user_id = $1 AND type = $2;

-- name: UpdateCreditLineUsage :one
UPDATE credit_lines
SET 
    used_usd = used_usd + $3,
    status = $4
WHERE user_id = $1 AND type = $2
RETURNING *;

-- name: CreateTransaction :one
INSERT INTO transactions (
    user_id, merchant_id, credit_line_id, total_amount, down_payment, financed_amount, num_installments, qr_code_token, mdr_fee, description
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: CreateInstallment :one
INSERT INTO installments (
    transaction_id, user_id, installment_num, amount, due_date
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;
