-- Migration 029: QR code history table

CREATE TABLE qr_codes (
  id          uuid PRIMARY KEY
              DEFAULT gen_random_uuid(),
  url         text NOT NULL,
  label       text,
  svg         text NOT NULL,
  png_base64  text NOT NULL,
  created_by  uuid REFERENCES admin_users(id)
              ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for chronological list queries
CREATE INDEX idx_qr_codes_created_at
  ON qr_codes (created_at DESC);

-- Index for per-admin filtering (future use)
CREATE INDEX idx_qr_codes_created_by
  ON qr_codes (created_by);

-- RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- All authenticated admins can view all saved QRs
-- (shared history — any admin can see any QR)
CREATE POLICY qr_codes_select_authenticated
  ON qr_codes FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated admin can insert (generate + save)
CREATE POLICY qr_codes_insert_authenticated
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only Super Admin and Owner Admin can delete
CREATE POLICY qr_codes_delete_sa_oa
  ON qr_codes FOR DELETE
  TO authenticated
  USING (is_super_admin_or_owner_admin());
