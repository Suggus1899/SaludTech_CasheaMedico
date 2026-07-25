-- name: InsertAuditLog :exec
INSERT INTO audit_log (user_id, action, resource_id, ip_address, user_agent, created_at)
VALUES ($1, $2, $3, $4, $5, NOW());
