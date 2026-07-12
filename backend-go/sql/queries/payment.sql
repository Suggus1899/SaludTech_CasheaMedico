-- name: ProcessInstallmentPayment :one
UPDATE installments
SET
    status = 'PAID',
    paid_at = NOW()
WHERE id = $1
RETURNING *;

-- name: AddUserPoints :exec
UPDATE users
SET points = points + $2
WHERE id = $1;

-- name: CheckAndLevelUpUser :exec
UPDATE users
SET level = level + 1
WHERE id = $1 AND points >= 100 AND level < 6;
