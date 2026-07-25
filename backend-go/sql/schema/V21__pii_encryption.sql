-- ============================================================
-- V21: PII Encryption with pgcrypto
-- ============================================================
-- Adds encrypted columns alongside existing plaintext PII columns
-- and backfills them from current data using pgp_sym_encrypt.
--
-- The application MUST set the encryption key before any query that
-- reads or writes encrypted columns:
--   SET LOCAL app.encryption_key = '<key-value>';
--
-- Encryption uses pgp_sym_encrypt(plaintext, key) and
-- pgp_sym_decrypt(ciphertext, key) from the pgcrypto extension
-- (enabled in V18). The key is provided via the
-- DB_ENCRYPTION_KEY environment variable at the application layer.
--
-- If DB_ENCRYPTION_KEY is not set, the encrypted columns are added
-- but NOT backfilled. The app can backfill later once the key is
-- configured.
--
-- Original plaintext columns are NOT dropped in this migration for
-- backward compatibility. A follow-up migration will drop them once
-- all read paths have been migrated to the encrypted columns.
-- ============================================================

-- ─── 1. health_profiles ─────────────────────────────────────
ALTER TABLE health_profiles
    ADD COLUMN IF NOT EXISTS blood_type_enc              BYTEA,
    ADD COLUMN IF NOT EXISTS allergies_enc               BYTEA,
    ADD COLUMN IF NOT EXISTS chronic_conditions_enc      BYTEA,
    ADD COLUMN IF NOT EXISTS current_medications_enc     BYTEA,
    ADD COLUMN IF NOT EXISTS emergency_contact_name_enc  BYTEA,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone_enc BYTEA;

-- Backfill only when the encryption key GUC is set
UPDATE health_profiles
SET blood_type_enc = pgp_sym_encrypt(blood_type::text, current_setting('app.encryption_key', true))
WHERE blood_type IS NOT NULL
  AND blood_type_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE health_profiles
SET allergies_enc = pgp_sym_encrypt(array_to_string(allergies, ','), current_setting('app.encryption_key', true))
WHERE allergies IS NOT NULL
  AND allergies_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE health_profiles
SET chronic_conditions_enc = pgp_sym_encrypt(array_to_string(chronic_conditions, ','), current_setting('app.encryption_key', true))
WHERE chronic_conditions IS NOT NULL
  AND chronic_conditions_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE health_profiles
SET current_medications_enc = pgp_sym_encrypt(array_to_string(current_medications, ','), current_setting('app.encryption_key', true))
WHERE current_medications IS NOT NULL
  AND current_medications_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE health_profiles
SET emergency_contact_name_enc = pgp_sym_encrypt(emergency_contact_name, current_setting('app.encryption_key', true))
WHERE emergency_contact_name IS NOT NULL
  AND emergency_contact_name_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE health_profiles
SET emergency_contact_phone_enc = pgp_sym_encrypt(emergency_contact_phone, current_setting('app.encryption_key', true))
WHERE emergency_contact_phone IS NOT NULL
  AND emergency_contact_phone_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

-- ─── 2. medical_records ─────────────────────────────────────
ALTER TABLE medical_records
    ADD COLUMN IF NOT EXISTS diagnosis_enc    BYTEA,
    ADD COLUMN IF NOT EXISTS prescription_enc BYTEA,
    ADD COLUMN IF NOT EXISTS doctor_name_enc  BYTEA,
    ADD COLUMN IF NOT EXISTS notes_enc        BYTEA;

UPDATE medical_records
SET diagnosis_enc = pgp_sym_encrypt(diagnosis, current_setting('app.encryption_key', true))
WHERE diagnosis IS NOT NULL
  AND diagnosis_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE medical_records
SET prescription_enc = pgp_sym_encrypt(prescription, current_setting('app.encryption_key', true))
WHERE prescription IS NOT NULL
  AND prescription_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE medical_records
SET doctor_name_enc = pgp_sym_encrypt(doctor_name, current_setting('app.encryption_key', true))
WHERE doctor_name IS NOT NULL
  AND doctor_name_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE medical_records
SET notes_enc = pgp_sym_encrypt(notes, current_setting('app.encryption_key', true))
WHERE notes IS NOT NULL
  AND notes_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

-- ─── 3. users ───────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_enc        BYTEA,
    ADD COLUMN IF NOT EXISTS email_enc        BYTEA,
    ADD COLUMN IF NOT EXISTS national_id_enc  BYTEA;

UPDATE users
SET phone_enc = pgp_sym_encrypt(phone, current_setting('app.encryption_key', true))
WHERE phone IS NOT NULL
  AND phone_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE users
SET email_enc = pgp_sym_encrypt(email, current_setting('app.encryption_key', true))
WHERE email IS NOT NULL
  AND email_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;

UPDATE users
SET national_id_enc = pgp_sym_encrypt(national_id, current_setting('app.encryption_key', true))
WHERE national_id IS NOT NULL
  AND national_id_enc IS NULL
  AND current_setting('app.encryption_key', true) IS NOT NULL;
