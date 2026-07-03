import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import OpportunityList from '@/components/crew/opportunities/OpportunityList'
import type { StandingOpportunity, OpportunityWithSubmissionCount } from '@/types/opportunity'

export default async function OpportunitiesPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()

  const [{ data: opportunityRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from('standing_opportunities')
      .select(
        'id, title, description, claim_type, slot_cap_enabled, slot_cap, status, created_by, created_at, updated_at'
      )
      .order('created_at', { ascending: false }),
    supabase.from('opportunity_submissions').select('opportunity_id').eq('status', 'submitted'),
  ])

  const countByOpportunity = new Map<string, number>()
  for (const row of submissionRows ?? []) {
    countByOpportunity.set(row.opportunity_id, (countByOpportunity.get(row.opportunity_id) ?? 0) + 1)
  }

  const opportunities: OpportunityWithSubmissionCount[] = ((opportunityRows ?? []) as StandingOpportunity[]).map(
    (o) => ({
      ...o,
      submission_count: countByOpportunity.get(o.id) ?? 0,
    })
  )

  return <OpportunityList opportunities={opportunities} adminRole={admin.role} />
}
