-- Remove KYC columns and enum from users table
ALTER TABLE users
    DROP COLUMN IF EXISTS kyc_status,
    DROP COLUMN IF EXISTS kyc_doc_url;

DROP INDEX IF EXISTS idx_users_kyc_status;

DROP TYPE IF EXISTS kyc_status;
