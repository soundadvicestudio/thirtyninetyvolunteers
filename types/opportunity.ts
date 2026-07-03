export type ClaimType = 'eoi' | 'slot_claim'
export type OpportunityStatus = 'active' | 'archived'

export type StandingOpportunity = {
  id: string
  title: string
  description: string | null
  claim_type: ClaimType
  slot_cap_enabled: boolean
  slot_cap: number | null
  status: OpportunityStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type OpportunityWithSubmissionCount = StandingOpportunity & {
  submission_count: number
}
