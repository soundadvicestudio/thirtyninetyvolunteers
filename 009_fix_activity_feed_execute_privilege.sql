-- Migration 009: Revoke public/anon EXECUTE on
-- get_activity_feed() SECURITY DEFINER function.
-- PostgreSQL grants EXECUTE to PUBLIC by default on
-- new functions. For SECURITY DEFINER functions this
-- allows the anon role to call them via PostgREST and
-- bypass RLS. This is the same fix applied to
-- get_show_notification_targets() in Migration 008.
-- See R28.

REVOKE EXECUTE ON FUNCTION
  get_activity_feed(p_limit integer, p_offset integer)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION
  get_activity_feed(p_limit integer, p_offset integer)
FROM anon;

-- authenticated is already granted from Migration 007.
-- Re-stating it here for clarity and auditability.
GRANT EXECUTE ON FUNCTION
  get_activity_feed(p_limit integer, p_offset integer)
TO authenticated;
