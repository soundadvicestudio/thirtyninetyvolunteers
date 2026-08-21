-- Migration 044: Maintenance Mode estimated restoration time
-- Seeds one app_settings key for the optional "Estimated Restoration
-- Time" field on the Maintenance Mode section.
-- Uses ON CONFLICT DO NOTHING — safe to re-run, preserves any value
-- already set.

INSERT INTO app_settings (key, value)
VALUES ('maintenance_estimated_restoration', '')
ON CONFLICT (key) DO NOTHING;
