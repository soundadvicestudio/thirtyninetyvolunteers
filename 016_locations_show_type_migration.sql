-- =====================================================================
-- Migration 016 — Locations table replaces shows.show_type
-- =====================================================================
-- Replaces the show_type text CHECK constraint on shows with a proper
-- location_id FK referencing a new locations table. Backfills existing
-- shows using the distinct show_type values confirmed live in Task A
-- audit (30BN-CAL.1): 'mainstage' (1 row) and 'one_off' (1 row, test
-- data) — both draft/live shows named "Test".
-- =====================================================================

-- SECTION A — CREATE locations TABLE
-- =====================================================================
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SECTION B — SEED initial locations
-- =====================================================================
-- Colors chosen as five perceptually distinct, accessible hues that
-- read clearly as calendar chip backgrounds on both white (public
-- pages) and dark navy/slate (admin dark mode) surfaces. Mainstage and
-- Studio X reuse existing brand colors (navy, orange) for continuity.
INSERT INTO locations (name, color, sort_order) VALUES
  ('Mainstage',          '#293994', 1),
  ('Mainstage Lobby',    '#0D9488', 2),
  ('Green Room',         '#15803D', 3),
  ('Studio X',           '#F26522', 4),
  ('Studio X Office',    '#7C3AED', 5);

-- SECTION C — RLS on locations
-- =====================================================================
-- Pattern mirrors standing_opportunities (Migration 005): a single
-- authenticated admin_all-style policy plus a public read policy.
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY super_admin_all
  ON locations FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY public_select_locations
  ON locations FOR SELECT TO anon, authenticated
  USING (true);

-- SECTION D — ADD location_id to shows (nullable initially)
-- =====================================================================
ALTER TABLE shows
ADD COLUMN location_id uuid REFERENCES locations(id);

-- SECTION E — BACKFILL from confirmed distinct show_type values
-- =====================================================================
-- Confirmed via Task A live audit: only 'mainstage' and 'one_off'
-- exist in the live shows table. 'studio_x' has zero rows but is
-- mapped here for completeness/safety. Owner-confirmed mapping for
-- 'one_off' (test/draft data, no direct location equivalent): Green
-- Room.
UPDATE shows
SET location_id = (
  SELECT id FROM locations WHERE name = CASE show_type
    WHEN 'mainstage' THEN 'Mainstage'
    WHEN 'studio_x'  THEN 'Studio X'
    WHEN 'one_off'   THEN 'Green Room'
    ELSE NULL
  END
);

-- SECTION F — SAFETY CHECK: abort migration if any row is unmapped
-- =====================================================================
DO $$
DECLARE
  unmapped_count integer;
BEGIN
  SELECT COUNT(*) INTO unmapped_count FROM shows WHERE location_id IS NULL;
  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'Migration 016 aborted: % show(s) have an unmapped show_type value and no location_id backfilled.', unmapped_count;
  END IF;
END $$;

-- SECTION G — SET NOT NULL + FK INDEX
-- =====================================================================
ALTER TABLE shows
ALTER COLUMN location_id SET NOT NULL;

CREATE INDEX idx_shows_location_id ON shows(location_id);

-- SECTION H — DROP show_type
-- =====================================================================
ALTER TABLE shows DROP COLUMN show_type;
