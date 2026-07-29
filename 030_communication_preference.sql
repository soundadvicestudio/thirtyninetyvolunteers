-- Migration 030: communication_preference on volunteers
-- Adds an optional advisory-only contact preference column.
-- Values: 'email' | 'phone' | 'either' | NULL
-- NULL = no preference recorded. Advisory only — no system
-- enforcement. Phase 19.

ALTER TABLE volunteers
ADD COLUMN communication_preference text
CHECK (communication_preference IN ('email', 'phone', 'either'));
