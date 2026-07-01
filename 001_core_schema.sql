-- =====================================================================
-- 30 By Ninety Theatre — Volunteer Platform
-- Migration 001: Core Schema
-- Project: thirtyninetyvolunteers
-- =====================================================================

-- =====================================================================
-- SECTION A — is_admin() HELPER FUNCTION
-- =====================================================================
-- NOTE (deviation from Brief §Section A literal ordering): LANGUAGE sql
-- functions are validated against the catalog at CREATE FUNCTION time
-- (unlike plpgsql), so this cannot be created before admin_users exists.
-- Moved to immediately before Section E (RLS policies) — the only actual
-- dependency is that it exists before policies reference it. Definition
-- is unchanged from the Brief; only its position in this file moved.
-- See Build Report Flags for 30BN-1.1.

-- =====================================================================
-- SECTION B — TABLES (dependency order)
-- =====================================================================

-- ---------- Tier 0 (no dependencies) ----------

CREATE TABLE public.admin_users (
  id               uuid PRIMARY KEY,
  name             text NOT NULL,
  email            text NOT NULL UNIQUE,
  role             text NOT NULL CHECK (role IN ('super_admin','editor','viewer')),
  is_active        boolean NOT NULL DEFAULT true,
  last_login       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);

CREATE TABLE public.volunteers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text NOT NULL,
  pronouns         text,
  school           text,
  age_range        text CHECK (age_range IN ('under_18','18_25','26_35','36_50','51_plus','prefer_not')),
  is_minor         boolean NOT NULL DEFAULT false,
  guardian_name    text,
  guardian_phone   text,
  referral_source  text,
  referral_name    text,
  update_token     uuid NOT NULL DEFAULT gen_random_uuid(),
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  total_hours      numeric(6,2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_volunteers_email UNIQUE (email),
  CONSTRAINT uq_volunteers_phone UNIQUE (phone)
);

CREATE TABLE public.volunteer_categories (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  sort_order       integer NOT NULL DEFAULT 0,
  is_visible       boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.seasons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  start_date       date,
  end_date         date,
  is_current       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.hearing_options (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label            text NOT NULL,
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true
);

-- ---------- Tier 1 (depend only on Tier 0) ----------

CREATE TABLE public.volunteer_category_assignments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  category_id      uuid NOT NULL REFERENCES public.volunteer_categories(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_vca_volunteer_category UNIQUE (volunteer_id, category_id)
);
CREATE INDEX idx_vca_volunteer_id ON public.volunteer_category_assignments(volunteer_id);
CREATE INDEX idx_vca_category_id ON public.volunteer_category_assignments(category_id);

CREATE TABLE public.volunteer_notes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES public.admin_users(id),
  body             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_vnotes_volunteer_id ON public.volunteer_notes(volunteer_id);
CREATE INDEX idx_vnotes_author_id ON public.volunteer_notes(author_id);

CREATE TABLE public.shows (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id        uuid REFERENCES public.seasons(id),
  name             text NOT NULL,
  show_type        text NOT NULL CHECK (show_type IN ('mainstage','studio_x','one_off')),
  description      text,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','past','archived')),
  volunteer_instructions text,
  check_in_token   uuid DEFAULT gen_random_uuid(),
  default_hours    numeric(4,2),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_shows_season_id ON public.shows(season_id);
CREATE INDEX idx_shows_status ON public.shows(status);

CREATE TABLE public.forms (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','closed')),
  created_by       uuid REFERENCES public.admin_users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  qr_token         uuid NOT NULL DEFAULT gen_random_uuid()
);
CREATE INDEX idx_forms_created_by ON public.forms(created_by);

CREATE TABLE public.volunteer_hours_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  hours            numeric(4,2) NOT NULL,
  source_type      text NOT NULL CHECK (source_type IN ('attendance','manual')),
  source_id        uuid,
  note             text,
  added_by         uuid REFERENCES public.admin_users(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hours_log_volunteer_id ON public.volunteer_hours_log(volunteer_id);
CREATE INDEX idx_hours_log_added_by ON public.volunteer_hours_log(added_by);

CREATE TABLE public.milestone_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  milestone_hours  numeric(6,2) NOT NULL,
  milestone_label  text NOT NULL,
  triggered_at     timestamptz NOT NULL DEFAULT now(),
  email_sent       boolean NOT NULL DEFAULT false,
  editor_notified  boolean NOT NULL DEFAULT false,
  editor_acknowledged boolean NOT NULL DEFAULT false
);
CREATE INDEX idx_milestone_log_volunteer_id ON public.milestone_log(volunteer_id);

CREATE TABLE public.email_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by          uuid REFERENCES public.admin_users(id),
  sent_at          timestamptz NOT NULL DEFAULT now(),
  subject          text NOT NULL,
  body_preview     text,
  recipient_type   text NOT NULL CHECK (recipient_type IN ('all','category','individual','transactional')),
  recipient_filter text,
  reply_to         text,
  recipient_count  integer NOT NULL DEFAULT 0
);
CREATE INDEX idx_email_log_sent_by ON public.email_log(sent_by);

CREATE TABLE public.audit_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id         uuid REFERENCES public.admin_users(id),
  action           text NOT NULL,
  target_type      text NOT NULL,
  target_id        text,
  before_value     jsonb,
  after_value      jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX idx_audit_log_target_type ON public.audit_log(target_type);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

CREATE TABLE public.documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  document_type    text NOT NULL CHECK (document_type IN ('consent_under18','general')),
  file_path        text NOT NULL,
  is_active        boolean NOT NULL DEFAULT false,
  uploaded_by      uuid REFERENCES public.admin_users(id),
  uploaded_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_type_active ON public.documents(document_type, is_active);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);

CREATE TABLE public.app_settings (
  key              text PRIMARY KEY,
  value            text,
  updated_by       uuid REFERENCES public.admin_users(id),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_app_settings_updated_by ON public.app_settings(updated_by);

-- ---------- Tier 2 (depend on Tier 1) ----------

CREATE TABLE public.show_dates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id          uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  show_date        date NOT NULL,
  show_time        time NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_show_dates_show_id ON public.show_dates(show_id);

CREATE TABLE public.volunteer_roles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id          uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  category_id      uuid REFERENCES public.volunteer_categories(id),
  role_name        text NOT NULL,
  slots_available  integer NOT NULL DEFAULT 1,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_volunteer_roles_show_id ON public.volunteer_roles(show_id);
CREATE INDEX idx_volunteer_roles_category_id ON public.volunteer_roles(category_id);

CREATE TABLE public.show_editors (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id          uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  admin_id         uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_show_editors_show_admin UNIQUE (show_id, admin_id)
);
CREATE INDEX idx_show_editors_show_id ON public.show_editors(show_id);
CREATE INDEX idx_show_editors_admin_id ON public.show_editors(admin_id);

CREATE TABLE public.form_fields (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id          uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_type       text NOT NULL CHECK (field_type IN ('text','textarea','dropdown','checkbox','radio','date','rating','number')),
  label            text NOT NULL,
  placeholder      text,
  options          jsonb,
  is_required      boolean NOT NULL DEFAULT false,
  sort_order       integer NOT NULL DEFAULT 0
);
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);

CREATE TABLE public.form_responses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id          uuid NOT NULL REFERENCES public.forms(id),
  volunteer_id     uuid REFERENCES public.volunteers(id),
  submitted_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX idx_form_responses_volunteer_id ON public.form_responses(volunteer_id);

CREATE TABLE public.email_log_recipients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id     uuid NOT NULL REFERENCES public.email_log(id) ON DELETE CASCADE,
  volunteer_id     uuid REFERENCES public.volunteers(id),
  email_address    text NOT NULL
);
CREATE INDEX idx_email_log_recipients_log_id ON public.email_log_recipients(email_log_id);
CREATE INDEX idx_email_log_recipients_volunteer_id ON public.email_log_recipients(volunteer_id);

-- ---------- Tier 3 (depend on Tier 2) ----------

CREATE TABLE public.slot_claims (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_role_id uuid NOT NULL REFERENCES public.volunteer_roles(id) ON DELETE CASCADE,
  show_date_id     uuid NOT NULL REFERENCES public.show_dates(id) ON DELETE CASCADE,
  volunteer_id     uuid REFERENCES public.volunteers(id),
  volunteer_name   text NOT NULL,
  volunteer_email  text NOT NULL,
  volunteer_phone  text,
  claim_token      uuid NOT NULL DEFAULT gen_random_uuid(),
  status           text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','cancelled','waitlisted')),
  waitlist_position integer,
  claimed_at       timestamptz NOT NULL DEFAULT now(),
  cancelled_at     timestamptz
);
CREATE INDEX idx_slot_claims_role_id ON public.slot_claims(volunteer_role_id);
CREATE INDEX idx_slot_claims_volunteer_id ON public.slot_claims(volunteer_id);
CREATE INDEX idx_slot_claims_show_date_id ON public.slot_claims(show_date_id);

CREATE TABLE public.form_response_values (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id      uuid NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
  field_id         uuid NOT NULL REFERENCES public.form_fields(id),
  value            text
);
CREATE INDEX idx_frv_response_id ON public.form_response_values(response_id);
CREATE INDEX idx_frv_field_id ON public.form_response_values(field_id);

-- ---------- Tier 4 (depends on Tier 3) ----------

CREATE TABLE public.attendance (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_claim_id    uuid NOT NULL REFERENCES public.slot_claims(id),
  volunteer_id     uuid REFERENCES public.volunteers(id),
  show_id          uuid NOT NULL REFERENCES public.shows(id),
  show_date_id     uuid NOT NULL REFERENCES public.show_dates(id),
  status           text NOT NULL CHECK (status IN ('showed','no_show','excused')),
  hours_logged     numeric(4,2) NOT NULL DEFAULT 0,
  source           text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','checkin')),
  marked_by        uuid REFERENCES public.admin_users(id),
  marked_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attendance_volunteer_id ON public.attendance(volunteer_id);
CREATE INDEX idx_attendance_show_id ON public.attendance(show_id);
CREATE INDEX idx_attendance_slot_claim_id ON public.attendance(slot_claim_id);
CREATE INDEX idx_attendance_show_date_id ON public.attendance(show_date_id);
CREATE INDEX idx_attendance_marked_by ON public.attendance(marked_by);

-- =====================================================================
-- SECTION C — TRIGGER FUNCTION + TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_shows_updated_at
  BEFORE UPDATE ON public.shows
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =====================================================================
-- SECTION D — ENABLE ROW LEVEL SECURITY
-- =====================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_hours_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_response_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION A (cont.) — is_admin() HELPER FUNCTION
-- (created here, not at top of file — see note above Section A header)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

-- =====================================================================
-- SECTION E — RLS POLICIES
-- =====================================================================

-- volunteers
CREATE POLICY "anon_insert" ON public.volunteers
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_all_admin" ON public.volunteers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- volunteer_categories
CREATE POLICY "anon_select" ON public.volunteer_categories
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.volunteer_categories
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- volunteer_category_assignments
CREATE POLICY "authenticated_all_admin" ON public.volunteer_category_assignments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- volunteer_notes (NO anon policies)
CREATE POLICY "authenticated_all_admin" ON public.volunteer_notes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- seasons
CREATE POLICY "anon_select" ON public.seasons
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.seasons
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- shows
CREATE POLICY "anon_select" ON public.shows
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.shows
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- show_dates
CREATE POLICY "anon_select" ON public.show_dates
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.show_dates
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- volunteer_roles
CREATE POLICY "anon_select" ON public.volunteer_roles
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.volunteer_roles
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- slot_claims
CREATE POLICY "anon_insert" ON public.slot_claims
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_all_admin" ON public.slot_claims
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- attendance
CREATE POLICY "authenticated_all_admin" ON public.attendance
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- show_editors
CREATE POLICY "authenticated_all_admin" ON public.show_editors
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- admin_users
CREATE POLICY "authenticated_select_own" ON public.admin_users
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "authenticated_all_admin" ON public.admin_users
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- forms
CREATE POLICY "anon_select" ON public.forms
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.forms
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- form_fields
CREATE POLICY "anon_select" ON public.form_fields
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.form_fields
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- form_responses
CREATE POLICY "anon_insert" ON public.form_responses
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_all_admin" ON public.form_responses
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- form_response_values
CREATE POLICY "anon_insert" ON public.form_response_values
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_all_admin" ON public.form_response_values
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- volunteer_hours_log
CREATE POLICY "authenticated_all_admin" ON public.volunteer_hours_log
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- milestone_log
CREATE POLICY "authenticated_all_admin" ON public.milestone_log
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- email_log
CREATE POLICY "authenticated_all_admin" ON public.email_log
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- email_log_recipients
CREATE POLICY "authenticated_all_admin" ON public.email_log_recipients
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- audit_log (SELECT only for admins; no INSERT/UPDATE/DELETE for any role)
CREATE POLICY "authenticated_select_admin" ON public.audit_log
  FOR SELECT TO authenticated USING (is_admin());

-- documents
CREATE POLICY "anon_select" ON public.documents
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.documents
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- app_settings
CREATE POLICY "anon_select" ON public.app_settings
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.app_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- hearing_options
CREATE POLICY "anon_select" ON public.hearing_options
  FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_admin" ON public.hearing_options
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- =====================================================================
-- SECTION F — SEED DATA
-- =====================================================================

-- 1. volunteer_categories
INSERT INTO public.volunteer_categories (name, sort_order, is_visible) VALUES
  ('Ushers/Front of House', 1, true),
  ('Band Members', 2, true),
  ('Concessions', 3, true),
  ('Backstage Crew', 4, true),
  ('Wardrobe/Costumes', 5, true),
  ('Hair/Make-Up', 6, true),
  ('Lighting Design', 7, true),
  ('Lighting Operator', 8, true),
  ('Sound Design', 9, true),
  ('Sound Operator', 10, true),
  ('Set Build', 11, true),
  ('Set Design', 12, true),
  ('Stage Manager', 13, true),
  ('Tech', 14, true),
  ('Cleaning/Organization', 15, true);

-- 2. hearing_options
INSERT INTO public.hearing_options (label, sort_order, is_active) VALUES
  ('Social Media (Instagram/Facebook/TikTok)', 1, true),
  ('Word of Mouth', 2, true),
  ('Program/QR Code', 3, true),
  ('Our Website', 4, true),
  ('Previous Patron/Audience Member', 5, true),
  ('Another Volunteer', 6, true),
  ('Other', 7, true);

-- 3. app_settings
INSERT INTO public.app_settings (key, value, updated_by) VALUES
  ('announcement_banner_active', 'false', NULL),
  ('announcement_banner_text', '', NULL),
  ('signup_show_school', 'true', NULL),
  ('signup_show_age_range', 'true', NULL),
  ('default_reply_to', 'info@30byninety.com', NULL),
  ('default_hours_mainstage', '3', NULL),
  ('default_hours_studio_x', '2', NULL),
  ('default_hours_one_off', '2', NULL);
