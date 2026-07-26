import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Fetches org identity fields from app_settings.
 * Uses getAdminClient() — safe for public Server
 * Components with no Supabase Auth session.
 * Falls back to 30BN defaults when keys are absent
 * so existing deployments are never broken.
 *
 * Server-side only. Never import from Client Components.
 */

export type OrgIdentity = {
  org_name: string
  org_tagline: string
  org_contact_email: string
  org_website_url: string
  org_location: string
}

export async function resolveOrgIdentity(): Promise<OrgIdentity> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'org_name',
      'org_tagline',
      'org_contact_email',
      'org_website_url',
      'org_location',
    ])
  const map = Object.fromEntries(
    (data ?? []).map(
      (r: { key: string; value: string }) =>
        [r.key, r.value]
    )
  )
  return {
    org_name:
      map['org_name'] || '30 By Ninety Theatre',
    org_tagline:
      map['org_tagline'] || '',
    org_contact_email:
      map['org_contact_email'] || '',
    org_website_url:
      map['org_website_url'] || '',
    org_location:
      map['org_location'] || '',
  }
}
