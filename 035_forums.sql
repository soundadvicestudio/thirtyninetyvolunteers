-- 035_forums.sql
-- Phase FORUMS foundation: 12 forum tables (user groups, categories, forums,
-- access grants, moderators, thread prefixes, threads, posts, attachments,
-- subscriptions, read tracking) + feature_forums flag seed.
-- Built FORUMS.1.

-- ── forum_user_groups ───────────────────────────────────────────────────────
CREATE TABLE forum_user_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_by  uuid REFERENCES admin_users(id)
              ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_forum_user_groups_name
  ON forum_user_groups(name);
CREATE INDEX idx_forum_user_groups_sort_order
  ON forum_user_groups(sort_order);
CREATE INDEX idx_forum_user_groups_created_by
  ON forum_user_groups(created_by);
CREATE TRIGGER handle_forum_user_groups_updated_at
  BEFORE UPDATE ON forum_user_groups
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE forum_user_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_user_groups_select_authenticated"
  ON forum_user_groups FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_user_groups_write_sa_oa"
  ON forum_user_groups FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_user_group_members ────────────────────────────────────────────────
CREATE TABLE forum_user_group_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid NOT NULL
                REFERENCES forum_user_groups(id)
                ON DELETE CASCADE,
  admin_user_id uuid NOT NULL
                REFERENCES admin_users(id)
                ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, admin_user_id)
);
CREATE INDEX idx_forum_group_members_group_id
  ON forum_user_group_members(group_id);
CREATE INDEX idx_forum_group_members_user_id
  ON forum_user_group_members(admin_user_id);
ALTER TABLE forum_user_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_group_members_select_authenticated"
  ON forum_user_group_members FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_group_members_write_sa_oa"
  ON forum_user_group_members FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_categories ─────────────────────────────────────────────────────────
CREATE TABLE forum_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES admin_users(id)
             ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_categories_sort_order
  ON forum_categories(sort_order);
CREATE INDEX idx_forum_categories_created_by
  ON forum_categories(created_by);
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_categories_select_authenticated"
  ON forum_categories FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_categories_write_sa_oa"
  ON forum_categories FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forums ───────────────────────────────────────────────────────────────────
CREATE TABLE forums (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL
              REFERENCES forum_categories(id)
              ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES admin_users(id)
              ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forums_category_id
  ON forums(category_id);
CREATE INDEX idx_forums_sort_order
  ON forums(sort_order);
CREATE INDEX idx_forums_created_by
  ON forums(created_by);
CREATE TRIGGER handle_forums_updated_at
  BEFORE UPDATE ON forums
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forums_select_authenticated"
  ON forums FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forums_write_sa_oa"
  ON forums FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_access_grants ──────────────────────────────────────────────────────
CREATE TABLE forum_access_grants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id      uuid NOT NULL
                REFERENCES forums(id) ON DELETE CASCADE,
  grant_type    text NOT NULL
                CHECK (grant_type IN
                  ('role','group','individual')),
  role          text CHECK (role IN (
                  'super_admin','owner_admin','editor',
                  'viewer','production'
                )),
  group_id      uuid REFERENCES forum_user_groups(id)
                ON DELETE CASCADE,
  admin_user_id uuid REFERENCES admin_users(id)
                ON DELETE CASCADE,
  created_by    uuid REFERENCES admin_users(id)
                ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_access_grants_forum_id
  ON forum_access_grants(forum_id);
CREATE INDEX idx_forum_access_grants_group_id
  ON forum_access_grants(group_id);
CREATE INDEX idx_forum_access_grants_admin_user_id
  ON forum_access_grants(admin_user_id);
ALTER TABLE forum_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_access_grants_select_authenticated"
  ON forum_access_grants FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_access_grants_write_sa_oa"
  ON forum_access_grants FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_moderators ─────────────────────────────────────────────────────────
CREATE TABLE forum_moderators (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id      uuid NOT NULL
                REFERENCES forums(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL
                REFERENCES admin_users(id) ON DELETE CASCADE,
  assigned_by   uuid REFERENCES admin_users(id)
                ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (forum_id, admin_user_id)
);
CREATE INDEX idx_forum_moderators_forum_id
  ON forum_moderators(forum_id);
CREATE INDEX idx_forum_moderators_admin_user_id
  ON forum_moderators(admin_user_id);
ALTER TABLE forum_moderators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_moderators_select_authenticated"
  ON forum_moderators FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_moderators_write_sa_oa"
  ON forum_moderators FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_thread_prefixes ────────────────────────────────────────────────────
CREATE TABLE forum_thread_prefixes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id   uuid NOT NULL
             REFERENCES forums(id) ON DELETE CASCADE,
  label      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_thread_prefixes_forum_id
  ON forum_thread_prefixes(forum_id);
ALTER TABLE forum_thread_prefixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_thread_prefixes_select_authenticated"
  ON forum_thread_prefixes FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_thread_prefixes_write_sa_oa"
  ON forum_thread_prefixes FOR ALL TO authenticated
  USING (is_super_admin_or_owner_admin())
  WITH CHECK (is_super_admin_or_owner_admin());

-- ── forum_threads ────────────────────────────────────────────────────────────
CREATE TABLE forum_threads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id   uuid NOT NULL
             REFERENCES forums(id) ON DELETE CASCADE,
  prefix_id  uuid REFERENCES forum_thread_prefixes(id)
             ON DELETE SET NULL,
  title      text NOT NULL,
  created_by uuid NOT NULL
             REFERENCES admin_users(id),
  is_pinned  boolean NOT NULL DEFAULT false,
  is_locked  boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_threads_forum_id
  ON forum_threads(forum_id);
CREATE INDEX idx_forum_threads_created_by
  ON forum_threads(created_by);
CREATE INDEX idx_forum_threads_prefix_id
  ON forum_threads(prefix_id);
-- Compound index for the primary sort query
-- (pinned first, then by last activity):
CREATE INDEX idx_forum_threads_sort
  ON forum_threads(forum_id, is_pinned DESC,
                   updated_at DESC);
CREATE TRIGGER handle_forum_threads_updated_at
  BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_threads_select_authenticated"
  ON forum_threads FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_threads_insert_authenticated"
  ON forum_threads FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "forum_threads_modify_sa_oa"
  ON forum_threads FOR UPDATE TO authenticated
  USING (is_super_admin_or_owner_admin());
CREATE POLICY "forum_threads_delete_sa_oa"
  ON forum_threads FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- ── forum_posts ──────────────────────────────────────────────────────────────
CREATE TABLE forum_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL
             REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL
             REFERENCES admin_users(id),
  body_html  text NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  edited_at  timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_posts_thread_id
  ON forum_posts(thread_id);
CREATE INDEX idx_forum_posts_author_id
  ON forum_posts(author_id);
CREATE TRIGGER handle_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_posts_select_authenticated"
  ON forum_posts FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_posts_insert_authenticated"
  ON forum_posts FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "forum_posts_modify_sa_oa"
  ON forum_posts FOR UPDATE TO authenticated
  USING (is_super_admin_or_owner_admin());
CREATE POLICY "forum_posts_delete_sa_oa"
  ON forum_posts FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- ── forum_post_attachments ───────────────────────────────────────────────────
CREATE TABLE forum_post_attachments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          uuid NOT NULL
                   REFERENCES forum_posts(id)
                   ON DELETE CASCADE,
  storage_path     text NOT NULL,
  filename         text NOT NULL,
  mime_type        text,
  file_size_bytes  bigint,
  uploaded_by      uuid REFERENCES admin_users(id)
                   ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_forum_post_attachments_post_id
  ON forum_post_attachments(post_id);
CREATE INDEX idx_forum_post_attachments_uploaded_by
  ON forum_post_attachments(uploaded_by);
ALTER TABLE forum_post_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_post_attachments_select_authenticated"
  ON forum_post_attachments FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_post_attachments_insert_authenticated"
  ON forum_post_attachments FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "forum_post_attachments_delete_sa_oa"
  ON forum_post_attachments FOR DELETE TO authenticated
  USING (is_super_admin_or_owner_admin());

-- ── forum_thread_subscriptions ───────────────────────────────────────────────
CREATE TABLE forum_thread_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     uuid NOT NULL
                REFERENCES forum_threads(id)
                ON DELETE CASCADE,
  admin_user_id uuid NOT NULL
                REFERENCES admin_users(id)
                ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, admin_user_id)
);
CREATE INDEX idx_forum_thread_subs_thread_id
  ON forum_thread_subscriptions(thread_id);
CREATE INDEX idx_forum_thread_subs_user_id
  ON forum_thread_subscriptions(admin_user_id);
ALTER TABLE forum_thread_subscriptions ENABLE ROW LEVEL SECURITY;
-- Users manage their own subscriptions:
CREATE POLICY "forum_thread_subs_select_authenticated"
  ON forum_thread_subscriptions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "forum_thread_subs_insert_own"
  ON forum_thread_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (admin_user_id = auth.uid());
CREATE POLICY "forum_thread_subs_delete_own"
  ON forum_thread_subscriptions FOR DELETE
  TO authenticated
  USING (admin_user_id = auth.uid());

-- ── forum_post_reads ─────────────────────────────────────────────────────────
CREATE TABLE forum_post_reads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL
                REFERENCES forum_posts(id)
                ON DELETE CASCADE,
  admin_user_id uuid NOT NULL
                REFERENCES admin_users(id)
                ON DELETE CASCADE,
  read_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, admin_user_id)
);
CREATE INDEX idx_forum_post_reads_post_id
  ON forum_post_reads(post_id);
CREATE INDEX idx_forum_post_reads_user_id
  ON forum_post_reads(admin_user_id);
-- Composite index for unread queries per user:
CREATE INDEX idx_forum_post_reads_user_post
  ON forum_post_reads(admin_user_id, post_id);
ALTER TABLE forum_post_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_post_reads_select_authenticated"
  ON forum_post_reads FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "forum_post_reads_insert_own"
  ON forum_post_reads FOR INSERT TO authenticated
  WITH CHECK (admin_user_id = auth.uid());
CREATE POLICY "forum_post_reads_delete_own"
  ON forum_post_reads FOR DELETE TO authenticated
  USING (admin_user_id = auth.uid());

-- ── feature flag seed ────────────────────────────────────────────────────────
INSERT INTO app_settings (key, value)
VALUES ('feature_forums', '')
ON CONFLICT (key) DO NOTHING;
