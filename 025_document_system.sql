-- 025_document_system.sql
-- 30BN-15.1: Document & Media System foundation

-- STEP 1 -- Drop old documents table (confirmed 0 rows live before this
-- migration; CASCADE removes idx_documents_type_active and dependents).
DROP TABLE IF EXISTS documents CASCADE;

-- STEP 2 -- document_types
CREATE TABLE document_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  is_system   boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_document_types_slug ON document_types (slug);
CREATE INDEX idx_document_types_sort_order ON document_types (sort_order);
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_types_select ON document_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY document_types_write ON document_types
  FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

INSERT INTO document_types (name, slug, description, is_system, sort_order)
VALUES
  ('Volunteer Consent Form', 'volunteer_consent_form',
   'Consent form required for volunteers under 18.', true, 1),
  ('Cast / Auditioner Consent Form', 'cast_consent_form',
   'Consent form required for auditioners under 18. Used with the Auditions system.', true, 2),
  ('Volunteer Handbook', 'volunteer_handbook',
   'General guidelines and information for volunteers.', false, 3),
  ('Production Schedule', 'production_schedule',
   'Show-specific schedules and call sheets.', false, 4),
  ('Audition Materials', 'audition_materials',
   'Scripts, sides, and supporting materials for auditions.', false, 5);

-- STEP 3 -- media_folders
CREATE TABLE media_folders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  parent_id   uuid REFERENCES media_folders(id) ON DELETE SET NULL,
  created_by  uuid REFERENCES admin_users(id),
  visibility  text NOT NULL DEFAULT 'backend'
              CHECK (visibility IN ('public', 'link_only', 'backend', 'restricted')),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_folders_parent_id ON media_folders (parent_id);
CREATE INDEX idx_media_folders_created_by ON media_folders (created_by);
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_folders_select ON media_folders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY media_folders_insert ON media_folders
  FOR INSERT TO authenticated WITH CHECK (is_editor());
CREATE POLICY media_folders_update ON media_folders
  FOR UPDATE TO authenticated USING (is_editor()) WITH CHECK (is_editor());
CREATE POLICY media_folders_delete ON media_folders
  FOR DELETE TO authenticated USING (is_super_admin_or_owner_admin());

CREATE TRIGGER trg_media_folders_updated_at
  BEFORE UPDATE ON media_folders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- STEP 4 -- media_folder_access
CREATE TABLE media_folder_access (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id     uuid NOT NULL REFERENCES media_folders(id) ON DELETE CASCADE,
  access_type   text NOT NULL CHECK (access_type IN ('role', 'user')),
  role          text,
  admin_user_id uuid REFERENCES admin_users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_folder_access_folder_id ON media_folder_access (folder_id);
CREATE INDEX idx_media_folder_access_admin_user_id ON media_folder_access (admin_user_id);
ALTER TABLE media_folder_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY folder_access_select ON media_folder_access
  FOR SELECT TO authenticated USING (true);
CREATE POLICY folder_access_write ON media_folder_access
  FOR ALL TO authenticated USING (is_editor()) WITH CHECK (is_editor());

-- STEP 5 -- documents (new schema)
CREATE TABLE documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token      uuid NOT NULL DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  description       text,
  document_type_id  uuid REFERENCES document_types(id) ON DELETE SET NULL,
  folder_id         uuid REFERENCES media_folders(id) ON DELETE SET NULL,
  entry_type        text NOT NULL CHECK (entry_type IN ('file', 'link')),
  storage_path      text,
  external_url      text,
  mime_type         text,
  file_size         bigint,
  original_filename text,
  access_tier       text NOT NULL DEFAULT 'backend'
                    CHECK (access_tier IN ('public', 'link_only', 'backend')),
  is_active         boolean NOT NULL DEFAULT true,
  is_type_active    boolean NOT NULL DEFAULT false,
  attached_to_type  text CHECK (attached_to_type IN ('show', 'rehearsal_batch', 'audition')),
  attached_to_id    uuid,
  uploaded_by       uuid REFERENCES admin_users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_documents_access_token ON documents (access_token);
CREATE INDEX idx_documents_document_type_id ON documents (document_type_id);
CREATE INDEX idx_documents_folder_id ON documents (folder_id);
CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_attached_to ON documents (attached_to_type, attached_to_id);
CREATE INDEX idx_documents_is_type_active ON documents (is_type_active) WHERE is_type_active = true;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select ON documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY documents_insert ON documents
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY documents_update ON documents
  FOR UPDATE TO authenticated USING (is_editor()) WITH CHECK (is_editor());
CREATE POLICY documents_delete ON documents
  FOR DELETE TO authenticated USING (is_super_admin_or_owner_admin());

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- STEP 6 -- document_access
CREATE TABLE document_access (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  access_type   text NOT NULL CHECK (access_type IN ('role', 'user')),
  role          text,
  admin_user_id uuid REFERENCES admin_users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_document_access_document_id ON document_access (document_id);
CREATE INDEX idx_document_access_admin_user_id ON document_access (admin_user_id);
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY doc_access_select ON document_access
  FOR SELECT TO authenticated USING (true);
CREATE POLICY doc_access_write ON document_access
  FOR ALL TO authenticated USING (is_editor()) WITH CHECK (is_editor());

-- STEP 7 -- consent_form_submissions
CREATE TABLE consent_form_submissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_token        uuid NOT NULL DEFAULT gen_random_uuid(),
  volunteer_id        uuid REFERENCES volunteers(id) ON DELETE CASCADE,
  document_type_id    uuid NOT NULL REFERENCES document_types(id),
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_file_path text,
  submitted_at        timestamptz,
  reviewed_by         uuid REFERENCES admin_users(id),
  reviewed_at         timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_consent_submissions_token ON consent_form_submissions (upload_token);
CREATE INDEX idx_consent_submissions_volunteer_id ON consent_form_submissions (volunteer_id);
CREATE INDEX idx_consent_submissions_status ON consent_form_submissions (status);
CREATE INDEX idx_consent_submissions_doc_type ON consent_form_submissions (document_type_id);
ALTER TABLE consent_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY consent_sub_admin ON consent_form_submissions
  FOR ALL TO authenticated USING (true);
CREATE POLICY consent_sub_anon_select ON consent_form_submissions
  FOR SELECT TO anon USING (status = 'pending');
