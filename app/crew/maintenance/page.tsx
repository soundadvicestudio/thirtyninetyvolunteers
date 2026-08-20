import Image from 'next/image'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'

export const metadata = {
  title: 'System Maintenance',
  robots: { index: false, follow: false },
}

export default async function MaintenancePage() {
  const supabase = getAdminClient()

  const [org, settingsResult] = await Promise.all([
    resolveOrgIdentity(),
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['maintenance_heading', 'maintenance_body']),
  ])

  const settingsMap = Object.fromEntries(
    (settingsResult.data ?? []).map((r) => [r.key, r.value])
  )

  const heading =
    settingsMap['maintenance_heading'] || 'System Maintenance'
  const body =
    settingsMap['maintenance_body'] ||
    'The crew portal is temporarily unavailable while system updates and performance improvements are in progress. Please check back soon.'

  const logoSrc = org.org_logo_url || '/logo.png'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src={logoSrc}
            alt={org.org_name}
            width={160}
            height={80}
            className="mx-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {heading}
        </h1>
        <p className="text-gray-600 mb-8">
          {body}
        </p>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Return to homepage
        </Link>
      </div>
    </div>
  )
}
