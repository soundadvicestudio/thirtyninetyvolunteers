'use client'

import { useState } from 'react'
import { formatCT } from '@/lib/utils/date'
import { approveRegistration, declineRegistration } from '@/lib/actions/admin-registration'

type PendingRegistrationRow = {
  id: string
  name: string
  email: string
  requested_at: string
}

type AdminRole = 'super_admin' | 'editor' | 'viewer'

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

function reloadWithNotice(notice: string) {
  window.location.href = `${window.location.pathname}?notice=${notice}`
}

function PendingRow({ registration }: { registration: PendingRegistrationRow }) {
  const [role, setRole] = useState<AdminRole>('viewer')
  const [confirming, setConfirming] = useState<'approve' | 'decline' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  async function handleApprove() {
    setIsSubmitting(true)
    setRowError(null)
    const result = await approveRegistration(registration.id, role)
    if ('success' in result) {
      reloadWithNotice('registration_approved')
      return
    }
    setIsSubmitting(false)
    setConfirming(null)
    setRowError(result.error)
  }

  async function handleDecline() {
    setIsSubmitting(true)
    setRowError(null)
    const result = await declineRegistration(registration.id)
    if ('success' in result) {
      reloadWithNotice('registration_declined')
      return
    }
    setIsSubmitting(false)
    setConfirming(null)
    setRowError(result.error)
  }

  return (
    <tr className="border-b border-divider dark:border-dark-border">
      <td className="px-4 py-3 text-dark dark:text-dark-text font-medium">{registration.name}</td>
      <td className="px-4 py-3 text-mid-gray dark:text-dark-muted text-sm">{registration.email}</td>
      <td className="px-4 py-3 text-dark dark:text-dark-text text-sm">
        {formatCT(registration.requested_at, 'MMM d, yyyy h:mm a')}
      </td>
      <td className="px-4 py-3">
        <select
          value={role}
          disabled={isSubmitting || confirming !== null}
          onChange={(e) => setRole(e.target.value as AdminRole)}
          className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-50"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </td>
      <td className="px-4 py-3">
        {rowError && <p className="text-orange text-xs mb-2">{rowError}</p>}
        {confirming === null && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirming('approve')}
              className="bg-navy text-white hover:bg-steel transition-colors text-sm px-3 py-1 rounded-md cursor-pointer"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setConfirming('decline')}
              className="border border-orange text-orange hover:bg-orange hover:text-white transition-colors text-sm px-3 py-1 rounded-md cursor-pointer"
            >
              Decline
            </button>
          </div>
        )}
        {confirming === 'approve' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark dark:text-dark-text">
              Approve as {ROLE_LABELS[role]}?
            </span>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-navy text-white hover:bg-steel transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Approving...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={isSubmitting}
              className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
        {confirming === 'decline' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark dark:text-dark-text">Are you sure?</span>
            <button
              type="button"
              onClick={handleDecline}
              disabled={isSubmitting}
              className="bg-orange text-white hover:bg-orange/90 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Declining...' : 'Confirm Decline'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={isSubmitting}
              className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function PendingRegistrations({
  registrations,
}: {
  registrations: PendingRegistrationRow[]
}) {
  if (registrations.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Pending Registrations</h2>
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider dark:border-dark-border text-left">
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Name</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Email</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                Requested At
              </th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Role</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <PendingRow key={registration.id} registration={registration} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
