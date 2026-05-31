-- ============================================================
-- SaludTech BNPL HealthTech Platform
-- V6: Sync ENUMs, create missing tables, add new columns
-- ============================================================

-- ============================================================
-- 1. Sync credit_line_type enum
--    V1 created: PRINCIPAL, DAILY
--    Java now has: SALUD_COTIDIANA, ESPECIALIDAD_PRINCIPAL, MAYOR_CUIDADO
--    Strategy: add new values, migrate data, keep old values
-- ============================================================

-- Extend type column width FIRST to avoid truncation when updating existing data
ALTER TABLE credit_lines ALTER COLUMN type TYPE VARCHAR(30);

-- credit_line_type is stored as VARCHAR(30), not a PG ENUM, so we just update data:
UPDATE credit_lines SET type = 'ESPECIALIDAD_PRINCIPAL' WHERE type = 'PRINCIPAL';
UPDATE credit_lines SET type = 'SALUD_COTIDIANA'        WHERE type = 'DAILY';

-- ============================================================
-- 2. Sync merchant_category — add EMERGENCY_TRIAGE and ELDER_CARE
--    (stored as VARCHAR(30), no PG ENUM to alter)
-- ============================================================

-- No DDL needed; VARCHAR allows any value. Java enum already has EMERGENCY_TRIAGE.
-- Just add ELDER_CARE to merchants.subcategory column below.

-- ============================================================
-- 3. Add merchants.subcategory column
-- ============================================================
ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);

-- ============================================================
-- 4. Add new columns to triage_requests
-- ============================================================
ALTER TABLE triage_requests
    ADD COLUMN IF NOT EXISTS specialty_recommended VARCHAR(50),
    ADD COLUMN IF NOT EXISTS urgency_level          VARCHAR(20),
    ADD COLUMN IF NOT EXISTS doctor_response_at     TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS referred_merchant_id   UUID REFERENCES merchants(id);

CREATE INDEX IF NOT EXISTS idx_triage_status ON triage_requests (status);
CREATE INDEX IF NOT EXISTS idx_triage_urgency ON triage_requests (urgency_level);

-- ============================================================
-- 5. Create subscriptions table (was missing from all migrations)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id      UUID            NOT NULL REFERENCES merchants(id),
    credit_line_id   UUID            REFERENCES credit_lines(id),
    amount           NUMERIC(14,2)   NOT NULL,
    product_name     VARCHAR(200)    NOT NULL,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    next_billing_date TIMESTAMPTZ,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at') THEN
    CREATE TRIGGER trg_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id   ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status    ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant  ON subscriptions (merchant_id);

-- ============================================================
-- 6. Create elder_care_subscriptions table
-- ============================================================
CREATE TABLE IF NOT EXISTS elder_care_subscriptions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id      UUID            NOT NULL REFERENCES merchants(id),
    credit_line_id   UUID            REFERENCES credit_lines(id),
    service_type     VARCHAR(30)     NOT NULL,  -- NURSE | CAREGIVER | PHYSIOTHERAPY | GERIATRIC_SPECIALIST
    monthly_amount   NUMERIC(14,2)   NOT NULL,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    next_billing_date TIMESTAMPTZ,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_elder_care_subs_updated_at') THEN
    CREATE TRIGGER trg_elder_care_subs_updated_at
        BEFORE UPDATE ON elder_care_subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_elder_care_subs_user_id  ON elder_care_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_elder_care_subs_status   ON elder_care_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_elder_care_subs_merchant ON elder_care_subscriptions (merchant_id);

-- ============================================================
-- 7. Seed credit lines with MAYOR_CUIDADO for existing users
--    (so existing users get the new line type)
-- ============================================================
INSERT INTO credit_lines (user_id, type, limit_usd, used_usd, status)
SELECT u.id, 'MAYOR_CUIDADO', 500.00, 0.00, 'ACTIVE'
FROM users u
WHERE u.role = 'PATIENT'
  AND NOT EXISTS (
      SELECT 1 FROM credit_lines cl
      WHERE cl.user_id = u.id AND cl.type = 'MAYOR_CUIDADO'
  );
