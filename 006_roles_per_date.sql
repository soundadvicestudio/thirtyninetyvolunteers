-- Migration 006: Roles-Per-Date Schema Fix
-- Project: thirtyninetyvolunteers
-- Prompt: 30BN-ADMIN.11
-- volunteer_roles moves from belonging to shows (show_id) to belonging
-- to show_dates (show_date_id), so each performance date can carry its
-- own staffing configuration.

-- 1. Add show_date_id column (nullable first, for backfill)
ALTER TABLE public.volunteer_roles
  ADD COLUMN show_date_id uuid
  REFERENCES public.show_dates(id) ON DELETE CASCADE;

-- 2. Backfill existing rows to the earliest show_date for the same show
UPDATE public.volunteer_roles vr
SET show_date_id = (
  SELECT sd.id
  FROM public.show_dates sd
  WHERE sd.show_id = vr.show_id
  ORDER BY sd.show_date ASC, sd.show_time ASC
  LIMIT 1
);

-- 3. Delete any rows that could not be backfilled (show has no dates)
DELETE FROM public.volunteer_roles
WHERE show_date_id IS NULL;

-- 4. Make show_date_id required
ALTER TABLE public.volunteer_roles
  ALTER COLUMN show_date_id SET NOT NULL;

-- 5. Drop the old show_id FK and column
ALTER TABLE public.volunteer_roles
  DROP CONSTRAINT volunteer_roles_show_id_fkey;

ALTER TABLE public.volunteer_roles
  DROP COLUMN show_id;

-- 6. Add index on show_date_id
CREATE INDEX idx_volunteer_roles_show_date_id
  ON public.volunteer_roles(show_date_id);

-- 7. Drop the old show_id index
DROP INDEX IF EXISTS idx_volunteer_roles_show_id;
