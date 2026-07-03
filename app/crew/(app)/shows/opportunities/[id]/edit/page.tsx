import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import OpportunityForm from '@/components/crew/opportunities/OpportunityForm'
import type { StandingOpportunity } from '@/types/opportunity'

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/shows/opportunities')
  }

  const { id } = await params
  const supabase = await getServerClient()

  const { data: opportunity } = await supabase
    .from('standing_opportunities')
    .select(
      'id, title, description, claim_type, slot_cap_enabled, slot_cap, status, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (!opportunity || opportunity.status === 'archived') {
    redirect('/crew/shows/opportunities')
  }

  return (
    <div>
      <Link
        href="/crew/shows/opportunities"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Standing Opportunities
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Edit Standing Opportunity</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">{opportunity.title}</p>

      <OpportunityForm opportunity={opportunity as StandingOpportunity} />
    </div>
  )
}
