import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import SignupFormSettings from '@/components/crew/settings/SignupFormSettings'

export default async function SignupFormSettingsPage() {
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
    .in('key', ['signup_show_school', 'signup_show_age_range'])

  const settingsMap = new Map((rows ?? []).map((r) => [r.key, r.value]))
  const initialShowSchool = settingsMap.get('signup_show_school') !== 'false'
  const initialShowAgeRange = settingsMap.get('signup_show_age_range') !== 'false'

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Signup Form</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Control which optional fields appear on the public volunteer signup form. Changes take
        effect immediately.
      </p>

      <SignupFormSettings initialShowSchool={initialShowSchool} initialShowAgeRange={initialShowAgeRange} />
    </div>
  )
}
