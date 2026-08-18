'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { MergeTagExtension } from '@/components/crew/auditions/MergeTagExtension'
import { MERGE_TAGS } from '@/lib/utils/merge-tags'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import {
  updateAudition,
  updateAuditionStatus,
  getAuditionSignups,
  updateAuditionSignupStatus,
  addAuditionNote,
  convertToVolunteer,
  getAuditionMaterialSignedUrl,
  sendAuditionBulkEmail,
  assignProductionUser,
  removeProductionUser,
  createAuditionRole,
  deleteAuditionRole,
  reorderAuditionRoles,
  getAuditionsSelectData,
  saveAuditionEmailTemplate,
  getAuditionEmailTemplates,
  previewAuditionEmailTemplate,
} from '@/lib/actions/auditions-admin'
import type {
  AuditionDetailData,
  AuditionSignupWithDetails,
  AuditionSignupStatus,
  AuditionMaterialType,
  AuditionStatus,
  AuditionType,
  AuditionCalendarVisibility,
  AuditionRole,
  AuditionEmailStatusType,
} from '@/types/audition'
import type { AdminRole } from '@/types/admin'

const EDITOR_TIER_ROLES: AdminRole[] = ['super_admin', 'owner_admin', 'editor']

const MATERIAL_TYPES: { type: AuditionMaterialType; label: string }[] = [
  { type: 'headshot', label: 'Headshot' },
  { type: 'resume', label: 'Resume' },
  { type: 'sheet_music', label: 'Sheet Music' },
  { type: 'mp3', label: 'MP3' },
  { type: 'video', label: 'Video' },
]

const EMAIL_STATUS_TYPES: AuditionEmailStatusType[] = ['callback', 'cast', 'not_cast']
const STATUS_LABELS: Record<AuditionEmailStatusType, string> = {
  callback: 'Callback',
  cast: 'Cast',
  not_cast: 'Not Cast',
}

function auditionTypeLabel(type: string): string {
  return type === 'timed_slots' ? 'Timed Slots' : 'Open Call'
}

function signupStatusBadge(status: AuditionSignupStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted' }
    case 'callback':
      return { label: 'Callback', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
    case 'cast':
      return { label: 'Cast', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'not_cast':
      return { label: 'Not Cast', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    case 'withdrawn':
    default:
      return { label: 'Withdrawn', className: 'bg-gray-100 text-gray-500 dark:bg-dark-border dark:text-dark-muted' }
  }
}

function auditionStatusBadge(status: AuditionStatus) {
  switch (status) {
    case 'draft':
      return { label: 'Draft', className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted' }
    case 'published':
      return {
        label: 'Published',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      }
    case 'closed':
      return {
        label: 'Closed',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      }
    case 'archived':
    default:
      return { label: 'Archived', className: 'bg-gray-100 text-gray-500 dark:bg-dark-border dark:text-dark-muted' }
  }
}

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

const linkClasses = 'text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer'

// ─── Tab 1: Overview ─────────────────────────────────────────────

function OverviewTab({
  detail,
  adminRole,
  checkInQrSvg,
  checkInQrPng,
  timezone,
}: {
  detail: AuditionDetailData
  adminRole: AdminRole
  checkInQrSvg: string
  checkInQrPng: string
  timezone: string
}) {
  const [status, setStatus] = useState<AuditionStatus>(detail.audition.status)
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const canEdit = adminRole !== 'viewer'
  const canArchive = EDITOR_TIER_ROLES.includes(adminRole)
  const badge = auditionStatusBadge(status)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const publicUrl = `${siteUrl}/auditions/${detail.audition.id}`

  async function handleStatusChange(newStatus: AuditionStatus) {
    if (newStatus === 'archived' && !canArchive) return
    setStatusSaving(true)
    setStatusError(null)
    const result = await updateAuditionStatus(detail.audition.id, newStatus)
    setStatusSaving(false)
    if (!result.success) {
      setStatusError(result.error ?? 'Something went wrong.')
      return
    }
    setStatus(newStatus)
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-dark-text">{detail.audition.title}</h2>
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text mt-1">
            {auditionTypeLabel(detail.audition.type)}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">Date(s)</p>
          <p className="text-sm text-dark dark:text-dark-text">
            {formatWallClockCT(detail.audition.date_start, null, 'MMM d, yyyy', timezone)}
            {detail.audition.date_end && detail.audition.date_end !== detail.audition.date_start
              ? ` – ${formatWallClockCT(detail.audition.date_end, null, 'MMM d, yyyy', timezone)}`
              : ''}
          </p>
        </div>

        {(detail.audition.time_start || detail.audition.time_end) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">Time</p>
            <p className="text-sm text-dark dark:text-dark-text">
              {detail.audition.time_start
                ? formatWallClockCT(detail.audition.date_start, detail.audition.time_start, 'h:mm a', timezone)
                : '—'}
              {detail.audition.time_end
                ? ` – ${formatWallClockCT(detail.audition.date_start, detail.audition.time_end, 'h:mm a', timezone)}`
                : ''}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
            Location
          </p>
          <p className="text-sm text-dark dark:text-dark-text">{detail.location?.name ?? 'No location set'}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">Show</p>
          {detail.show ? (
            <Link
              href={`/crew/shows/${detail.show.id}`}
              className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
            >
              {detail.show.name}
            </Link>
          ) : (
            <p className="text-sm text-dark dark:text-dark-text">Standalone audition</p>
          )}
        </div>

        {detail.parent_audition && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
              Callback for
            </p>
            <Link
              href={`/crew/auditions/${detail.parent_audition.id}`}
              className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
            >
              {detail.parent_audition.title}
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
            Status
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>
              {badge.label}
            </span>
            {canEdit && (
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as AuditionStatus)}
                disabled={statusSaving}
                className="rounded-lg border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                {canArchive && <option value="archived">Archived</option>}
              </select>
            )}
          </div>
          {statusError && <p className="text-red-500 text-xs mt-1">{statusError}</p>}
        </div>

        {status === 'published' && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
              Public URL
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text px-2 py-1 rounded break-all">
                {publicUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
            Check-In QR
          </p>
          {/* White container regardless of theme — QR scanability requirement,
              same rule as rehearsal/show check-in QRs. SVG inline for display,
              PNG + SVG download links — matches established ShowDetail /
              RehearsalDetailTabs QR pattern. */}
          <div className="inline-flex flex-col items-start gap-2">
            <div
              className="bg-white p-3 rounded inline-block [&_svg]:w-[120px] [&_svg]:h-[120px]"
              dangerouslySetInnerHTML={{ __html: checkInQrSvg }}
            />
            <div className="flex gap-3 text-xs font-semibold">
              <a
                href={`data:image/png;base64,${checkInQrPng}`}
                download="audition-checkin-qr.png"
                className={linkClasses}
              >
                Download PNG
              </a>
              <a
                href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(checkInQrSvg)}`}
                download="audition-checkin-qr.svg"
                className={linkClasses}
              >
                Download SVG
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Signups ──────────────────────────────────────────────

function SignupsTab({
  auditionType,
  roleSelectionEnabled,
  enabledMaterialTypes,
  signups,
  loading,
  adminRole,
  onReload,
  timezone,
}: {
  auditionType: string
  roleSelectionEnabled: boolean
  enabledMaterialTypes: AuditionMaterialType[]
  signups: AuditionSignupWithDetails[] | null
  loading: boolean
  adminRole: AdminRole
  onReload: () => void
  timezone: string
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [addingNote, setAddingNote] = useState<Record<string, boolean>>({})
  const [statusChanging, setStatusChanging] = useState<Record<string, boolean>>({})
  const [castRoleInputs, setCastRoleInputs] = useState<Record<string, string>>({})
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set())
  const [convertResults, setConvertResults] = useState<Record<string, { volunteerId?: string; error?: string }>>({})
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  const canEdit = EDITOR_TIER_ROLES.includes(adminRole) || adminRole === 'production'
  const canConvert = EDITOR_TIER_ROLES.includes(adminRole)

  function toggleExpand(id: string, signup: AuditionSignupWithDetails) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (!(id in castRoleInputs)) {
          setCastRoleInputs((c) => ({ ...c, [id]: signup.signup.cast_role ?? '' }))
        }
      }
      return next
    })
  }

  async function handleStatusChange(signupId: string, status: AuditionSignupStatus) {
    setStatusChanging((prev) => ({ ...prev, [signupId]: true }))
    setRowErrors((prev) => ({ ...prev, [signupId]: '' }))
    const result = await updateAuditionSignupStatus(signupId, status)
    setStatusChanging((prev) => ({ ...prev, [signupId]: false }))
    if (!result.success) {
      setRowErrors((prev) => ({ ...prev, [signupId]: result.error ?? 'Something went wrong.' }))
      return
    }
    onReload()
  }

  async function handleSaveCastRole(signupId: string, status: AuditionSignupStatus) {
    setStatusChanging((prev) => ({ ...prev, [signupId]: true }))
    setRowErrors((prev) => ({ ...prev, [signupId]: '' }))
    const result = await updateAuditionSignupStatus(signupId, status, castRoleInputs[signupId] ?? '')
    setStatusChanging((prev) => ({ ...prev, [signupId]: false }))
    if (!result.success) {
      setRowErrors((prev) => ({ ...prev, [signupId]: result.error ?? 'Something went wrong.' }))
      return
    }
    onReload()
  }

  async function handleAddNote(signupId: string) {
    const content = (noteInputs[signupId] ?? '').trim()
    if (!content) return
    setAddingNote((prev) => ({ ...prev, [signupId]: true }))
    const result = await addAuditionNote(signupId, content)
    setAddingNote((prev) => ({ ...prev, [signupId]: false }))
    if (!result.success) {
      setRowErrors((prev) => ({ ...prev, [signupId]: result.error ?? 'Something went wrong.' }))
      return
    }
    setNoteInputs((prev) => ({ ...prev, [signupId]: '' }))
    onReload()
  }

  async function handleConvert(signupId: string) {
    const result = await convertToVolunteer(signupId)
    if (!result.success) {
      setConvertResults((prev) => ({ ...prev, [signupId]: { error: result.error ?? 'Something went wrong.' } }))
      return
    }
    setConvertResults((prev) => ({ ...prev, [signupId]: { volunteerId: result.volunteerId } }))
    setConvertingIds((prev) => {
      const next = new Set(prev)
      next.delete(signupId)
      return next
    })
  }

  if (loading) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">Loading signups…</p>
  }

  if (!signups || signups.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No signups yet.</p>
  }

  return (
    <div className="space-y-3">
      {signups.map((s) => {
        const badge = signupStatusBadge(s.signup.status)
        const isExpanded = expandedIds.has(s.signup.id)
        const isConverting = convertingIds.has(s.signup.id)
        const convertResult = convertResults[s.signup.id]

        return (
          <div key={s.signup.id} className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleExpand(s.signup.id, s)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-medium text-dark dark:text-dark-text">{s.signup.name}</span>
                <span className="text-mid-gray dark:text-dark-muted">{s.signup.email}</span>
                {auditionType === 'timed_slots' && s.slot && (
                  <span className="text-mid-gray dark:text-dark-muted">
                    {formatCT(s.slot.start_time, 'MMM d, h:mm a', timezone)}
                  </span>
                )}
                {roleSelectionEnabled && s.role && (
                  <span className="text-mid-gray dark:text-dark-muted">{s.role.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {enabledMaterialTypes.map((type) => {
                  const submitted = s.materials.some((m) => m.material_type === type)
                  return (
                    <span
                      key={type}
                      title={MATERIAL_TYPES.find((m) => m.type === type)?.label}
                      className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                        submitted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-dark-border dark:text-dark-muted'
                      }`}
                    >
                      {submitted ? '✓' : '—'}
                    </span>
                  )
                })}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-divider dark:border-dark-border p-4 space-y-4">
                {rowErrors[s.signup.id] && (
                  <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark">
                    {rowErrors[s.signup.id]}
                  </div>
                )}

                <div className="flex items-start gap-4 flex-wrap">
                  <div>
                    <label className="block text-xs font-semibold text-dark dark:text-dark-text mb-1">Status</label>
                    {canEdit ? (
                      <select
                        value={s.signup.status}
                        disabled={statusChanging[s.signup.id]}
                        onChange={(e) => handleStatusChange(s.signup.id, e.target.value as AuditionSignupStatus)}
                        className={inputClasses}
                      >
                        <option value="pending">Pending</option>
                        <option value="callback">Callback</option>
                        <option value="cast">Cast</option>
                        <option value="not_cast">Not Cast</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    ) : (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex-1 min-w-[180px]">
                      <label className="block text-xs font-semibold text-dark dark:text-dark-text mb-1">
                        Cast Role
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={castRoleInputs[s.signup.id] ?? ''}
                          onChange={(e) => setCastRoleInputs((prev) => ({ ...prev, [s.signup.id]: e.target.value }))}
                          className={inputClasses}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCastRole(s.signup.id, s.signup.status)}
                          disabled={statusChanging[s.signup.id]}
                          className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark dark:text-dark-text mb-1">Notes</label>
                  {s.notes.length === 0 ? (
                    <p className="text-sm text-mid-gray dark:text-dark-muted">No notes yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {s.notes.map((note) => (
                        <li
                          key={note.id}
                          className="text-sm text-dark dark:text-dark-text bg-gray-50 dark:bg-dark-bg rounded-lg p-2"
                        >
                          <p className="text-xs text-mid-gray dark:text-dark-muted">
                            {formatCT(note.created_at, 'MMM d, yyyy h:mm a', timezone)}
                          </p>
                          <p>{note.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {canEdit && (
                    <div className="mt-2 space-y-1.5">
                      <textarea
                        value={noteInputs[s.signup.id] ?? ''}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [s.signup.id]: e.target.value }))}
                        rows={2}
                        placeholder="Add a note…"
                        className={inputClasses}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddNote(s.signup.id)}
                        disabled={addingNote[s.signup.id] || !(noteInputs[s.signup.id] ?? '').trim()}
                        className="text-xs font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {addingNote[s.signup.id] ? 'Saving…' : 'Add Note'}
                      </button>
                    </div>
                  )}
                </div>

                {canConvert && s.signup.status === 'cast' && (
                  <div>
                    {convertResult?.volunteerId ? (
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Volunteer record created.{' '}
                        <Link
                          href={`/crew/volunteers/${convertResult.volunteerId}`}
                          className="font-semibold hover:underline"
                        >
                          View profile →
                        </Link>
                      </p>
                    ) : isConverting ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-dark dark:text-dark-text">
                          Convert this auditioner to a volunteer?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConvert(s.signup.id)}
                          className="text-sm font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConvertingIds((prev) => {
                              const next = new Set(prev)
                              next.delete(s.signup.id)
                              return next
                            })
                          }
                          className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConvertingIds((prev) => {
                            const next = new Set(prev)
                            next.add(s.signup.id)
                            return next
                          })
                        }
                        className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
                      >
                        Convert to Volunteer
                      </button>
                    )}
                    {convertResult?.error && <p className="text-red-500 text-sm mt-1">{convertResult.error}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab 3: Materials ────────────────────────────────────────────

function MaterialsTab({
  signups,
  loading,
  enabledMaterialTypes,
  timezone,
}: {
  signups: AuditionSignupWithDetails[] | null
  loading: boolean
  enabledMaterialTypes: AuditionMaterialType[]
  timezone: string
}) {
  const [filter, setFilter] = useState<AuditionMaterialType | 'all'>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  async function handleDownload(materialId: string) {
    setDownloadingId(materialId)
    setDownloadError(null)
    const result = await getAuditionMaterialSignedUrl(materialId)
    setDownloadingId(null)
    if (!result.url) {
      setDownloadError(result.error ?? 'Failed to generate download link.')
      return
    }
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">Loading materials…</p>
  }

  const allMaterials = (signups ?? []).flatMap((s) =>
    s.materials.map((m) => ({ ...m, auditionerName: s.signup.name }))
  )
  const filtered = filter === 'all' ? allMaterials : allMaterials.filter((m) => m.material_type === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            filter === 'all'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-surface/50'
          }`}
        >
          All
        </button>
        {enabledMaterialTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              filter === type
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-surface/50'
            }`}
          >
            {MATERIAL_TYPES.find((m) => m.type === type)?.label ?? type}
          </button>
        ))}
      </div>

      {downloadError && <p className="text-red-500 text-sm">{downloadError}</p>}

      {filtered.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No materials submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border">
                <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Auditioner
                </th>
                <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Type
                </th>
                <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Filename
                </th>
                <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Uploaded
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-divider dark:border-dark-border last:border-0">
                  <td className="px-2 py-2 text-dark dark:text-dark-text">{m.auditionerName}</td>
                  <td className="px-2 py-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text">
                      {MATERIAL_TYPES.find((t) => t.type === m.material_type)?.label ?? m.material_type}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-dark dark:text-dark-text">{m.original_filename ?? '—'}</td>
                  <td className="px-2 py-2 text-mid-gray dark:text-dark-muted">
                    {formatCT(m.uploaded_at, 'MMM d, yyyy', timezone)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(m.id)}
                      disabled={downloadingId === m.id}
                      className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {downloadingId === m.id ? 'Loading…' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Tab 4: Communication ────────────────────────────────────────

function CommunicationTab({
  auditionId,
  signups,
  loading,
  adminRole,
}: {
  auditionId: string
  signups: AuditionSignupWithDetails[] | null
  loading: boolean
  adminRole: AdminRole
}) {
  const [step, setStep] = useState<'compose' | 'confirm' | 'sent'>('compose')
  const [subject, setSubject] = useState('')
  const [statusFilter, setStatusFilter] = useState<AuditionSignupStatus | 'all'>('all')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sentCount, setSentCount] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: '',
    immediatelyRender: false, // required for Next.js App Router to prevent hydration mismatch
  })

  if (adminRole === 'viewer') {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">Sending email requires Editor access or higher.</p>
  }

  if (loading) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">Loading recipients…</p>
  }

  const eligibleSignups = (signups ?? []).filter((s) => s.signup.status !== 'withdrawn')
  const recipientCount =
    statusFilter === 'all'
      ? eligibleSignups.length
      : eligibleSignups.filter((s) => s.signup.status === statusFilter).length

  function handleReset() {
    setStep('compose')
    setSubject('')
    setStatusFilter('all')
    editor?.commands.clearContent()
    setSendError(null)
  }

  async function handleSend() {
    setSending(true)
    setSendError(null)
    const result = await sendAuditionBulkEmail({
      auditionId,
      subject,
      bodyHtml: editor?.getHTML() ?? '',
      statusFilter: statusFilter === 'all' ? undefined : [statusFilter],
    })
    setSending(false)
    if (!result.success) {
      setSendError(result.error ?? 'Something went wrong sending the email.')
      return
    }
    setSentCount(result.count ?? 0)
    setStep('sent')
  }

  if (step === 'sent') {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-lg font-bold text-dark dark:text-dark-text">
          Email sent to {sentCount} auditioner{sentCount === 1 ? '' : 's'}.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer"
        >
          Send Another
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-dark dark:text-dark-text">Subject:</span>{' '}
            <span className="text-dark dark:text-dark-text">{subject}</span>
          </p>
          <p>
            <span className="font-semibold text-dark dark:text-dark-text">Filter:</span>{' '}
            <span className="text-dark dark:text-dark-text">
              {statusFilter === 'all' ? 'All Signups' : signupStatusBadge(statusFilter).label}
            </span>
          </p>
          <p>
            <span className="font-semibold text-dark dark:text-dark-text">Recipients:</span>{' '}
            <span className="text-dark dark:text-dark-text">{recipientCount}</span>
          </p>
        </div>
        <div className="border border-brand-accent bg-brand-accent-light rounded-lg p-4">
          <p className="text-sm text-dark font-semibold">
            ⚠ This will send {recipientCount} emails. This action {"can't"} be undone.
          </p>
        </div>
        {sendError && <p className="text-red-500 text-sm">{sendError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('compose')}
            className="px-5 py-2 border border-divider dark:border-dark-border rounded-lg text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="px-5 py-2 bg-brand-accent text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Confirm Send'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Send To</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AuditionSignupStatus | 'all')}
          className={inputClasses}
        >
          <option value="all">All Signups</option>
          <option value="pending">Pending</option>
          <option value="callback">Callback</option>
          <option value="cast">Cast</option>
          <option value="not_cast">Not Cast</option>
        </select>
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">{recipientCount} recipients</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Message</label>
        <div className="flex flex-wrap gap-1 p-2 border-b border-divider dark:border-dark-border bg-gray-50 dark:bg-dark-surface rounded-t-md">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs rounded font-bold ${
              editor?.isActive('bold')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs rounded italic ${
              editor?.isActive('italic')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor?.isActive('bulletList')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            • List
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="min-h-[140px] px-3 py-2 text-sm
            text-dark dark:text-dark-text
            bg-white dark:bg-dark-surface
            rounded-b-md border-x border-b
            border-divider dark:border-dark-border
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:min-h-[120px]
            [&_.ProseMirror_p]:mb-3
            [&_.ProseMirror_ul]:list-disc
            [&_.ProseMirror_ul]:pl-5"
        />
      </div>

      {sendError && <p className="text-red-500 text-sm">{sendError}</p>}

      <button
        type="button"
        onClick={() => setStep('confirm')}
        disabled={!subject.trim() || recipientCount === 0}
        className="px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
      >
        Send to {recipientCount} auditioner{recipientCount === 1 ? '' : 's'}
      </button>
    </div>
  )
}

// ─── Tab 5: Settings ─────────────────────────────────────────────

type MaterialToggles = {
  headshot: boolean
  resume: boolean
  sheet_music: boolean
  mp3: boolean
  video: boolean
}

function SettingsTab({
  detail,
  adminRole,
  adminId,
  messagesEnabled,
  selectData,
  settingsLoaded,
  settType,
  setSettType,
  settSlotDuration,
  setSettSlotDuration,
  settSlotsTotal,
  setSettSlotsTotal,
  settSlotCap,
  setSettSlotCap,
  settRoleSelection,
  setSettRoleSelection,
  settMaterials,
  setSettMaterials,
  settCalendarVisibility,
  setSettCalendarVisibility,
  settShowId,
  setSettShowId,
  settParentAuditionId,
  setSettParentAuditionId,
  settSaving,
  setSettSaving,
  settSaveError,
  setSettSaveError,
  settSaveSuccess,
  setSettSaveSuccess,
  roles,
  setRoles,
  newRoleName,
  setNewRoleName,
  addingRole,
  setAddingRole,
  assignments,
  setAssignments,
  assignSearch,
  setAssignSearch,
  assigning,
  setAssigning,
}: {
  detail: AuditionDetailData
  adminRole: AdminRole
  adminId: string
  messagesEnabled?: boolean
  selectData: { shows: { id: string; name: string }[]; otherAuditions: { id: string; title: string }[] } | null
  settingsLoaded: boolean
  settType: AuditionType
  setSettType: (v: AuditionType) => void
  settSlotDuration: number
  setSettSlotDuration: (v: number) => void
  settSlotsTotal: number
  setSettSlotsTotal: (v: number) => void
  settSlotCap: number
  setSettSlotCap: (v: number) => void
  settRoleSelection: boolean
  setSettRoleSelection: (v: boolean) => void
  settMaterials: MaterialToggles
  setSettMaterials: React.Dispatch<React.SetStateAction<MaterialToggles>>
  settCalendarVisibility: AuditionCalendarVisibility
  setSettCalendarVisibility: (v: AuditionCalendarVisibility) => void
  settShowId: string | null
  setSettShowId: (v: string | null) => void
  settParentAuditionId: string | null
  setSettParentAuditionId: (v: string | null) => void
  settSaving: boolean
  setSettSaving: (v: boolean) => void
  settSaveError: string | null
  setSettSaveError: (v: string | null) => void
  settSaveSuccess: boolean
  setSettSaveSuccess: (v: boolean) => void
  roles: AuditionRole[]
  setRoles: React.Dispatch<React.SetStateAction<AuditionRole[]>>
  newRoleName: string
  setNewRoleName: (v: string) => void
  addingRole: boolean
  setAddingRole: (v: boolean) => void
  assignments: AuditionDetailData['assignments']
  setAssignments: React.Dispatch<React.SetStateAction<AuditionDetailData['assignments']>>
  assignSearch: string
  setAssignSearch: (v: string) => void
  assigning: boolean
  setAssigning: (v: boolean) => void
}) {
  const router = useRouter()
  const [assignError, setAssignError] = useState<string | null>(null)
  const [confirmingArchive, setConfirmingArchive] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const canEdit = adminRole !== 'viewer'
  const canManage = EDITOR_TIER_ROLES.includes(adminRole)

  async function handleSaveSettings() {
    setSettSaving(true)
    setSettSaveError(null)
    const result = await updateAudition(detail.audition.id, {
      type: settType,
      slotDurationMinutes: settSlotDuration || null,
      slotsTotal: settSlotsTotal || null,
      slotCap: settSlotCap,
      roleSelectionEnabled: settRoleSelection,
      materialHeadshot: settMaterials.headshot,
      materialResume: settMaterials.resume,
      materialSheetMusic: settMaterials.sheet_music,
      materialMp3: settMaterials.mp3,
      materialVideo: settMaterials.video,
      calendarVisibility: settCalendarVisibility,
      showId: settShowId || null,
      parentAuditionId: settParentAuditionId || null,
    })
    setSettSaving(false)
    if (result.success) {
      setSettSaveSuccess(true)
      setTimeout(() => setSettSaveSuccess(false), 3000)
    } else {
      setSettSaveError(result.error ?? 'Something went wrong.')
    }
  }

  async function handleMoveRole(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= roles.length) return
    const reordered = [...roles]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]
    const result = await reorderAuditionRoles(
      detail.audition.id,
      reordered.map((r) => r.id)
    )
    if (result.success) {
      setRoles(reordered)
    }
  }

  async function handleAddRole() {
    if (!newRoleName.trim() || addingRole) return
    setAddingRole(true)
    const result = await createAuditionRole(detail.audition.id, newRoleName)
    setAddingRole(false)
    if (result.success && result.role) {
      setRoles((prev) => [...prev, result.role as AuditionRole])
      setNewRoleName('')
    }
  }

  async function handleDeleteRole(roleId: string) {
    const result = await deleteAuditionRole(roleId)
    if (result.success) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId))
    }
  }

  async function handleAddAssignment() {
    const adminUserId = assignSearch.trim()
    if (!adminUserId || assigning) return
    setAssigning(true)
    setAssignError(null)
    const result = await assignProductionUser(detail.audition.id, adminUserId)
    setAssigning(false)
    if (result.success) {
      setAssignSearch('')
      router.refresh()
    } else {
      setAssignError(result.error ?? 'Failed to assign user.')
    }
  }

  async function handleRemoveAssignment(adminUserId: string) {
    const result = await removeProductionUser(detail.audition.id, adminUserId)
    if (result.success) {
      setAssignments((prev) => prev.filter((a) => a.admin_user_id !== adminUserId))
    }
  }

  async function handleArchive() {
    setArchiving(true)
    const result = await updateAuditionStatus(detail.audition.id, 'archived')
    setArchiving(false)
    if (result.success) {
      setConfirmingArchive(false)
      router.refresh()
    }
  }

  return (
    <div className="p-4 space-y-8">
      {/* Section 1 — Audition Configuration */}
      <div>
        <h3 className="font-semibold text-dark dark:text-dark-text mb-3">Audition Configuration</h3>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Type</label>
            <select
              value={settType}
              disabled={!canEdit}
              onChange={(e) => setSettType(e.target.value as AuditionType)}
              className={inputClasses}
            >
              <option value="open_call">Open Call</option>
              <option value="timed_slots">Timed Slots</option>
            </select>
          </div>

          {settType === 'timed_slots' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Slot duration (min)
                </label>
                <input
                  type="number"
                  min={1}
                  value={settSlotDuration}
                  disabled={!canEdit}
                  onChange={(e) => setSettSlotDuration(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Total slots
                </label>
                <input
                  type="number"
                  min={1}
                  value={settSlotsTotal}
                  disabled={!canEdit}
                  onChange={(e) => setSettSlotsTotal(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Cap per slot
                </label>
                <input
                  type="number"
                  min={1}
                  value={settSlotCap}
                  disabled={!canEdit}
                  onChange={(e) => setSettSlotCap(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settRoleSelection}
              disabled={!canEdit}
              onChange={(e) => setSettRoleSelection(e.target.checked)}
            />
            <span className="text-sm text-dark dark:text-dark-text">Enable role/character selection</span>
          </label>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Material uploads
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {MATERIAL_TYPES.map((m) => (
                <label key={m.type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settMaterials[m.type]}
                    disabled={!canEdit}
                    onChange={(e) => setSettMaterials((prev) => ({ ...prev, [m.type]: e.target.checked }))}
                  />
                  <span className="text-sm text-dark dark:text-dark-text">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Calendar visibility
            </label>
            <select
              value={settCalendarVisibility}
              disabled={!canEdit}
              onChange={(e) => setSettCalendarVisibility(e.target.value as AuditionCalendarVisibility)}
              className={inputClasses}
            >
              <option value="admin_only">Admin only</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Show link</label>
            {!settingsLoaded ? (
              <select disabled className={inputClasses}>
                <option>Loading…</option>
              </select>
            ) : (
              <select
                value={settShowId ?? ''}
                disabled={!canEdit}
                onChange={(e) => setSettShowId(e.target.value || null)}
                className={inputClasses}
              >
                <option value="">Standalone (no show)</option>
                {selectData?.shows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Parent audition (callback for)
            </label>
            {!settingsLoaded ? (
              <select disabled className={inputClasses}>
                <option>Loading…</option>
              </select>
            ) : (
              <select
                value={settParentAuditionId ?? ''}
                disabled={!canEdit}
                onChange={(e) => setSettParentAuditionId(e.target.value || null)}
                className={inputClasses}
              >
                <option value="">None</option>
                {selectData?.otherAuditions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {canEdit && (
            <div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settSaving}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
              >
                {settSaving ? 'Saving…' : settSaveSuccess ? '✓ Saved' : 'Save Audition Settings'}
              </button>
              {settSaveError && <p className="text-red-500 text-sm mt-1">{settSaveError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Section 2 — Role / Character List */}
      {settRoleSelection && (
        <div>
          <h3 className="font-semibold text-dark dark:text-dark-text mb-1">Audition Roles</h3>
          <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
            Auditioners will choose from these roles when signing up.
          </p>

          {roles.length === 0 ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">No roles added yet.</p>
          ) : (
            <ul className="space-y-1.5 mb-3 max-w-md">
              {roles.map((role, index) => (
                <li
                  key={role.id}
                  className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-dark-bg rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-dark dark:text-dark-text">{role.name}</span>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveRole(index, 'up')}
                        disabled={index === 0}
                        className="text-xs text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text disabled:opacity-30 cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRole(index, 'down')}
                        disabled={index === roles.length - 1}
                        className="text-xs text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text disabled:opacity-30 cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canEdit && (
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="New role name…"
                className={inputClasses}
              />
              <button
                type="button"
                onClick={handleAddRole}
                disabled={!newRoleName.trim() || addingRole}
                className="px-3 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                Add Role
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section 3 — Production User Assignments */}
      {canManage && (
        <div>
          <h3 className="font-semibold text-dark dark:text-dark-text mb-1">Production Access</h3>
          <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
            Production users assigned here have full read/write access to this audition.
          </p>

          {assignments.length === 0 ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">No Production users assigned.</p>
          ) : (
            <ul className="space-y-1.5 mb-3 max-w-md">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-dark-bg rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-dark dark:text-dark-text">
                    {a.admin.full_name}{' '}
                    <span className="text-xs text-mid-gray dark:text-dark-muted">({a.admin.role})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {messagesEnabled && a.admin_user_id !== adminId && (
                      <Link
                        href={`/crew/messages/compose?to=${a.admin_user_id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"
                      >
                        <Mail size={12} />
                        Message
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.admin_user_id)}
                      className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              placeholder="Admin user ID"
              className={inputClasses}
            />
            <button
              type="button"
              onClick={handleAddAssignment}
              disabled={!assignSearch.trim() || assigning}
              className="px-3 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              Add
            </button>
          </div>
          {assignError && <p className="text-red-500 text-sm mt-1">{assignError}</p>}
        </div>
      )}

      {/* Section 4 — Danger Zone */}
      {canManage && detail.audition.status !== 'archived' && (
        <div>
          <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
          {confirmingArchive ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-dark dark:text-dark-text">Archive this audition?</span>
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="text-sm font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {archiving ? 'Archiving…' : 'Confirm Archive'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingArchive(false)}
                className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingArchive(true)}
              className="text-sm font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Archive Audition
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab 6: Email Templates ──────────────────────────────────────

function EmailTemplatesTab({
  detail,
  adminRole,
  notifEnabled,
  setNotifEnabled,
  notifSaving,
  setNotifSaving,
  templateSubjects,
  setTemplateSubjects,
  templateSaving,
  setTemplateSaving,
  templateSaveSuccess,
  setTemplateSaveSuccess,
  templateErrors,
  setTemplateErrors,
  previewing,
  setPreviewing,
  previewHtml,
  setPreviewHtml,
  editorsByStatus,
}: {
  detail: AuditionDetailData
  adminRole: AdminRole
  notifEnabled: boolean
  setNotifEnabled: (v: boolean) => void
  notifSaving: boolean
  setNotifSaving: (v: boolean) => void
  templateSubjects: Record<AuditionEmailStatusType, string>
  setTemplateSubjects: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, string>>>
  templateSaving: Record<AuditionEmailStatusType, boolean>
  setTemplateSaving: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, boolean>>>
  templateSaveSuccess: Record<AuditionEmailStatusType, boolean>
  setTemplateSaveSuccess: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, boolean>>>
  templateErrors: Record<AuditionEmailStatusType, string | null>
  setTemplateErrors: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, string | null>>>
  previewing: Record<AuditionEmailStatusType, boolean>
  setPreviewing: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, boolean>>>
  previewHtml: Record<AuditionEmailStatusType, string | null>
  setPreviewHtml: React.Dispatch<React.SetStateAction<Record<AuditionEmailStatusType, string | null>>>
  editorsByStatus: Record<AuditionEmailStatusType, Editor | null>
}) {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-dark dark:text-dark-text mb-1">Email Templates</h3>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
        Configure automatic emails sent when an {"auditioner's"} status changes.
      </p>

      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          id="notif-enabled"
          checked={notifEnabled}
          disabled={notifSaving || adminRole === 'viewer'}
          onChange={async (e) => {
            const val = e.target.checked
            setNotifEnabled(val)
            setNotifSaving(true)
            await updateAudition(detail.audition.id, { notificationEmailsEnabled: val })
            setNotifSaving(false)
          }}
        />
        <label htmlFor="notif-enabled" className="font-medium text-dark dark:text-dark-text">
          Automatically send emails on status change
        </label>
      </div>
      {notifEnabled && (
        <p className="text-sm text-amber-700 mb-6 bg-amber-50 border border-amber-200 rounded p-3">
          {"When enabled, changing an auditioner's status will automatically send the configured template for that status. If no template is saved for a status, no email will be sent."}
        </p>
      )}

      {EMAIL_STATUS_TYPES.map((statusType) => {
        const editor = editorsByStatus[statusType]
        const label = STATUS_LABELS[statusType]

        return (
          <div key={statusType} className="mb-8 border border-divider dark:border-dark-border rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-dark-bg px-4 py-3 border-b border-divider dark:border-dark-border">
              <h4 className="font-medium text-dark dark:text-dark-text">{label} Email</h4>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-dark-text mb-1">Subject</label>
                <input
                  type="text"
                  value={templateSubjects[statusType]}
                  onChange={(e) =>
                    setTemplateSubjects((prev) => ({ ...prev, [statusType]: e.target.value }))
                  }
                  placeholder={`${label} email subject…`}
                  className={inputClasses}
                  disabled={adminRole === 'viewer'}
                />
              </div>

              {adminRole !== 'viewer' && (
                <div>
                  <p className="text-xs text-mid-gray dark:text-dark-muted mb-1">Insert merge tag:</p>
                  <div className="flex flex-wrap gap-1">
                    {MERGE_TAGS.map(({ tag, label: tagLabel }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (editor) {
                            editor.commands.insertMergeTag(tag)
                            editor.commands.focus()
                          }
                        }}
                        disabled={!editor}
                        className="text-xs px-2 py-1 rounded border border-divider dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border text-mid-gray dark:text-dark-muted disabled:opacity-50 cursor-pointer"
                      >
                        {tagLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-divider dark:border-dark-border rounded">
                {editor ? (
                  <EditorContent
                    editor={editor}
                    className="min-h-[120px] px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror_p]:mb-3 [&_.merge-tag-pill]:mx-0.5"
                  />
                ) : (
                  <div className="p-3 text-mid-gray dark:text-dark-muted text-sm">Loading editor…</div>
                )}
              </div>

              {adminRole !== 'viewer' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={templateSaving[statusType]}
                    onClick={async () => {
                      if (!editor) return
                      setTemplateSaving((prev) => ({ ...prev, [statusType]: true }))
                      setTemplateErrors((prev) => ({ ...prev, [statusType]: null }))
                      const result = await saveAuditionEmailTemplate({
                        auditionId: detail.audition.id,
                        statusType,
                        subject: templateSubjects[statusType],
                        bodyHtml: editor.getHTML(),
                      })
                      setTemplateSaving((prev) => ({ ...prev, [statusType]: false }))
                      if (result.success) {
                        setTemplateSaveSuccess((prev) => ({ ...prev, [statusType]: true }))
                        setTimeout(
                          () => setTemplateSaveSuccess((prev) => ({ ...prev, [statusType]: false })),
                          2000
                        )
                      } else {
                        setTemplateErrors((prev) => ({ ...prev, [statusType]: result.error ?? 'Save failed' }))
                      }
                    }}
                    className="px-3 py-2 text-sm rounded bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {templateSaving[statusType]
                      ? 'Saving...'
                      : templateSaveSuccess[statusType]
                        ? '✓ Saved'
                        : 'Save template'}
                  </button>

                  <button
                    type="button"
                    disabled={previewing[statusType] || !editor}
                    onClick={async () => {
                      if (!editor) return
                      setPreviewing((prev) => ({ ...prev, [statusType]: true }))
                      const result = await previewAuditionEmailTemplate(
                        detail.audition.id,
                        templateSubjects[statusType],
                        editor.getHTML()
                      )
                      setPreviewing((prev) => ({ ...prev, [statusType]: false }))
                      if (result.previewHtml) {
                        setPreviewHtml((prev) => ({ ...prev, [statusType]: result.previewHtml }))
                      }
                    }}
                    className="px-3 py-2 text-sm rounded border border-divider dark:border-dark-border text-mid-gray dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {previewing[statusType] ? 'Loading...' : 'Preview'}
                  </button>
                </div>
              )}

              {templateErrors[statusType] && <p className="text-sm text-red-600">{templateErrors[statusType]}</p>}

              {previewHtml[statusType] && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-mid-gray dark:text-dark-muted">
                      Email Preview (sample data)
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewHtml((prev) => ({ ...prev, [statusType]: null }))}
                      className="text-xs text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="border border-divider dark:border-dark-border rounded overflow-hidden text-sm">
                    {/* dangerouslySetInnerHTML is safe here: content is from
                        previewAuditionEmailTemplate() server action, which builds
                        HTML from our own template system with escaped user values. */}
                    <div dangerouslySetInnerHTML={{ __html: previewHtml[statusType]! }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────

type TabKey = 'overview' | 'signups' | 'materials' | 'communication' | 'templates' | 'settings'

export default function AuditionDetailTabs({
  detail,
  adminRole,
  adminId,
  checkInQrSvg,
  checkInQrPng,
  messagesEnabled,
}: {
  detail: AuditionDetailData
  adminRole: AdminRole
  adminId: string
  checkInQrSvg: string
  checkInQrPng: string
  messagesEnabled?: boolean
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [signups, setSignups] = useState<AuditionSignupWithDetails[] | null>(null)
  const [signupsLoading, setSignupsLoading] = useState(false)

  // Settings tab — data
  const [selectData, setSelectData] = useState<{
    shows: { id: string; name: string }[]
    otherAuditions: { id: string; title: string }[]
  } | null>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Settings tab — form fields (initialized from detail)
  const [settType, setSettType] = useState<AuditionType>(detail.audition.type)
  const [settSlotDuration, setSettSlotDuration] = useState(detail.audition.slot_duration_minutes ?? 30)
  const [settSlotsTotal, setSettSlotsTotal] = useState(detail.audition.slots_total ?? 1)
  const [settSlotCap, setSettSlotCap] = useState(detail.audition.slot_cap)
  const [settRoleSelection, setSettRoleSelection] = useState(detail.audition.role_selection_enabled)
  const [settMaterials, setSettMaterials] = useState<MaterialToggles>({
    headshot: detail.audition.material_headshot,
    resume: detail.audition.material_resume,
    sheet_music: detail.audition.material_sheet_music,
    mp3: detail.audition.material_mp3,
    video: detail.audition.material_video,
  })
  const [settCalendarVisibility, setSettCalendarVisibility] = useState<AuditionCalendarVisibility>(
    detail.audition.calendar_visibility
  )
  const [settShowId, setSettShowId] = useState<string | null>(detail.audition.show_id)
  const [settParentAuditionId, setSettParentAuditionId] = useState<string | null>(detail.audition.parent_audition_id)
  const [settSaving, setSettSaving] = useState(false)
  const [settSaveError, setSettSaveError] = useState<string | null>(null)
  const [settSaveSuccess, setSettSaveSuccess] = useState(false)

  // Roles management state
  const [roles, setRoles] = useState<AuditionRole[]>(detail.roles)
  const [newRoleName, setNewRoleName] = useState('')
  const [addingRole, setAddingRole] = useState(false)

  // Production assignments state
  const [assignments, setAssignments] = useState(detail.assignments)
  const [assignSearch, setAssignSearch] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Email Templates tab state
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(detail.audition.notification_emails_enabled)
  const [notifSaving, setNotifSaving] = useState(false)
  const [templateSubjects, setTemplateSubjects] = useState<Record<AuditionEmailStatusType, string>>({
    callback: '',
    cast: '',
    not_cast: '',
  })
  const [templateSaving, setTemplateSaving] = useState<Record<AuditionEmailStatusType, boolean>>({
    callback: false,
    cast: false,
    not_cast: false,
  })
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState<Record<AuditionEmailStatusType, boolean>>({
    callback: false,
    cast: false,
    not_cast: false,
  })
  const [templateErrors, setTemplateErrors] = useState<Record<AuditionEmailStatusType, string | null>>({
    callback: null,
    cast: null,
    not_cast: null,
  })
  const [previewing, setPreviewing] = useState<Record<AuditionEmailStatusType, boolean>>({
    callback: false,
    cast: false,
    not_cast: false,
  })
  const [previewHtml, setPreviewHtml] = useState<Record<AuditionEmailStatusType, string | null>>({
    callback: null,
    cast: null,
    not_cast: null,
  })

  // Three TipTap instances — hooks, must live at component top level, not
  // inside a conditional. immediatelyRender: false required for Next.js
  // App Router (same requirement as CommunicationTab's editor above and
  // BlastComposer.tsx).
  const callbackEditor = useEditor({
    extensions: [StarterKit, MergeTagExtension],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm min-h-[120px] p-3 focus:outline-none',
      },
    },
  })

  const castEditor = useEditor({
    extensions: [StarterKit, MergeTagExtension],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm min-h-[120px] p-3 focus:outline-none',
      },
    },
  })

  const notCastEditor = useEditor({
    extensions: [StarterKit, MergeTagExtension],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm min-h-[120px] p-3 focus:outline-none',
      },
    },
  })

  const editorsByStatus: Record<AuditionEmailStatusType, Editor | null> = {
    callback: callbackEditor,
    cast: castEditor,
    not_cast: notCastEditor,
  }

  const enabledMaterialTypes: AuditionMaterialType[] = []
  if (detail.audition.material_headshot) enabledMaterialTypes.push('headshot')
  if (detail.audition.material_resume) enabledMaterialTypes.push('resume')
  if (detail.audition.material_sheet_music) enabledMaterialTypes.push('sheet_music')
  if (detail.audition.material_mp3) enabledMaterialTypes.push('mp3')
  if (detail.audition.material_video) enabledMaterialTypes.push('video')

  const loadSignups = useCallback(() => {
    setSignupsLoading(true)
    getAuditionSignups(detail.audition.id).then((result) => {
      setSignups(result)
      setSignupsLoading(false)
    })
  }, [detail.audition.id])

  async function loadSettingsData() {
    if (settingsLoaded) return
    const data = await getAuditionsSelectData(detail.audition.id)
    setSelectData(data)
    setSettingsLoaded(true)
  }

  async function loadTemplates() {
    if (templatesLoaded) return
    const data = await getAuditionEmailTemplates(detail.audition.id)
    setTemplatesLoaded(true)

    // Sync fetched content into the editors + subject fields here, in the
    // same async handler that triggered the fetch — not in a reactive
    // useEffect keyed on fetched data, which the react-hooks/set-state-
    // in-effect rule flags as a cascading-render anti-pattern. loadTemplates()
    // only ever runs once (guarded above), so there is nothing to "keep in
    // sync" across renders — this is a one-time initialization, not an
    // ongoing subscription.
    const cb = data.find((t) => t.status_type === 'callback')
    if (cb) {
      callbackEditor?.commands.setContent(cb.body_html || '')
      setTemplateSubjects((prev) => ({ ...prev, callback: cb.subject || '' }))
    }
    const cast = data.find((t) => t.status_type === 'cast')
    if (cast) {
      castEditor?.commands.setContent(cast.body_html || '')
      setTemplateSubjects((prev) => ({ ...prev, cast: cast.subject || '' }))
    }
    const nc = data.find((t) => t.status_type === 'not_cast')
    if (nc) {
      notCastEditor?.commands.setContent(nc.body_html || '')
      setTemplateSubjects((prev) => ({ ...prev, not_cast: nc.subject || '' }))
    }
  }

  // Materials and Communication tabs reuse the Signups tab's fetch — shared
  // state lifted here rather than re-fetching per tab. Fetch is triggered
  // from the tab click itself (not a reactive effect) — same pattern as
  // RehearsalDetailTabs.tsx's per-row fetchRoster()/fetchAttendance().
  function handleTabClick(tab: TabKey) {
    setActiveTab(tab)
    if ((tab === 'signups' || tab === 'materials' || tab === 'communication') && signups === null && !signupsLoading) {
      loadSignups()
    }
    if (tab === 'settings' && !settingsLoaded) {
      loadSettingsData()
    }
    if (tab === 'templates' && !templatesLoaded) {
      loadTemplates()
    }
  }

  const tabClasses = (tab: TabKey) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
      activeTab === tab
        ? 'border-brand-primary text-brand-primary dark:text-brand-primary-mid'
        : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
    }`

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg">
      <div className="flex border-b border-divider dark:border-dark-border px-2 overflow-x-auto">
        <button type="button" onClick={() => handleTabClick('overview')} className={tabClasses('overview')}>
          Overview
        </button>
        <button type="button" onClick={() => handleTabClick('signups')} className={tabClasses('signups')}>
          <span className="inline-flex items-center gap-1.5">
            Signups
            <HelpTooltip anchor="auditions-signups" label="Signups" />
          </span>
        </button>
        <button type="button" onClick={() => handleTabClick('materials')} className={tabClasses('materials')}>
          <span className="inline-flex items-center gap-1.5">
            Materials
            <HelpTooltip anchor="auditions-materials" label="Materials" />
          </span>
        </button>
        <button type="button" onClick={() => handleTabClick('communication')} className={tabClasses('communication')}>
          Communication
        </button>
        <button type="button" onClick={() => handleTabClick('templates')} className={tabClasses('templates')}>
          Email Templates
        </button>
        <button type="button" onClick={() => handleTabClick('settings')} className={tabClasses('settings')}>
          Settings
        </button>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="p-4">
            <OverviewTab
              detail={detail}
              adminRole={adminRole}
              checkInQrSvg={checkInQrSvg}
              checkInQrPng={checkInQrPng}
              timezone={tz}
            />
          </div>
        )}
        {activeTab === 'signups' && (
          <div className="p-4">
            <SignupsTab
              auditionType={detail.audition.type}
              roleSelectionEnabled={detail.audition.role_selection_enabled}
              enabledMaterialTypes={enabledMaterialTypes}
              signups={signups}
              loading={signupsLoading}
              adminRole={adminRole}
              onReload={loadSignups}
              timezone={tz}
            />
          </div>
        )}
        {activeTab === 'materials' && (
          <div className="p-4">
            <MaterialsTab
              signups={signups}
              loading={signupsLoading}
              enabledMaterialTypes={enabledMaterialTypes}
              timezone={tz}
            />
          </div>
        )}
        {activeTab === 'communication' && (
          <div className="p-4">
            <CommunicationTab
              auditionId={detail.audition.id}
              signups={signups}
              loading={signupsLoading}
              adminRole={adminRole}
            />
          </div>
        )}
        {activeTab === 'templates' && (
          <EmailTemplatesTab
            detail={detail}
            adminRole={adminRole}
            notifEnabled={notifEnabled}
            setNotifEnabled={setNotifEnabled}
            notifSaving={notifSaving}
            setNotifSaving={setNotifSaving}
            templateSubjects={templateSubjects}
            setTemplateSubjects={setTemplateSubjects}
            templateSaving={templateSaving}
            setTemplateSaving={setTemplateSaving}
            templateSaveSuccess={templateSaveSuccess}
            setTemplateSaveSuccess={setTemplateSaveSuccess}
            templateErrors={templateErrors}
            setTemplateErrors={setTemplateErrors}
            previewing={previewing}
            setPreviewing={setPreviewing}
            previewHtml={previewHtml}
            setPreviewHtml={setPreviewHtml}
            editorsByStatus={editorsByStatus}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            detail={detail}
            adminRole={adminRole}
            adminId={adminId}
            messagesEnabled={messagesEnabled}
            selectData={selectData}
            settingsLoaded={settingsLoaded}
            settType={settType}
            setSettType={setSettType}
            settSlotDuration={settSlotDuration}
            setSettSlotDuration={setSettSlotDuration}
            settSlotsTotal={settSlotsTotal}
            setSettSlotsTotal={setSettSlotsTotal}
            settSlotCap={settSlotCap}
            setSettSlotCap={setSettSlotCap}
            settRoleSelection={settRoleSelection}
            setSettRoleSelection={setSettRoleSelection}
            settMaterials={settMaterials}
            setSettMaterials={setSettMaterials}
            settCalendarVisibility={settCalendarVisibility}
            setSettCalendarVisibility={setSettCalendarVisibility}
            settShowId={settShowId}
            setSettShowId={setSettShowId}
            settParentAuditionId={settParentAuditionId}
            setSettParentAuditionId={setSettParentAuditionId}
            settSaving={settSaving}
            setSettSaving={setSettSaving}
            settSaveError={settSaveError}
            setSettSaveError={setSettSaveError}
            settSaveSuccess={settSaveSuccess}
            setSettSaveSuccess={setSettSaveSuccess}
            roles={roles}
            setRoles={setRoles}
            newRoleName={newRoleName}
            setNewRoleName={setNewRoleName}
            addingRole={addingRole}
            setAddingRole={setAddingRole}
            assignments={assignments}
            setAssignments={setAssignments}
            assignSearch={assignSearch}
            setAssignSearch={setAssignSearch}
            assigning={assigning}
            setAssigning={setAssigning}
          />
        )}
      </div>
    </div>
  )
}
