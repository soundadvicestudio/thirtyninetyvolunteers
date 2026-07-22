-- =====================================================================
-- Migration 019 — end_time on show_dates
-- =====================================================================
-- Nullable, no default — existing rows have no end time and cannot be
-- backfilled with real values. Null is the correct sentinel meaning
-- "end time not yet set; syncShowDateToCalendar() falls back to a
-- 3-hour default" (30BN-CAL.4a).

ALTER TABLE show_dates
ADD COLUMN end_time time without time zone;
