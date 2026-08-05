-- STEP 1 — ALTER calendar_events event_type CHECK (adds 'audition')

ALTER TABLE calendar_events
DROP CONSTRAINT calendar_events_event_type_check;

ALTER TABLE calendar_events
ADD CONSTRAINT calendar_events_event_type_check
CHECK (event_type = ANY (ARRAY[
  'performance', 'rehearsal', 'teaching', 'meeting',
  'event', 'rental', 'other', 'audition'
]));

-- STEP 2 — CREATE auditions

CREATE TABLE auditions (
  id                      uuid PRIMARY KEY
                          DEFAULT gen_random_uuid(),
  title                   text NOT NULL,
  description             text,
  show_id                 uuid
                          REFERENCES shows(id)
                          ON DELETE SET NULL,
  parent_audition_id      uuid
                          REFERENCES auditions(id)
                          ON DELETE SET NULL,
  location_id             uuid
                          REFERENCES locations(id)
                          ON DELETE SET NULL,
  type                    text NOT NULL DEFAULT 'open_call'
                          CHECK (type IN (
                          'open_call', 'timed_slots')),
  status                  text NOT NULL DEFAULT 'draft'
                          CHECK (status IN (
                          'draft', 'published',
                          'closed', 'archived')),
  date_start              date NOT NULL,
  date_end                date,
  time_start              time without time zone,
  time_end                time without time zone,
  slot_duration_minutes   integer,
  slots_total             integer,
  slot_cap                integer NOT NULL DEFAULT 1,
  role_selection_enabled  boolean NOT NULL DEFAULT false,
  material_headshot       boolean NOT NULL DEFAULT false,
  material_resume         boolean NOT NULL DEFAULT false,
  material_sheet_music    boolean NOT NULL DEFAULT false,
  material_mp3            boolean NOT NULL DEFAULT false,
  material_video          boolean NOT NULL DEFAULT false,
  calendar_visibility     text NOT NULL DEFAULT 'admin_only'
                          CHECK (calendar_visibility IN (
                          'admin_only', 'public')),
  notification_emails_enabled
                          boolean NOT NULL DEFAULT false,
  check_in_token          uuid NOT NULL
                          DEFAULT gen_random_uuid(),
  created_by              uuid
                          REFERENCES admin_users(id)
                          ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_auditions_check_in_token
  ON auditions(check_in_token);
CREATE INDEX idx_auditions_show_id
  ON auditions(show_id);
CREATE INDEX idx_auditions_status
  ON auditions(status);
CREATE INDEX idx_auditions_created_by
  ON auditions(created_by);
CREATE INDEX idx_auditions_date_start
  ON auditions(date_start);

CREATE TRIGGER trg_auditions_updated_at
  BEFORE UPDATE ON auditions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE auditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auditions_anon_select_published"
  ON auditions FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "auditions_auth_select_all"
  ON auditions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auditions_editor_insert"
  ON auditions FOR INSERT TO authenticated
  WITH CHECK (is_editor());

CREATE POLICY "auditions_editor_update"
  ON auditions FOR UPDATE TO authenticated
  USING (is_editor());

CREATE POLICY "auditions_sa_oa_delete"
  ON auditions FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- STEP 3 — CREATE audition_roles

CREATE TABLE audition_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audition_id  uuid NOT NULL
               REFERENCES auditions(id) ON DELETE CASCADE,
  name         text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audition_roles_audition_id
  ON audition_roles(audition_id);

ALTER TABLE audition_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_roles_auth_select"
  ON audition_roles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_roles_editor_insert"
  ON audition_roles FOR INSERT TO authenticated
  WITH CHECK (is_editor());

CREATE POLICY "audition_roles_editor_update"
  ON audition_roles FOR UPDATE TO authenticated
  USING (is_editor());

CREATE POLICY "audition_roles_editor_delete"
  ON audition_roles FOR DELETE TO authenticated
  USING (is_editor());

-- STEP 4 — CREATE audition_slots

CREATE TABLE audition_slots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audition_id  uuid NOT NULL
               REFERENCES auditions(id) ON DELETE CASCADE,
  start_time   timestamptz NOT NULL,
  cap          integer NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audition_slots_audition_id
  ON audition_slots(audition_id);

ALTER TABLE audition_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_slots_anon_select"
  ON audition_slots FOR SELECT TO anon
  USING (true);

CREATE POLICY "audition_slots_auth_select"
  ON audition_slots FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_slots_editor_insert"
  ON audition_slots FOR INSERT TO authenticated
  WITH CHECK (is_editor());

CREATE POLICY "audition_slots_editor_update"
  ON audition_slots FOR UPDATE TO authenticated
  USING (is_editor());

CREATE POLICY "audition_slots_editor_delete"
  ON audition_slots FOR DELETE TO authenticated
  USING (is_editor());

-- STEP 5 — CREATE audition_signups

CREATE TABLE audition_signups (
  id                uuid PRIMARY KEY
                    DEFAULT gen_random_uuid(),
  audition_id       uuid NOT NULL
                    REFERENCES auditions(id)
                    ON DELETE CASCADE,
  slot_id           uuid
                    REFERENCES audition_slots(id)
                    ON DELETE SET NULL,
  audition_role_id  uuid
                    REFERENCES audition_roles(id)
                    ON DELETE SET NULL,
  name              text NOT NULL,
  email             text NOT NULL,
  phone             text,
  is_minor          boolean NOT NULL DEFAULT false,
  guardian_name     text,
  guardian_phone    text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                    'pending', 'callback', 'cast',
                    'not_cast', 'withdrawn')),
  cast_role         text,
  cancel_token      uuid NOT NULL
                    DEFAULT gen_random_uuid(),
  upload_token      uuid NOT NULL
                    DEFAULT gen_random_uuid(),
  checked_in_at     timestamptz,
  check_in_source   text
                    CHECK (check_in_source IN (
                    'checkin', 'manual')),
  signed_up_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_audition_signups_cancel_token
  ON audition_signups(cancel_token);
CREATE UNIQUE INDEX idx_audition_signups_upload_token
  ON audition_signups(upload_token);
CREATE INDEX idx_audition_signups_audition_id
  ON audition_signups(audition_id);
CREATE INDEX idx_audition_signups_slot_id
  ON audition_signups(slot_id);
CREATE INDEX idx_audition_signups_status
  ON audition_signups(status);
CREATE INDEX idx_audition_signups_email
  ON audition_signups(lower(email));

ALTER TABLE audition_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_signups_anon_insert"
  ON audition_signups FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "audition_signups_anon_select"
  ON audition_signups FOR SELECT TO anon
  USING (true);

CREATE POLICY "audition_signups_auth_select"
  ON audition_signups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_signups_editor_update"
  ON audition_signups FOR UPDATE TO authenticated
  USING (is_editor());

CREATE POLICY "audition_signups_sa_oa_delete"
  ON audition_signups FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- STEP 6 — ALTER consent_form_submissions (adds audition_signup_id)

ALTER TABLE consent_form_submissions
ADD COLUMN audition_signup_id uuid
REFERENCES audition_signups(id) ON DELETE SET NULL;

CREATE INDEX idx_consent_submissions_audition_signup
  ON consent_form_submissions(audition_signup_id)
  WHERE audition_signup_id IS NOT NULL;

-- STEP 7 — CREATE audition_signup_notes

CREATE TABLE audition_signup_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id   uuid NOT NULL
              REFERENCES audition_signups(id)
              ON DELETE CASCADE,
  content     text NOT NULL,
  created_by  uuid
              REFERENCES admin_users(id)
              ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audition_signup_notes_signup_id
  ON audition_signup_notes(signup_id);

ALTER TABLE audition_signup_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_signup_notes_auth_select"
  ON audition_signup_notes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_signup_notes_editor_insert"
  ON audition_signup_notes FOR INSERT TO authenticated
  WITH CHECK (is_editor());

-- STEP 8 — CREATE audition_materials

CREATE TABLE audition_materials (
  id                uuid PRIMARY KEY
                    DEFAULT gen_random_uuid(),
  signup_id         uuid NOT NULL
                    REFERENCES audition_signups(id)
                    ON DELETE CASCADE,
  material_type     text NOT NULL
                    CHECK (material_type IN (
                    'headshot', 'resume', 'sheet_music',
                    'mp3', 'video')),
  storage_path      text NOT NULL,
  original_filename text,
  uploaded_at       timestamptz NOT NULL DEFAULT now()
);

-- NOTE: original_filename is an intentional addition beyond the Brief's
-- §9 schema block. Needed to display meaningful filenames in the admin
-- Materials tab and the late-upload confirmation UI. Logged as a
-- deliberate enhancement in the AUDITIONS.1a build report.

CREATE INDEX idx_audition_materials_signup_id
  ON audition_materials(signup_id);

ALTER TABLE audition_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_materials_anon_insert"
  ON audition_materials FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "audition_materials_auth_select"
  ON audition_materials FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_materials_sa_oa_delete"
  ON audition_materials FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- STEP 9 — CREATE audition_assignments

CREATE TABLE audition_assignments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audition_id    uuid NOT NULL
                 REFERENCES auditions(id) ON DELETE CASCADE,
  admin_user_id  uuid NOT NULL
                 REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_audition_assignments_unique
  ON audition_assignments(audition_id, admin_user_id);
CREATE INDEX idx_audition_assignments_admin_user_id
  ON audition_assignments(admin_user_id);

ALTER TABLE audition_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_assignments_auth_select"
  ON audition_assignments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_assignments_editor_insert"
  ON audition_assignments FOR INSERT TO authenticated
  WITH CHECK (is_editor());

CREATE POLICY "audition_assignments_editor_delete"
  ON audition_assignments FOR DELETE TO authenticated
  USING (is_editor());

-- STEP 10 — CREATE audition_email_templates

CREATE TABLE audition_email_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audition_id  uuid NOT NULL
               REFERENCES auditions(id) ON DELETE CASCADE,
  status_type  text NOT NULL
               CHECK (status_type IN (
               'callback', 'cast', 'not_cast')),
  subject      text NOT NULL DEFAULT '',
  body_html    text NOT NULL DEFAULT '',
  updated_by   uuid
               REFERENCES admin_users(id)
               ON DELETE SET NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_audition_email_templates_unique
  ON audition_email_templates(audition_id, status_type);

CREATE TRIGGER trg_audition_email_templates_updated_at
  BEFORE UPDATE ON audition_email_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE audition_email_templates
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audition_email_templates_auth_select"
  ON audition_email_templates FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audition_email_templates_editor_insert"
  ON audition_email_templates FOR INSERT TO authenticated
  WITH CHECK (is_editor());

CREATE POLICY "audition_email_templates_editor_update"
  ON audition_email_templates FOR UPDATE TO authenticated
  USING (is_editor());

CREATE POLICY "audition_email_templates_sa_oa_delete"
  ON audition_email_templates FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- STEP 11 — Seed feature_auditions in app_settings

INSERT INTO app_settings (key, value)
VALUES ('feature_auditions', '')
ON CONFLICT (key) DO NOTHING;
