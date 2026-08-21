'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import { markAttendance, bulkMarkAttendance } from '@/lib/actions/attendance'
import {
  addShowEditor,
  removeShowEditor,
  updateShowStatus,
  sendShowNotifications,
  deleteShow,
} from '@/lib/actions/shows'
import { SHOW_STATUS_LABEL, SHOW_STATUS_BADGE, getLocationHoursBucket } from '@/lib/utils/showDisplay'
import PostShowReport from '@/components/crew/shows/PostShowReport'
import BulkEmailSection from '@/components/crew/shows/BulkEmailSection'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { AdminUser } from '@/lib/auth'
import type {
  Show,
  ShowDateWithRoles,
  ShowRole,
  SlotClaim,
  AttendanceRecord,
  ShowEditor,
  AdminUserSummary,
  ShowStatus,
  PostShowReportData,
} from '@/types/show'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'
const selectClasses =
  'rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

const ATTENDANCE_LABEL: Record<'showed' | 'no_show' | 'excused', string> = {
  showed: 'Showed',
  no_show: 'No-Show',
  excused: 'Excused',
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'show'
  )
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'waitlist', label: 'Waitlist' },
  { key: 'dates', label: 'Dates' },
  { key: 'report', label: 'Report' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

function OverviewTab({
  show,
  season,
  canEdit,
  qr,
  bulkEmailRecipientCount,
  defaultReplyTo,
  defaultSubject,
  timezone,
}: {
  show: Show
  season: { id: string; name: string } | null
  canEdit: boolean
  qr: { svg: string; pngBase64: string }
  bulkEmailRecipientCount: number
  defaultReplyTo: string
  defaultSubject: string
  timezone: string
}) {
  const [copied, setCopied] = useState(false)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const publicUrl = `${siteUrl}/shows/${show.id}`
  const slug = slugify(show.name)

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{show.name}</h1>
          <span
            className="text-xs font-semibold rounded px-2 py-0.5 text-white"
            style={{ backgroundColor: show.location?.color ?? '#555555' }}
          >
            {show.location?.name ?? 'Unknown Location'}
          </span>
          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${SHOW_STATUS_BADGE[show.status]}`}>
            {SHOW_STATUS_LABEL[show.status]}
          </span>
        </div>
        {season && <p className="text-sm text-mid-gray dark:text-dark-muted">{season.name}</p>}
      </div>

      {show.description && <p className="text-dark dark:text-dark-text">{show.description}</p>}

      {show.volunteer_instructions && (
        <div>
          <p className="text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-1">
            Volunteer Instructions (included in confirmation emails)
          </p>
          <blockquote className="border-l-4 border-brand-primary-mid bg-white dark:bg-dark-surface rounded-r-lg p-4 text-dark dark:text-dark-text">
            {show.volunteer_instructions}
          </blockquote>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-dark dark:text-dark-text font-mono bg-white dark:bg-dark-surface px-3 py-1.5 rounded break-all">
          {publicUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => window.open(`/shows/${show.id}`, '_blank', 'noopener,noreferrer')}
          className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
        >
          View
        </button>
      </div>

      {canEdit && (
        <Link
          href={`/crew/shows/${show.id}/edit`}
          className="inline-block bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium"
        >
          Edit Show
        </Link>
      )}

      <div>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Show QR Code</h2>
        <div
          className="w-[200px] h-[200px] [&>svg]:w-full [&>svg]:h-full bg-white p-2 rounded-lg border border-divider dark:border-dark-border"
          dangerouslySetInnerHTML={{ __html: qr.svg }}
        />
        <div className="flex gap-4 mt-3">
          <a
            href={`data:image/png;base64,${qr.pngBase64}`}
            download={`${slug}-qr.png`}
            className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Download PNG
          </a>
          <a
            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.svg)}`}
            download={`${slug}-qr.svg`}
            className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Download SVG
          </a>
        </div>
      </div>

      <NotificationsSection show={show} canEdit={canEdit} timezone={timezone} />

      {canEdit && (
        <BulkEmailSection
          showId={show.id}
          showName={show.name}
          recipientCount={bulkEmailRecipientCount}
          defaultReplyTo={defaultReplyTo}
          defaultSubject={defaultSubject}
        />
      )}
    </div>
  )
}

function NotificationsSection({
  show,
  canEdit,
  timezone,
}: {
  show: Show
  canEdit: boolean
  timezone: string
}) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  if (!canEdit || show.status !== 'live') return null

  const alreadySent = !!show.notifications_sent_at

  async function handleSend() {
    setSending(true)
    setResult(null)
    const res = await sendShowNotifications(show.id)
    setSending(false)
    setConfirming(false)
    if (res.error) {
      setResult('Notification send failed. Please try again.')
    } else if (res.sent === 0) {
      setResult("No volunteers matched this show's roles.")
    } else {
      setResult(`Notifications sent to ${res.sent} matching volunteer(s).`)
    }
    router.refresh()
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3 flex items-center gap-1.5">
        Volunteer Notifications
        <HelpTooltip anchor="publish-show" label="Show Notifications" />
      </h2>

      {alreadySent && (
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
          Notifications last sent {formatCT(show.notifications_sent_at!, 'MMM d, yyyy h:mm a', timezone)}
        </p>
      )}

      {result && <p className="text-sm text-brand-primary dark:text-brand-primary-mid mb-3">{result}</p>}

      {!alreadySent ? (
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {sending ? 'Sending…' : 'Send Notifications to Matching Volunteers'}
        </button>
      ) : confirming ? (
        <div className="space-y-3">
          <p className="text-sm text-dark dark:text-dark-text">
            Notifications were previously sent for this show. Send again to all currently matching volunteers?
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="bg-brand-accent text-white hover:bg-opacity-90 transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {sending ? 'Sending…' : 'Yes, send again'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={sending}
              className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="bg-white dark:bg-dark-surface border border-brand-primary dark:border-brand-primary-mid text-brand-primary dark:text-brand-primary-mid font-semibold px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors"
        >
          Send Again
        </button>
      )}
    </div>
  )
}

function VolunteersTab({
  showId,
  showDates,
  slotClaims,
  attendance,
  canEdit,
  todayCT,
  timezone,
}: {
  showId: string
  showDates: ShowDateWithRoles[]
  slotClaims: SlotClaim[]
  attendance: Record<string, AttendanceRecord>
  canEdit: boolean
  todayCT: string
  timezone: string
}) {
  const router = useRouter()

  const pastDates = showDates.filter((d) => d.show_date < todayCT)
  const futureDates = showDates.filter((d) => d.show_date >= todayCT)
  const defaultDateId = pastDates.length > 0 ? pastDates[pastDates.length - 1].id : (futureDates[0]?.id ?? null)

  const [selectedDateId, setSelectedDateId] = useState<string | null>(defaultDateId)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [bulkMarkingRoleId, setBulkMarkingRoleId] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  if (showDates.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No show dates scheduled.</p>
  }

  const selectedDate = showDates.find((d) => d.id === selectedDateId) ?? showDates[0]
  const isPastSelected = selectedDate.show_date < todayCT

  async function handleAttendanceChange(claim: SlotClaim, newStatus: string) {
    if (!newStatus) return
    setMarkingId(claim.id)
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[claim.id]
      return next
    })
    const result = await markAttendance({
      slotClaimId: claim.id,
      showDateId: claim.show_date_id,
      showId,
      newStatus: newStatus as 'showed' | 'no_show' | 'excused',
    })
    setMarkingId(null)
    if ('error' in result) {
      setRowErrors((prev) => ({ ...prev, [claim.id]: result.error }))
      return
    }
    router.refresh()
  }

  async function handleBulkMark(roleId: string, claimIds: string[]) {
    setBulkMarkingRoleId(roleId)
    await bulkMarkAttendance({
      slotClaimIds: claimIds,
      showDateId: selectedDate.id,
      showId,
      status: 'showed',
    })
    setBulkMarkingRoleId(null)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Show Date</label>
        <select
          value={selectedDate.id}
          onChange={(e) => setSelectedDateId(e.target.value)}
          className={selectClasses}
        >
          {showDates.map((d) => (
            <option key={d.id} value={d.id}>
              {formatWallClockCT(d.show_date, d.show_time, "EEEE, MMMM d, yyyy 'at' h:mm a", timezone)}
              {d.end_time && ` – ${formatWallClockCT(d.show_date, d.end_time, 'h:mm a', timezone)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {selectedDate.roles.map((role) => {
          const claimsForRole = slotClaims.filter(
            (c) =>
              c.volunteer_role_id === role.id && c.show_date_id === selectedDate.id && c.status === 'claimed'
          )
          return (
            <div key={role.id} className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-dark-nav">
                <h3 className="font-bold text-dark dark:text-dark-text">
                  {role.role_name} — {role.slots_available} {role.slots_available === 1 ? 'slot' : 'slots'}
                </h3>
                {canEdit && isPastSelected && claimsForRole.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBulkMark(role.id, claimsForRole.map((c) => c.id))}
                    disabled={bulkMarkingRoleId === role.id}
                    className="text-xs font-semibold border border-brand-primary dark:border-brand-primary-mid text-brand-primary dark:text-brand-primary-mid px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {bulkMarkingRoleId === role.id ? 'Marking…' : 'Mark All Showed'}
                  </button>
                )}
              </div>

              {claimsForRole.length === 0 ? (
                <p className="text-sm text-mid-gray dark:text-dark-muted px-4 py-3 bg-white dark:bg-dark-surface">
                  No volunteers signed up for this role on this date.
                </p>
              ) : (
                <div className="overflow-x-auto bg-white dark:bg-dark-surface">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted">
                        <th className="px-4 py-2 font-semibold">Volunteer Name</th>
                        <th className="px-4 py-2 font-semibold">Email</th>
                        <th className="px-4 py-2 font-semibold">Claimed At</th>
                        <th className="px-4 py-2 font-semibold">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsForRole.map((claim, i) => {
                        const record = attendance[claim.id]
                        return (
                          <tr
                            key={claim.id}
                            className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                          >
                            <td className="px-4 py-2 text-dark dark:text-dark-text align-top">
                              {claim.volunteer_name}
                              {!claim.volunteer_id && (
                                <span className="flex items-center gap-1 text-xs text-brand-accent">
                                  ⚠ No linked volunteer — hours won&apos;t tally
                                  <HelpTooltip anchor="hours" label="Hours Tallying" />
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-dark dark:text-dark-text align-top">{claim.volunteer_email}</td>
                            <td className="px-4 py-2 text-dark dark:text-dark-text align-top">
                              {formatCT(claim.claimed_at, 'MMM d, yyyy h:mm a', timezone)}
                            </td>
                            <td className="px-4 py-2 align-top">
                              {record?.source === 'checkin' && (
                                <span className="block w-fit text-xs px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary dark:text-brand-primary-mid border border-brand-primary/20 dark:border-brand-primary-mid/30 mb-1">
                                  Self Check-In
                                </span>
                              )}
                              {!isPastSelected ? (
                                <span className="text-mid-gray dark:text-dark-muted">—</span>
                              ) : canEdit ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={record?.status ?? ''}
                                    onChange={(e) => handleAttendanceChange(claim, e.target.value)}
                                    disabled={markingId === claim.id}
                                    className={selectClasses}
                                  >
                                    <option value="">—</option>
                                    <option value="showed">Showed</option>
                                    <option value="no_show">No-Show</option>
                                    <option value="excused">Excused</option>
                                  </select>
                                  {markingId === claim.id && (
                                    <Loader2 size={14} className="animate-spin text-mid-gray dark:text-dark-muted" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-dark dark:text-dark-text">
                                  {record ? ATTENDANCE_LABEL[record.status] : '—'}
                                </span>
                              )}
                              {rowErrors[claim.id] && (
                                <p className="text-xs text-brand-accent mt-1">{rowErrors[claim.id]}</p>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WaitlistTab({
  roles,
  slotClaims,
  timezone,
}: {
  roles: ShowRole[]
  slotClaims: SlotClaim[]
  timezone: string
}) {
  const rolesWithWaitlist = roles
    .map((role) => ({
      role,
      claims: slotClaims
        .filter((c) => c.volunteer_role_id === role.id && c.status === 'waitlisted')
        .sort((a, b) => (a.waitlist_position ?? 0) - (b.waitlist_position ?? 0)),
    }))
    .filter((r) => r.claims.length > 0)

  return (
    <div>
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3 flex items-center gap-1.5">
        Waitlist
        <HelpTooltip anchor="waitlist" label="Waitlist" />
      </h2>

      {rolesWithWaitlist.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No volunteers on the waitlist.</p>
      ) : (
        <div className="space-y-6">
          {rolesWithWaitlist.map(({ role, claims }) => (
        <div key={role.id} className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-dark-nav">
            <h3 className="font-bold text-dark dark:text-dark-text">{role.role_name}</h3>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-dark-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted">
                  <th className="px-4 py-2 font-semibold">Position</th>
                  <th className="px-4 py-2 font-semibold">Volunteer Name</th>
                  <th className="px-4 py-2 font-semibold">Email</th>
                  <th className="px-4 py-2 font-semibold">Added At</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim, i) => (
                  <tr
                    key={claim.id}
                    className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                  >
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{claim.waitlist_position ?? '—'}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{claim.volunteer_name}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{claim.volunteer_email}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">
                      {formatCT(claim.claimed_at, 'MMM d, yyyy h:mm a', timezone)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DatesTab({
  showDates,
  todayCT,
  checkinQr,
  dateCheckinQrs,
  timezone,
}: {
  showDates: ShowDateWithRoles[]
  todayCT: string
  checkinQr: { svg: string; pngBase64: string } | null
  dateCheckinQrs: Record<string, { svg: string; pngBase64: string }>
  timezone: string
}) {
  if (showDates.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No show dates scheduled.</p>
  }
  return (
    <div className="space-y-8">
      {checkinQr && (
        <div>
          <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1 flex items-center gap-1.5">
            Whole-Show Check-In QR
            <HelpTooltip anchor="check-in-qr" label="Check-In QR Codes" />
          </h2>
          <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
            Volunteers scan this QR at any performance. The system automatically selects their show date.
          </p>
          <div
            className="w-[200px] h-[200px] [&>svg]:w-full [&>svg]:h-full bg-white p-2 rounded-lg border border-divider dark:border-dark-border"
            dangerouslySetInnerHTML={{ __html: checkinQr.svg }}
          />
          <div className="flex gap-4 mt-3">
            <a
              href={`data:image/png;base64,${checkinQr.pngBase64}`}
              download="checkin-whole-show.png"
              className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
            >
              Download PNG
            </a>
            <a
              href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(checkinQr.svg)}`}
              download="checkin-whole-show.svg"
              className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
            >
              Download SVG
            </a>
          </div>
        </div>
      )}

      <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-gray-50 dark:bg-dark-nav">
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Day of Week</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-surface">
            {showDates.map((d, i) => {
              const isPast = d.show_date < todayCT
              const dateQr = dateCheckinQrs[d.id]
              const rowBg = i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''
              return (
                <Fragment key={d.id}>
                  <tr
                    className={`${rowBg} ${dateQr ? '' : 'border-b'} border-divider dark:border-dark-border last:border-b-0 ${
                      isPast ? 'text-mid-gray dark:text-dark-muted' : 'text-dark dark:text-dark-text'
                    }`}
                  >
                    <td className="px-4 py-2 align-top">{formatWallClockCT(d.show_date, null, 'MMM d, yyyy', timezone)}</td>
                    <td className="px-4 py-2 align-top">
                      {formatWallClockCT(d.show_date, d.show_time, 'h:mm a', timezone)}
                      {d.end_time && ` – ${formatWallClockCT(d.show_date, d.end_time, 'h:mm a', timezone)}`}
                    </td>
                    <td className="px-4 py-2 align-top">{formatWallClockCT(d.show_date, null, 'EEEE', timezone)}</td>
                  </tr>
                  {dateQr && (
                    <tr className={`${rowBg} border-b border-divider dark:border-dark-border last:border-b-0`}>
                      <td colSpan={3} className="px-4 pb-4">
                        <div className="pt-3 border-t border-divider dark:border-dark-border">
                          <p className="text-xs font-semibold text-mid-gray dark:text-dark-muted mb-2">
                            Check-In QR — {formatWallClockCT(d.show_date, null, 'MMM d, yyyy', timezone)}
                          </p>
                          <div
                            className="w-[120px] h-[120px] [&>svg]:w-full [&>svg]:h-full bg-white p-1.5 rounded-lg border border-divider dark:border-dark-border"
                            dangerouslySetInnerHTML={{ __html: dateQr.svg }}
                          />
                          <div className="flex gap-3 mt-2">
                            <a
                              href={`data:image/png;base64,${dateQr.pngBase64}`}
                              download={`checkin-${d.show_date}.png`}
                              className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
                            >
                              Download PNG
                            </a>
                            <a
                              href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(dateQr.svg)}`}
                              download={`checkin-${d.show_date}.svg`}
                              className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
                            >
                              Download SVG
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SettingsTab({
  show,
  showEditors,
  allAdminUsers,
  defaultHours,
  canEdit,
  adminId,
  messagesEnabled,
}: {
  show: Show
  showEditors: ShowEditor[]
  allAdminUsers: AdminUserSummary[]
  defaultHours: { mainstage: number; studio_x: number; one_off: number }
  canEdit: boolean
  adminId: string
  messagesEnabled?: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)

  const [statusValue, setStatusValue] = useState<ShowStatus>(show.status)
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSaved, setStatusSaved] = useState(false)
  const [notify, setNotify] = useState(!show.notifications_sent_at)
  const [notifyResult, setNotifyResult] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const showLivePanel = statusValue === 'live' && statusValue !== show.status

  const resolvedDefaultHours = show.default_hours ?? defaultHours[getLocationHoursBucket(show.location?.name)]

  const assignedIds = new Set(showEditors.map((e) => e.admin_id))
  const searchTerm = search.trim().toLowerCase()
  const searchResults = searchTerm
    ? allAdminUsers.filter(
        (u) =>
          !assignedIds.has(u.id) &&
          (u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm))
      )
    : []

  async function handleAdd(adminId: string) {
    setAddingId(adminId)
    setEditorError(null)
    const result = await addShowEditor(show.id, adminId)
    setAddingId(null)
    if ('error' in result) {
      setEditorError(result.error)
      return
    }
    setSearch('')
    router.refresh()
  }

  async function handleRemove(adminId: string) {
    setRemovingId(adminId)
    setEditorError(null)
    const result = await removeShowEditor(show.id, adminId)
    setRemovingId(null)
    if ('error' in result) {
      setEditorError(result.error)
      return
    }
    router.refresh()
  }

  async function handleSaveStatus() {
    setStatusSaving(true)
    setStatusError(null)
    setStatusSaved(false)
    const result = await updateShowStatus(show.id, statusValue)
    setStatusSaving(false)
    if ('error' in result) {
      setStatusError(result.error)
      return
    }
    setStatusSaved(true)
    router.refresh()
  }

  async function handleConfirmLive() {
    setStatusSaving(true)
    setStatusError(null)
    setStatusSaved(false)
    setNotifyResult(null)

    const result = await updateShowStatus(show.id, 'live')
    if ('error' in result) {
      setStatusSaving(false)
      setStatusError(result.error)
      return
    }

    if (notify) {
      const notifyRes = await sendShowNotifications(show.id)
      if (notifyRes.error) {
        setNotifyResult('Show published — notification send failed. You can retry from the show detail page.')
      } else if (notifyRes.sent === 0) {
        setNotifyResult("No volunteers matched this show's roles.")
      } else {
        setNotifyResult(`Notifications sent to ${notifyRes.sent} matching volunteer(s).`)
      }
    }

    setStatusSaving(false)
    setStatusSaved(true)
    router.refresh()
  }

  function handleCancelLive() {
    setStatusValue(show.status)
    setNotifyResult(null)
  }

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError('')
    const result = await deleteShow(show.id)
    if ('error' in result) {
      setIsDeleting(false)
      setDeleteError(result.error)
      setShowDeleteConfirm(false)
    } else {
      router.push('/crew/shows')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <p className="text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-1">
          Default Hours per Volunteer
        </p>
        <p className="text-dark dark:text-dark-text">{resolvedDefaultHours ?? '—'}</p>
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">Edit via the show edit form.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Assigned Editors</h2>
        {showEditors.length === 0 ? (
          <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">No editors assigned yet.</p>
        ) : (
          <ul className="space-y-2 mb-3">
            {showEditors.map((editor) => (
              <li
                key={editor.admin_id}
                className="flex items-center justify-between bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-dark-text">{editor.name}</p>
                  <p className="text-xs text-mid-gray dark:text-dark-muted">{editor.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase">
                    {editor.role.replace('_', ' ')}
                  </span>
                  {messagesEnabled && editor.admin_id !== adminId && (
                    <Link
                      href={`/crew/messages/compose?to=${editor.admin_id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"
                    >
                      <Mail size={12} />
                      Message
                    </Link>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemove(editor.admin_id)}
                      disabled={removingId === editor.admin_id}
                      className="text-xs font-semibold text-brand-accent hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {removingId === editor.admin_id ? 'Removing…' : 'Remove'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email to add an editor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClasses}
            />
            {searchResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {searchResults.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(u.id)}
                      disabled={addingId === u.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-sm text-dark dark:text-dark-text font-medium">{u.name}</span>
                      <span className="text-xs text-mid-gray dark:text-dark-muted ml-2">{u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {editorError && <p className="text-sm text-brand-accent mt-2">{editorError}</p>}
      </section>

      {canEdit && (
        <section>
          <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Show Status</h2>
          <div className="flex items-center gap-3">
            <select
              value={statusValue}
              onChange={(e) => {
                setStatusValue(e.target.value as ShowStatus)
                setStatusSaved(false)
                setNotifyResult(null)
              }}
              className={selectClasses}
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="past">Past</option>
              <option value="archived">Archived</option>
            </select>
            {!showLivePanel && (
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={statusSaving || statusValue === show.status}
                className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {statusSaving ? 'Saving…' : 'Save Status'}
              </button>
            )}
            {statusSaved && <span className="text-sm text-green-700 dark:text-green-400">Saved</span>}
          </div>
          {statusError && <p className="text-sm text-brand-accent mt-2">{statusError}</p>}

          {showLivePanel && (
            <div className="mt-4 rounded-lg border border-divider dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg/40 p-4 space-y-3 max-w-md">
              <label className="flex items-start gap-2 text-sm text-dark dark:text-dark-text">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="mt-0.5"
                />
                Notify matching volunteers about this show
              </label>
              {notify && show.notifications_sent_at && (
                <p className="text-sm text-brand-accent">
                  Notifications were previously sent for this show. Checking this will send again to all matching
                  volunteers.
                </p>
              )}
              {notifyResult && <p className="text-sm text-brand-primary dark:text-brand-primary-mid">{notifyResult}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmLive}
                  disabled={statusSaving}
                  className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                  {statusSaving ? 'Confirming…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelLive}
                  disabled={statusSaving}
                  className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {canEdit && show.status === 'archived' && (
        <section className="border-l-4 pl-4 py-1" style={{ borderLeftColor: '#ef4444' }}>
          <h3 className="text-sm font-semibold text-red-600 mb-1">Delete Show</h3>
          <p className="text-xs text-mid-gray dark:text-dark-muted mb-3">
            {'Permanently delete this show and all associated data. This cannot be undone.'}
          </p>
          {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Delete Show
          </button>
        </section>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Show?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete "${show.name}" and all associated dates, slot assignments, and calendar events. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogPrimitive.Cancel
              disabled={isDeleting}
              className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              Cancel
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Show'}
            </AlertDialogPrimitive.Action>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ShowDetail({
  show,
  season,
  showDates,
  slotClaims,
  attendance,
  showEditors,
  allAdminUsers,
  defaultHours,
  qr,
  checkinQr,
  dateCheckinQrs,
  adminRole,
  adminId,
  reportData,
  bulkEmailRecipientCount,
  defaultReplyTo,
  defaultSubject,
  messagesEnabled,
}: {
  show: Show
  season: { id: string; name: string } | null
  showDates: ShowDateWithRoles[]
  slotClaims: SlotClaim[]
  attendance: Record<string, AttendanceRecord>
  showEditors: ShowEditor[]
  allAdminUsers: AdminUserSummary[]
  defaultHours: { mainstage: number; studio_x: number; one_off: number }
  qr: { svg: string; pngBase64: string }
  checkinQr: { svg: string; pngBase64: string } | null
  dateCheckinQrs: Record<string, { svg: string; pngBase64: string }>
  adminRole: AdminUser['role']
  adminId: string
  reportData: PostShowReportData | null
  bulkEmailRecipientCount: number
  defaultReplyTo: string
  defaultSubject: string
  messagesEnabled?: boolean
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const canEdit = adminRole === 'super_admin' || adminRole === 'owner_admin' || adminRole === 'editor'
  const todayCT = formatCT(new Date(), 'yyyy-MM-dd', tz)
  const allRoles: ShowRole[] = showDates.flatMap((d) => d.roles)
  const visibleTabs = TABS.filter((tab) => tab.key !== 'report' || show.status === 'past')

  return (
    <div>
      <div className="flex border-b border-divider dark:border-dark-border mb-6 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-brand-primary text-brand-primary dark:text-brand-primary-mid'
                : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          show={show}
          season={season}
          canEdit={canEdit}
          qr={qr}
          bulkEmailRecipientCount={bulkEmailRecipientCount}
          defaultReplyTo={defaultReplyTo}
          defaultSubject={defaultSubject}
          timezone={tz}
        />
      )}
      {activeTab === 'volunteers' && (
        <VolunteersTab
          showId={show.id}
          showDates={showDates}
          slotClaims={slotClaims}
          attendance={attendance}
          canEdit={canEdit}
          todayCT={todayCT}
          timezone={tz}
        />
      )}
      {activeTab === 'waitlist' && <WaitlistTab roles={allRoles} slotClaims={slotClaims} timezone={tz} />}
      {activeTab === 'dates' && (
        <DatesTab
          showDates={showDates}
          todayCT={todayCT}
          checkinQr={checkinQr}
          dateCheckinQrs={dateCheckinQrs}
          timezone={tz}
        />
      )}
      {activeTab === 'report' && show.status === 'past' && reportData && (
        <PostShowReport data={reportData} timezone={tz} />
      )}
      {activeTab === 'settings' && (
        <SettingsTab
          show={show}
          showEditors={showEditors}
          allAdminUsers={allAdminUsers}
          defaultHours={defaultHours}
          canEdit={canEdit}
          adminId={adminId}
          messagesEnabled={messagesEnabled}
        />
      )}
    </div>
  )
}
