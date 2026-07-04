import type { FormStatus } from '@/types/form'

export const FORM_STATUS_LABEL: Record<FormStatus, string> = {
  draft: 'Draft',
  live: 'Live',
  closed: 'Closed',
}

export const FORM_STATUS_BADGE: Record<FormStatus, string> = {
  draft: 'bg-gray-200 text-gray-700 dark:bg-dark-border dark:text-dark-muted',
  live: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
