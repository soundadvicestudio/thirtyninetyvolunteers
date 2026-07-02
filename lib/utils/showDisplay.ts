import type { ShowType, ShowStatus } from '@/types/show'

export const SHOW_TYPE_LABEL: Record<ShowType, string> = {
  mainstage: 'Mainstage',
  studio_x: 'Studio X',
  one_off: 'One-Off',
}

export const SHOW_TYPE_BADGE: Record<ShowType, string> = {
  mainstage: 'bg-navy text-white',
  studio_x: 'bg-steel text-white',
  one_off: 'bg-orange text-white',
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
