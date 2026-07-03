import Image from 'next/image'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import OpportunitySubmitForm from '@/components/opportunities/OpportunitySubmitForm'
import type { StandingOpportunity } from '@/types/opportunity'

const CLAIM_TYPE_LABEL: Record<'eoi' | 'slot_claim', string> = {
  eoi: 'Expression of Interest',
  slot_claim: 'Volunteer Position',
}

function PublicHeader() {
  return (
    <header className="w-full bg-white border-b border-divider">
      <div className="max-w-2xl mx-auto py-6 px-6 text-center">
        <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
        <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
      </div>
    </header>
  )
}

function Unavailable() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-navy font-bold text-xl mb-3">This opportunity is no longer available</h1>
          <p className="text-mid-gray text-sm leading-relaxed mb-6">
            It may have been filled or is no longer active. Check out our other volunteer opportunities.
          </p>
          <Link
            href="/shows"
            className="inline-block bg-navy text-white font-semibold py-3 px-6 rounded hover:bg-opacity-90 transition-colors"
          >
            View Opportunities
          </Link>
        </div>
      </main>
    </div>
  )
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = getAdminClient()

  const { data: opportunity } = await client
    .from('standing_opportunities')
    .select(
      'id, title, description, claim_type, slot_cap_enabled, slot_cap, status, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (!opportunity || opportunity.status !== 'active') {
    return <Unavailable />
  }

  const opp = opportunity as StandingOpportunity

  let isFull = false
  if (opp.claim_type === 'slot_claim' && opp.slot_cap_enabled && opp.slot_cap != null) {
    const { count } = await client
      .from('opportunity_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('opportunity_id', id)
      .eq('status', 'submitted')
    isFull = (count ?? 0) >= opp.slot_cap
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-light-navy text-navy text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-3">
            {CLAIM_TYPE_LABEL[opp.claim_type]}
          </span>
          <h1 className="text-navy font-bold text-2xl md:text-3xl mb-4">{opp.title}</h1>
          {opp.description && (
            <p className="text-dark text-base leading-relaxed mb-8 whitespace-pre-wrap">{opp.description}</p>
          )}

          {isFull ? (
            <div className="rounded-xl bg-pale-orange border border-divider p-6 text-center max-w-xl">
              <p className="text-dark font-semibold">This position is currently full.</p>
              <p className="text-mid-gray text-sm mt-2">Check back later or browse other opportunities.</p>
              <Link href="/shows" className="inline-block mt-4 text-navy font-semibold underline">
                Browse Other Opportunities →
              </Link>
            </div>
          ) : (
            <OpportunitySubmitForm opportunityId={opp.id} claimType={opp.claim_type} />
          )}
        </div>
      </main>
    </div>
  )
}
