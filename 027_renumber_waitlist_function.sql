-- Migration 027: Atomic waitlist renumbering function.
-- Replaces sequential per-row JS updates in cancelClaim()
-- with a single atomic SQL UPDATE, eliminating the race
-- condition where two concurrent cancellations could
-- produce duplicate or missing waitlist_position values.
-- This is NOT SECURITY DEFINER — runs with caller
-- privileges (authenticated admin client in cancelClaim).
-- REVOKE/GRANT still applied as defensive practice.

CREATE OR REPLACE FUNCTION renumber_waitlist(
  p_role_id uuid,
  p_cancelled_position integer
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE slot_claims
  SET waitlist_position = waitlist_position - 1
  WHERE volunteer_role_id = p_role_id
    AND status = 'waitlisted'
    AND waitlist_position > p_cancelled_position;
$$;

REVOKE EXECUTE ON FUNCTION
  renumber_waitlist(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION
  renumber_waitlist(uuid, integer) FROM anon;
GRANT EXECUTE ON FUNCTION
  renumber_waitlist(uuid, integer) TO authenticated;
