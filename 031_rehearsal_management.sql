-- 031_rehearsal_management.sql
-- 30BN-21.1: Rehearsal Management System — schema foundation.
-- calendar_events.check_in_token (Phase 21 check-in), three new tables
-- (schedule assignments, per-date overrides, attendance), feature_rehearsals
-- flag seed.
--
-- NOTE (21.A/21.1 schema verification correction): admin_users has no
-- auth_user_id column — admin_users.id IS the Supabase Auth user id
-- directly (confirmed via proxy.ts and the existing is_editor()/
-- is_super_admin()/is_super_admin_or_owner_admin() helpers, all of which
-- use `id = auth.uid()`). RLS policies below use that same pattern —
-- not `auth_user_id = auth.uid()`.

-- CHANGE 1: calendar_events.check_in_token — nullable, no backfill.
-- Only rehearsal-type events created going forward get a token.
ALTER TABLE calendar_events
  ADD COLUMN check_in_token uuid DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_calendar_events_check_in_token
  ON calendar_events (check_in_token)
  WHERE check_in_token IS NOT NULL;

-- CHANGE 2: rehearsal_schedule_assignments — schedule-level (batch-level)
-- default assignment. A user assigned here attends all dates in the batch
-- unless overridden per-date in rehearsal_date_assignments.
CREATE TABLE rehearsal_schedule_assignments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rehearsal_batch_id uuid NOT NULL
                     REFERENCES rehearsal_batches(id)
                     ON DELETE CASCADE,
  admin_user_id      uuid NOT NULL
                     REFERENCES admin_users(id)
                     ON DELETE CASCADE,
  assigned_at        timestamptz NOT NULL DEFAULT now(),
  assigned_by        uuid REFERENCES admin_users(id),
  UNIQUE (rehearsal_batch_id, admin_user_id)
);

CREATE INDEX idx_rsa_batch
  ON rehearsal_schedule_assignments(rehearsal_batch_id);
CREATE INDEX idx_rsa_user
  ON rehearsal_schedule_assignments(admin_user_id);
CREATE INDEX idx_rsa_assigned_by
  ON rehearsal_schedule_assignments(assigned_by);

ALTER TABLE rehearsal_schedule_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY rsa_editor_all ON rehearsal_schedule_assignments
  FOR ALL TO authenticated
  USING (is_editor())
  WITH CHECK (is_editor());

CREATE POLICY rsa_viewer_select ON rehearsal_schedule_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'viewer'
  );

CREATE POLICY rsa_production_select ON rehearsal_schedule_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'production'
    AND admin_user_id = auth.uid()
  );

-- CHANGE 3: rehearsal_date_assignments — per-date override. include = add a
-- non-assignee for this date only; exclude = remove a schedule assignee
-- from this date only. Effective roster = schedule assignees MINUS
-- excludes PLUS includes.
CREATE TABLE rehearsal_date_assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid NOT NULL
                    REFERENCES calendar_events(id)
                    ON DELETE CASCADE,
  admin_user_id     uuid NOT NULL
                    REFERENCES admin_users(id)
                    ON DELETE CASCADE,
  override_type     text NOT NULL
                    CHECK (override_type IN ('include', 'exclude')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid REFERENCES admin_users(id),
  UNIQUE (calendar_event_id, admin_user_id)
);

CREATE INDEX idx_rda_event
  ON rehearsal_date_assignments(calendar_event_id);
CREATE INDEX idx_rda_user
  ON rehearsal_date_assignments(admin_user_id);
CREATE INDEX idx_rda_created_by
  ON rehearsal_date_assignments(created_by);

ALTER TABLE rehearsal_date_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY rda_editor_all ON rehearsal_date_assignments
  FOR ALL TO authenticated
  USING (is_editor())
  WITH CHECK (is_editor());

CREATE POLICY rda_viewer_select ON rehearsal_date_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'viewer'
  );

CREATE POLICY rda_production_select ON rehearsal_date_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'production'
    AND admin_user_id = auth.uid()
  );

-- CHANGE 4: rehearsal_attendance — separate from the volunteer attendance
-- table by design (different entity: admin_users, not volunteers).
CREATE TABLE rehearsal_attendance (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid NOT NULL
                    REFERENCES calendar_events(id)
                    ON DELETE CASCADE,
  admin_user_id     uuid NOT NULL
                    REFERENCES admin_users(id)
                    ON DELETE CASCADE,
  status            text NOT NULL
                    CHECK (status IN ('showed', 'no-show', 'excused')),
  source            text NOT NULL
                    CHECK (source IN ('checkin', 'manual')),
  checked_in_at     timestamptz,
  marked_by         uuid REFERENCES admin_users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (calendar_event_id, admin_user_id)
);

CREATE INDEX idx_rattend_event
  ON rehearsal_attendance(calendar_event_id);
CREATE INDEX idx_rattend_user
  ON rehearsal_attendance(admin_user_id);
CREATE INDEX idx_rattend_marked_by
  ON rehearsal_attendance(marked_by);

ALTER TABLE rehearsal_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY rattend_editor_all ON rehearsal_attendance
  FOR ALL TO authenticated
  USING (is_editor())
  WITH CHECK (is_editor());

CREATE POLICY rattend_viewer_select ON rehearsal_attendance
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'viewer'
  );

CREATE POLICY rattend_production_select ON rehearsal_attendance
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'production'
    AND admin_user_id = auth.uid()
  );

-- Production: INSERT own rows only (manual attendance marking on own
-- dates — belt-and-suspenders alongside the app-layer guard).
CREATE POLICY rattend_production_insert ON rehearsal_attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'production'
    AND admin_user_id = auth.uid()
  );

-- CHANGE 5: feature_rehearsals app_settings seed. Value '' with the
-- `!== 'false'` default-enabled logic in getFeatureFlags() evaluates as
-- enabled (truthy) — consistent with Brief §11.
INSERT INTO app_settings (key, value)
VALUES ('feature_rehearsals', '')
ON CONFLICT (key) DO NOTHING;
