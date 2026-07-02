-- =====================================================================
-- 30 By Ninety Theatre — Volunteer Platform
-- Migration 002: volunteer_notes Role-Scoped RLS
-- Project: thirtyninetyvolunteers
-- =====================================================================
--
-- Context (30BN-3.3 Step 1 schema verification): the volunteer_notes
-- table was carrying the generic "authenticated_all_admin" policy
-- (FOR ALL TO authenticated USING (is_admin())) applied to most tables
-- in Migration 001. is_admin() only checks admin_users membership +
-- is_active — it does not check role — so this let Viewers read/write
-- notes at the database layer, and allowed UPDATE/DELETE despite notes
-- being append-only records.
--
-- This corrects the policy to match Brief §9 ("RLS: SELECT, INSERT for
-- editors only") and R5 (Editor Notes must be enforced at both the
-- render layer and the database layer). No UPDATE/DELETE policy is
-- added — notes are permanent, append-only records.

DROP POLICY IF EXISTS "authenticated_all_admin" ON public.volunteer_notes;

CREATE OR REPLACE FUNCTION public.is_editor()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true AND role IN ('editor', 'super_admin')
  );
$function$;

CREATE POLICY "editor_select" ON public.volunteer_notes
  FOR SELECT TO authenticated
  USING (is_editor());

CREATE POLICY "editor_insert" ON public.volunteer_notes
  FOR INSERT TO authenticated
  WITH CHECK (is_editor());
