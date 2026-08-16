-- Phase TZ: seed org_timezone into app_settings
-- Seeded as 'America/Chicago' to preserve existing behavior on deploy.
-- Configurable via Setup Panel Section 1 (Super Admin only).
INSERT INTO app_settings (key, value)
VALUES ('org_timezone', 'America/Chicago')
ON CONFLICT (key) DO NOTHING;
