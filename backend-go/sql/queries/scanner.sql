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

-- name: GetUpcomingInstallmentsForReminder :many
SELECT
    i.id,
    i.user_id,
    i.amount,
    i.due_date,
    i.installment_num,
    u.email,
    u.full_name
FROM installments i
JOIN users u ON i.user_id = u.id
WHERE i.status = 'PENDING'
  AND i.due_date >= CURRENT_DATE
  AND i.due_date <= CURRENT_DATE + INTERVAL '3 days'
  AND u.email IS NOT NULL
  AND u.is_active = true;
