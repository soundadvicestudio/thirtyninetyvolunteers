import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveCheckInToken } from '@/lib/actions/checkin'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import CheckInClient from '@/components/checkin/CheckInClient'
import PublicHeader from '@/components/public/PublicHeader'

export async function generateMetadata() {
  const org = await resolveOrgIdentity()
  return {
    title: `Check In — ${org.org_name} Volunteers`,
    robots: { index: false, follow: false },
  }
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
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Main Page
          </Link>
        </div>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-brand-primary font-bold text-xl mb-3">This check-in link is not valid.</h1>
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
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Main Page
        </Link>
      </div>
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
