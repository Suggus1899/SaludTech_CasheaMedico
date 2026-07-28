-- ============================================================
-- V23: Fix seed user password hashes
-- The original seeds used a placeholder bcrypt hash that does NOT
-- correspond to "admin123". This migration sets the correct hash.
-- ============================================================

-- Hash for "admin123" (bcrypt cost 10)
UPDATE users
SET password_hash = '$2a$10$iO720SZA3cxyrwNHNVvF..bh/W/NL8Fn797WwkWKw0GvcjbO0MTI6'
WHERE email IN ('admin@saludtech.com', 'merchant@saludtech.com');
