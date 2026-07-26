-- Migration 026: Feature flag cleanup + favicon_url seed
-- Removes stale flag rows that are no longer feature flags
-- (documents, opportunities, and hours_milestones are core
-- features — not toggleable). Adds favicon_url key.

DELETE FROM app_settings
WHERE key IN (
  'feature_documents',
  'feature_opportunities',
  'feature_hours_milestones'
);

INSERT INTO app_settings (key, value)
VALUES ('favicon_url', '')
ON CONFLICT (key) DO NOTHING;
