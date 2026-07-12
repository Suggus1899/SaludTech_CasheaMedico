-- ============================================================
-- V11: Medical catalog — services, supplies, transaction items
-- ============================================================

-- ─── Medical Services ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medical_services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    subcategory     VARCHAR(100),
    price_usd       NUMERIC(10,2) NOT NULL,
    duration_min    SMALLINT DEFAULT 30,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE medical_services ADD CONSTRAINT svc_category_check
    CHECK (category IN ('CONSULTATION','PROCEDURE','LAB_TEST','DENTAL','IMAGING','VACCINATION','TELEMEDICINE'));

CREATE INDEX IF NOT EXISTS idx_svc_merchant ON medical_services (merchant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_svc_category ON medical_services (category, is_active);

-- ─── Medical Supplies ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medical_supplies (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id          UUID NOT NULL REFERENCES merchants(id),
    name                 VARCHAR(200) NOT NULL,
    description          TEXT,
    category             VARCHAR(50) NOT NULL,
    subcategory          VARCHAR(100),
    price_usd            NUMERIC(10,2) NOT NULL,
    unit                 VARCHAR(50) DEFAULT 'unidad',
    stock                INTEGER NOT NULL DEFAULT 0,
    min_stock            INTEGER DEFAULT 10,
    requires_prescription BOOLEAN NOT NULL DEFAULT false,
    is_active            BOOLEAN NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE medical_supplies ADD CONSTRAINT sup_category_check
    CHECK (category IN ('MEDICATION','DEVICE','SUPPLY','OXYGEN','NUTRITION','PERSONAL_CARE'));

CREATE INDEX IF NOT EXISTS idx_sup_merchant ON medical_supplies (merchant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sup_category ON medical_supplies (category, is_active);

-- ─── Transaction Items ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS transaction_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    service_id      UUID REFERENCES medical_services(id),
    supply_id       UUID REFERENCES medical_supplies(id),
    item_name       VARCHAR(200) NOT NULL,
    quantity        SMALLINT NOT NULL DEFAULT 1,
    unit_price_usd  NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transaction_items ADD CONSTRAINT ti_one_item_check
    CHECK (service_id IS NOT NULL OR supply_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ti_transaction ON transaction_items (transaction_id);

-- ─── Subscription Items ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    supply_id       UUID REFERENCES medical_supplies(id),
    item_name       VARCHAR(200) NOT NULL,
    quantity        SMALLINT NOT NULL DEFAULT 1,
    unit_price_usd  NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_si_subscription ON subscription_items (subscription_id);
