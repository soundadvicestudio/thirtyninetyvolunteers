-- =====================================================================
-- Migration 020 — locations.default_hours
-- =====================================================================
-- Nullable, no default — null means "use the app_settings bucket
-- fallback" (30BN-ADMIN.25 Item 1). Once a Super Admin sets a
-- per-location value (currently only settable via SQL — no UI yet),
-- it takes priority over the legacy name->bucket lookup.

ALTER TABLE locations
ADD COLUMN default_hours numeric(4,2);
