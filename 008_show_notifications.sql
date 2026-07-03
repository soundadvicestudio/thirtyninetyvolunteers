-- 008_show_notifications.sql
-- 30BN-5.3 — Category-match volunteer notification system.

-- Part A: track when category-match notifications were last sent for a show.
ALTER TABLE shows
  ADD COLUMN notifications_sent_at timestamptz;

-- Part B: returns, for a given show, every active volunteer whose saved
-- category assignments match a role on any date of that show, along with
-- the distinct matching role names. SECURITY DEFINER — same pattern as
-- get_activity_feed() (Migration 007) — needed to join volunteers (RLS
-- admin-only) from an authenticated admin context.
CREATE OR REPLACE FUNCTION get_show_notification_targets(
  p_show_id uuid
)
RETURNS TABLE (
  volunteer_id   uuid,
  full_name      text,
  email          text,
  matching_roles text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    v.id            AS volunteer_id,
    v.full_name,
    v.email,
    array_agg(DISTINCT vr.role_name) AS matching_roles
  FROM volunteers v
  JOIN volunteer_category_assignments vca
    ON vca.volunteer_id = v.id
  JOIN volunteer_roles vr
    ON vr.category_id = vca.category_id
  JOIN show_dates sd
    ON sd.id = vr.show_date_id
  WHERE sd.show_id = p_show_id
    AND v.status = 'active'
    AND v.email IS NOT NULL
    AND v.email != ''
  GROUP BY v.id, v.full_name, v.email;
$$;

-- PostgreSQL grants EXECUTE to PUBLIC by default on CREATE FUNCTION, which
-- would let the anon role (unauthenticated PostgREST callers) invoke this
-- SECURITY DEFINER function and pull volunteer names/emails for any show.
-- Revoke PUBLIC/anon explicitly before granting to authenticated only.
REVOKE EXECUTE ON FUNCTION get_show_notification_targets(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_show_notification_targets(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION get_show_notification_targets(uuid)
  TO authenticated;
