-- ============================================================
-- V19: Drop obsolete email verification columns
-- ============================================================
-- The email system was removed; these columns are no longer used.
-- is_email_verified is kept (still set to TRUE on register).
-- ============================================================

-- Drop the partial index first (depends on the column)
DROP INDEX IF EXISTS idx_users_email_verification_token;

-- Drop the columns
ALTER TABLE users DROP COLUMN IF EXISTS email_verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
