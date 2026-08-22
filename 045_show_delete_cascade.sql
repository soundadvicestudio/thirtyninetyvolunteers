-- Migration 045: Change attendance FKs to ON DELETE CASCADE
-- Allows shows to be hard-deleted even with associated attendance records.
-- attendance.show_id and attendance.show_date_id previously ON DELETE NO ACTION.

-- Drop and recreate the FK from attendance → shows
ALTER TABLE attendance
  DROP CONSTRAINT attendance_show_id_fkey,
  ADD CONSTRAINT attendance_show_id_fkey
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE;

-- Drop and recreate the FK from attendance → show_dates
ALTER TABLE attendance
  DROP CONSTRAINT attendance_show_date_id_fkey,
  ADD CONSTRAINT attendance_show_date_id_fkey
    FOREIGN KEY (show_date_id) REFERENCES show_dates(id) ON DELETE CASCADE;
