-- ============================================================
-- V10: Triage table for symptom assessment and merchant referral
-- ============================================================

CREATE TABLE IF NOT EXISTS triage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    symptoms            TEXT NOT NULL,
    perceived_severity  SMALLINT NOT NULL DEFAULT 5,
    priority            VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    recommendation      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE triage ADD CONSTRAINT triage_priority_check
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'));

ALTER TABLE triage ADD CONSTRAINT triage_status_check
    CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'REFERRED', 'COMPLETED'));

ALTER TABLE triage ADD CONSTRAINT triage_severity_check
    CHECK (perceived_severity >= 1 AND perceived_severity <= 10);

CREATE INDEX IF NOT EXISTS idx_triage_user_created
    ON triage (user_id, created_at DESC);
