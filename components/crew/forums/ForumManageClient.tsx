'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Pencil, Check, X, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import {
  createForumCategory,
  updateForumCategory,
  reorderForumCategory,
  deleteForumCategory,
  createForum,
  updateForum,
  reorderForum,
  archiveForum,
  unarchiveForum,
  deleteForum,
  moveForum,
  addForumAccessGrant,
  removeForumAccessGrant,
  addForumModerator,
  removeForumModerator,
  searchForumAdminUsers,
  createForumPrefix,
  updateForumPrefix,
  reorderForumPrefix,
  deleteForumPrefix,
} from '@/lib/actions/forum-admin'
import type { CategoryWithForums, ForumUserGroup, ForumAdminUserOption, ForumWithDetails } from '@/types/forums'

const ROLE_OPTIONS = [
  { value: 'editor', label: 'All Editors' },
  { value: 'viewer', label: 'All Viewers' },
  { value: 'production', label: 'All Production' },
]

// ─── Shared admin-user search picker (grant + moderator use) ────

function AdminUserPicker({
  excludeIds,
  onSelect,
  placeholder,
}: {
  excludeIds: string[]
  onSelect: (hit: ForumAdminUserOption) => void
  placeholder: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ForumAdminUserOption[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (value.trim().length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      const hits = await searchForumAdminUsers(value, excludeIds)
      setResults(hits)
      setLoading(false)
    }, 300)
  }

  function handleSelect(hit: ForumAdminUserOption) {
    setQuery('')
    setResults([])
    onSelect(hit)
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full max-w-xs rounded border border-divider dark:border-dark-border px-3 py-1.5 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
      />
      {loading && <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">Searching…</p>}
      {results.length > 0 && (
        <div className="absolute z-10 w-full max-w-xs bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg">
          {results.map((hit) => (
            <button
              key={hit.id}
              type="button"
              onClick={() => handleSelect(hit)}
              className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
            >
              {hit.name}
              <span className="text-mid-gray dark:text-dark-muted ml-1">{hit.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Forum sub-panel: access grants, moderators, thread prefixes ─

function ForumSubPanel({
  forum,
  groups,
}: {
  forum: ForumWithDetails
  groups: ForumUserGroup[]
}) {
  const router = useRouter()
  const [grantType, setGrantType] = useState<'role' | 'group' | 'user'>('role')
  const [error, setError] = useState<string | null>(null)

  const individualIds = forum.grants.filter((g) => g.grant_type === 'individual').map((g) => g.admin_user_id!)
  const moderatorIds = forum.moderators.map((m) => m.admin_user_id)

  async function handleAddGrant(value: string) {
    setError(null)
    const dbGrantType = grantType === 'user' ? 'individual' : grantType
    const result = await addForumAccessGrant(forum.id, dbGrantType, value)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleRemoveGrant(grantId: string) {
    setError(null)
    const result = await removeForumAccessGrant(grantId)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleAddModerator(adminUserId: string) {
    setError(null)
    const result = await addForumModerator(forum.id, adminUserId)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleRemoveModerator(moderatorId: string) {
    setError(null)
    const result = await removeForumModerator(moderatorId)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="border-t border-divider dark:border-dark-border px-4 py-4 space-y-6">
      {error && <p className="text-xs text-brand-accent">{error}</p>}

      {/* Section 1 — Access Grants */}
      <div>
        <h4 className="text-sm font-bold text-dark dark:text-dark-text">Who can see this forum</h4>
        <p className="text-xs text-mid-gray dark:text-dark-muted mb-2">
          Super Admins and Owner Admins always have access.
        </p>
        {forum.grants.length === 0 ? (
          <p className="text-xs text-mid-gray dark:text-dark-muted italic mb-2">
            (No access grants — only Super Admins and Owner Admins can see this forum.)
          </p>
        ) : (
          <div className="space-y-1 mb-3">
            {forum.grants.map((g) => (
              <div key={g.id} className="flex items-center gap-2 text-sm py-1">
                {g.grant_type === 'role' && (
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
                    {ROLE_OPTIONS.find((r) => r.value === g.role)?.label ?? g.role}
                  </span>
                )}
                {g.grant_type === 'group' && (
                  <>
                    <span className="text-dark dark:text-dark-text font-medium">{g.group_name}</span>
                    <span className="text-xs text-mid-gray dark:text-dark-muted">Group</span>
                  </>
                )}
                {g.grant_type === 'individual' && (
                  <>
                    <span className="text-dark dark:text-dark-text font-medium">{g.admin_user_name}</span>
                    <span className="text-mid-gray dark:text-dark-muted">{g.admin_user_email}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveGrant(g.id)}
                  aria-label="Remove grant"
                  className="ml-auto text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mb-2">
          {(['role', 'group', 'user'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setGrantType(t)}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer ${
                grantType === t
                  ? 'bg-brand-primary text-white'
                  : 'border border-divider dark:border-dark-border text-dark dark:text-dark-text'
              }`}
            >
              {t === 'role' ? 'Role' : t === 'group' ? 'Group' : 'User'}
            </button>
          ))}
        </div>

        {grantType === 'role' && (
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleAddGrant(r.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
              >
                + {r.label}
              </button>
            ))}
          </div>
        )}

        {grantType === 'group' && (
          <div className="flex flex-wrap gap-2">
            {groups.length === 0 ? (
              <p className="text-xs text-mid-gray dark:text-dark-muted">
                No groups exist yet — create one at Settings → User Groups.
              </p>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleAddGrant(g.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
                >
                  + {g.name}
                </button>
              ))
            )}
          </div>
        )}

        {grantType === 'user' && (
          <AdminUserPicker
            excludeIds={individualIds}
            onSelect={(hit) => handleAddGrant(hit.id)}
            placeholder="Search admins to grant access…"
          />
        )}
      </div>

      {/* Section 2 — Moderators */}
      <div>
        <h4 className="text-sm font-bold text-dark dark:text-dark-text">Moderators</h4>
        <p className="text-xs text-mid-gray dark:text-dark-muted mb-2">
          Moderators can edit/delete posts and manage threads in this forum only.
        </p>
        {forum.moderators.length === 0 ? (
          <p className="text-xs text-mid-gray dark:text-dark-muted italic mb-2">(No moderators assigned.)</p>
        ) : (
          <div className="space-y-1 mb-3">
            {forum.moderators.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm py-1">
                <span className="text-dark dark:text-dark-text font-medium">{m.name}</span>
                <span className="text-mid-gray dark:text-dark-muted">{m.email}</span>
                <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-mid-gray/20 text-mid-gray">
                  {m.role}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveModerator(m.id)}
                  aria-label={`Remove ${m.name} as moderator`}
                  className="ml-auto text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <AdminUserPicker
          excludeIds={moderatorIds}
          onSelect={(hit) => handleAddModerator(hit.id)}
          placeholder="Search admins to add as moderator…"
        />
      </div>

      {/* Section 3 — Thread Prefixes */}
      <ThreadPrefixesSection forum={forum} />
    </div>
  )
}

function ThreadPrefixesSection({ forum }: { forum: ForumWithDetails }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftLabel, setDraftLabel] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit(id: string, currentLabel: string) {
    setEditingId(id)
    setDraftLabel(currentLabel)
  }

  async function handleSaveEdit(id: string) {
    setError(null)
    setIsSubmitting(true)
    const result = await updateForumPrefix(id, draftLabel)
    setIsSubmitting(false)
    if ('success' in result) {
      setEditingId(null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    setError(null)
    const result = await reorderForumPrefix(id, direction)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    const result = await deleteForumPrefix(id)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleAdd() {
    if (!newLabel.trim()) {
      setError('Prefix label is required.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    const result = await createForumPrefix(forum.id, newLabel)
    setIsSubmitting(false)
    if ('success' in result) {
      setNewLabel('')
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div>
      <h4 className="text-sm font-bold text-dark dark:text-dark-text">Thread Prefixes</h4>
      <p className="text-xs text-mid-gray dark:text-dark-muted mb-2">
        Optional labels for threads (e.g. [ANNOUNCEMENT], [QUESTION]).
      </p>
      {forum.prefixes.length === 0 ? (
        <p className="text-xs text-mid-gray dark:text-dark-muted italic mb-2">
          (No prefixes defined — posts can still be created without a prefix.)
        </p>
      ) : (
        <div className="space-y-1 mb-3">
          {forum.prefixes.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 text-sm py-1">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleReorder(p.id, 'up')}
                  disabled={i === 0}
                  aria-label={`Move ${p.label} up`}
                  className="p-0.5 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(p.id, 'down')}
                  disabled={i === forum.prefixes.length - 1}
                  aria-label={`Move ${p.label} down`}
                  className="p-0.5 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              {editingId === p.id ? (
                <>
                  <input
                    type="text"
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                    className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(p.id)}
                    disabled={isSubmitting}
                    aria-label="Save prefix"
                    className="p-1 rounded text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={isSubmitting}
                    aria-label="Cancel edit"
                    className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(p.id, p.label)}
                    className="text-dark dark:text-dark-text font-medium hover:underline cursor-pointer"
                  >
                    {p.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    aria-label={`Delete ${p.label}`}
                    className="ml-auto p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="New prefix label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSubmitting}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-mid cursor-pointer disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="text-xs text-brand-accent mt-2">{error}</p>}
    </div>
  )
}

// ─── Forum row ────────────────────────────────────────────────

function ForumRow({
  forum,
  otherCategories,
  isFirst,
  isLast,
  groups,
}: {
  forum: ForumWithDetails
  otherCategories: CategoryWithForums[]
  isFirst: boolean
  isLast: boolean
  groups: ForumUserGroup[]
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(forum.name)
  const [draftDescription, setDraftDescription] = useState(forum.description ?? '')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateForum(forum.id, draftName, draftDescription || null)
    setIsSubmitting(false)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  function handleCancel() {
    setDraftName(forum.name)
    setDraftDescription(forum.description ?? '')
    setEditMode(false)
    setError(null)
  }

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderForum(forum.id, direction)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleArchiveToggle() {
    setError(null)
    const result = forum.is_archived ? await unarchiveForum(forum.id) : await archiveForum(forum.id)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleDelete() {
    setError(null)
    setIsSubmitting(true)
    const result = await deleteForum(forum.id)
    setIsSubmitting(false)
    if ('success' in result) {
      router.refresh()
    } else {
      setConfirmingDelete(false)
      setError(result.error)
    }
  }

  async function handleMove(newCategoryId: string) {
    if (!newCategoryId) return
    setError(null)
    const result = await moveForum(forum.id, newCategoryId)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="border-b border-divider dark:border-dark-border last:border-b-0">
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder('up')}
              disabled={isFirst}
              aria-label={`Move ${forum.name} up`}
              className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleReorder('down')}
              disabled={isLast}
              aria-label={`Move ${forum.name} down`}
              className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {editMode ? (
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Forum name"
                className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                autoFocus
              />
              <input
                type="text"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Description (optional)"
                className="flex-1 min-w-[160px] rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                aria-label="Save forum"
                className="p-1 rounded text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                aria-label="Cancel edit"
                className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <span className="text-dark dark:text-dark-text font-medium">{forum.name}</span>
              {forum.description && (
                <span className="text-mid-gray dark:text-dark-muted text-sm truncate max-w-xs">
                  {forum.description}
                </span>
              )}
              {forum.is_archived && (
                <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-mid-gray/20 text-mid-gray">
                  Archived
                </span>
              )}
            </div>
          )}

          {!editMode && !confirmingDelete && (
            <div className="flex items-center gap-2 ml-auto">
              <select
                value=""
                onChange={(e) => handleMove(e.target.value)}
                className="text-xs rounded border border-divider dark:border-dark-border px-2 py-1 text-dark dark:text-dark-text bg-white dark:bg-dark-surface cursor-pointer"
              >
                <option value="">Move to…</option>
                {otherCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-mid-gray dark:text-dark-muted">Manage Access</span>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Collapse forum details' : 'Expand forum details'}
                className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(true)}
                aria-label={`Edit ${forum.name}`}
                className="p-1 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:hover:bg-dark-surface/50"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={handleArchiveToggle}
                aria-label={forum.is_archived ? `Unarchive ${forum.name}` : `Archive ${forum.name}`}
                className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
              >
                {forum.is_archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${forum.name}`}
                className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {confirmingDelete && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-dark dark:text-dark-text">
                {`Delete ${forum.name}? This cannot be undone.`}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-sm font-semibold text-white bg-brand-accent hover:bg-brand-primary-mid px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isSubmitting}
                className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-brand-accent">{error}</p>}
      </div>
      {expanded && <ForumSubPanel forum={forum} groups={groups} />}
    </div>
  )
}

// ─── Add forum form ───────────────────────────────────────────

function AddForumForm({ categoryId, onDone }: { categoryId: string; onDone: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Forum name is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createForum(categoryId, name, description || null)
    setIsPending(false)
    if ('success' in result) {
      router.refresh()
      onDone()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-surface/50 border border-divider dark:border-dark-border rounded-lg p-4 mx-4 mb-3">
      <div className="flex items-start gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Forum name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          autoFocus
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create Forum'}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-brand-accent mt-2">{error}</p>}
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────

function CategorySection({
  category,
  allCategories,
  isFirst,
  isLast,
  groups,
}: {
  category: CategoryWithForums
  allCategories: CategoryWithForums[]
  isFirst: boolean
  isLast: boolean
  groups: ForumUserGroup[]
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(category.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [addingForum, setAddingForum] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeForums = category.forums.filter((f) => !f.is_archived)
  const archivedForums = category.forums.filter((f) => f.is_archived)
  const orderedForums = [...activeForums, ...archivedForums]
  const otherCategories = allCategories.filter((c) => c.id !== category.id)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateForumCategory(category.id, draftName)
    setIsSubmitting(false)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  function handleCancel() {
    setDraftName(category.name)
    setEditMode(false)
    setError(null)
  }

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderForumCategory(category.id, direction)
    if ('success' in result) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleDelete() {
    setError(null)
    setIsSubmitting(true)
    const result = await deleteForumCategory(category.id)
    setIsSubmitting(false)
    if ('success' in result) {
      router.refresh()
    } else {
      setConfirmingDelete(false)
      setError(result.error)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-divider dark:border-dark-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder('up')}
              disabled={isFirst}
              aria-label={`Move ${category.name} up`}
              className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleReorder('down')}
              disabled={isLast}
              aria-label={`Move ${category.name} down`}
              className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {editMode ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="rounded border border-divider dark:border-dark-border px-2 py-1 text-base font-bold text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                aria-label="Save category"
                className="p-1 rounded text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                aria-label="Cancel edit"
                className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-base font-bold text-dark dark:text-dark-text hover:underline cursor-pointer flex items-center gap-1.5"
            >
              {category.name}
              <Pencil size={14} className="text-brand-primary" />
            </button>
          )}

          {!editMode && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete ${category.name}`}
              className="ml-auto p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}

          {confirmingDelete && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-dark dark:text-dark-text">
                {`Delete this category? This cannot be undone.`}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-sm font-semibold text-white bg-brand-accent hover:bg-brand-primary-mid px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isSubmitting}
                className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-brand-accent">{error}</p>}
      </div>

      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => setAddingForum(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-mid cursor-pointer mb-3"
        >
          Add Forum
        </button>
      </div>
      {addingForum && <AddForumForm categoryId={category.id} onDone={() => setAddingForum(false)} />}

      {orderedForums.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted px-4 pb-4">No forums in this category yet.</p>
      ) : (
        <div>
          {orderedForums.map((forum) => {
            const activeIndex = activeForums.findIndex((f) => f.id === forum.id)
            const isArchivedRow = forum.is_archived
            return (
              <ForumRow
                key={forum.id}
                forum={forum}
                otherCategories={otherCategories}
                isFirst={isArchivedRow ? true : activeIndex === 0}
                isLast={isArchivedRow ? true : activeIndex === activeForums.length - 1}
                groups={groups}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Add category form ────────────────────────────────────────

function AddCategoryForm({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Category name is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createForumCategory(name)
    setIsPending(false)
    if ('success' in result) {
      router.refresh()
      onDone()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide mb-3">Add Category</h3>
      <div className="flex items-start gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          autoFocus
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Adding…' : 'Add Category'}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-brand-accent mt-2">{error}</p>}
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────

export default function ForumManageClient({
  categories,
  groups,
}: {
  categories: CategoryWithForums[]
  groups: ForumUserGroup[]
  adminUsers: ForumAdminUserOption[]
}) {
  const [addingCategory, setAddingCategory] = useState(false)

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!addingCategory && (
          <button
            type="button"
            onClick={() => setAddingCategory(true)}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Add Category
          </button>
        )}
      </div>

      {addingCategory && <AddCategoryForm onDone={() => setAddingCategory(false)} />}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-mid-gray dark:text-dark-muted mb-4">
            No categories yet. Create a category to organize your forums.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, i) => (
            <CategorySection
              key={category.id}
              category={category}
              allCategories={categories}
              isFirst={i === 0}
              isLast={i === categories.length - 1}
              groups={groups}
            />
          ))}
        </div>
      )}
    </div>
  )
}
