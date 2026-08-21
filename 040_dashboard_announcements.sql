-- Migration 040: Dashboard Announcements Widget
-- Adds announcement_dismissed_at to admin_users and
-- seeds four new app_settings keys for the dashboard
-- announcements feature. Uses ON CONFLICT DO NOTHING
-- on app_settings inserts — safe to re-run.

-- Add announcement_dismissed_at column to admin_users.
-- Nullable timestamptz, no default.
-- When NULL: user has never dismissed any announcement.
-- When set: compared against dashboard_announcement_
-- updated_at to determine if the announcement is new.
ALTER TABLE admin_users
  ADD COLUMN announcement_dismissed_at timestamptz;

-- Seed four new app_settings keys.
INSERT INTO app_settings (key, value) VALUES
  ('dashboard_announcement_body', ''),
  ('dashboard_announcement_updated_at', ''),
  ('dashboard_announcement_roles', '[]'),
  ('announcements_oa_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
