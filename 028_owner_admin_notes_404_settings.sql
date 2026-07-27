-- Migration 028: Owner Admin volunteer notes access
-- + 404 page app_settings keys

-- 1. Update volunteer_notes UPDATE policy
--    to allow owner_admin alongside super_admin
DROP POLICY IF EXISTS superadmin_update_notes
  ON volunteer_notes;
CREATE POLICY volunteer_notes_update_sa_oa
  ON volunteer_notes
  FOR UPDATE
  TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- 2. Update volunteer_notes DELETE policy
--    to allow owner_admin alongside super_admin
DROP POLICY IF EXISTS superadmin_delete_notes
  ON volunteer_notes;
CREATE POLICY volunteer_notes_delete_sa_oa
  ON volunteer_notes
  FOR DELETE
  TO authenticated
  USING (is_super_admin_or_owner_admin());

-- 3. Seed 404 page customization keys
INSERT INTO app_settings (key, value) VALUES
  ('not_found_heading', 'Page Not Found'),
  ('not_found_body',
   'We couldn''t find what you were looking for.')
ON CONFLICT (key) DO NOTHING;
