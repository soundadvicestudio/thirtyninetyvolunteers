import { Calendar } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'

type CallHistoryRow = {
  id: string
  show_name: string
  show_date: string
  role_name: string
  attendance_status: 'showed' | 'no_show' | 'excused' | null
  hours_logged: number | null
}

const ATTENDANCE_LABEL: Record<'showed' | 'no_show' | 'excused', string> = {
  showed: 'Showed',
  no_show: 'No Show',
  excused: 'Excused',
}

const ATTENDANCE_CLASSES: Record<'showed' | 'no_show' | 'excused', string> = {
  showed: 'text-green-700',
  no_show: 'text-red-700',
  excused: 'text-mid-gray',
}

export default function CallHistoryTable({ calls }: { calls: CallHistoryRow[] }) {
  if (calls.length === 0) {
    return (
      <div className="bg-white border border-divider rounded-lg py-16 px-6 flex flex-col items-center text-center">
        <Calendar size={40} className="text-mid-gray mb-3" />
        <p className="text-mid-gray">No calls on record yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-divider rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider text-left">
            <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Show Name</th>
            <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Date</th>
            <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Role</th>
            <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Attendance</th>
            <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Hours</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, i) => (
            <tr
              key={call.id}
              className={`border-b border-divider ${i % 2 === 0 ? 'bg-light-navy/30' : ''}`}
            >
              <td className="px-4 py-3 text-dark">{call.show_name}</td>
              <td className="px-4 py-3 text-dark">
                {call.show_date ? formatCT(call.show_date, 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3 text-dark">{call.role_name}</td>
              <td className="px-4 py-3">
                {call.attendance_status ? (
                  <span className={ATTENDANCE_CLASSES[call.attendance_status]}>
                    {ATTENDANCE_LABEL[call.attendance_status]}
                  </span>
                ) : (
                  <span className="text-mid-gray">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {call.hours_logged !== null ? (
                  <span className="text-dark">{call.hours_logged}</span>
                ) : (
                  <span className="text-mid-gray">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
