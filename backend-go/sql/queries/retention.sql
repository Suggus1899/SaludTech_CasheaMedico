-- ════════════════════════════════════════════════════════════
-- Data Retention — periodic cleanup of expired/old records
-- ════════════════════════════════════════════════════════════

-- name: DeleteExpiredQrTokens :exec
DELETE FROM qr_tokens
WHERE status IN ('EXPIRED', 'CANCELLED')
  AND created_at < NOW() - INTERVAL '30 days';

-- name: DeleteRevokedConsents :exec
DELETE FROM user_consents
WHERE granted = false
  AND revoked_at IS NOT NULL
  AND revoked_at < NOW() - INTERVAL '7 years';

-- name: DeleteOldAuditLogs :exec
DELETE FROM audit_log
WHERE created_at < NOW() - INTERVAL '7 years';
