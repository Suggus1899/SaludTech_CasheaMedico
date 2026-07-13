-- ============================================================
-- V14: QR tokens for merchant payment flow
-- ============================================================

CREATE TABLE IF NOT EXISTS qr_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token           VARCHAR(100) NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount          NUMERIC(14,2) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        -- PENDING (waiting for patient scan)
        -- SCANNED (patient scanned, confirming)
        -- COMPLETED (transaction created)
        -- EXPIRED (10 min timeout)
        -- CANCELLED (merchant cancelled)
    transaction_id  UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
    CHECK (status IN ('PENDING', 'SCANNED', 'COMPLETED', 'EXPIRED', 'CANCELLED'))
);

CREATE TRIGGER trg_qr_tokens_updated_at
    BEFORE UPDATE ON qr_tokens
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_qr_tokens_token ON qr_tokens (token);
CREATE INDEX idx_qr_tokens_merchant_id ON qr_tokens (merchant_id);
CREATE INDEX idx_qr_tokens_status ON qr_tokens (status);
