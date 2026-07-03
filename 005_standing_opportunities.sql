-- Migration 005: Standing Volunteer Opportunities
-- Project: thirtyninetyvolunteers
-- Prompt: 30BN-4.4a

CREATE TABLE public.standing_opportunities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  claim_type       text NOT NULL
    CHECK (claim_type IN ('eoi', 'slot_claim')),
  slot_cap_enabled boolean NOT NULL DEFAULT false,
  slot_cap         integer,
  status           text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  created_by       uuid REFERENCES public.admin_users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opp_status
  ON public.standing_opportunities(status);

CREATE TABLE public.opportunity_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   uuid NOT NULL
    REFERENCES public.standing_opportunities(id) ON DELETE CASCADE,
  volunteer_id     uuid REFERENCES public.volunteers(id),
  volunteer_name   text NOT NULL,
  volunteer_email  text NOT NULL,
  volunteer_phone  text,
  submission_token uuid NOT NULL DEFAULT gen_random_uuid(),
  status           text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'cancelled')),
  submitted_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opp_submissions_opportunity_id
  ON public.opportunity_submissions(opportunity_id);
CREATE INDEX idx_opp_submissions_volunteer_id
  ON public.opportunity_submissions(volunteer_id);

-- updated_at trigger (reuses public.handle_updated_at(), established in Migration 001)
CREATE TRIGGER trg_standing_opportunities_updated_at
  BEFORE UPDATE ON public.standing_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.standing_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all"
  ON public.standing_opportunities
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "public_select_active"
  ON public.standing_opportunities
  FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "admin_all"
  ON public.opportunity_submissions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "anon_insert"
  ON public.opportunity_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
