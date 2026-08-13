-- Migration 037: private messaging tables
-- Two-participant threaded private messages between admin_users (Super
-- Admin, Owner Admin, Editor, Viewer, Production). message_threads is the
-- conversation shell (one row per creator/recipient pair + subject);
-- thread_replies holds the messages; thread_reads tracks per-participant
-- read state for unread counts and read receipts; thread_reply_attachments
-- holds P-DC file uploads on individual replies.
--
-- RLS policy naming, TO authenticated clause, and index naming convention
-- (idx_<table>_<column>) follow 036_notifications.sql — the immediate
-- predecessor migration and confirmed live-schema template (MESSAGES.1
-- Task A).

-- ──────────────────────────────────────────
-- SECTION 1 — message_threads
-- ──────────────────────────────────────────

CREATE TABLE message_threads (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id            uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  recipient_id          uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  subject               varchar(150) NOT NULL,
  created_at            timestamptz DEFAULT now() NOT NULL,
  last_reply_at         timestamptz DEFAULT now() NOT NULL,
  creator_archived_at   timestamptz,
  recipient_archived_at timestamptz
);

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- SELECT: both participants can read their shared threads
CREATE POLICY message_threads_select_participant ON message_threads
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

-- INSERT: only the creator can insert; creator_id must be their own UID
CREATE POLICY message_threads_insert_own ON message_threads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- UPDATE: both participants can update (archive flags + last_reply_at).
-- Column-level restriction (subject, creator_id, recipient_id immutable)
-- is enforced at the application layer, not via RLS.
CREATE POLICY message_threads_update_participant ON message_threads
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = recipient_id);

CREATE INDEX idx_message_threads_creator_id
  ON message_threads (creator_id);

CREATE INDEX idx_message_threads_recipient_id
  ON message_threads (recipient_id);

-- DESC index for inbox sort (most recent first)
CREATE INDEX idx_message_threads_last_reply_at
  ON message_threads (last_reply_at DESC);

-- ──────────────────────────────────────────
-- SECTION 2 — thread_replies
-- ──────────────────────────────────────────

CREATE TABLE thread_replies (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id  uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;

-- SELECT: participant check via EXISTS on message_threads
CREATE POLICY thread_replies_select_participant ON thread_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
        AND (creator_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- INSERT: sender must be themselves AND a participant in the thread.
-- Both conditions required — participant check prevents unauthorized
-- reply injection by non-participants who know a thread_id.
CREATE POLICY thread_replies_insert_own ON thread_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
        AND (creator_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- No UPDATE policy — replies are immutable once sent.
-- No DELETE policy — thread archive is the user-controlled removal path.

-- Composite index: primary read pattern (all replies for a thread, ordered)
CREATE INDEX idx_thread_replies_thread_id_created_at
  ON thread_replies (thread_id, created_at);

CREATE INDEX idx_thread_replies_sender_id
  ON thread_replies (sender_id);

-- ──────────────────────────────────────────
-- SECTION 3 — thread_reads
-- ──────────────────────────────────────────

CREATE TABLE thread_reads (
  thread_id    uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (thread_id, user_id)
);

ALTER TABLE thread_reads ENABLE ROW LEVEL SECURITY;

-- SELECT: BOTH participants can read ALL read records for their shared thread.
-- INTENTIONAL ASYMMETRY — do not "fix" this to self-only.
-- Required for read receipts: each participant must see the other's
-- last_read_at to display "Read [time]" in the thread view.
CREATE POLICY thread_reads_select_participant ON thread_reads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
        AND (creator_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- INSERT: users may only insert their own read record
CREATE POLICY thread_reads_insert_own ON thread_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users may only update their own read record.
-- Both INSERT and UPDATE policies are required: markThreadRead() uses
-- upsert (INSERT ... ON CONFLICT DO UPDATE), which evaluates both paths.
CREATE POLICY thread_reads_update_own ON thread_reads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Additional index on user_id: unread count query joins thread_reads by
-- user_id without a known thread_id, so the composite PK leading on
-- thread_id cannot serve this lookup efficiently.
CREATE INDEX idx_thread_reads_user_id
  ON thread_reads (user_id);

-- ──────────────────────────────────────────
-- SECTION 4 — thread_reply_attachments
-- ──────────────────────────────────────────

CREATE TABLE thread_reply_attachments (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id     uuid NOT NULL REFERENCES thread_replies(id) ON DELETE CASCADE,
  file_path    text NOT NULL,
  file_name    text NOT NULL,
  file_size    integer NOT NULL,
  content_type text NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE thread_reply_attachments ENABLE ROW LEVEL SECURITY;

-- SELECT: two-level EXISTS — attachment -> reply -> thread -> participant check
CREATE POLICY thread_reply_attachments_select_participant ON thread_reply_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM thread_replies tr
      JOIN message_threads mt ON mt.id = tr.thread_id
      WHERE tr.id = reply_id
        AND (mt.creator_id = auth.uid() OR mt.recipient_id = auth.uid())
    )
  );

-- INSERT: only the reply's sender may attach files to it
CREATE POLICY thread_reply_attachments_insert_own ON thread_reply_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM thread_replies
      WHERE id = reply_id AND sender_id = auth.uid()
    )
  );

CREATE INDEX idx_thread_reply_attachments_reply_id
  ON thread_reply_attachments (reply_id);

-- ──────────────────────────────────────────
-- SECTION 5 — ALTER notifications CHECK constraint
-- ──────────────────────────────────────────

-- Add direct_message to the notifications type allowlist.
-- Constraint name and existing six values copied verbatim from the live
-- information_schema.check_constraints query run in MESSAGES.1 Task A
-- (matches MESSAGES.A Finding 10 exactly — no drift).

ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'audition_signup'::text,
    'audition_material'::text,
    'calendar_approved'::text,
    'calendar_changed'::text,
    'calendar_cancelled'::text,
    'forum_reply'::text,
    'direct_message'::text
  ]));

-- ──────────────────────────────────────────
-- SECTION 6 — feature_messages seed
-- ──────────────────────────────────────────

-- Defaults to 'false' — Private Messaging is opt-in.
-- ON CONFLICT DO NOTHING: safe to re-run; will not overwrite if already set.
INSERT INTO app_settings (key, value)
VALUES ('feature_messages', 'false')
ON CONFLICT (key) DO NOTHING;
