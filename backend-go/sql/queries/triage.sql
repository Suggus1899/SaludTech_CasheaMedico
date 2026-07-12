-- name: GetTriageByUser :many
SELECT * FROM triage WHERE user_id = $1 ORDER BY created_at DESC;

-- name: CreateTriage :one
INSERT INTO triage (user_id, symptoms, perceived_severity, priority, status)
VALUES ($1, $2, $3, $4, 'PENDING')
RETURNING *;

-- name: GetTriageByID :one
SELECT * FROM triage WHERE id = $1;
