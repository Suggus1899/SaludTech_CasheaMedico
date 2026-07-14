-- ============================================================
-- V17: NOT NULL constraints on critical business columns
-- ============================================================
-- Addresses audit findings: several UNIQUE/business-critical columns
-- allowed NULL when they should be required.
--
-- IMPORTANT: Run this only after confirming no NULL values exist in
-- production data. If NULLs exist, backfill or clean them first.
-- ============================================================

-- ─── 1. users: email and national_id ──────────────────────────
-- email is UNIQUE but allowed NULL. Application requires it.
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- national_id is UNIQUE but allowed NULL. Required for KYC.
-- Only set NOT NULL if all existing users have a national_id.
-- If some users lack it, run: UPDATE users SET national_id = 'PENDING-' || id::text WHERE national_id IS NULL;
-- before this migration. For now, we leave it nullable since the
-- application treats it as optional during registration.

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
ALTER TABLE payments ALTER COLUMN verified_by SET NOT NULL;

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
