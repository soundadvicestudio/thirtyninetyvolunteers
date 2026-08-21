-- Migration 043: Beta Feedback System
-- beta_feedback table for in-platform feedback collection during Beta period.
-- feature_beta flag seeded as 'false' (opt-in — disabled by default).

CREATE TABLE beta_feedback (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by  uuid        NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_snapshot text        NOT NULL,
  type          text        NOT NULL CHECK (type IN ('feature_request','bug_report','other')),
  message       text        NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
  -- completed_at NULL  = pending (visible in SA queue)
  -- completed_at NOT NULL = soft-archived (hidden from queue, preserved in DB)
);

CREATE INDEX idx_beta_feedback_submitted_by  ON beta_feedback(submitted_by);
CREATE INDEX idx_beta_feedback_submitted_at  ON beta_feedback(submitted_at);
CREATE INDEX idx_beta_feedback_pending
  ON beta_feedback(submitted_at)
  WHERE completed_at IS NULL;

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Any authenticated user may insert their own row
CREATE POLICY beta_feedback_insert_authenticated
  ON beta_feedback FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Super Admin may read all pending rows
CREATE POLICY beta_feedback_select_sa
  ON beta_feedback FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super Admin may update (set completed_at to soft-archive)
CREATE POLICY beta_feedback_update_sa
  ON beta_feedback FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Seed feature flag (opt-in — off by default, same as feature_messages)
INSERT INTO app_settings (key, value)
VALUES ('feature_beta', 'false')
ON CONFLICT (key) DO NOTHING;
