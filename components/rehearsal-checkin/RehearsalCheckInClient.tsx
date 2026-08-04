'use client'

import { useState, useTransition } from 'react'
import { formatCT } from '@/lib/utils/date'
import { checkInToRehearsal } from '@/lib/actions/rehearsals'
import type { RehearsalCheckInData, CheckInToRehearsalResult } from '@/types/rehearsal'

export default function RehearsalCheckInClient({
  token,
  data,
}: {
  token: string
  data: RehearsalCheckInData
}) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [result, setResult] = useState<CheckInToRehearsalResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCheckIn() {
    startTransition(async () => {
      const res = await checkInToRehearsal(token, selectedUserId)
      setResult(res)
    })
  }

  if (result?.result === 'success') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <h1 className="text-brand-primary font-bold text-2xl mb-2">{`You're checked in!`}</h1>
        <p className="text-mid-gray text-base">
          {`You're checked in to ${data.batchTitle} on ${formatCT(data.event.start_time, 'MMMM d')}.`}
        </p>
        <p className="text-mid-gray text-base mt-1">{`Checked in at ${formatCT(result.checkedInAt, 'h:mm a')}.`}</p>
      </div>
    )
  }

  if (result?.result === 'already-checked-in') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <h1 className="text-brand-primary font-bold text-2xl mb-2">{`You're already checked in!`}</h1>
        <p className="text-mid-gray text-base">
          {`You already checked in at ${formatCT(result.checkedInAt, 'h:mm a')}.`}
        </p>
      </div>
    )
  }

  if (result?.result === 'not-on-roster') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <h1 className="text-brand-primary font-bold text-xl mb-3">{`Your name is not on the roster for this rehearsal.`}</h1>
        <p className="text-mid-gray text-sm leading-relaxed">{`Contact your stage manager.`}</p>
      </div>
    )
  }

  if (result?.result === 'invalid-token' || result?.result === 'error') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <h1 className="text-brand-primary font-bold text-xl mb-3">{`Something went wrong.`}</h1>
        <p className="text-mid-gray text-sm leading-relaxed">{`Please try again or contact your stage manager.`}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 space-y-5">
      <div className="text-center">
        <h1 className="text-brand-primary font-bold text-xl mb-1">{data.batchTitle}</h1>
        <p className="text-dark text-sm">{formatCT(data.event.start_time, 'EEEE, MMMM d')}</p>
        <p className="text-dark text-sm">
          {formatCT(data.event.start_time, 'h:mm a')} – {formatCT(data.event.end_time, 'h:mm a')}
        </p>
        <p className="text-mid-gray text-sm mt-1">{data.event.location_name ?? 'TBD'}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-1">{`Select your name`}</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
        >
          <option value="">{'— Select your name —'}</option>
          {data.effectiveRoster.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.full_name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={selectedUserId === '' || isPending}
        className="w-full min-h-[44px] py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Checking In…' : 'Check In'}
      </button>
    </div>
  )
}
