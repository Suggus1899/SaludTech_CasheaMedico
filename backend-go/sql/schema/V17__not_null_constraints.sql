-- ============================================================
-- V17: NOT NULL constraints on critical business columns
-- ============================================================
-- Addresses audit findings: several UNIQUE/business-critical columns
-- allowed NULL when they should be required.
--
-- This migration includes backfill statements to handle existing
-- NULL values before applying NOT NULL constraints.
-- ============================================================

-- ─── 0. Backfill existing NULLs ────────────────────────────────
-- users: email is required by application
UPDATE users SET email = 'unknown-' || id::text || '@placeholder.local' WHERE email IS NULL;

-- merchants: required business fields
UPDATE merchants SET address = 'N/A' WHERE address IS NULL;
UPDATE merchants SET city = 'N/A' WHERE city IS NULL;
UPDATE merchants SET phone = '+580000000000' WHERE phone IS NULL;
UPDATE merchants SET contact_name = 'N/A' WHERE contact_name IS NULL;

-- transactions: critical financial fields
UPDATE transactions SET down_payment = 0 WHERE down_payment IS NULL;
UPDATE transactions SET qr_code_token = 'legacy-' || id::text WHERE qr_code_token IS NULL;
UPDATE transactions SET description = 'N/A' WHERE description IS NULL;

-- payments: reference_code (verified_by left nullable — unverified payments have no verifier)
UPDATE payments SET reference_code = 'N/A' WHERE reference_code IS NULL;

-- subscriptions: delete orphan rows missing credit_line_id (incomplete records)
DELETE FROM subscriptions WHERE credit_line_id IS NULL;
UPDATE subscriptions SET next_billing_date = created_at WHERE next_billing_date IS NULL;

-- elder_care_subscriptions: same treatment
DELETE FROM elder_care_subscriptions WHERE credit_line_id IS NULL;
UPDATE elder_care_subscriptions SET next_billing_date = created_at WHERE next_billing_date IS NULL;

-- medical_services: catalog completeness
UPDATE medical_services SET description = 'N/A' WHERE description IS NULL;
UPDATE medical_services SET subcategory = 'general' WHERE subcategory IS NULL;
UPDATE medical_services SET duration_min = 30 WHERE duration_min IS NULL;

-- health_profiles: required medical fields
UPDATE health_profiles SET blood_type = 'Unknown' WHERE blood_type IS NULL;
UPDATE health_profiles SET emergency_contact_name = 'N/A' WHERE emergency_contact_name IS NULL;
UPDATE health_profiles SET emergency_contact_phone = '+580000000000' WHERE emergency_contact_phone IS NULL;

-- medical_records: delete orphans missing FKs, backfill text fields
DELETE FROM medical_records WHERE transaction_id IS NULL;
DELETE FROM medical_records WHERE merchant_id IS NULL;
DELETE FROM medical_records WHERE service_id IS NULL;
UPDATE medical_records SET diagnosis = 'N/A' WHERE diagnosis IS NULL;
UPDATE medical_records SET prescription = 'N/A' WHERE prescription IS NULL;
UPDATE medical_records SET doctor_name = 'N/A' WHERE doctor_name IS NULL;

-- appointments: delete orphans missing service_id
DELETE FROM appointments WHERE service_id IS NULL;

-- medication_reminders: required fields
UPDATE medication_reminders SET dosage = 'N/A' WHERE dosage IS NULL;

-- family_members: required fields
UPDATE family_members SET relation = 'Otro' WHERE relation IS NULL;

-- qr_tokens: delete orphans missing transaction_id
DELETE FROM qr_tokens WHERE transaction_id IS NULL;

-- ─── 1. users: email ──────────────────────────────────────────
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- ─── 2. merchants: required business fields ───────────────────
ALTER TABLE merchants ALTER COLUMN address SET NOT NULL;
ALTER TABLE merchants ALTER COLUMN city SET NOT NULL;
ALTER TABLE merchants ALTER COLUMN phone SET NOT NULL;
ALTER TABLE merchants ALTER COLUMN contact_name SET NOT NULL;

-- ─── 3. transactions: critical financial fields ───────────────
ALTER TABLE transactions ALTER COLUMN down_payment SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN qr_code_token SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN description SET NOT NULL;

-- ─── 4. payments: verification tracking ───────────────────────
ALTER TABLE payments ALTER COLUMN reference_code SET NOT NULL;
-- verified_by left nullable: unverified payments legitimately have no verifier

-- ─── 5. subscriptions: billing-critical fields ────────────────
ALTER TABLE subscriptions ALTER COLUMN credit_line_id SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN next_billing_date SET NOT NULL;

-- ─── 6. elder_care_subscriptions: billing-critical fields ─────
ALTER TABLE elder_care_subscriptions ALTER COLUMN credit_line_id SET NOT NULL;
ALTER TABLE elder_care_subscriptions ALTER COLUMN next_billing_date SET NOT NULL;

-- ─── 7. medical_services: catalog completeness ────────────────
ALTER TABLE medical_services ALTER COLUMN description SET NOT NULL;
ALTER TABLE medical_services ALTER COLUMN subcategory SET NOT NULL;
ALTER TABLE medical_services ALTER COLUMN duration_min SET NOT NULL;

-- ─── 8. health_profiles: required medical fields ──────────────
ALTER TABLE health_profiles ALTER COLUMN blood_type SET NOT NULL;
ALTER TABLE health_profiles ALTER COLUMN emergency_contact_name SET NOT NULL;
ALTER TABLE health_profiles ALTER COLUMN emergency_contact_phone SET NOT NULL;

-- ─── 9. medical_records: required fields ──────────────────────
ALTER TABLE medical_records ALTER COLUMN transaction_id SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN merchant_id SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN service_id SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN diagnosis SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN prescription SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN doctor_name SET NOT NULL;

-- ─── 10. appointments: required fields ────────────────────────
ALTER TABLE appointments ALTER COLUMN service_id SET NOT NULL;

-- ─── 11. medication_reminders: required fields ────────────────
ALTER TABLE medication_reminders ALTER COLUMN dosage SET NOT NULL;

-- ─── 12. family_members: required fields ──────────────────────
ALTER TABLE family_members ALTER COLUMN relation SET NOT NULL;

-- ─── 13. qr_tokens: required fields ───────────────────────────
ALTER TABLE qr_tokens ALTER COLUMN transaction_id SET NOT NULL;
