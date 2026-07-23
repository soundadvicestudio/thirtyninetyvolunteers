'use client'

const EDIT_SCOPES = [
  {
    scope: 'this' as const,
    label: 'Only this occurrence',
    description: 'Only this date will be changed. It will be detached from the series.',
  },
  {
    scope: 'future' as const,
    label: 'This and all future occurrences',
    description: 'This date and all future dates in the series will be updated.',
  },
  {
    scope: 'all' as const,
    label: 'All occurrences',
    description: 'Every occurrence in the series will be updated.',
  },
]

const CANCEL_SCOPES = [
  {
    scope: 'this' as const,
    label: 'Only this occurrence',
    description: 'Only this date will be removed from the calendar.',
  },
  {
    scope: 'future' as const,
    label: 'This and all future occurrences',
    description: 'This date and all future dates will be removed.',
  },
  {
    scope: 'all' as const,
    label: 'Cancel the entire series',
    description: 'Every occurrence will be removed from the calendar.',
  },
]

export default function RecurrenceScopePicker({
  mode,
  onSelect,
  onClose,
}: {
  mode: 'edit' | 'cancel'
  onSelect: (scope: 'this' | 'future' | 'all') => void
  onClose: () => void
}) {
  const scopes = mode === 'edit' ? EDIT_SCOPES : CANCEL_SCOPES

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[71] flex items-end sm:items-center justify-center pointer-events-none">
        <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-lg bg-white dark:bg-dark-surface shadow-xl p-6 pointer-events-auto">
          <h2 className="text-lg font-semibold text-dark dark:text-dark-text mb-4">
            {mode === 'edit' ? 'Edit Recurring Event' : 'Cancel Recurring Event'}
          </h2>

          {scopes.map(({ scope, label, description }) => (
            <button
              key={scope}
              type="button"
              onClick={() => onSelect(scope)}
              className={`w-full text-left px-4 py-3 rounded-md border border-divider dark:border-dark-border hover:bg-light-navy dark:hover:bg-dark-surface ${
                scope === 'all' && mode === 'cancel' ? 'hover:border-orange' : 'hover:border-navy dark:hover:border-steel'
              } text-dark dark:text-dark-text transition-colors mb-2 last:mb-0 cursor-pointer`}
            >
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-mid-gray dark:text-dark-muted mt-0.5">{description}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full text-sm text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
