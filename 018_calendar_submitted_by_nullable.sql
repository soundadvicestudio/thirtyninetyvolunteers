-- =====================================================================
-- Migration 018 — calendar_events.submitted_by nullable +
-- source_show_date_id unique constraint
-- =====================================================================
-- Enables the show-to-calendar sync upsert (30BN-CAL.3): synced events
-- have no human submitter (submitted_by = null), and the unique
-- constraint gives the upsert a conflict target so exactly one
-- calendar_events row ever exists per show date.

ALTER TABLE calendar_events
ALTER COLUMN submitted_by DROP NOT NULL;

ALTER TABLE calendar_events
ADD CONSTRAINT calendar_events_source_show_date_id_unique
UNIQUE (source_show_date_id);
