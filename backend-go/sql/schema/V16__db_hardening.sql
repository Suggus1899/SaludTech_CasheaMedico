-- ============================================================
-- V16: DB hardening — missing indexes, CHECK constraints, ON DELETE
-- ============================================================

-- ─── 1. Missing index on FK ────────────────────────────────────
-- transactions.credit_line_id had no index despite being a FK used in joins.
CREATE INDEX IF NOT EXISTS idx_transactions_credit_line_id
    ON transactions (credit_line_id);

-- ─── 2. CHECK constraints on numeric ranges ─────────────────────
-- Prevent invalid data at the DB level.

-- users: level (1-6), points >= 0, total_paid >= 0
ALTER TABLE users ADD CONSTRAINT users_level_check CHECK (level >= 1 AND level <= 6);
ALTER TABLE users ADD CONSTRAINT users_points_check CHECK (points >= 0);
ALTER TABLE users ADD CONSTRAINT users_total_paid_check CHECK (total_paid >= 0);

-- credit_lines: limit_usd >= 0, used_usd >= 0
ALTER TABLE credit_lines ADD CONSTRAINT credit_lines_limit_check CHECK (limit_usd >= 0);
ALTER TABLE credit_lines ADD CONSTRAINT credit_lines_used_check CHECK (used_usd >= 0);

-- installments: amount > 0, installment_num > 0, days_overdue >= 0
ALTER TABLE installments ADD CONSTRAINT installments_amount_check CHECK (amount > 0);
ALTER TABLE installments ADD CONSTRAINT installments_num_check CHECK (installment_num > 0);
ALTER TABLE installments ADD CONSTRAINT installments_days_overdue_check CHECK (days_overdue >= 0);

-- payments: amount_paid > 0
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount_paid > 0);

-- merchants: mdr_rate between 0 and 1
ALTER TABLE merchants ADD CONSTRAINT merchants_mdr_rate_check CHECK (mdr_rate >= 0 AND mdr_rate <= 1);

-- medical_services: price_usd > 0
ALTER TABLE medical_services ADD CONSTRAINT medical_services_price_check CHECK (price_usd > 0);

-- medical_supplies: price_usd > 0, stock >= 0
ALTER TABLE medical_supplies ADD CONSTRAINT medical_supplies_price_check CHECK (price_usd > 0);
ALTER TABLE medical_supplies ADD CONSTRAINT medical_supplies_stock_check CHECK (stock >= 0);

-- appointments: duration_min > 0
ALTER TABLE appointments ADD CONSTRAINT appointments_duration_check CHECK (duration_min > 0);

-- ─── 3. ON DELETE clauses on critical FKs ───────────────────────
-- Currently deleting a user leaves orphan transactions/payments.
-- Add ON DELETE CASCADE for child tables that don't make sense without parent.

-- payments.installment_id → installments.id (already has index, add ON DELETE CASCADE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'payments_installment_id_fkey_cascade'
    ) THEN
        ALTER TABLE payments
            DROP CONSTRAINT IF EXISTS payments_installment_id_fkey,
            ADD CONSTRAINT payments_installment_id_fkey_cascade
            FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- payments.user_id → users.id (restrict delete if payments exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'payments_user_id_fkey_restrict'
    ) THEN
        ALTER TABLE payments
            DROP CONSTRAINT IF EXISTS payments_user_id_fkey,
            ADD CONSTRAINT payments_user_id_fkey_restrict
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- transactions.user_id → users.id (restrict — never auto-delete transactions)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'transactions_user_id_fkey_restrict'
    ) THEN
        ALTER TABLE transactions
            DROP CONSTRAINT IF EXISTS transactions_user_id_fkey,
            ADD CONSTRAINT transactions_user_id_fkey_restrict
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- transactions.merchant_id → merchants.id (restrict)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'transactions_merchant_id_fkey_restrict'
    ) THEN
        ALTER TABLE transactions
            DROP CONSTRAINT IF EXISTS transactions_merchant_id_fkey,
            ADD CONSTRAINT transactions_merchant_id_fkey_restrict
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- ─── 4. Composite indexes for common query patterns ─────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_created
    ON transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_installments_user_status_due
    ON installments (user_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_status_expires
    ON qr_tokens (status, expires_at);
