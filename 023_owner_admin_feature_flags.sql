-- 023_owner_admin_feature_flags.sql
-- SETUP.0: Owner Admin role + OpenCall OS default app_settings

-- 1. admin_users.role CHECK: add 'owner_admin'
ALTER TABLE admin_users DROP CONSTRAINT admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'owner_admin', 'editor', 'viewer', 'production'));

-- 2. admin_users.calendar_editor CHECK: allow owner_admin (along with editor/viewer)
ALTER TABLE admin_users DROP CONSTRAINT admin_users_calendar_editor_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_calendar_editor_check
  CHECK (calendar_editor = false OR role IN ('editor', 'viewer', 'owner_admin'));

-- 3. is_editor(): include owner_admin
CREATE OR REPLACE FUNCTION is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true AND role IN ('editor', 'super_admin', 'owner_admin')
  );
$$;

-- 4. locations RLS gap: the existing super_admin_all policy uses is_super_admin(),
-- which checks role = 'super_admin' strictly (unlike every sibling admin table's
-- ALL policy, which uses is_admin()). Without this fix, Owner Admin would pass the
-- app-layer guard on location management actions but fail at the RLS layer.
-- New helper is scoped narrowly to this one policy — is_super_admin() itself is
-- left untouched since it also correctly gates volunteer_notes UPDATE/DELETE,
-- which stays Super Admin only.
CREATE OR REPLACE FUNCTION is_super_admin_or_owner_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true AND role IN ('super_admin', 'owner_admin')
  );
$$;

DROP POLICY IF EXISTS super_admin_all ON locations;
CREATE POLICY super_admin_all ON locations
  FOR ALL
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- 5. Default app_settings rows for OpenCall OS Setup Panel (Phase SETUP).
-- ON CONFLICT DO NOTHING — never overwrite an existing value.
INSERT INTO app_settings (key, value) VALUES
  ('org_name', '30 By Ninety Theatre'),
  ('org_tagline', ''),
  ('org_contact_email', 'info@30byninety.com'),
  ('org_website_url', ''),
  ('org_location', 'Old Mandeville, LA'),
  ('brand_primary', '#293994'),
  ('brand_accent', '#F26522'),
  ('org_logo_url', ''),
  ('email_from_address', 'volunteers@30byninetyvolunteers.com'),
  ('email_from_name', '30 By Ninety Theatre Volunteers'),
  ('feature_calendar', 'true'),
  ('feature_checkin', 'true'),
  ('feature_blast', 'true'),
  ('feature_opportunities', 'true'),
  ('feature_hours_milestones', 'true'),
  ('feature_documents', 'false'),
  ('instance_label', '30 By Ninety Theatre')
ON CONFLICT (key) DO NOTHING;
