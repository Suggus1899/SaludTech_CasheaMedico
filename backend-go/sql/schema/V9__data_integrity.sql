-- ============================================================
-- SaludTech BNPL HealthTech Platform
-- V9: Data integrity — CHECK constraints, indexes, FKs, cleanup
-- ============================================================

-- ============================================================
-- 1. CHECK constraints on enum-like VARCHAR columns
--    Prevents invalid values like status='BANANA'
-- ============================================================

ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('PATIENT', 'MERCHANT', 'ADMIN'));

ALTER TABLE credit_lines ADD CONSTRAINT credit_lines_type_check
    CHECK (type IN ('ESPECIALIDAD_PRINCIPAL', 'SALUD_COTIDIANA', 'MAYOR_CUIDADO'));

ALTER TABLE credit_lines ADD CONSTRAINT credit_lines_status_check
    CHECK (status IN ('ACTIVE', 'PAUSED', 'BLOCKED'));

ALTER TABLE transactions ADD CONSTRAINT transactions_status_check
    CHECK (status IN ('PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED'));

ALTER TABLE installments ADD CONSTRAINT installments_status_check
    CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'WAIVED'));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAUSED'));

ALTER TABLE elder_care_subscriptions ADD CONSTRAINT elder_care_subs_status_check
    CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAUSED'));

ALTER TABLE elder_care_subscriptions ADD CONSTRAINT elder_care_subs_service_type_check
    CHECK (service_type IN ('NURSE', 'CAREGIVER', 'PHYSIOTHERAPY', 'GERIATRIC_SPECIALIST'));

ALTER TABLE merchant_payouts ADD CONSTRAINT merchant_payouts_status_check
    CHECK (status IN ('PENDING', 'PAID', 'FAILED'));

ALTER TABLE merchants ADD CONSTRAINT merchants_category_check
    CHECK (category IN ('CLINIC', 'PHARMACY', 'OPTICS', 'DENTAL', 'LABORATORY', 'AESTHETIC', 'MEDICAL_SUPPLIES', 'WELLNESS', 'EMERGENCY_TRIAGE', 'ELDER_CARE'));

-- ============================================================
-- 2. Drop orphan PG ENUM types (no column references them)
-- ============================================================
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS credit_line_status;
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS installment_status;

-- ============================================================
-- 3. Performance: drop redundant index
--    transactions_qr_code_token_key (UNIQUE) already indexes this column
-- ============================================================
DROP INDEX IF EXISTS idx_transactions_qr_code_token;

-- ============================================================
-- 4. Performance: composite indexes for real query patterns
-- ============================================================

-- Patient: pending installments by user
CREATE INDEX IF NOT EXISTS idx_installments_user_status
    ON installments (user_id, status);

-- Merchant: payouts last 30 days
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_created
    ON transactions (merchant_id, created_at);

-- Billing cron: subscriptions due for charge
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing
    ON subscriptions (next_billing_date)
    WHERE status = 'ACTIVE';

-- Billing cron: elder care subscriptions due for charge
CREATE INDEX IF NOT EXISTS idx_elder_care_subs_next_billing
    ON elder_care_subscriptions (next_billing_date)
    WHERE status = 'ACTIVE';

-- Audit: search by entity
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id
    ON audit_log (entity, entity_id);

-- ============================================================
-- 5. Fix TIMESTAMP vs TIMESTAMPTZ inconsistency
-- ============================================================
ALTER TABLE user_gamification_history
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
    USING created_at AT TIME ZONE 'UTC';

-- ============================================================
-- 6. Business constraints: prevent duplicate active subscriptions
-- ============================================================

-- A user cannot have two active subscriptions to the same merchant
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_active
    ON subscriptions (user_id, merchant_id)
    WHERE status = 'ACTIVE';

-- A user cannot have two active elder care subscriptions to the same service type
CREATE UNIQUE INDEX IF NOT EXISTS uq_elder_care_subs_active
    ON elder_care_subscriptions (user_id, service_type)
    WHERE status = 'ACTIVE';

-- A merchant cannot have duplicate payouts for the same period
CREATE UNIQUE INDEX IF NOT EXISTS uq_merchant_payouts_period
    ON merchant_payouts (merchant_id, period_start, period_end);

-- ============================================================
-- 7. Missing foreign key: payments.verified_by → users(id)
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payments_verified_by_fkey'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT payments_verified_by_fkey
            FOREIGN KEY (verified_by) REFERENCES users(id);
    END IF;
END $$;

-- ============================================================
-- 8. credit_lines: add blocked_at timestamp
-- ============================================================
ALTER TABLE credit_lines
    ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
