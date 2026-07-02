'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import { markAttendance, bulkMarkAttendance } from '@/lib/actions/attendance'
import { addShowEditor, removeShowEditor, updateShowStatus } from '@/lib/actions/shows'
import {
  SHOW_TYPE_LABEL,
  SHOW_TYPE_BADGE,
  SHOW_STATUS_LABEL,
  SHOW_STATUS_BADGE,
} from '@/lib/utils/showDisplay'
import type { AdminUser } from '@/lib/auth'
import type {
  Show,
  ShowDate,
  ShowRole,
  SlotClaim,
  AttendanceRecord,
  ShowEditor,
  AdminUserSummary,
  ShowStatus,
} from '@/types/show'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const selectClasses =
  'rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'

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
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

function OverviewTab({
  show,
  season,
  canEdit,
  qr,
}: {
  show: Show
  season: { id: string; name: string } | null
  canEdit: boolean
  qr: { svg: string; pngBase64: string }
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
          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${SHOW_TYPE_BADGE[show.show_type]}`}>
            {SHOW_TYPE_LABEL[show.show_type]}
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
          <blockquote className="border-l-4 border-steel bg-light-navy dark:bg-dark-surface rounded-r-lg p-4 text-dark dark:text-dark-text">
            {show.volunteer_instructions}
          </blockquote>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-dark dark:text-dark-text font-mono bg-light-navy dark:bg-dark-surface px-3 py-1.5 rounded break-all">
          {publicUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => window.open(`/shows/${show.id}`, '_blank', 'noopener,noreferrer')}
          className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
        >
          View
        </button>
      </div>

      {canEdit && (
        <Link
          href={`/crew/shows/${show.id}/edit`}
          className="inline-block bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
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
            className="text-sm font-semibold text-navy dark:text-steel hover:underline"
          >
            Download PNG
          </a>
          <a
            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.svg)}`}
            download={`${slug}-qr.svg`}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline"
          >
            Download SVG
          </a>
        </div>
      </div>
    </div>
  )
}

function VolunteersTab({
  showId,
  showDates,
  roles,
  slotClaims,
  attendance,
  canEdit,
  todayCT,
}: {
  showId: string
  showDates: ShowDate[]
  roles: ShowRole[]
  slotClaims: SlotClaim[]
  attendance: Record<string, AttendanceRecord>
  canEdit: boolean
  todayCT: string
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
              {formatWallClockCT(d.show_date, d.show_time, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {roles.map((role) => {
          const claimsForRole = slotClaims.filter(
            (c) =>
              c.volunteer_role_id === role.id && c.show_date_id === selectedDate.id && c.status === 'claimed'
          )
          return (
            <div key={role.id} className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-light-navy dark:bg-dark-nav">
                <h3 className="font-bold text-dark dark:text-dark-text">
                  {role.role_name} — {role.slots_available} {role.slots_available === 1 ? 'slot' : 'slots'}
                </h3>
                {canEdit && isPastSelected && claimsForRole.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBulkMark(role.id, claimsForRole.map((c) => c.id))}
                    disabled={bulkMarkingRoleId === role.id}
                    className="text-xs font-semibold border border-navy dark:border-steel text-navy dark:text-steel px-3 py-1.5 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
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
                                <span className="block text-xs text-orange">
                                  ⚠ No linked volunteer — hours won&apos;t tally
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-dark dark:text-dark-text align-top">{claim.volunteer_email}</td>
                            <td className="px-4 py-2 text-dark dark:text-dark-text align-top">
                              {formatCT(claim.claimed_at, 'MMM d, yyyy h:mm a')}
                            </td>
                            <td className="px-4 py-2 align-top">
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
                                <p className="text-xs text-orange mt-1">{rowErrors[claim.id]}</p>
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

function WaitlistTab({ roles, slotClaims }: { roles: ShowRole[]; slotClaims: SlotClaim[] }) {
  const rolesWithWaitlist = roles
    .map((role) => ({
      role,
      claims: slotClaims
        .filter((c) => c.volunteer_role_id === role.id && c.status === 'waitlisted')
        .sort((a, b) => (a.waitlist_position ?? 0) - (b.waitlist_position ?? 0)),
    }))
    .filter((r) => r.claims.length > 0)

  if (rolesWithWaitlist.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No volunteers on the waitlist.</p>
  }

  return (
    <div className="space-y-6">
      {rolesWithWaitlist.map(({ role, claims }) => (
        <div key={role.id} className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-light-navy dark:bg-dark-nav">
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
                      {formatCT(claim.claimed_at, 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function DatesTab({ showDates, todayCT }: { showDates: ShowDate[]; todayCT: string }) {
  if (showDates.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No show dates scheduled.</p>
  }
  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Time</th>
            <th className="px-4 py-2 font-semibold">Day of Week</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-surface">
          {showDates.map((d, i) => {
            const isPast = d.show_date < todayCT
            return (
              <tr
                key={d.id}
                className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0 ${
                  isPast ? 'text-mid-gray dark:text-dark-muted' : 'text-dark dark:text-dark-text'
                }`}
              >
                <td className="px-4 py-2">{formatWallClockCT(d.show_date, null, 'MMM d, yyyy')}</td>
                <td className="px-4 py-2">{formatWallClockCT(d.show_date, d.show_time, 'h:mm a')}</td>
                <td className="px-4 py-2">{formatWallClockCT(d.show_date, null, 'EEEE')}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SettingsTab({
  show,
  showEditors,
  allAdminUsers,
  canEdit,
}: {
  show: Show
  showEditors: ShowEditor[]
  allAdminUsers: AdminUserSummary[]
  canEdit: boolean
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

  return (
    <div className="space-y-8 max-w-2xl">
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
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemove(editor.admin_id)}
                      disabled={removingId === editor.admin_id}
                      className="text-xs font-semibold text-orange hover:underline disabled:opacity-50 cursor-pointer"
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
                      className="w-full text-left px-4 py-2 hover:bg-light-navy dark:hover:bg-dark-bg transition-colors cursor-pointer disabled:opacity-50"
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
        {editorError && <p className="text-sm text-orange mt-2">{editorError}</p>}
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
              }}
              className={selectClasses}
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="past">Past</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={statusSaving || statusValue === show.status}
              className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {statusSaving ? 'Saving…' : 'Save Status'}
            </button>
            {statusSaved && <span className="text-sm text-green-700 dark:text-green-400">Saved</span>}
          </div>
          {statusError && <p className="text-sm text-orange mt-2">{statusError}</p>}
        </section>
      )}
    </div>
  )
}

export default function ShowDetail({
  show,
  season,
  showDates,
  roles,
  slotClaims,
  attendance,
  showEditors,
  allAdminUsers,
  qr,
  adminRole,
}: {
  show: Show
  season: { id: string; name: string } | null
  showDates: ShowDate[]
  roles: ShowRole[]
  slotClaims: SlotClaim[]
  attendance: Record<string, AttendanceRecord>
  showEditors: ShowEditor[]
  allAdminUsers: AdminUserSummary[]
  defaultHours: { mainstage: number; studio_x: number; one_off: number }
  qr: { svg: string; pngBase64: string }
  adminRole: AdminUser['role']
  adminId: string
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const canEdit = adminRole === 'super_admin' || adminRole === 'editor'
  const todayCT = formatCT(new Date(), 'yyyy-MM-dd')

  return (
    <div>
      <div className="flex border-b border-divider dark:border-dark-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-navy text-navy dark:text-steel'
                : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab show={show} season={season} canEdit={canEdit} qr={qr} />
      )}
      {activeTab === 'volunteers' && (
        <VolunteersTab
          showId={show.id}
          showDates={showDates}
          roles={roles}
          slotClaims={slotClaims}
          attendance={attendance}
          canEdit={canEdit}
          todayCT={todayCT}
        />
      )}
      {activeTab === 'waitlist' && <WaitlistTab roles={roles} slotClaims={slotClaims} />}
      {activeTab === 'dates' && <DatesTab showDates={showDates} todayCT={todayCT} />}
      {activeTab === 'settings' && (
        <SettingsTab show={show} showEditors={showEditors} allAdminUsers={allAdminUsers} canEdit={canEdit} />
      )}
    </div>
  )
}
