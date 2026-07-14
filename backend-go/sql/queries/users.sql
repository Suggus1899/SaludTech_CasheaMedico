-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByPhone :one
SELECT * FROM users WHERE phone = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (
    phone, email, password_hash, full_name, national_id, role, email_verification_token
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetUserByVerificationToken :one
SELECT * FROM users WHERE email_verification_token = $1 AND email_verification_token IS NOT NULL;

-- name: VerifyEmail :exec
UPDATE users
SET
    is_email_verified = TRUE,
    email_verified_at = NOW(),
    email_verification_token = NULL,
    kyc_status = 'APPROVED'
WHERE id = $1;

-- name: UpdateUserGamification :one
UPDATE users
SET
    points = points + $2,
    level = $3,
    total_paid = total_paid + $4,
    installments_paid_count = installments_paid_count + $5
WHERE id = $1
RETURNING *;

-- name: UpdateUserPassword :exec
UPDATE users
SET password_hash = $2
WHERE id = $1;
