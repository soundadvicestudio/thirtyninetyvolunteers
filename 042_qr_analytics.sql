-- Migration 042: QR code scan analytics
-- Phase QRANALYTICS — QR Code Scan Tracking

-- Add redirect_token and target_url to qr_codes.
-- redirect_token: app-generated UUID for new QR codes.
--   NULL on legacy rows (generated before this migration)
--   — signals "analytics not available" for those rows.
--   No DEFAULT — always set explicitly on insert for new
--   rows.
-- target_url: the admin's original destination URL.
--   Stored so /go/[token] knows where to redirect scanners.
--   NULL on legacy rows (their QR images encode the raw
--   URL directly and never hit /go/).
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS redirect_token uuid,
  ADD COLUMN IF NOT EXISTS target_url text;

-- Partial index for fast token lookup in the route
-- handler. Every QR scan hits this index.
CREATE INDEX IF NOT EXISTS idx_qr_codes_redirect_token
  ON qr_codes(redirect_token)
  WHERE redirect_token IS NOT NULL;

-- Scan event log. One row per scan of a trackable QR code.
CREATE TABLE IF NOT EXISTS qr_scan_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id  uuid NOT NULL
              REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at  timestamptz NOT NULL DEFAULT now(),
  user_agent  text,
  device_type text,
  browser     text
);

-- Index for the analytics aggregate query (QRANALYTICS.2).
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_qr_code_id
  ON qr_scan_events(qr_code_id);

-- RLS on qr_scan_events.
ALTER TABLE qr_scan_events ENABLE ROW LEVEL SECURITY;

-- Any signed-in admin can read analytics.
-- Matches qr_codes_select_authenticated naming convention.
CREATE POLICY qr_scan_events_select_authenticated
  ON qr_scan_events FOR SELECT
  TO authenticated
  USING (true);

-- SA/OA can delete scan events (e.g. to clear history).
-- Matches qr_codes_delete_sa_oa naming convention.
CREATE POLICY qr_scan_events_delete_sa_oa
  ON qr_scan_events FOR DELETE
  TO authenticated
  USING (is_super_admin_or_owner_admin());

-- No INSERT policy: the only writer is the public
-- /go/[token] route handler, which uses getAdminClient()
-- (service role) and bypasses RLS entirely. An INSERT
-- policy would be dead code.
