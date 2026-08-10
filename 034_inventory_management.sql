-- 034_inventory_management.sql
-- Phase INVENTORY foundation: inventory_manager boolean on admin_users + 9 new
-- inventory tables (categories, locations, items, item_locations, photos,
-- notes, checkouts, checkout_items) + feature_inventory flag seed.
-- Built INVENTORY.1.

-- ── admin_users: inventory_manager column ──────────────────────────────────
ALTER TABLE admin_users
  ADD COLUMN inventory_manager boolean NOT NULL DEFAULT false;

ALTER TABLE admin_users
  ADD CONSTRAINT admin_users_inventory_manager_check
  CHECK (
    (role NOT IN ('production', 'viewer')) OR (inventory_manager = false)
  );

-- ── inventory_categories ────────────────────────────────────────────────────
CREATE TABLE inventory_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  prefix      text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_categories_prefix_unique UNIQUE (prefix),
  CONSTRAINT inventory_categories_prefix_format CHECK (
    prefix ~ '^[A-Z]{2,6}$'
  )
);
CREATE INDEX idx_inventory_categories_sort ON inventory_categories(sort_order);

ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_categories_select ON inventory_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_categories_write ON inventory_categories
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_locations ──────────────────────────────────────────────────────
CREATE TABLE inventory_locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_locations_sort ON inventory_locations(sort_order);

ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_locations_select ON inventory_locations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_locations_write ON inventory_locations
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_items ──────────────────────────────────────────────────────────
CREATE TABLE inventory_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_number text NOT NULL,
  name        text NOT NULL,
  category_id uuid NOT NULL REFERENCES inventory_categories(id) ON DELETE RESTRICT,
  description text,
  condition   text NOT NULL DEFAULT 'good'
              CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_items_number_unique UNIQUE (item_number)
);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX idx_inventory_items_created_by ON inventory_items(created_by);
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_items_select ON inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_items_write ON inventory_items
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_item_locations ─────────────────────────────────────────────────
CREATE TABLE inventory_item_locations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location_id      uuid REFERENCES inventory_locations(id) ON DELETE SET NULL,
  freeform_location text,
  CONSTRAINT inventory_item_locations_one_set CHECK (
    (location_id IS NOT NULL) OR (freeform_location IS NOT NULL)
  )
);
CREATE INDEX idx_inventory_item_locations_item ON inventory_item_locations(item_id);
CREATE INDEX idx_inventory_item_locations_location
  ON inventory_item_locations(location_id) WHERE location_id IS NOT NULL;

ALTER TABLE inventory_item_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_item_locations_select ON inventory_item_locations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_item_locations_write ON inventory_item_locations
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_photos ──────────────────────────────────────────────────────────
CREATE TABLE inventory_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0,
  uploaded_by  uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_photos_item ON inventory_photos(item_id);

ALTER TABLE inventory_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_photos_select ON inventory_photos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_photos_write ON inventory_photos
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_notes (append-only — no UPDATE/DELETE policy) ────────────────
-- F1: SELECT restricted to SA/OA/Editor — Viewer and Production cannot read
-- private notes. Same pattern as volunteer_notes / audition_signup_notes.
CREATE TABLE inventory_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_notes_item ON inventory_notes(item_id);

ALTER TABLE inventory_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_notes_select ON inventory_notes
  FOR SELECT TO authenticated
  USING (is_super_admin_or_owner_admin() OR is_editor());
CREATE POLICY inventory_notes_insert ON inventory_notes
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin_or_owner_admin() OR is_editor());
-- No UPDATE or DELETE policy — append-only by design (same as volunteer_notes,
-- audition_signup_notes). Private: Viewer and Production cannot SELECT.

-- ── inventory_checkouts ──────────────────────────────────────────────────────
CREATE TABLE inventory_checkouts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_out_at       timestamptz NOT NULL DEFAULT now(),
  expected_return_date date,
  returned_at          timestamptz,
  checked_out_by       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  target_type          text NOT NULL
                       CHECK (target_type IN ('show', 'user', 'custom')),
  target_show_id       uuid REFERENCES shows(id) ON DELETE SET NULL,
  target_user_id       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  target_custom_name   text,
  target_custom_contact text,
  checkout_notes       text,
  return_notes         text,
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_checkouts_checked_out_by
  ON inventory_checkouts(checked_out_by);
CREATE INDEX idx_inventory_checkouts_returned_at
  ON inventory_checkouts(returned_at) WHERE returned_at IS NULL;

ALTER TABLE inventory_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_checkouts_select ON inventory_checkouts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_checkouts_write ON inventory_checkouts
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── inventory_checkout_items ─────────────────────────────────────────────────
CREATE TABLE inventory_checkout_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id uuid NOT NULL REFERENCES inventory_checkouts(id) ON DELETE CASCADE,
  item_id     uuid NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  CONSTRAINT inventory_checkout_items_unique UNIQUE (checkout_id, item_id)
);
CREATE INDEX idx_inventory_checkout_items_checkout
  ON inventory_checkout_items(checkout_id);
CREATE INDEX idx_inventory_checkout_items_item
  ON inventory_checkout_items(item_id);

ALTER TABLE inventory_checkout_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_checkout_items_select ON inventory_checkout_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_checkout_items_write ON inventory_checkout_items
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ))
  WITH CHECK (is_super_admin_or_owner_admin() OR (
    is_editor() AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND inventory_manager = true
    )
  ));

-- ── feature flag seed ────────────────────────────────────────────────────────
INSERT INTO app_settings (key, value)
VALUES ('feature_inventory', '')
ON CONFLICT (key) DO NOTHING;
