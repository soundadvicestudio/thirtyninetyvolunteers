-- Migration 004: Super Admin UPDATE/DELETE on volunteer_notes
-- Project: thirtyninetyvolunteers
-- Prompt: 30BN-ADMIN.5

CREATE OR REPLACE FUNCTION public.is_super_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND is_active = true
        AND role = 'super_admin'
    );
  $$;

CREATE POLICY "superadmin_update_notes"
  ON public.volunteer_notes
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "superadmin_delete_notes"
  ON public.volunteer_notes
  FOR DELETE
  TO authenticated
  USING (is_super_admin());
