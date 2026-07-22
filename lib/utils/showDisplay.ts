import type { ShowStatus } from '@/types/show'

// Preserves the legacy default-hours-by-venue-category app_settings
// lookup (default_hours_mainstage/studio_x/one_off) now that locations
// (5) replaced the old three-way category as the data model (30BN-CAL.1).
// Maps each location name to its historical bucket; the 3 new locations
// without a direct predecessor share the bucket of their sibling venue.
const LOCATION_HOURS_BUCKET: Record<string, 'mainstage' | 'studio_x' | 'one_off'> = {
  Mainstage: 'mainstage',
  'Mainstage Lobby': 'mainstage',
  'Studio X': 'studio_x',
  'Studio X Office': 'studio_x',
  'Green Room': 'one_off',
}

export function getLocationHoursBucket(
  locationName: string | null | undefined
): 'mainstage' | 'studio_x' | 'one_off' {
  return (locationName && LOCATION_HOURS_BUCKET[locationName]) || 'one_off'
}

export const SHOW_STATUS_LABEL: Record<ShowStatus, string> = {
  draft: 'Draft',
  live: 'Live',
  past: 'Past',
  archived: 'Archived',
}

export const SHOW_STATUS_BADGE: Record<ShowStatus, string> = {
  draft: 'bg-gray-200 text-gray-700 dark:bg-dark-border dark:text-dark-muted',
  live: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  past: 'bg-steel/20 text-steel dark:bg-steel/20 dark:text-steel',
  archived: 'bg-mid-gray/20 text-mid-gray dark:bg-dark-border dark:text-dark-muted',
}
