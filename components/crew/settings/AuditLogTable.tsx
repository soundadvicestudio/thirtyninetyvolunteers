'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { formatCT } from '@/lib/utils/date'

export type AuditLogEntry = {
  id: string
  action: string
  target_type: string
  target_id: string | null
  before_value: Record<string, unknown> | null
  after_value: Record<string, unknown> | null
  created_at: string
  admin: { id: string; name: string; role: string } | null
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  'volunteer.update': 'Profile updated',
  'volunteer.archive': 'Volunteer archived',
  'volunteer.unarchive': 'Volunteer unarchived',
  'volunteer.note.add': 'Note added',
  'volunteer.note.edit': 'Note edited',
  'volunteer.note.delete': 'Note deleted',
  'volunteer.hours_add': 'Hours added',
  'show.create': 'Show created',
  'show.update': 'Show updated',
  'show.status_change': 'Show status changed',
  'show.editor_add': 'Show editor added',
  'show.editor_remove': 'Show editor removed',
  'season.create': 'Season created',
  'category.create': 'Category created',
  'category.rename': 'Category renamed',
  'category.reorder': 'Category reordered',
  'category.visibility': 'Category visibility toggled',
  'user.create': 'User created',
  'user.deactivate': 'User deactivated',
  'user.reactivate': 'User reactivated',
  'user.role_change': 'User role changed',
  'user.decline_registration': 'Registration declined',
  'user.password_change': 'Password changed',
  'opportunity.create': 'Opportunity created',
  'opportunity.update': 'Opportunity updated',
  'opportunity.archive': 'Opportunity archived',
  'opportunity.reactivate': 'Opportunity reactivated',
  'opportunity.submission': 'Opportunity submission (public)',
  'form.create': 'Form created',
  'form.update': 'Form updated',
  'attendance.mark': 'Attendance marked',
  'attendance.hours_confirm': 'Hours confirmed',
  'slot_claim.cancel': 'Slot claim cancelled',
  'milestone.acknowledge': 'Milestone acknowledged',
  'settings.update': 'Setting changed',
  'hearing_options.create': 'Hearing option created',
  'hearing_options.update': 'Hearing option updated',
  'hearing_options.reorder': 'Hearing options reordered',
  'hearing_options.deactivate': 'Hearing option deactivated',
}

function actionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action
}

function targetLink(targetType: string, targetId: string | null): string | null {
  if (!targetId) return null
  switch (targetType) {
    case 'volunteer':
      return `/crew/volunteers/${targetId}`
    case 'show':
      return `/crew/shows/${targetId}`
    case 'form':
      return `/crew/forms/${targetId}`
    case 'opportunity':
      return `/crew/shows/opportunities/${targetId}`
    default:
      return null
  }
}

function truncateId(id: string | null): string {
  if (!id) return '—'
  return id.length === 36 ? id.slice(0, 8) : id
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') {
    const json = JSON.stringify(value)
    return json.length > 200 ? `${json.slice(0, 200)}…` : json
  }
  return String(value)
}

type DiffRow = { key: string; before: unknown; after: unknown; type: 'added' | 'removed' | 'changed' }

function computeDiff(before: Record<string, unknown> | null, after: Record<string, unknown> | null): DiffRow[] {
  const allKeys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])
  const rows: DiffRow[] = []

  for (const key of allKeys) {
    const hasBefore = !!before && key in before
    const hasAfter = !!after && key in after
    const beforeVal = before?.[key]
    const afterVal = after?.[key]

    if (hasAfter && !hasBefore) {
      rows.push({ key, before: undefined, after: afterVal, type: 'added' })
    } else if (hasBefore && !hasAfter) {
      rows.push({ key, before: beforeVal, after: undefined, type: 'removed' })
    } else if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      rows.push({ key, before: beforeVal, after: afterVal, type: 'changed' })
    }
    // else: unchanged — skip
  }

  return rows
}

function DiffPanel({ entry }: { entry: AuditLogEntry }) {
  const diff = computeDiff(entry.before_value, entry.after_value)

  if (diff.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted px-4 py-3">No field-level changes recorded.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider dark:border-dark-border text-left">
            <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Field</th>
            <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Before</th>
            <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">After</th>
          </tr>
        </thead>
        <tbody>
          {diff.map((row) => (
            <tr key={row.key} className="border-b border-divider dark:border-dark-border last:border-0">
              <td className="px-4 py-2 text-dark dark:text-dark-text font-medium">{row.key}</td>
              <td className={`px-4 py-2 ${row.type === 'removed' ? 'text-orange' : 'text-mid-gray dark:text-dark-muted'}`}>
                {formatDiffValue(row.before)}
              </td>
              <td
                className={`px-4 py-2 ${
                  row.type === 'added' || row.type === 'changed'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-mid-gray dark:text-dark-muted'
                }`}
              >
                {formatDiffValue(row.after)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleExpand(id: string) {
    setExpandedId((current) => (current === id ? null : id))
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider dark:border-dark-border text-left">
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Date</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Admin</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Action</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Target</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Details</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const hasDiff = !!entry.before_value || !!entry.after_value
            const link = targetLink(entry.target_type, entry.target_id)
            const isExpanded = expandedId === entry.id

            return (
              <Fragment key={entry.id}>
                <tr className="border-b border-divider dark:border-dark-border">
                  <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                    {formatCT(entry.created_at, 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-4 py-3">
                    {entry.admin ? (
                      <span className="text-dark dark:text-dark-text">{entry.admin.name}</span>
                    ) : (
                      <span className="text-mid-gray dark:text-dark-muted italic">Public</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark dark:text-dark-text">{actionLabel(entry.action)}</td>
                  <td className="px-4 py-3 text-dark dark:text-dark-text">
                    {link ? (
                      <Link href={link} className="text-navy dark:text-steel hover:underline">
                        {entry.target_type} — {truncateId(entry.target_id)}
                      </Link>
                    ) : (
                      <span>
                        {entry.target_type} — {truncateId(entry.target_id)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {hasDiff ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(entry.id)}
                        className="text-navy dark:text-steel text-sm font-semibold hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Hide diff' : 'View diff'}
                      </button>
                    ) : (
                      <span className="text-mid-gray dark:text-dark-muted text-sm">—</span>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-divider dark:border-dark-border bg-light-navy/30 dark:bg-dark-bg/50">
                    <td colSpan={5} className="p-0">
                      <DiffPanel entry={entry} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
