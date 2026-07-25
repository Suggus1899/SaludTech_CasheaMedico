-- ============================================================
-- V22: Compliance — consent tracking, soft delete, audit log
-- ============================================================

-- ─── 1. Consent Tracking ─────────────────────────────────────
-- Records every consent grant/revoke event for GDPR/Ley de Protección
-- de Datos Personales (Venezuela) compliance. Immutable audit trail.

CREATE TABLE IF NOT EXISTS user_consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type    VARCHAR(50) NOT NULL CHECK (consent_type IN ('HEALTH_DATA_PROCESSING', 'DATA_SHARING_MERCHANTS', 'MARKETING_COMMUNICATIONS', 'TERMS_AND_CONDITIONS')),
    consent_version VARCHAR(20) NOT NULL,
    granted         BOOLEAN NOT NULL,
    granted_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);

-- Track the current consent version accepted by each user.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS consent_version    VARCHAR(20),
    ADD COLUMN IF NOT EXISTS consent_granted_at TIMESTAMPTZ;

-- ─── 2. Soft Delete ──────────────────────────────────────────
-- Medical records and appointments are soft-deleted to preserve the
-- clinical audit trail required by health-data regulations.

ALTER TABLE medical_records
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_medical_records_deleted_at ON medical_records(deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at);

-- ─── 3. Audit Log hardening ──────────────────────────────────
-- Add resource_id and user_agent columns for richer audit context.
-- The HTTP audit middleware logs method+path as `action` and the
-- affected entity id as `resource_id`. `entity` is made nullable so
-- the compliance middleware can insert audit entries that are not
-- tied to a specific entity table.

ALTER TABLE audit_log
    ADD COLUMN IF NOT EXISTS resource_id UUID,
    ADD COLUMN IF NOT EXISTS user_agent  VARCHAR(255);

ALTER TABLE audit_log
    ALTER COLUMN entity DROP NOT NULL;
