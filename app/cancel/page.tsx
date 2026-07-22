import Image from 'next/image'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { formatWallClockCT } from '@/lib/utils/date'
import CancelForm from './CancelForm'

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

function InfoPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-navy font-bold text-xl mb-6">{title}</h1>
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

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  return `${local.slice(0, 2)}***@${domain}`
}

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <InfoPage title="No cancel link found" />
  }

  const client = getAdminClient()

  const { data: claim } = await client
    .from('slot_claims')
    .select('id, status, volunteer_name, volunteer_email, volunteer_role_id, show_date_id, claim_token')
    .eq('claim_token', token)
    .maybeSingle()

  if (!claim) {
    return <InfoPage title="This cancel link is not valid or has already been used." />
  }

  if (claim.status === 'cancelled') {
    return <InfoPage title="This spot has already been cancelled. We hope to see you at a future show!" />
  }

  const { data: showDate } = await client
    .from('show_dates')
    .select('id, show_id, show_date, show_time, end_time')
    .eq('id', claim.show_date_id)
    .maybeSingle()

  const [{ data: show }, { data: role }] = await Promise.all([
    showDate
      ? client.from('shows').select('name').eq('id', showDate.show_id).maybeSingle()
      : Promise.resolve({ data: null }),
    client.from('volunteer_roles').select('role_name').eq('id', claim.volunteer_role_id).maybeSingle(),
  ])

  if (!showDate || !show || !role) {
    return <InfoPage title="This cancel link is not valid or has already been used." />
  }

  const formattedDate = formatWallClockCT(showDate.show_date, showDate.show_time, 'EEEE, MMMM d, yyyy')
  const formattedTime = showDate.end_time
    ? `${formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a')} – ${formatWallClockCT(showDate.show_date, showDate.end_time, 'h:mm a')}`
    : formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a')
  const maskedEmail = maskEmail(claim.volunteer_email)
  const claimStatus = claim.status as 'claimed' | 'waitlisted'

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-navy font-bold text-2xl mb-6">Cancel Your Spot</h1>

          <div className="rounded-xl border border-divider p-4 mb-8">
            <p className="text-dark font-semibold">{show.name}</p>
            <p className="text-mid-gray text-sm">
              {formattedDate} at {formattedTime}
            </p>
            <p className="text-mid-gray text-sm">Role: {role.role_name}</p>
            <p className="text-mid-gray text-sm">Volunteer: {claim.volunteer_name}</p>
          </div>

          <CancelForm claimToken={claim.claim_token} claimStatus={claimStatus} maskedEmail={maskedEmail} />
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© 30 By Ninety Theatre</p>
          <Link href="/crew/login" className="text-mid-gray text-xs hover:text-navy transition-colors">
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
