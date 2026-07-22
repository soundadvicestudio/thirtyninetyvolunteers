-- =====================================================================
-- Migration 017 — Calendar Schema Foundation & Production Role
-- =====================================================================
-- Schema-only foundation for the Master Calendar system (30BN-CAL.2).
-- No UI ships in this migration. CAL.3+ builds on top of this.

-- SECTION A — rehearsal_batches
-- =====================================================================
CREATE TABLE rehearsal_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  submitted_by uuid NOT NULL REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rehearsal_batches_submitted_by
  ON rehearsal_batches(submitted_by);

-- SECTION B — calendar_events
-- =====================================================================
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'performance','rehearsal','teaching',
    'meeting','event','rental','other'
  )),
  custom_type_label text,
  location_id uuid REFERENCES locations(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  description text,
  requirements text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending','approved','cancelled')
  ),
  source text NOT NULL DEFAULT 'manual' CHECK (
    source IN ('show','manual')
  ),
  source_show_date_id uuid REFERENCES show_dates(id)
    ON DELETE CASCADE,
  rehearsal_batch_id uuid REFERENCES rehearsal_batches(id)
    ON DELETE SET NULL,
  submitted_by uuid NOT NULL REFERENCES admin_users(id),
  approved_by uuid REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_location_id
  ON calendar_events(location_id);
CREATE INDEX idx_calendar_events_start_time
  ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_status
  ON calendar_events(status);
CREATE INDEX idx_calendar_events_source_show_date_id
  ON calendar_events(source_show_date_id);
CREATE INDEX idx_calendar_events_submitted_by
  ON calendar_events(submitted_by);
CREATE INDEX idx_calendar_events_rehearsal_batch_id
  ON calendar_events(rehearsal_batch_id);

-- updated_at trigger — reuses handle_updated_at(), the established
-- pattern already used by volunteers/shows/standing_opportunities
-- (confirmed via pg_trigger in Task A; moddatetime is not the
-- pattern in use in this project).
CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- SECTION C — calendar_event_contacts
-- =====================================================================
CREATE TABLE calendar_event_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid NOT NULL
    REFERENCES calendar_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_event_contacts_event_id
  ON calendar_event_contacts(calendar_event_id);

-- SECTION D — show_date_buffer
-- =====================================================================
CREATE TABLE show_date_buffer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_date_id uuid NOT NULL UNIQUE
    REFERENCES show_dates(id) ON DELETE CASCADE,
  buffer_before_minutes integer NOT NULL DEFAULT 0,
  buffer_after_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_show_date_buffer_show_date_id
  ON show_date_buffer(show_date_id);

-- SECTION E — admin_users: calendar_editor column
-- =====================================================================
ALTER TABLE admin_users
ADD COLUMN calendar_editor boolean NOT NULL DEFAULT false;

ALTER TABLE admin_users
ADD CONSTRAINT admin_users_calendar_editor_check
CHECK (
  role NOT IN ('super_admin','production')
  OR calendar_editor = false
);

-- SECTION F — admin_users: extend role CHECK constraint
-- =====================================================================
-- Exact constraint name confirmed via Task A (A1): admin_users_role_check
ALTER TABLE admin_users
DROP CONSTRAINT admin_users_role_check;

ALTER TABLE admin_users
ADD CONSTRAINT admin_users_role_check
CHECK (role IN (
  'super_admin','editor','viewer','production'
));

-- SECTION G — Enable RLS on all four new tables
-- =====================================================================
ALTER TABLE rehearsal_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_date_buffer ENABLE ROW LEVEL SECURITY;

-- SECTION H — RLS policies
-- =====================================================================

-- rehearsal_batches
CREATE POLICY "authenticated_select_rehearsal_batches"
ON rehearsal_batches FOR SELECT
TO authenticated USING (true);

CREATE POLICY "authenticated_insert_rehearsal_batches"
ON rehearsal_batches FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "super_admin_modify_rehearsal_batches"
ON rehearsal_batches FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- calendar_events
CREATE POLICY "authenticated_select_calendar_events"
ON calendar_events FOR SELECT
TO authenticated USING (true);

CREATE POLICY "authenticated_insert_calendar_events"
ON calendar_events FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "super_admin_modify_calendar_events"
ON calendar_events FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "super_admin_delete_calendar_events"
ON calendar_events FOR DELETE
TO authenticated
USING (is_admin());

-- calendar_event_contacts
CREATE POLICY "authenticated_all_calendar_event_contacts"
ON calendar_event_contacts FOR ALL
TO authenticated USING (true) WITH CHECK (true);

-- show_date_buffer
CREATE POLICY "authenticated_select_show_date_buffer"
ON show_date_buffer FOR SELECT
TO authenticated USING (true);

CREATE POLICY "super_admin_modify_show_date_buffer"
ON show_date_buffer FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- SECTION I — locations RLS gap check
-- =====================================================================
-- Confirmed via Task A (A3): locations already has a super_admin_all
-- FOR ALL policy covering UPDATE/DELETE. No gap — nothing to add here.
