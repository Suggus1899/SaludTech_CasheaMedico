ALTER TABLE users ADD COLUMN is_credit_frozen_for_electives BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE user_gamification_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type      VARCHAR(50)     NOT NULL,
    points_awarded  INT             NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gamification_user_id ON user_gamification_history (user_id);
