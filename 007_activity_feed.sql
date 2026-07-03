-- Migration 007: Activity Feed
-- Project: thirtyninetyvolunteers
-- Prompt: 30BN-ADMIN.12

-- 1. Per-admin "cleared" watermark for the activity feed.
-- Null means "never cleared" — every event is treated as new.
ALTER TABLE public.admin_users
  ADD COLUMN activity_cleared_at timestamptz;

-- 2. Unified activity feed RPC — signups, claims, cancellations,
-- and opportunity submissions, newest first. SECURITY DEFINER so a
-- single call can read across tables with different RLS policies.
CREATE OR REPLACE FUNCTION public.get_activity_feed(
  p_limit  integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  event_type     text,
  event_id       uuid,
  volunteer_name text,
  volunteer_id   uuid,
  detail         text,
  detail_id      uuid,
  occurred_at    timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    'signup'::text          AS event_type,
    v.id                    AS event_id,
    v.full_name             AS volunteer_name,
    v.id                    AS volunteer_id,
    NULL::text              AS detail,
    NULL::uuid              AS detail_id,
    v.created_at            AS occurred_at
  FROM public.volunteers v

  UNION ALL

  SELECT
    'claim'::text,
    sc.id,
    sc.volunteer_name,
    sc.volunteer_id,
    s.name                  AS detail,
    s.id                    AS detail_id,
    sc.claimed_at           AS occurred_at
  FROM public.slot_claims sc
  JOIN public.volunteer_roles vr ON sc.volunteer_role_id = vr.id
  JOIN public.show_dates sd       ON vr.show_date_id = sd.id
  JOIN public.shows s             ON sd.show_id = s.id
  WHERE sc.status = 'claimed'

  UNION ALL

  SELECT
    'cancellation'::text,
    sc.id,
    sc.volunteer_name,
    sc.volunteer_id,
    s.name                  AS detail,
    s.id                    AS detail_id,
    sc.cancelled_at         AS occurred_at
  FROM public.slot_claims sc
  JOIN public.volunteer_roles vr ON sc.volunteer_role_id = vr.id
  JOIN public.show_dates sd       ON vr.show_date_id = sd.id
  JOIN public.shows s             ON sd.show_id = s.id
  WHERE sc.status = 'cancelled'
    AND sc.cancelled_at IS NOT NULL

  UNION ALL

  SELECT
    'opportunity_submission'::text,
    os.id,
    os.volunteer_name,
    os.volunteer_id,
    so.title                AS detail,
    so.id                   AS detail_id,
    os.submitted_at         AS occurred_at
  FROM public.opportunity_submissions os
  JOIN public.standing_opportunities so
    ON os.opportunity_id = so.id
  WHERE os.status = 'submitted'

  ORDER BY occurred_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.get_activity_feed(integer, integer)
  TO authenticated;
