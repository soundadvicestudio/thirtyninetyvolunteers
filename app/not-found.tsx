import Image from 'next/image'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'

export default async function NotFound() {
  const supabase = getAdminClient()
  const [org, { data: settingsRows }] = await Promise.all([
    resolveOrgIdentity(),
    supabase.from('app_settings').select('key, value').in('key', ['not_found_heading', 'not_found_body']),
  ])
  const settingsMap = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]))
  const heading = settingsMap['not_found_heading'] || 'Page Not Found'
  const body = settingsMap['not_found_body'] || "We couldn't find what you were looking for."

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <Image
          src={org.org_logo_url || '/logo.png'}
          alt={org.org_name}
          width={120}
          height={48}
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-3xl font-bold text-navy mb-3">{heading}</h1>
        <p className="text-mid-gray mb-8">{body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center border-2 border-navy text-navy font-semibold px-6 py-3 rounded-md hover:bg-light-navy transition-colors"
          >
            Go to volunteer signup
          </Link>
          <Link
            href="/crew/dashboard"
            className="inline-flex items-center justify-center border-2 border-navy text-navy font-semibold px-6 py-3 rounded-md hover:bg-light-navy transition-colors"
          >
            Go to Production Crew
          </Link>
        </div>
      </div>
    </div>
  )
}
