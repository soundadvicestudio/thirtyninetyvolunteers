import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AGE_RANGE_LABELS } from '@/lib/utils/csv'
import type { VolunteersUrlState } from './url'

/**
 * Builds a human-readable summary of the active (non-default) volunteer
 * list filters, e.g. "Category: Ushers/Front of House · Status: Active".
 * Returns an empty string when no non-default filters are active.
 */
export async function buildFilterSummary(
  supabase: SupabaseClient,
  state: VolunteersUrlState
): Promise<string> {
  const parts: string[] = []

  if (state.q) parts.push(`Search: "${state.q}"`)

  if (state.categoryIds.length > 0) {
    const { data } = await supabase
      .from('volunteer_categories')
      .select('name')
      .in('id', state.categoryIds)
    const names = (data ?? []).map((c) => c.name)
    if (names.length > 0) parts.push(`Category: ${names.join(', ')}`)
  }

  if (state.status !== 'active') {
    parts.push(`Status: ${state.status === 'archived' ? 'Archived' : 'All'}`)
  }

  if (state.ageRange) {
    parts.push(`Age Range: ${AGE_RANGE_LABELS[state.ageRange] ?? state.ageRange}`)
  }

  if (state.school !== 'all') {
    parts.push(`School: ${state.school === 'yes' ? 'Has school' : 'No school on file'}`)
  }

  if (state.isMinor !== 'all') {
    parts.push(`Is Minor: ${state.isMinor === 'yes' ? 'Yes' : 'No'}`)
  }

  return parts.join(' · ')
}
