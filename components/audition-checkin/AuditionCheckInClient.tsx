'use client'

import { useState } from 'react'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import { checkInToAudition } from '@/lib/actions/auditions'
import type { AuditionCheckInData } from '@/types/audition'

type CheckInState = 'idle' | 'loading' | 'success' | 'already-checked-in' | 'not-on-roster' | 'error'

// time_start is a `time without time zone` column — a raw string like
// "19:00:00". Neither formatCT() (timestamptz) nor formatWallClockCT()
// (date columns) apply here; this is a plain string formatter, matching
// the identical helper in AuditionSignupClient.tsx (sanctioned small-
// pure-helper duplication — see Process §14 DRY exception precedent).
function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AuditionCheckInClient({
  data,
  checkInToken,
}: {
  data: AuditionCheckInData
  checkInToken: string
}) {
  const [selectedSignupId, setSelectedSignupId] = useState<string | null>(null)
  const [checkInState, setCheckInState] = useState<CheckInState>('idle')
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)

  async function handleCheckIn() {
    if (!selectedSignupId) return
    setCheckInState('loading')

    const result = await checkInToAudition(checkInToken, selectedSignupId)

    switch (result.result) {
      case 'success':
        setCheckInState('success')
        setCheckedInAt(result.checkedInAt)
        break
      case 'already-checked-in':
        setCheckInState('already-checked-in')
        setCheckedInAt(result.checkedInAt)
        break
      case 'not-on-roster':
        setCheckInState('not-on-roster')
        break
      case 'invalid-token':
        // Shouldn't happen — handled server-side — but handle defensively.
        setCheckInState('error')
        break
      default:
        setCheckInState('error')
    }
  }

  if (checkInState === 'success') {
    return (
      <div className="text-center py-10">
        <h2 className="text-brand-primary font-bold text-2xl mb-2">{"You're checked in!"}</h2>
        <p className="text-dark text-base">{'See you soon.'}</p>
        {checkedInAt && (
          <p className="text-mid-gray text-sm mt-1">{`Checked in at ${formatCT(checkedInAt, 'h:mm a')}`}</p>
        )}
      </div>
    )
  }

  if (checkInState === 'already-checked-in') {
    return (
      <div className="text-center py-10">
        <p className="text-dark text-base">
          {'You already checked in'}
          {checkedInAt ? ` at ${formatCT(checkedInAt, 'h:mm a')}.` : '.'}
        </p>
        <p className="text-mid-gray text-sm mt-1">{'See you soon!'}</p>
      </div>
    )
  }

  if (checkInState === 'not-on-roster') {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-base">
          {'Your name is not on the roster for this audition. Contact your director or stage manager.'}
        </p>
      </div>
    )
  }

  if (checkInState === 'error') {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-base">
          {'Something went wrong. Please try again or contact your director.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-brand-primary font-bold text-xl mb-1">{data.audition.title}</h1>
        <p className="text-dark text-sm">{formatWallClockCT(data.audition.date_start, null, 'EEEE, MMMM d, yyyy')}</p>
        {data.audition.time_start && <p className="text-dark text-sm">{formatTime(data.audition.time_start)}</p>}
        {data.location && <p className="text-mid-gray text-sm mt-1">{data.location.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-1">Select your name</label>
        <select
          value={selectedSignupId || ''}
          onChange={(e) => setSelectedSignupId(e.target.value || null)}
          className="w-full min-h-[44px] rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
        >
          <option value="">Select your name...</option>
          {data.roster.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={!selectedSignupId || checkInState === 'loading'}
        className="w-full min-h-[44px] py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {checkInState === 'loading' ? 'Checking in...' : 'Check In'}
      </button>
    </div>
  )
}
