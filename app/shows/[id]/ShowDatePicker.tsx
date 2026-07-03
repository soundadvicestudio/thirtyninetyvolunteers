'use client'

import { useState } from 'react'
import { formatWallClockCT } from '@/lib/utils/date'
import type { PublicShowDate } from '@/types/show-public'
import ClaimForm from './ClaimForm'

function isDateFull(date: PublicShowDate): boolean {
  return date.roles.length > 0 && date.roles.every((r) => r.is_full)
}

export default function ShowDatePicker({ dates, showName }: { dates: PublicShowDate[]; showName: string }) {
  const singleDate = dates.length === 1

  const [selectedDateId, setSelectedDateId] = useState<string | null>(singleDate ? dates[0]?.id ?? null : null)
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null)

  const selectedDate = dates.find((d) => d.id === selectedDateId) ?? null

  function handleSelectDate(dateId: string) {
    setSelectedDateId(dateId)
    setActiveRoleId(null)
  }

  function handleToggleRole(roleId: string) {
    setActiveRoleId((current) => (current === roleId ? null : roleId))
  }

  if (dates.length === 0) {
    return <p className="text-mid-gray text-sm">No dates are scheduled for this show yet.</p>
  }

  return (
    <div className="space-y-8">
      {singleDate ? (
        <p className="text-navy font-bold text-lg">
          {formatWallClockCT(dates[0].show_date, dates[0].show_time, 'EEEE, MMMM d, yyyy')} at{' '}
          {formatWallClockCT(dates[0].show_date, dates[0].show_time, 'h:mm a')}
        </p>
      ) : (
        <div>
          <h2 className="text-navy font-bold text-lg mb-3">Choose a Date</h2>
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => {
              const full = isDateFull(date)
              const isSelected = date.id === selectedDateId

              return (
                <button
                  key={date.id}
                  type="button"
                  disabled={full}
                  onClick={() => handleSelectDate(date.id)}
                  className={
                    full
                      ? 'rounded-full border border-divider bg-footer-gray text-mid-gray text-sm font-semibold px-4 py-2.5 cursor-not-allowed'
                      : isSelected
                        ? 'rounded-full bg-navy text-white text-sm font-semibold px-4 py-2.5 transition-colors'
                        : 'rounded-full border border-navy text-navy text-sm font-semibold px-4 py-2.5 hover:bg-light-navy transition-colors'
                  }
                >
                  {formatWallClockCT(date.show_date, date.show_time, 'EEE, MMM d, yyyy')}
                  {full ? ' — Full' : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="space-y-4">
          <h2 className="text-navy font-bold text-lg">
            Roles for {formatWallClockCT(selectedDate.show_date, selectedDate.show_time, 'MMM d, yyyy')}
          </h2>

          {selectedDate.roles.map((role) => {
            const remaining = Math.max(role.slots_available - role.claimed_count, 0)

            return (
              <div key={role.id} className="rounded-xl border border-divider p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-dark font-semibold">{role.role_name}</p>
                    <p className="text-mid-gray text-sm">
                      {role.is_full ? 'Full — waitlist available' : `${remaining} spot${remaining === 1 ? '' : 's'} open`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleRole(role.id)}
                    className={
                      role.is_full
                        ? 'bg-steel text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-opacity-90 transition-colors'
                        : 'bg-orange text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-opacity-90 transition-colors'
                    }
                  >
                    {role.is_full ? 'Join Waitlist' : 'Claim This Spot'}
                  </button>
                </div>

                {activeRoleId === role.id && (
                  <div className="mt-4 pt-4 border-t border-divider">
                    <ClaimForm
                      roleId={role.id}
                      showDateId={selectedDate.id}
                      roleName={role.role_name}
                      showName={showName}
                      isWaitlist={role.is_full}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
