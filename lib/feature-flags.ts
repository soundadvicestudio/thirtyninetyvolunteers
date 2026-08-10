import type { SupabaseClient } from '@supabase/supabase-js'

export type FeatureFlags = {
  calendar: boolean
  checkin: boolean
  blast: boolean
  rehearsals: boolean
  auditions: boolean
  inventory: boolean
}

/**
 * Fetches all feature flags from app_settings in a single
 * query. Accepts the supabase client as a parameter —
 * callers construct the client (getServerClient() for
 * authenticated contexts, getAdminClient() for public/
 * edge contexts). Missing keys default to true so that
 * a misconfigured deployment never accidentally disables
 * a feature.
 */
export async function getFeatureFlags(
  supabase: SupabaseClient
): Promise<FeatureFlags> {
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['feature_calendar', 'feature_checkin', 'feature_blast', 'feature_rehearsals', 'feature_auditions', 'feature_inventory'])

  const map = Object.fromEntries(
    (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  )

  return {
    calendar: map['feature_calendar'] !== 'false',
    checkin: map['feature_checkin'] !== 'false',
    blast: map['feature_blast'] !== 'false',
    rehearsals: map['feature_rehearsals'] !== 'false',
    auditions: map['feature_auditions'] !== 'false',
    inventory: map['feature_inventory'] !== 'false',
  }
}
