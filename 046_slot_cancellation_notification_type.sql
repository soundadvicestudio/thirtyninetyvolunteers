-- 046_slot_cancellation_notification_type.sql (ADMIN.64)
-- Adds 'slot_cancellation' to the notifications.type CHECK constraint,
-- following the exact same pattern used to add 'direct_message' in
-- Migration 037 (DROP CONSTRAINT / ADD CONSTRAINT with the new value
-- appended to the array).

ALTER TABLE notifications
  DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'audition_signup',
    'audition_material',
    'calendar_approved',
    'calendar_changed',
    'calendar_cancelled',
    'forum_reply',
    'direct_message',
    'slot_cancellation'
  ]::text[]));
