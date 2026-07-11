-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByPhone :one
SELECT * FROM users WHERE phone = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (
    phone, email, password_hash, full_name, national_id, role
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: UpdateUserGamification :one
UPDATE users
SET 
    points = points + $2,
    level = $3,
    total_paid = total_paid + $4,
    installments_paid_count = installments_paid_count + $5
WHERE id = $1
RETURNING *;
