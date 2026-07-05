CREATE TABLE pending_registrations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  email          text NOT NULL,
  auth_user_id   uuid NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','declined')),
  requested_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_by    uuid REFERENCES admin_users(id),
  reviewed_at    timestamptz
);

CREATE UNIQUE INDEX idx_pending_reg_email
  ON pending_registrations(email);
CREATE INDEX idx_pending_reg_status
  ON pending_registrations(status);

-- RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Super Admins: full access
CREATE POLICY "super_admin_all_pending"
  ON pending_registrations
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Anon: INSERT only (registration submission)
CREATE POLICY "anon_insert_pending"
  ON pending_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);
