import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import AnnouncementBannerForm from '@/components/crew/settings/AnnouncementBannerForm'

export default async function AnnouncementSettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/settings')
  }

  const supabase = await getServerClient()
  const { data: rows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['announcement_banner_active', 'announcement_banner_text'])

  const settingsMap = new Map((rows ?? []).map((r) => [r.key, r.value]))
  const initialActive = settingsMap.get('announcement_banner_active') === 'true'
  const initialText = settingsMap.get('announcement_banner_text') ?? ''

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Announcement Banner</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Control the banner that appears at the top of the public volunteer signup page. Changes
        take effect immediately.
      </p>

      <AnnouncementBannerForm initialText={initialText} initialActive={initialActive} />
    </div>
  )
}
