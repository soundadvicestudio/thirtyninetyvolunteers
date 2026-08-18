'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { changeRole, deactivateUser, reactivateUser, toggleCalendarEditor, toggleInventoryManager } from '@/lib/actions/users'
import type { AdminRole } from '@/types/admin'

type AdminUserRow = {
  id: string
  name: string
  email: string
  role: AdminRole
  is_active: boolean
  calendar_editor: boolean
  inventory_manager: boolean
  last_login: string | null
  created_at: string
}

const ROLE_BADGE: Record<AdminUserRow['role'], { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-[#293994] text-white' },
  owner_admin: { label: 'Owner Admin', className: 'bg-indigo-600 text-white' },
  editor: { label: 'Editor', className: 'bg-[#729ABF] text-white' },
  viewer: { label: 'Viewer', className: 'bg-mid-gray text-white' },
  production: { label: 'Production', className: 'bg-[#F26522] text-white' },
}

function UserRow({
  user,
  isSelf,
  messagesEnabled,
}: {
  user: AdminUserRow
  isSelf: boolean
  messagesEnabled?: boolean
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingCalendarEditor, setIsTogglingCalendarEditor] = useState(false)
  const [isTogglingInventoryManager, setIsTogglingInventoryManager] = useState(false)

  async function handleRoleChange(newRole: 'editor' | 'viewer' | 'production' | 'owner_admin') {
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

  async function handleToggleInventoryManager(enabled: boolean) {
    setIsTogglingInventoryManager(true)
    const result = await toggleInventoryManager(user.id, enabled)
    setIsTogglingInventoryManager(false)
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
        {user.last_login ? formatCT(user.last_login, 'MMM d, yyyy h:mm a', tz) : 'Never'}
      </td>
      <td className="px-4 py-3 text-dark dark:text-dark-text text-sm">{formatCT(user.created_at, 'MMM d, yyyy', tz)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {messagesEnabled && !isSelf && (
            <Link
              href={`/crew/messages/compose?to=${user.id}`}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
            >
              <Mail size={14} />
              Message
            </Link>
          )}
          {user.role === 'super_admin' ? (
            <span className="text-sm text-mid-gray dark:text-dark-muted">—</span>
          ) : (
            <select
              value={user.role}
              disabled={isSubmitting}
              onChange={(e) =>
                handleRoleChange(e.target.value as 'editor' | 'viewer' | 'production' | 'owner_admin')
              }
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="production">Production</option>
              <option value="owner_admin">Owner Admin</option>
            </select>
          )}

          {(user.role === 'editor' || user.role === 'viewer' || user.role === 'owner_admin') && (
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

          {user.role === 'editor' && (
            <label className="flex items-center gap-2 text-sm text-mid-gray dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={user.inventory_manager}
                onChange={(e) => handleToggleInventoryManager(e.target.checked)}
                disabled={isTogglingInventoryManager}
                className="rounded"
              />
              Inventory Mgr
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
              className="text-sm px-3 py-1 rounded-md opacity-40 cursor-not-allowed border border-brand-accent text-brand-accent"
            >
              Deactivate
            </button>
          ) : user.is_active ? (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
  messagesEnabled,
}: {
  users: AdminUserRow[]
  currentAdminId: string
  messagesEnabled?: boolean
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
            <UserRow key={user.id} user={user} isSelf={user.id === currentAdminId} messagesEnabled={messagesEnabled} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
