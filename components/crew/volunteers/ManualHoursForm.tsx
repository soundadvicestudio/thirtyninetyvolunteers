'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addManualHours } from '@/lib/actions/volunteers'
import { formatCT } from '@/lib/utils/date'

function todayCT(): string {
  return formatCT(new Date(), 'yyyy-MM-dd')
}

export default function ManualHoursForm({ volunteerId }: { volunteerId: string }) {
  const router = useRouter()
  const [hours, setHours] = useState('')
  const [loggedDate, setLoggedDate] = useState(todayCT)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedHours = Number(hours)
    if (!hours || Number.isNaN(parsedHours) || parsedHours <= 0) {
      setError('Enter a valid number of hours greater than 0.')
      return
    }
    if (!note.trim()) {
      setError('A description is required.')
      return
    }

    setIsSubmitting(true)
    const result = await addManualHours(volunteerId, parsedHours, note, loggedDate)

    if ('success' in result) {
      setHours('')
      setNote('')
      setLoggedDate(todayCT())
      router.refresh()
      return
    }

    setIsSubmitting(false)
    setError(result.error)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-6 space-y-4"
    >
      <h3 className="text-sm font-bold text-dark dark:text-dark-text">Add Manual Hours</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">
            Hours to add
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">
            Date of activity
          </label>
          <input
            type="date"
            value={loggedDate}
            onChange={(e) => setLoggedDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">
            Description
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Set build, June 15"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="text-sm text-orange">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-orange text-white font-bold px-5 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Adding…' : 'Add Hours'}
      </button>
    </form>
  )
}
