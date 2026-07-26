import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveCheckInToken } from '@/lib/actions/checkin'
import CheckInClient from '@/components/checkin/CheckInClient'

export const metadata = {
  title: 'Check In — 30 By Ninety Theatre Volunteers',
  robots: { index: false, follow: false },
}

// Matches the established public-page header pattern (app/shows/[id]/page.tsx,
// app/opportunities/[id]/page.tsx) — white header, centered logo, orange accent.
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

export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const flags = await getFeatureFlags(getAdminClient())
  if (!flags.checkin) redirect('/')

  const resolution = await resolveCheckInToken(token)

  if (resolution.type === 'invalid') {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-navy font-bold text-xl mb-3">This check-in link is not valid.</h1>
            <p className="text-mid-gray text-sm leading-relaxed">Please ask a crew member for assistance.</p>
          </div>
        </main>
      </div>
    )
  }

  const supabase = getAdminClient()

  const [{ data: categories }, { data: hearingOptions }, { data: settingsRows }] = await Promise.all([
    supabase
      .from('volunteer_categories')
      .select('id, name')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('hearing_options')
      .select('id, label')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('app_settings').select('key, value').in('key', ['signup_show_school', 'signup_show_age_range']),
  ])

  const settingsMap = new Map((settingsRows ?? []).map((r) => [r.key, r.value]))
  const showSchool = settingsMap.get('signup_show_school') !== 'false'
  const showAgeRange = settingsMap.get('signup_show_age_range') !== 'false'

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-white py-10">
        <CheckInClient
          resolution={resolution}
          token={token}
          categories={categories ?? []}
          hearingOptions={hearingOptions ?? []}
          showSchool={showSchool}
          showAgeRange={showAgeRange}
        />
      </main>
    </div>
  )
}
