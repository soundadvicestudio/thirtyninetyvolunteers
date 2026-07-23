-- 022_recurring_events.sql
-- CAL.10a: Recurring events data-layer foundation.
-- recurrence_groups holds the shared series definition; calendar_events
-- rows carry recurrence_group_id back to their parent series.

CREATE TABLE recurrence_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'performance','rehearsal','teaching',
    'meeting','event','rental','other'
  )),
  custom_type_label text,
  location_id uuid REFERENCES locations(id),
  start_time time NOT NULL,
  end_time time NOT NULL,
  description text,
  requirements text,
  frequency text NOT NULL CHECK (
    frequency IN ('weekly','biweekly','monthly')
  ),
  series_start_date date NOT NULL,
  series_end_date date,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','cancelled')),
  submitted_by uuid NOT NULL
    REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurrence_groups_submitted_by
  ON recurrence_groups(submitted_by);

ALTER TABLE calendar_events
ADD COLUMN recurrence_group_id uuid
  REFERENCES recurrence_groups(id)
  ON DELETE SET NULL;

CREATE INDEX idx_calendar_events_recurrence_group
  ON calendar_events(recurrence_group_id);

ALTER TABLE recurrence_groups
  ENABLE ROW LEVEL SECURITY;

-- RLS function: is_admin() (not is_super_admin()) — matches the
-- established calendar_events convention (A7 audit finding). is_admin()
-- checks is_active = true for any admin role; true super-admin-only
-- enforcement for edit/cancel happens in the server actions themselves.
CREATE POLICY
  "authenticated_select_recurrence_groups"
ON recurrence_groups FOR SELECT
TO authenticated USING (true);

CREATE POLICY
  "authenticated_insert_recurrence_groups"
ON recurrence_groups FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY
  "super_admin_modify_recurrence_groups"
ON recurrence_groups FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
