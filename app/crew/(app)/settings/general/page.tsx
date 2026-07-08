import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import GeneralSettings from '@/components/crew/settings/GeneralSettings'

export default async function GeneralSettingsPage() {
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
    .in('key', [
      'default_hours_mainstage',
      'default_hours_studio_x',
      'default_hours_one_off',
      'default_reply_to',
    ])

  const settingsMap = new Map((rows ?? []).map((r) => [r.key, r.value]))

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">General Defaults</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Default settings used when creating new shows and sending emails.
      </p>

      <GeneralSettings
        initialMainstage={Number(settingsMap.get('default_hours_mainstage') ?? 3)}
        initialStudioX={Number(settingsMap.get('default_hours_studio_x') ?? 2)}
        initialOneOff={Number(settingsMap.get('default_hours_one_off') ?? 2)}
        initialReplyTo={settingsMap.get('default_reply_to') ?? ''}
      />
    </div>
  )
}
