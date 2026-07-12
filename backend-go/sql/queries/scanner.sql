-- name: TryScannerLock :one
SELECT pg_try_advisory_xact_lock($1, $2) AS acquired;

-- name: GetOverdueInstallments :many
SELECT * FROM installments
WHERE status = 'PENDING' AND due_date < CURRENT_DATE - INTERVAL '2 days';

-- name: ApplyReactivationFee :one
UPDATE installments
SET
    status = 'OVERDUE',
    reactivation_fee = 4.00,
    days_overdue = CURRENT_DATE - due_date
WHERE id = $1
RETURNING *;

-- name: PauseUserCreditLines :exec
UPDATE credit_lines
SET
    status = 'PAUSED',
    paused_at = NOW()
WHERE user_id = $1 AND type != 'SALUD_COTIDIANA';
