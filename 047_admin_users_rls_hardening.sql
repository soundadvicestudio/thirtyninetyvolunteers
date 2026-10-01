-- 047_admin_users_rls_hardening.sql (SEC.1)
--
-- VULNERABILITY (found in 30BN-ACCOUNT.A, read-only audit):
-- public.admin_users carried a single write-capable policy,
-- authenticated_all_admin (cmd ALL, USING and WITH CHECK is_admin()).
-- is_admin() only checks is_active = true -- NOT role, NOT row ownership.
-- Result: any active admin of ANY role (Editor, Viewer, Production) could,
-- via the Supabase API with their own session (bypassing every application
-- role guard in lib/actions/users.ts), UPDATE any column of any admin_users
-- row -- including role, is_active, calendar_editor, inventory_manager -- or
-- INSERT/DELETE rows outright.
--
-- Separately found in SEC.1 Task A: GRANT TRUNCATE ... TO anon, authenticated
-- on this table is a live, unnecessary privilege -- no application code path
-- uses it. TRUNCATE is not subject to row-level security in Postgres, so RLS
-- offers no backstop here. Task C1 confirmed the TRUNCATE privilege itself IS
-- granted to an ordinary Editor session (no permission-denied error), but a
-- bare TRUNCATE on this table is currently blocked by Postgres's own
-- FK-dependency protection (49 other tables reference admin_users). A
-- TRUNCATE ... CASCADE was NOT attempted given its blast radius across those
-- 49 tables; whether it would succeed depends on whether the caller also
-- holds TRUNCATE on all of them, which was not investigated here. Revoked
-- below as defense in depth regardless of whether it's reachable today.
--
-- DESIGN:
--   1. Replace the unscoped ALL policy with four narrow policies:
--      - admin_users_select_admins: any active admin may SELECT all rows
--        (unchanged visibility from today -- the old ALL policy's USING
--        already granted this; preserved so every existing live join in
--        the app -- Audit Log, Forums, DMs, User Management, etc. -- keeps
--        working unmodified).
--      - admin_users_insert_sa_oa / admin_users_update_sa_oa: Super Admin
--        may insert/update anything; Owner Admin may insert/update any row
--        EXCEPT setting/targeting role = 'super_admin'. Editor/Viewer/
--        Production get neither.
--      - admin_users_update_own: any active admin may UPDATE their own row
--        (further restricted by the trigger below to an explicit column
--        allowlist -- RLS alone cannot express "same row, but only these
--        columns").
--      - No DELETE policy for `authenticated` at all -- confirmed in
--        SEC.1 Task A4 that zero live code paths delete admin_users rows.
--   2. admin_users_guard_update() BEFORE UPDATE trigger enforces the
--      column-level allowlist RLS can't: a non-SA/OA caller editing their
--      own row may only change the columns in self_cols (below). An OA
--      caller additionally may not touch email/created_at, may not
--      touch/assign role = 'super_admin', and may not rotate another
--      user's calendar_subscription_token. auth.uid() IS NULL (service_role
--      / migrations / the postgres superuser) is always trusted and skips
--      all checks -- confirmed safe in SEC.1 Task A5(iii): anon has no
--      policy on this table at all (so an anon caller never reaches UPDATE
--      to begin with), and an authenticated session's auth.uid() is never
--      NULL when a valid JWT is present.
--   3. REVOKE TRUNCATE, REFERENCES, TRIGGER from anon/authenticated --
--      defense in depth; none of these three privileges are used by any
--      live application code path (confirmed SEC.1 Task A4).
--
-- self_cols intentionally includes 'phone' and 'show_absences_on_calendar',
-- columns that do not exist on admin_users yet (planned for the upcoming
-- Phase ACCOUNT). Harmless: `to_jsonb(row) - self_cols` simply ignores list
-- entries that are not actual keys in the jsonb object.
--
-- admin_users_is_sa_or_oa(): a new, narrowly-scoped SECURITY DEFINER
-- function duplicating is_super_admin_or_owner_admin()'s exact logic, used
-- only by the two SA/OA policies above and by the trigger function.
-- is_super_admin_or_owner_admin() itself is NOT SECURITY DEFINER (confirmed
-- live: prosecdef = false) and is NOT modified by this migration -- it
-- backs policies on many other tables (SEC.1 Task A3g lists 25) and the
-- owner (PROCEED, SEC.1) declined to change it. Initial Task A review
-- predicted that calling a non-SECURITY-DEFINER function from a policy ON
-- admin_users itself could cause "infinite recursion detected in policy for
-- relation admin_users". That prediction was tested empirically in Task C3
-- before this file was finalized and was NOT reproduced: an experimental
-- policy pair calling is_super_admin_or_owner_admin() directly, exercised
-- by a real Owner Admin persona, produced a clean INSERT (no error) proving
-- the function resolves correctly from within an admin_users policy -- no
-- recursion occurred, because the function's own internal lookup always
-- targets the caller's own row, which is already trivially visible via the
-- plain `id = auth.uid()` condition on authenticated_select_own, with no
-- function call and therefore nothing to recurse through. (A companion
-- UPDATE test in that same experiment returned 0 rows, but that was an
-- artifact of the minimal experimental policy set omitting an admin-wide
-- SELECT grant for the target's row -- not a function or recursion fault;
-- admin_users_select_admins below supplies exactly that grant.)
-- admin_users_is_sa_or_oa() is adopted anyway, per explicit owner decision,
-- for robustness (these policies no longer depend on how SELECT-policy
-- evaluation happens to interact with this function on this table -- that
-- interaction is exactly what the Task C3 experiment had to untangle to
-- explain a merely-surprising, not-even-incorrect result) and because it
-- lets this migration pin search_path on a function scoped only to this
-- table's own protection, without touching a shared helper used by 25 other
-- tables' policies.

CREATE OR REPLACE FUNCTION public.admin_users_is_sa_or_oa()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
      AND role IN ('super_admin', 'owner_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.admin_users_is_sa_or_oa() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_users_is_sa_or_oa() TO authenticated, service_role;

DROP POLICY authenticated_all_admin ON public.admin_users;

CREATE POLICY admin_users_select_admins ON public.admin_users
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY admin_users_insert_sa_oa ON public.admin_users
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin()
    OR (admin_users_is_sa_or_oa() AND role <> 'super_admin')
  );

CREATE POLICY admin_users_update_sa_oa ON public.admin_users
  FOR UPDATE TO authenticated
  USING (
    is_super_admin()
    OR (admin_users_is_sa_or_oa() AND role <> 'super_admin')
  )
  WITH CHECK (
    is_super_admin()
    OR (admin_users_is_sa_or_oa() AND role <> 'super_admin')
  );

CREATE POLICY admin_users_update_own ON public.admin_users
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND is_admin())
  WITH CHECK (id = auth.uid() AND is_admin());

-- authenticated_select_own is untouched (left exactly as-is).

CREATE OR REPLACE FUNCTION public.admin_users_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  self_cols text[] := ARRAY[
    'name','phone','last_login','activity_cleared_at',
    'announcement_dismissed_at','calendar_subscription_token',
    'show_absences_on_calendar'
  ];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- trusted: service_role / migrations / postgres superuser
  END IF;

  IF is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'admin_users.id is immutable' USING ERRCODE = '42501';
  END IF;

  IF admin_users_is_sa_or_oa() THEN
    IF OLD.role = 'super_admin' OR NEW.role = 'super_admin' THEN
      RAISE EXCEPTION 'Owner Admin cannot modify a Super Admin role' USING ERRCODE = '42501';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Owner Admin cannot change email via this path' USING ERRCODE = '42501';
    END IF;
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'created_at is immutable' USING ERRCODE = '42501';
    END IF;
    IF NEW.calendar_subscription_token IS DISTINCT FROM OLD.calendar_subscription_token
       AND OLD.id <> auth.uid() THEN
      RAISE EXCEPTION 'Cannot rotate another user''s calendar token' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- everyone else: editor / viewer / production / inactive -- own row only,
  -- and only the allow-listed columns
  IF OLD.id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify another admin''s row' USING ERRCODE = '42501';
  END IF;

  IF (to_jsonb(NEW) - self_cols) IS DISTINCT FROM (to_jsonb(OLD) - self_cols) THEN
    RAISE EXCEPTION 'Cannot modify restricted columns on your own row' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_users_guard_update
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE FUNCTION public.admin_users_guard_update();

REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.admin_users FROM anon, authenticated;

-- ROLLBACK:
-- DROP POLICY IF EXISTS admin_users_select_admins ON public.admin_users;
-- DROP POLICY IF EXISTS admin_users_insert_sa_oa ON public.admin_users;
-- DROP POLICY IF EXISTS admin_users_update_sa_oa ON public.admin_users;
-- DROP POLICY IF EXISTS admin_users_update_own ON public.admin_users;
-- CREATE POLICY authenticated_all_admin ON public.admin_users
--   FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- DROP TRIGGER IF EXISTS admin_users_guard_update ON public.admin_users;
-- DROP FUNCTION IF EXISTS public.admin_users_guard_update();
-- DROP FUNCTION IF EXISTS public.admin_users_is_sa_or_oa();
-- GRANT TRUNCATE, REFERENCES, TRIGGER ON public.admin_users TO anon, authenticated;
