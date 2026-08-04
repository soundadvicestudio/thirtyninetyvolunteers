import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import SetupPanel, { type SetupPanelInitialValues } from '@/components/crew/settings/SetupPanel'

const SETUP_KEYS = [
  'org_name',
  'org_tagline',
  'org_contact_email',
  'org_website_url',
  'org_location',
  'brand_primary',
  'brand_accent',
  'org_logo_url',
  'favicon_url',
  'email_from_address',
  'email_from_name',
  'default_reply_to',
  'feature_calendar',
  'feature_checkin',
  'feature_blast',
  'feature_rehearsals',
  'instance_label',
  'not_found_heading',
  'not_found_body',
] as const

export default async function SetupPage() {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    redirect('/crew/login')
  }
  // proxy.ts already hard-blocks any non-Super-Admin on this route.
  // Server-side check here is defense in depth.
  if (adminUser.role !== 'super_admin') {
    redirect('/crew/dashboard')
  }

  const supabase = await getServerClient()
  const { data: settings } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', SETUP_KEYS)

  const settingsMap = new Map((settings ?? []).map((row) => [row.key, row.value]))

  const initialValues: SetupPanelInitialValues = {
    org_name: settingsMap.get('org_name') ?? '',
    org_tagline: settingsMap.get('org_tagline') ?? '',
    org_contact_email: settingsMap.get('org_contact_email') ?? '',
    org_website_url: settingsMap.get('org_website_url') ?? '',
    org_location: settingsMap.get('org_location') ?? '',
    brand_primary: settingsMap.get('brand_primary') ?? '',
    brand_accent: settingsMap.get('brand_accent') ?? '',
    org_logo_url: settingsMap.get('org_logo_url') ?? '',
    favicon_url: settingsMap.get('favicon_url') ?? '',
    email_from_address: settingsMap.get('email_from_address') ?? '',
    email_from_name: settingsMap.get('email_from_name') ?? '',
    default_reply_to: settingsMap.get('default_reply_to') ?? '',
    feature_calendar: settingsMap.get('feature_calendar') ?? 'true',
    feature_checkin: settingsMap.get('feature_checkin') ?? 'true',
    feature_blast: settingsMap.get('feature_blast') ?? 'true',
    feature_rehearsals: settingsMap.get('feature_rehearsals') ?? 'true',
    instance_label: settingsMap.get('instance_label') ?? '',
    not_found_heading: settingsMap.get('not_found_heading') ?? 'Page Not Found',
    not_found_body: settingsMap.get('not_found_body') ?? "We couldn't find what you were looking for.",
  }

  const instanceLabel = settingsMap.get('instance_label') ?? ''

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Platform Setup</h1>
          {instanceLabel && (
            <span className="text-sm font-normal text-mid-gray dark:text-dark-muted">
              · {instanceLabel}
            </span>
          )}
        </div>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Configure this OpenCall OS deployment. Changes take effect immediately.
        </p>
      </div>
      <SetupPanel initialValues={initialValues} />
    </div>
  )
}
