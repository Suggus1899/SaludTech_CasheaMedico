-- ============================================================
-- V13: Health features — profile, medical records, appointments,
--       medication reminders, and family/caregiver accounts
-- ============================================================

-- ─── 1. Health Profile ──────────────────────────────────────
-- Stores patient health information that no BNPL competitor has.
-- One row per user (1:1 relationship).

CREATE TABLE IF NOT EXISTS health_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_type           VARCHAR(10),   -- A+, A-, B+, B-, AB+, AB-, O+, O-, unknown
    height_cm            SMALLINT,
    weight_kg            NUMERIC(5,2),
    allergies            TEXT[],         -- array of allergy names
    chronic_conditions   TEXT[],         -- array of condition names (diabetes, hypertension, etc.)
    current_medications  TEXT[],         -- array of medication names currently taken
    emergency_contact_name  VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50), -- parent, spouse, sibling, etc.
    notes                TEXT,            -- free-form notes from patient
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_health_profiles_updated_at
    BEFORE UPDATE ON health_profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_health_profiles_user_id ON health_profiles (user_id);

-- ─── 2. Medical Records ─────────────────────────────────────
-- Links transactions to medical outcomes (diagnosis, prescription, notes).
-- A patient can have records without a transaction (e.g. external consult).

CREATE TABLE IF NOT EXISTS medical_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id  UUID REFERENCES transactions(id) ON DELETE SET NULL,
    merchant_id     UUID REFERENCES merchants(id) ON DELETE SET NULL,
    service_id      UUID REFERENCES medical_services(id) ON DELETE SET NULL,
    record_type     VARCHAR(30) NOT NULL DEFAULT 'CONSULTATION',
        -- CONSULTATION, LAB_RESULT, PROCEDURE, DENTAL, VACCINATION, PRESCRIPTION
    diagnosis       TEXT,
    prescription    TEXT,           -- free-form or structured prescription text
    doctor_name     VARCHAR(200),
    notes           TEXT,
    record_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (record_type IN ('CONSULTATION', 'LAB_RESULT', 'PROCEDURE', 'DENTAL', 'VACCINATION', 'PRESCRIPTION', 'OTHER'))
);

CREATE TRIGGER trg_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_medical_records_user_id ON medical_records (user_id);
CREATE INDEX idx_medical_records_record_date ON medical_records (record_date DESC);
CREATE INDEX idx_medical_records_merchant_id ON medical_records (merchant_id);

-- ─── 3. Appointments ────────────────────────────────────────
-- Booking system: patient schedules a service with a merchant.

CREATE TABLE IF NOT EXISTS appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    service_id      UUID REFERENCES medical_services(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_min    SMALLINT NOT NULL DEFAULT 30,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        -- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_appointments_user_id ON appointments (user_id);
CREATE INDEX idx_appointments_merchant_id ON appointments (merchant_id);
CREATE INDEX idx_appointments_date ON appointments (appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments (status);

-- ─── 4. Medication Reminders ────────────────────────────────
-- Reminders for chronic medication schedules.

CREATE TABLE IF NOT EXISTS medication_reminders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),    -- e.g. "1 tablet", "10ml"
    frequency       VARCHAR(50) NOT NULL DEFAULT 'DAILY',
        -- DAILY, TWICE_DAILY, THREE_TIMES_DAY, WEEKLY, AS_NEEDED
    times           TEXT[] NOT NULL, -- array of times: ['08:00', '20:00']
    start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,            -- NULL = indefinite
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_medication_reminders_updated_at
    BEFORE UPDATE ON medication_reminders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_medication_reminders_user_id ON medication_reminders (user_id);
CREATE INDEX idx_medication_reminders_active ON medication_reminders (is_active);

-- ─── 5. Family / Caregiver Accounts ──────────────────────────
-- A caregiver can manage multiple patients (e.g. elderly parents).
-- The patient must approve the caregiver relationship.

CREATE TABLE IF NOT EXISTS family_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relation        VARCHAR(50),     -- parent, child, spouse, sibling, other
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        -- PENDING (awaiting patient approval), ACTIVE, REVOKED
    permissions     TEXT[] NOT NULL DEFAULT '{}',
        -- can include: 'view_profile', 'make_payments', 'book_appointments', 'view_records'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (caregiver_id, patient_id),
    CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED'))
);

CREATE TRIGGER trg_family_members_updated_at
    BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_family_members_caregiver_id ON family_members (caregiver_id);
CREATE INDEX idx_family_members_patient_id ON family_members (patient_id);
CREATE INDEX idx_family_members_status ON family_members (status);
