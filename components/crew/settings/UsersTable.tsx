'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCT } from '@/lib/utils/date'
import { changeRole, deactivateUser, reactivateUser, toggleCalendarEditor } from '@/lib/actions/users'
import type { AdminRole } from '@/types/admin'

type AdminUserRow = {
  id: string
  name: string
  email: string
  role: AdminRole
  is_active: boolean
  calendar_editor: boolean
  last_login: string | null
  created_at: string
}

const ROLE_BADGE: Record<AdminUserRow['role'], { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-navy text-white' },
  editor: { label: 'Editor', className: 'bg-steel text-white' },
  viewer: { label: 'Viewer', className: 'bg-mid-gray text-white' },
  production: { label: 'Production', className: 'bg-orange text-white' },
}

function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingCalendarEditor, setIsTogglingCalendarEditor] = useState(false)

  async function handleRoleChange(newRole: 'editor' | 'viewer') {
    setIsSubmitting(true)
    const result = await changeRole(user.id, newRole)
    setIsSubmitting(false)
    if ('success' in result) {
      router.refresh()
      return
    }
    alert(result.error)
  }

  async function handleToggleActive() {
    setIsSubmitting(true)
    const result = user.is_active ? await deactivateUser(user.id) : await reactivateUser(user.id)
    setIsSubmitting(false)
    if ('success' in result) {
      router.refresh()
      return
    }
    alert(result.error)
  }

  async function handleToggleCalendarEditor(enabled: boolean) {
    setIsTogglingCalendarEditor(true)
    const result = await toggleCalendarEditor(user.id, enabled)
    setIsTogglingCalendarEditor(false)
    if (result.success) {
      router.refresh()
      return
    }
    alert(result.error)
  }

  const roleBadge = ROLE_BADGE[user.role]

  return (
    <tr className="border-b border-divider dark:border-dark-border">
      <td className="px-4 py-3 text-dark dark:text-dark-text font-medium">{user.name}</td>
      <td className="px-4 py-3 text-mid-gray dark:text-dark-muted text-sm">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold rounded px-2 py-0.5 ${roleBadge.className}`}>
          {roleBadge.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs font-semibold rounded px-2 py-0.5 ${
            user.is_active ? 'bg-green-100 text-green-800' : 'bg-mid-gray/20 text-mid-gray'
          }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-dark dark:text-dark-text text-sm">
        {user.last_login ? formatCT(user.last_login, 'MMM d, yyyy h:mm a') : 'Never'}
      </td>
      <td className="px-4 py-3 text-dark dark:text-dark-text text-sm">{formatCT(user.created_at, 'MMM d, yyyy')}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.role === 'super_admin' || user.role === 'production' ? (
            <span className="text-sm text-mid-gray dark:text-dark-muted">—</span>
          ) : (
            <select
              value={user.role}
              disabled={isSubmitting}
              onChange={(e) => handleRoleChange(e.target.value as 'editor' | 'viewer')}
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-50"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          )}

          {(user.role === 'editor' || user.role === 'viewer') && (
            <label className="flex items-center gap-2 text-sm text-mid-gray dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={user.calendar_editor}
                onChange={(e) => handleToggleCalendarEditor(e.target.checked)}
                disabled={isTogglingCalendarEditor}
                className="rounded"
              />
              Calendar Editor{' '}
              <span className="text-xs">(direct calendar write access)</span>
            </label>
          )}

          {isSelf || user.role === 'super_admin' ? (
            <button
              type="button"
              disabled
              title={
                isSelf
                  ? 'Cannot deactivate your own account'
                  : 'Super Admin accounts cannot be deactivated via this panel'
              }
              className="text-sm px-3 py-1 rounded-md opacity-40 cursor-not-allowed border border-orange text-orange"
            >
              Deactivate
            </button>
          ) : user.is_active ? (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className="border border-orange text-orange hover:bg-orange hover:text-white transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className="bg-navy text-white hover:bg-steel transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reactivate
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function UsersTable({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[]
  currentAdminId: string
}) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider dark:border-dark-border text-left">
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Name</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Email</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Role</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Status</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
              Last Login
            </th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Created</th>
            <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} isSelf={user.id === currentAdminId} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
