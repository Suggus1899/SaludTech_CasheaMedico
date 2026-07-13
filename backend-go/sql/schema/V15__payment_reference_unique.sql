-- ============================================================
-- V15: Unique constraint on payments.reference_code for idempotency
-- ============================================================

-- Partial unique index: only enforces uniqueness when reference_code is NOT NULL.
-- This prevents duplicate payments with the same reference at the DB level,
-- even if two concurrent transactions race past the application-level check.
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_reference_code
    ON payments (reference_code)
    WHERE reference_code IS NOT NULL;
