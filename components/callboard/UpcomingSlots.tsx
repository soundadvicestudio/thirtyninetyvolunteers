'use client'

import { useState } from 'react'
import { cancelClaimFromCallboard } from '@/lib/actions/claims'
import type { UpcomingClaim } from '@/lib/data/callboard'

interface UpcomingSlotsProps {
  claims: UpcomingClaim[]
  volunteerEmail: string
}

type RowState = 'idle' | 'confirming' | 'cancelling' | 'error'

export default function UpcomingSlots({ claims, volunteerEmail }: UpcomingSlotsProps) {
  const [cancelState, setCancelState] = useState<Record<string, RowState>>({})
  const [cancelledTokens, setCancelledTokens] = useState<Set<string>>(new Set())

  const visibleClaims = claims.filter((c) => !cancelledTokens.has(c.claimToken))

  function setRowState(token: string, state: RowState) {
    setCancelState((prev) => ({ ...prev, [token]: state }))
  }

  async function handleConfirmCancel(token: string) {
    setRowState(token, 'cancelling')
    const result = await cancelClaimFromCallboard(token, volunteerEmail)
    if ('success' in result) {
      setCancelledTokens((prev) => new Set(prev).add(token))
    } else {
      setRowState(token, 'error')
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-dark mb-4">Upcoming Slots</h2>

      {visibleClaims.length === 0 ? (
        <p className="text-sm text-mid-gray">You have no upcoming slots.</p>
      ) : (
        <div className="space-y-3">
          {visibleClaims.map((claim) => {
            const state = cancelState[claim.claimToken] ?? 'idle'
            return (
              <div key={claim.claimToken} className="rounded-lg border border-neutral-border p-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-dark font-semibold text-sm">{claim.roleName}</p>
                    <p className="text-dark text-sm">{claim.showName}</p>
                    <p className="text-sm text-mid-gray">
                      {claim.showDate}
                      {claim.showTime ? ` · ${claim.showTime}` : ''}
                    </p>
                    <div className="mt-1.5">
                      {claim.status === 'claimed' ? (
                        <span className="inline-block text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800">
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-medium rounded-full px-2.5 py-0.5 bg-yellow-100 text-yellow-800">
                          Waitlist{claim.waitlistPosition != null ? ` #${claim.waitlistPosition}` : ''}
                        </span>
                      )}
                    </div>
                    {state === 'error' && (
                      <p className="text-xs text-red-600 mt-1.5">Could not cancel. Please try again.</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {state === 'cancelling' ? (
                      <span className="text-sm text-mid-gray">Cancelling...</span>
                    ) : state === 'confirming' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-dark">Cancel this slot?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmCancel(claim.claimToken)}
                          className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Yes, cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setRowState(claim.claimToken, 'idle')}
                          className="text-sm border border-neutral-border px-3 py-1.5 rounded-md text-mid-gray hover:bg-neutral-surface transition-colors cursor-pointer"
                        >
                          Keep it
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRowState(claim.claimToken, 'confirming')}
                        className="text-sm border border-neutral-border px-3 py-1.5 rounded-md text-mid-gray hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
