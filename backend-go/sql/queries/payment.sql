-- name: ProcessInstallmentPayment :one
UPDATE installments
SET
    status = 'PAID',
    paid_at = NOW()
WHERE id = $1 AND status IN ('PENDING', 'OVERDUE')
RETURNING *;

-- name: AddUserPoints :exec
UPDATE users
SET points = points + $2
WHERE id = $1;

-- name: CheckAndLevelUpUser :exec
UPDATE users
SET level = level + 1
WHERE id = $1 AND points >= 100 AND level < 6;

-- name: CountOverdueByUser :one
SELECT COUNT(*) FROM installments
WHERE user_id = $1 AND status = 'OVERDUE';

-- name: ReactivateUserCreditLines :exec
UPDATE credit_lines
SET
    status = 'ACTIVE',
    reactivated_at = NOW(),
    paused_at = NULL
WHERE user_id = $1 AND status = 'PAUSED';

-- name: ReleaseCreditLineUsage :one
UPDATE credit_lines
SET used_usd = used_usd - $2
WHERE id = $1 AND used_usd >= $2
RETURNING *;
