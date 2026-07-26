'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import {
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  reorderDocumentType,
  setTypeActiveDocument,
} from '@/lib/actions/documents'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { AdminRole } from '@/types/admin'

export type DocumentTypeRow = {
  id: string
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  sort_order: number
  documents: Array<{ id: string; title: string; is_type_active: boolean; created_at: string }>
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
}

function ActiveDocumentSection({ type, canManage }: { type: DocumentTypeRow; canManage: boolean }) {
  const router = useRouter()
  const [picking, setPicking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDocument = type.documents.find((d) => d.is_type_active) ?? null
  const otherDocuments = type.documents.filter((d) => !d.is_type_active)

  async function handleSetActive(documentId: string | null) {
    setError(null)
    setIsSubmitting(true)
    const result = await setTypeActiveDocument(type.id, documentId)
    setIsSubmitting(false)
    if ('success' in result) {
      setPicking(false)
      router.refresh()
      return
    }
    setError(result.error)
  }

  return (
    <div className="mt-3 pt-3 border-t border-divider dark:border-dark-border">
      {activeDocument ? (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-dark dark:text-dark-text">
            Active document: <span className="font-semibold">{activeDocument.title}</span>{' '}
            <span className="text-mid-gray dark:text-dark-muted">
              (uploaded {formatCT(activeDocument.created_at, 'MMM d, yyyy')})
            </span>
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="text-xs font-semibold text-navy dark:text-steel hover:underline cursor-pointer shrink-0"
            >
              Change Active Document
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-mid-gray dark:text-dark-muted">No active document.</p>
          {canManage && (
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="text-xs font-semibold text-navy dark:text-steel hover:underline cursor-pointer shrink-0"
            >
              Set Active Document
            </button>
          )}
        </div>
      )}

      {picking && canManage && (
        <div className="mt-2 rounded-lg border border-divider dark:border-dark-border p-3 bg-light-navy/30 dark:bg-dark-bg/40">
          {otherDocuments.length === 0 ? (
            <p className="text-xs text-mid-gray dark:text-dark-muted">No documents of this type yet.</p>
          ) : (
            <ul className="space-y-1">
              {otherDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-dark dark:text-dark-text">{doc.title}</span>
                  <button
                    type="button"
                    onClick={() => handleSetActive(doc.id)}
                    disabled={isSubmitting}
                    className="text-xs font-semibold text-navy dark:text-steel hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Make Active
                  </button>
                </li>
              ))}
            </ul>
          )}
          {activeDocument && (
            <button
              type="button"
              onClick={() => handleSetActive(null)}
              disabled={isSubmitting}
              className="mt-2 text-xs font-semibold text-orange hover:underline cursor-pointer disabled:opacity-50"
            >
              Clear Active Document
            </button>
          )}
          <button
            type="button"
            onClick={() => setPicking(false)}
            disabled={isSubmitting}
            className="mt-2 ml-3 text-xs font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
        </div>
      )}
      {error && <p className="text-xs text-orange mt-1">{error}</p>}
    </div>
  )
}

function TypeRow({
  type,
  isFirst,
  isLast,
  canManage,
}: {
  type: DocumentTypeRow
  isFirst: boolean
  isLast: boolean
  canManage: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(type.name)
  const [draftDescription, setDraftDescription] = useState(type.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<'deactivate' | 'delete' | null>(null)

  const hasActiveDocuments = type.documents.some((d) => d.is_type_active)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderDocumentType(type.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateDocumentType(type.id, {
      name: draftName,
      description: draftDescription,
    })
    if ('success' in result) {
      setEditMode(false)
      setIsSubmitting(false)
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(type.name)
    setDraftDescription(type.description ?? '')
    setEditMode(false)
    setError(null)
  }

  async function handleToggleActive() {
    if (type.is_active) {
      setConfirming('deactivate')
      return
    }
    setError(null)
    const result = await updateDocumentType(type.id, { is_active: true })
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleConfirmDeactivate() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateDocumentType(type.id, { is_active: false })
    setIsSubmitting(false)
    setConfirming(null)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleConfirmDelete() {
    setError(null)
    setIsSubmitting(true)
    const result = await deleteDocumentType(type.id)
    setIsSubmitting(false)
    setConfirming(null)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  return (
    <div
      className={`border-b border-divider dark:border-dark-border px-4 py-3 last:border-b-0 ${
        type.is_active ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder('up')}
              disabled={isFirst}
              aria-label={`Move ${type.name} up`}
              className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleReorder('down')}
              disabled={isLast}
              aria-label={`Move ${type.name} down`}
              className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {editMode ? (
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              autoFocus
            />
            <input
              type="text"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 min-w-[180px] rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              aria-label="Save document type"
              className="p-1 rounded text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel edit"
              className="p-1 rounded text-orange hover:bg-pale-orange cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
            <span className="text-dark dark:text-dark-text font-medium">{type.name}</span>
            {type.description && (
              <span className="text-sm text-mid-gray dark:text-dark-muted">{type.description}</span>
            )}
            {type.is_system && (
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-steel text-white">System</span>
            )}
            {!type.is_active && (
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-mid-gray/20 text-mid-gray">
                Deactivated
              </span>
            )}
          </div>
        )}

        {!editMode && canManage && confirming === null && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              aria-label={`Edit ${type.name}`}
              className="p-1 rounded text-navy hover:bg-light-navy cursor-pointer dark:hover:bg-dark-surface/50"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`text-sm font-semibold px-3 py-1 rounded-md cursor-pointer transition-colors ${
                type.is_active
                  ? 'border border-orange text-orange hover:bg-orange hover:text-white'
                  : 'bg-navy text-white hover:bg-steel'
              }`}
            >
              {type.is_active ? 'Deactivate' : 'Reactivate'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming('delete')}
              disabled={type.is_system}
              title={type.is_system ? 'System document types cannot be deleted' : undefined}
              className="text-sm font-semibold px-3 py-1 rounded-md cursor-pointer border border-orange text-orange hover:bg-orange hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-orange"
            >
              Delete
            </button>
          </div>
        )}

        {confirming === 'deactivate' && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-dark dark:text-dark-text">Deactivate this document type?</span>
            <button
              type="button"
              onClick={handleConfirmDeactivate}
              disabled={isSubmitting}
              className="bg-orange text-white hover:bg-opacity-90 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Deactivating…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={isSubmitting}
              className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}

        {confirming === 'delete' && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-dark dark:text-dark-text">Delete this document type?</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-orange text-white hover:bg-opacity-90 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting…' : 'Confirm Delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={isSubmitting}
              className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-orange mt-1">{error}</p>}
      {!editMode && confirming === null && (
        <ActiveDocumentSection type={type} canManage={canManage} />
      )}
      {hasActiveDocuments && type.is_active === false && (
        <p className="text-xs text-orange mt-1">
          This type has an active document but is deactivated — it will not be offered for new uploads.
        </p>
      )}
    </div>
  )
}

function AddTypeForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setNewName(value)
    if (!slugEdited) {
      setNewSlug(slugify(value))
    }
  }

  async function handleSubmit() {
    if (!newName.trim()) {
      setError('Name is required.')
      return
    }
    if (!newSlug.trim()) {
      setError('Slug is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createDocumentType({
      name: newName,
      slug: newSlug,
      description: newDescription || undefined,
    })
    if ('success' in result) {
      setNewName('')
      setNewSlug('')
      setSlugEdited(false)
      setNewDescription('')
      setIsCreating(false)
      setIsPending(false)
      router.refresh()
      return
    }
    setIsPending(false)
    setError(result.error === 'slug_taken' ? 'That slug is already in use.' : result.error)
  }

  if (!isCreating) {
    return (
      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer mb-4"
      >
        Add Type
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Add Document Type</h3>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <input
          type="text"
          placeholder="slug"
          value={newSlug}
          onChange={(e) => {
            setSlugEdited(true)
            setNewSlug(e.target.value)
          }}
          className="w-48 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm font-mono text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Adding…' : 'Add Type'}
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
      {error && <p className="text-sm text-orange mt-2">{error}</p>}
    </div>
  )
}

export function DocumentTypesManager({
  documentTypes,
  adminRole,
}: {
  documentTypes: DocumentTypeRow[]
  adminRole: AdminRole
}) {
  const canManage = adminRole === 'super_admin' || adminRole === 'owner_admin'
  const sorted = [...documentTypes].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
          Document Types
          <HelpTooltip anchor="document-types" label="Document Types" />
        </h2>
      </div>
      {canManage && <AddTypeForm />}
      {sorted.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-sm">No document types yet.</p>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          {sorted.map((type, i) => (
            <TypeRow
              key={type.id}
              type={type}
              canManage={canManage}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
