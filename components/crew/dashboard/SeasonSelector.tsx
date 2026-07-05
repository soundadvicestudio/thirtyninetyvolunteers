'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setPinnedSeason } from '@/lib/actions/settings'

type Season = {
  id: string
  name: string
}

export default function SeasonSelector({
  seasons,
  currentSeasonId,
  adminRole,
}: {
  seasons: Season[]
  currentSeasonId: string | null
  adminRole: string
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  if (adminRole !== 'super_admin') return null

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    setIsSaving(true)

    const result = await setPinnedSeason(value === '' ? null : value)

    setIsSaving(false)
    if ('success' in result) {
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentSeasonId ?? ''}
        onChange={handleChange}
        disabled={isSaving}
        className="text-sm rounded border border-divider dark:border-dark-border px-2 py-1 text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
      >
        <option value="">— All Live Shows —</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
      {isSaving && <span className="text-xs text-mid-gray dark:text-dark-muted">Saving…</span>}
    </div>
  )
}
