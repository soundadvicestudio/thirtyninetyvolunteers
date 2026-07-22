-- 021_admin_calendar_token.sql
-- CAL.7: adds a per-admin subscription token for the iCalendar feed route
-- (/api/calendar/feed.ics?token=). Every existing admin gets a unique
-- token immediately via the DEFAULT; new admins get one automatically.

ALTER TABLE admin_users
ADD COLUMN calendar_subscription_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_admin_users_calendar_token
  ON admin_users(calendar_subscription_token);
