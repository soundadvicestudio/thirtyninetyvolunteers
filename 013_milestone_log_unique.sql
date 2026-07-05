-- Migration 013: milestone_log UNIQUE constraint (30BN-9.2)
-- Prevents duplicate milestone entries for the same volunteer at the same
-- threshold. checkMilestones()/checkFirstCall() guard against this in code,
-- but a DB constraint is the reliable backstop against race conditions.

ALTER TABLE milestone_log
ADD CONSTRAINT milestone_log_volunteer_threshold_unique
UNIQUE (volunteer_id, milestone_hours);
