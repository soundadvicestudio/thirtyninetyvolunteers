-- Migration 039: Maintenance Mode app_settings keys
-- Seeds three keys for the Maintenance Mode feature.
-- All use ON CONFLICT DO NOTHING — safe to re-run,
-- preserves any values already set.

INSERT INTO app_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('maintenance_heading', 'System Maintenance'),
  ('maintenance_body', 'The crew portal is temporarily unavailable while system updates and performance improvements are in progress. Please check back soon.')
ON CONFLICT (key) DO NOTHING;
