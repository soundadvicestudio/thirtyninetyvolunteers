-- 033_audition_schema_fixes.sql
-- Captures five inline schema fixes applied via Supabase MCP during Phase AUDITIONS
-- that were not included in the committed 032_audition_management.sql file.
-- All five changes are already live in production. This file brings the committed
-- migration history into sync with the live schema so a fresh environment seeded
-- from the repo produces an identical result.
-- Applied: 2026-08-09

-- Fix 1: audition_signups.phone NOT NULL
-- Applied inline in AUDITIONS.2a. Phone is required on the public signup form.
ALTER TABLE audition_signups ALTER COLUMN phone SET NOT NULL;

-- Fix 2: calendar_events.source_audition_id column + FK + partial unique index
-- Applied inline in AUDITIONS.1b. Required as the upsert conflict anchor for
-- syncAuditionToCalendar(). The partial unique index serves as both the upsert
-- anchor and the FK index (R2 — FK columns must have explicit indexes).
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS source_audition_id uuid
  REFERENCES auditions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_source_audition_id
  ON calendar_events(source_audition_id)
  WHERE source_audition_id IS NOT NULL;

-- Fix 3: calendar_events source CHECK updated to include 'audition'
-- Applied inline in AUDITIONS.1b. syncAuditionToCalendar() sets source='audition'.
-- Drop and recreate to update the allowed values list.
-- IF NOT EXISTS / IF EXISTS used for idempotency in both directions.
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_source_check;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_source_check
  CHECK (source IN ('show', 'manual', 'audition'));

-- Fix 4: consent_form_submissions.audition_signup_id column + FK + partial index
-- Applied inline in AUDITIONS.1a. Links under-18 auditioner consent submissions to
-- the audition_signups row. NULL for volunteer consent submissions (volunteer_id used
-- instead). Partial index covers only non-null rows (same pattern as
-- idx_calendar_events_source_audition_id above).
ALTER TABLE consent_form_submissions
  ADD COLUMN IF NOT EXISTS audition_signup_id uuid
  REFERENCES audition_signups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_consent_submissions_audition_signup
  ON consent_form_submissions(audition_signup_id)
  WHERE audition_signup_id IS NOT NULL;

-- Fix 5: email_log recipient_type CHECK updated to include 'audition'
-- Applied inline in AUDITIONS.2a. Constraint value exists in schema but is not
-- currently exercised by any code path (all audition sends log as 'transactional'
-- or 'individual'). Captured here for schema completeness and future use.
-- Use the exact constraint name confirmed in Task A Query 7.
ALTER TABLE email_log DROP CONSTRAINT IF EXISTS email_log_recipient_type_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_recipient_type_check
  CHECK (recipient_type IN ('all', 'category', 'individual', 'transactional', 'audition'));
