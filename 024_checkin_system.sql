-- 024_checkin_system.sql
-- 30BN-14.1: Check-In System — schema for public per-date check-in

-- CHANGE 1: Add check_in_token to show_dates (per-date check-in link,
-- distinct from the unused/legacy shows.check_in_token column).
ALTER TABLE show_dates
  ADD COLUMN check_in_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_show_dates_check_in_token
  ON show_dates (check_in_token);

-- CHANGE 2: Make attendance.slot_claim_id nullable — walk-in check-ins
-- (new volunteers with no prior slot claim) insert attendance with
-- slot_claim_id = null.
ALTER TABLE attendance
  ALTER COLUMN slot_claim_id DROP NOT NULL;
