-- ============================================================
-- SaludTech BNPL HealthTech Platform - Initial Schema
-- V1: Core tables, enums, indexes, triggers
-- ============================================================

-- ============================================================
-- 1. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. Custom ENUM types
-- ============================================================
CREATE TYPE user_role AS ENUM ('PATIENT', 'MERCHANT', 'ADMIN');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE credit_line_type AS ENUM ('PRINCIPAL', 'DAILY');
CREATE TYPE credit_line_status AS ENUM ('ACTIVE', 'PAUSED', 'BLOCKED');
CREATE TYPE transaction_status AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE installment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED');
CREATE TYPE merchant_category AS ENUM ('CLINIC', 'PHARMACY', 'OPTICS', 'DENTAL', 'LABORATORY', 'AESTHETIC', 'MEDICAL_SUPPLIES', 'WELLNESS');

-- ============================================================
-- 3. Helper function for updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. Tables
-- ============================================================

-- 4.1 Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    email           VARCHAR(150)    UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(200)    NOT NULL,
    national_id     VARCHAR(20)     UNIQUE,
    role            VARCHAR(20)     NOT NULL DEFAULT 'PATIENT',
    kyc_status      VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    kyc_doc_url     VARCHAR(500),
    level           SMALLINT        NOT NULL DEFAULT 1,
    points          INTEGER         NOT NULL DEFAULT 0,
    total_paid      NUMERIC(14,2)   NOT NULL DEFAULT 0.00,
    installments_paid_count INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_kyc_status ON users (kyc_status);
CREATE INDEX idx_users_national_id ON users (national_id);

-- 4.2 Merchants
CREATE TABLE merchants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name      VARCHAR(200)    NOT NULL,
    trade_name      VARCHAR(200)    NOT NULL,
    rif             VARCHAR(20)     NOT NULL UNIQUE,
    category        VARCHAR(30)     NOT NULL,
    address         VARCHAR(500),
    city            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(150)    NOT NULL UNIQUE,
    contact_name    VARCHAR(200),
    mdr_rate        NUMERIC(5,4)    NOT NULL DEFAULT 0.0350,
    bank_account_bs VARCHAR(30),
    bank_account_usd VARCHAR(30),
    is_active       BOOLEAN         NOT NULL DEFAULT FALSE,
    is_online       BOOLEAN         NOT NULL DEFAULT FALSE,
    min_transaction NUMERIC(10,2)   NOT NULL DEFAULT 25.00,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_merchants_category ON merchants (category);
CREATE INDEX idx_merchants_is_active ON merchants (is_active);

-- 4.3 Merchant Users (junction table)
CREATE TABLE merchant_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID            NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_owner        BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (merchant_id, user_id)
);

CREATE INDEX idx_merchant_users_merchant_id ON merchant_users (merchant_id);
CREATE INDEX idx_merchant_users_user_id ON merchant_users (user_id);

-- 4.4 Credit Lines
CREATE TABLE credit_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20)     NOT NULL,
    limit_usd       NUMERIC(14,2)   NOT NULL,
    used_usd        NUMERIC(14,2)   NOT NULL DEFAULT 0.00,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    paused_at       TIMESTAMPTZ,
    reactivated_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, type)
);

CREATE TRIGGER trg_credit_lines_updated_at
    BEFORE UPDATE ON credit_lines
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_credit_lines_user_id ON credit_lines (user_id);
CREATE INDEX idx_credit_lines_status ON credit_lines (status);

-- 4.5 Transactions
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id),
    merchant_id     UUID            NOT NULL REFERENCES merchants(id),
    credit_line_id  UUID            NOT NULL REFERENCES credit_lines(id),
    total_amount    NUMERIC(14,2)   NOT NULL,
    down_payment    NUMERIC(14,2)   NOT NULL DEFAULT 0.00,
    financed_amount NUMERIC(14,2)   NOT NULL,
    num_installments SMALLINT       NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING_PAYMENT',
    qr_code_token   VARCHAR(500)    UNIQUE,
    qr_expires_at   TIMESTAMPTZ,
    mdr_fee         NUMERIC(14,2)   NOT NULL DEFAULT 0.00,
    description     VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_merchant_id ON transactions (merchant_id);
CREATE INDEX idx_transactions_status ON transactions (status);
CREATE INDEX idx_transactions_qr_code_token ON transactions (qr_code_token);

-- 4.6 Installments
CREATE TABLE installments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id      UUID            NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id),
    installment_num     SMALLINT        NOT NULL,
    amount              NUMERIC(14,2)   NOT NULL,
    due_date            DATE            NOT NULL,
    paid_at             TIMESTAMPTZ,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    reactivation_fee    NUMERIC(14,2)   NOT NULL DEFAULT 0.00,
    days_overdue        INTEGER         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_installments_updated_at
    BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_installments_transaction_id ON installments (transaction_id);
CREATE INDEX idx_installments_user_id ON installments (user_id);
CREATE INDEX idx_installments_status ON installments (status);
CREATE INDEX idx_installments_due_date ON installments (due_date);

-- 4.7 Payments
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installment_id  UUID            NOT NULL REFERENCES installments(id),
    user_id         UUID            NOT NULL REFERENCES users(id),
    amount_paid     NUMERIC(14,2)   NOT NULL,
    payment_method  VARCHAR(50)     NOT NULL,
    reference_code  VARCHAR(100),
    verified        BOOLEAN         NOT NULL DEFAULT FALSE,
    verified_by     UUID,
    paid_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_installment_id ON payments (installment_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);

-- 4.8 Merchant Payouts
CREATE TABLE merchant_payouts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID            NOT NULL REFERENCES merchants(id),
    period_start    DATE            NOT NULL,
    period_end      DATE            NOT NULL,
    gross_amount    NUMERIC(14,2)   NOT NULL,
    mdr_deducted    NUMERIC(14,2)   NOT NULL,
    net_amount      NUMERIC(14,2)   NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_payouts_merchant_id ON merchant_payouts (merchant_id);
CREATE INDEX idx_merchant_payouts_status ON merchant_payouts (status);

-- 4.9 User Level History
CREATE TABLE user_level_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_level      SMALLINT,
    to_level        SMALLINT        NOT NULL,
    reason          VARCHAR(500),
    changed_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_level_history_user_id ON user_level_history (user_id);

-- 4.10 Audit Log
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID            REFERENCES users(id),
    action          VARCHAR(100)    NOT NULL,
    entity          VARCHAR(100)    NOT NULL,
    entity_id       UUID,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log (user_id);
CREATE INDEX idx_audit_log_action ON audit_log (action);
CREATE INDEX idx_audit_log_entity ON audit_log (entity);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);
