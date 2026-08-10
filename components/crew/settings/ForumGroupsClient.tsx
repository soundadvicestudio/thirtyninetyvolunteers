'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Pencil, Check, X, Trash2, Users } from 'lucide-react'
import {
  createForumGroup,
  updateForumGroup,
  deleteForumGroup,
  getForumGroupMembers,
  addForumGroupMember,
  removeForumGroupMember,
  searchAdminUsersForGroup,
} from '@/lib/actions/forum-groups'
import type { ForumUserGroup, ForumGroupMember } from '@/types/forums'

type AdminHit = { id: string; name: string; email: string; role: string }

function MembersSection({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [members, setMembers] = useState<ForumGroupMember[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdminHit[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    getForumGroupMembers(groupId).then((result) => {
      if (!cancelled) {
        setMembers(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [groupId])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  function handleSearchChange(query: string) {
    setSearchQuery(query)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      const excludeIds = (members ?? []).map((m) => m.admin_user_id)
      const results = await searchAdminUsersForGroup(query, excludeIds)
      setSearchResults(results)
      setSearchLoading(false)
    }, 300)
  }

  async function handleAdd(hit: AdminHit) {
    setSearchQuery('')
    setSearchResults([])
    const result = await addForumGroupMember(groupId, hit.id)
    if ('success' in result) {
      const refreshed = await getForumGroupMembers(groupId)
      setMembers(refreshed)
      router.refresh()
    }
  }

  async function handleRemove(adminUserId: string) {
    const result = await removeForumGroupMember(groupId, adminUserId)
    if ('success' in result) {
      const refreshed = await getForumGroupMembers(groupId)
      setMembers(refreshed)
      router.refresh()
    }
  }

  return (
    <div className="border-t border-divider dark:border-dark-border px-4 py-3 space-y-3">
      {loading ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">Loading members…</p>
      ) : members && members.length > 0 ? (
        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-sm py-1">
              <span className="text-dark dark:text-dark-text font-medium">{m.name}</span>
              <span className="text-mid-gray dark:text-dark-muted">{m.email}</span>
              <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
                {m.role}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(m.admin_user_id)}
                aria-label={`Remove ${m.name}`}
                className="ml-auto text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No members yet.</p>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Add member…"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full max-w-xs rounded border border-divider dark:border-dark-border px-3 py-1.5 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        {searchLoading && <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">Searching…</p>}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full max-w-xs bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg">
            {searchResults.map((hit) => (
              <button
                key={hit.id}
                type="button"
                onClick={() => handleAdd(hit)}
                className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
              >
                {hit.name}
                <span className="text-mid-gray dark:text-dark-muted ml-1">{hit.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupCard({ group }: { group: ForumUserGroup }) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(group.name)
  const [draftDescription, setDraftDescription] = useState(group.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateForumGroup(group.id, draftName, draftDescription || null)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(group.name)
    setDraftDescription(group.description ?? '')
    setEditMode(false)
    setError(null)
  }

  async function handleDelete() {
    setError(null)
    setIsSubmitting(true)
    const result = await deleteForumGroup(group.id)
    if ('success' in result) {
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setConfirmingDelete(false)
    setError(result.error)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {editMode ? (
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Group name"
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
                aria-label="Save group"
                className="p-1 rounded text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                aria-label="Cancel edit"
                className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <span className="text-dark dark:text-dark-text font-medium">{group.name}</span>
              {group.description && (
                <span className="text-mid-gray dark:text-dark-muted text-sm">{group.description}</span>
              )}
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-mid-gray/20 text-mid-gray flex items-center gap-1">
                <Users size={12} />
                {group.member_count ?? 0}
              </span>
            </div>
          )}

          {!editMode && !confirmingDelete && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Collapse members' : 'Expand members'}
                className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(true)}
                aria-label={`Edit ${group.name}`}
                className="p-1 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:hover:bg-dark-surface/50"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${group.name}`}
                className="p-1 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {confirmingDelete && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-dark dark:text-dark-text">
                {`Delete ${group.name}? This cannot be undone.`}
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
      {expanded && <MembersSection groupId={group.id} />}
    </div>
  )
}

function NewGroupForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!newName.trim()) {
      setError('Group name is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createForumGroup(newName, newDescription || null)
    if ('success' in result) {
      setNewName('')
      setNewDescription('')
      setIsCreating(false)
      router.refresh()
      return
    }
    setIsPending(false)
    setError(result.error)
  }

  if (!isCreating) {
    return (
      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer mb-4"
      >
        New Group
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide mb-3">New Group</h3>
      <div className="flex items-start gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating…' : 'Create Group'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false)
            setError(null)
          }}
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

export default function ForumGroupsClient({ groups }: { groups: ForumUserGroup[] }) {
  return (
    <div>
      <NewGroupForm />
      {groups.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-sm">
          No groups yet. Create a group to organize forum access.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
