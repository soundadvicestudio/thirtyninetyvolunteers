-- Migration 011: Hours Tracking (30BN-9.1)
-- Adds a confirmation flag to attendance hours (Option A: hours log
-- immediately on Showed, confirmed/adjusted afterward) and a logged_date
-- column on volunteer_hours_log for manual entries.

-- Add hours_confirmed to attendance
ALTER TABLE attendance
ADD COLUMN hours_confirmed boolean NOT NULL DEFAULT false;

-- DEFAULT false means all existing Showed records are unconfirmed. This is
-- correct — they appear in the pending review queue. No backfill needed.

-- Composite index for the dashboard card query (filters on both columns
-- together)
CREATE INDEX idx_attendance_hours_confirmed
ON attendance(hours_confirmed, status);

-- Add logged_date to volunteer_hours_log
ALTER TABLE volunteer_hours_log
ADD COLUMN logged_date date;

-- Nullable — attendance entries leave it null (date implied by
-- attendance.show_date_id). Manual entries set it to the user-supplied date.
