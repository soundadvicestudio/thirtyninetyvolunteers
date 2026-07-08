import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import HearingOptionsManager from '@/components/crew/settings/HearingOptionsManager'

export default async function HearingOptionsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/settings')
  }

  const supabase = await getServerClient()
  const { data: hearingOptions } = await supabase
    .from('hearing_options')
    .select('id, label, sort_order, is_active')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Hearing Options</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Manage the &lsquo;How did you hear about us?&rsquo; dropdown options on the public
        volunteer signup form. Inactive options are hidden from new signups but remain on
        existing volunteer records.
      </p>

      <HearingOptionsManager hearingOptions={hearingOptions ?? []} />
    </div>
  )
}
