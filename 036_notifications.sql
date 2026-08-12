-- Migration 036: notifications table
-- Persistent per-admin-user in-app notifications (audition signups/materials,
-- calendar approve/change/cancel, forum replies). No INSERT policy — writes
-- go through getAdminClient() (service role bypasses RLS), same as
-- audit_log. No DELETE policy — notifications are soft-read via read_at,
-- never hard-deleted.

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'audition_signup', 'audition_material',
    'calendar_approved', 'calendar_changed',
    'calendar_cancelled', 'forum_reply'
  )),
  title text NOT NULL,
  body text,
  href text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_admin_user_id ON notifications (admin_user_id);
CREATE INDEX idx_notifications_unread ON notifications (admin_user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT TO authenticated
  USING (admin_user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());
