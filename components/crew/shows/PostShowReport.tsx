import type { ReactNode } from 'react'
import { formatWallClockCT } from '@/lib/utils/date'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { PostShowReportData } from '@/types/show'

function StatTile({
  label,
  value,
  subtext,
  colorClass,
}: {
  label: string
  value: string | number
  subtext?: ReactNode
  colorClass?: string
}) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4">
      <p className="text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass ?? 'text-dark dark:text-dark-text'}`}>{value}</p>
      {subtext && <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">{subtext}</p>}
    </div>
  )
}

export default function PostShowReport({ data }: { data: PostShowReportData }) {
  if (data.totalClaimedAppearances === 0) {
    return (
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        No volunteers were rostered for this show.
      </p>
    )
  }

  const attendanceNotMarked =
    data.totalShowedCount + data.totalNoShowCount + data.totalExcusedCount === 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatTile
          label="Claimed Appearances"
          value={data.totalClaimedAppearances}
          subtext={data.uniqueVolunteerCount > 0 ? `${data.uniqueVolunteerCount} registered volunteers` : undefined}
        />
        <StatTile label="Showed Up" value={data.totalShowedCount} colorClass="text-green-700 dark:text-green-400" />
        <StatTile label="No-Shows" value={data.totalNoShowCount} colorClass="text-red-600 dark:text-red-400" />
        <StatTile label="Excused" value={data.totalExcusedCount} colorClass="text-amber-600 dark:text-amber-400" />
        <StatTile
          label="Total Hours"
          value={data.totalHours.toFixed(1)}
          subtext={
            data.totalPendingHoursCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                {`${data.totalPendingHoursCount} appearances pending hours confirmation`}
                <HelpTooltip anchor="hours" label="Hours Confirmation" />
              </span>
            ) : undefined
          }
        />
        <StatTile
          label="Attendance Rate"
          value={data.attendanceRate !== null ? `${data.attendanceRate}%` : '—'}
          subtext="of marked attendance"
        />
      </div>

      {attendanceNotMarked && (
        <p className="text-sm text-mid-gray dark:text-dark-muted bg-light-navy/30 dark:bg-dark-bg/40 border border-divider dark:border-dark-border rounded-lg px-4 py-3">
          Attendance has not been marked yet. Use the Volunteers tab to mark attendance for each date.
        </p>
      )}

      <div>
        <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-3">By Date</h3>
        <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold text-right">Claimed</th>
                <th className="px-4 py-2 font-semibold text-right">Showed</th>
                <th className="px-4 py-2 font-semibold text-right">No-Show</th>
                <th className="px-4 py-2 font-semibold text-right">Excused</th>
                <th className="px-4 py-2 font-semibold text-right">Unmarked</th>
                <th className="px-4 py-2 font-semibold text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface">
              {data.perDate.map((d, i) => (
                <tr
                  key={d.dateId}
                  className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                >
                  <td className="px-4 py-2 text-dark dark:text-dark-text">
                    {formatWallClockCT(d.showDate, d.showTime, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-2 text-right text-dark dark:text-dark-text">{d.totalClaimed}</td>
                  <td className="px-4 py-2 text-right text-dark dark:text-dark-text">{d.showedCount}</td>
                  <td className="px-4 py-2 text-right text-dark dark:text-dark-text">{d.noShowCount}</td>
                  <td className="px-4 py-2 text-right text-dark dark:text-dark-text">{d.excusedCount}</td>
                  <td
                    className={`px-4 py-2 text-right ${
                      d.unmarkedCount > 0
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-dark dark:text-dark-text'
                    }`}
                  >
                    {d.unmarkedCount}
                  </td>
                  <td className="px-4 py-2 text-right text-dark dark:text-dark-text">{d.totalHours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
