-- Normalize volunteers.phone (NOT NULL, UNIQUE constraint)
-- Only updates rows that actually need changing (idempotent)
UPDATE volunteers
SET phone = regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone != regexp_replace(phone, '[^0-9]', '', 'g');

-- Normalize slot_claims.volunteer_phone (nullable)
UPDATE slot_claims
SET volunteer_phone = regexp_replace(
      volunteer_phone, '[^0-9]', '', 'g')
WHERE volunteer_phone IS NOT NULL
  AND volunteer_phone != regexp_replace(
        volunteer_phone, '[^0-9]', '', 'g');
