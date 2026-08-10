'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCT } from '@/lib/utils/date'
import {
  updateInventoryItem,
  deactivateInventoryItem,
  reactivateInventoryItem,
  deleteInventoryItem,
  deleteInventoryPhoto,
  reorderInventoryPhoto,
  addInventoryNote,
} from '@/lib/actions/inventory'
import InventoryPhotoUploader from '@/components/crew/inventory/InventoryPhotoUploader'
import type { InventoryCategory, InventoryCondition, InventoryItemWithStatus } from '@/types/inventory'
import type { AdminRole } from '@/types/admin'

const cardClasses = 'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg'

const CONDITION_LABELS: Record<InventoryCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const CONDITION_BADGE: Record<InventoryCondition, string> = {
  excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  fair: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const MAX_NOTE_LENGTH = 2000

type TabKey = 'overview' | 'photos' | 'notes' | 'checkouts' | 'qr'

function OverviewTab({
  item,
  categories,
  canWrite,
  canDelete,
}: {
  item: InventoryItemWithStatus
  categories: InventoryCategory[]
  canWrite: boolean
  canDelete: boolean
}) {
  const router = useRouter()
  const activeCategories = categories.filter((c) => c.is_active)

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(item.name)
  const [categoryId, setCategoryId] = useState(item.category_id)
  const [description, setDescription] = useState(item.description ?? '')
  const [condition, setCondition] = useState<InventoryCondition>(item.condition)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  const [reactivating, setReactivating] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function resetEditForm() {
    setName(item.name)
    setCategoryId(item.category_id)
    setDescription(item.description ?? '')
    setCondition(item.condition)
    setSaveError(null)
  }

  async function handleSave() {
    if (!name.trim()) {
      setSaveError('Name is required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const result = await updateInventoryItem(item.id, {
      name,
      category_id: categoryId,
      description: description || undefined,
      condition,
    })
    setSaving(false)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
      return
    }
    setSaveError(result.error)
  }

  async function handleDeactivate() {
    setDeactivating(true)
    setDeactivateError(null)
    const result = await deactivateInventoryItem(item.id)
    setDeactivating(false)
    if ('success' in result) {
      setConfirmingDeactivate(false)
      router.refresh()
      return
    }
    setDeactivateError(result.error)
  }

  async function handleReactivate() {
    setReactivating(true)
    const result = await reactivateInventoryItem(item.id)
    setReactivating(false)
    if ('success' in result) {
      router.refresh()
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteInventoryItem(item.id)
    setDeleting(false)
    if ('success' in result) {
      router.push('/crew/inventory')
      return
    }
    setDeleteError(result.error)
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <p className="font-mono text-sm text-mid-gray dark:text-dark-muted">{item.item_number}</p>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{item.name}</h1>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              item.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-mid-gray/20 text-mid-gray'
            }`}
          >
            {item.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CONDITION_BADGE[item.condition]}`}>
            {CONDITION_LABELS[item.condition]}
          </span>
          {item.category && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
              {item.category.name}
            </span>
          )}
        </div>
      </div>

      {!editMode ? (
        <div className={`${cardClasses} p-4 space-y-3`}>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
              Description
            </h3>
            <p className="text-sm text-dark dark:text-dark-text whitespace-pre-wrap">
              {item.description || 'No description provided.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
              Locations
            </h3>
            {item.item_locations && item.item_locations.length > 0 ? (
              <ul className="text-sm text-dark dark:text-dark-text space-y-1">
                {item.item_locations.map((loc) => (
                  <li key={loc.id}>
                    {loc.location ? (
                      loc.location.name
                    ) : (
                      <>
                        {loc.freeform_location}{' '}
                        <span className="text-xs text-mid-gray dark:text-dark-muted">(Freeform)</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-mid-gray dark:text-dark-muted">No locations set.</p>
            )}
          </div>

          <p className="text-xs text-mid-gray dark:text-dark-muted">
            Added {formatCT(item.created_at, 'MMM d, yyyy')}
          </p>

          {canWrite && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              Edit Item
            </button>
          )}
        </div>
      ) : (
        <div className={`${cardClasses} p-4 space-y-4`}>
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Name<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.prefix})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as InventoryCondition)}
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          {saveError && <p className="text-sm text-brand-accent">{saveError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetEditForm()
                setEditMode(false)
              }}
              disabled={saving}
              className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {canWrite && (
        <div className={`${cardClasses} p-4`}>
          {item.is_active ? (
            !confirmingDeactivate ? (
              <button
                type="button"
                onClick={() => setConfirmingDeactivate(true)}
                className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Deactivate Item
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-dark dark:text-dark-text">
                  Are you sure? This will hide the item from the default inventory list. Items with active
                  checkouts cannot be deactivated.
                </p>
                {deactivateError && <p className="text-sm text-brand-accent">{deactivateError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    disabled={deactivating}
                    className="bg-brand-accent text-white hover:bg-opacity-90 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    {deactivating ? 'Deactivating...' : 'Confirm Deactivate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingDeactivate(false)
                      setDeactivateError(null)
                    }}
                    disabled={deactivating}
                    className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-dark dark:text-dark-text">This item is inactive.</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleReactivate}
                  disabled={reactivating}
                  className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {reactivating ? 'Reactivating...' : 'Reactivate Item'}
                </button>
                {canDelete && !confirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                )}
              </div>
              {canDelete && confirmingDelete && (
                <div className="space-y-3">
                  <p className="text-sm text-dark dark:text-dark-text">
                    This will permanently delete this item and all its photos, notes, and checkout history. This
                    cannot be undone.
                  </p>
                  {deleteError && <p className="text-sm text-brand-accent">{deleteError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-brand-accent text-white hover:bg-opacity-90 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Forever'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDelete(false)
                        setDeleteError(null)
                      }}
                      disabled={deleting}
                      className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PhotosTab({ item, canWrite }: { item: InventoryItemWithStatus; canWrite: boolean }) {
  const router = useRouter()
  const photos = item.photos ?? []
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  async function handleReorder(photoId: string, direction: 'up' | 'down') {
    setPhotoError(null)
    const result = await reorderInventoryPhoto(photoId, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setPhotoError(result.error)
  }

  async function handleDelete(photoId: string) {
    setPhotoError(null)
    const result = await deleteInventoryPhoto(photoId)
    if ('success' in result) {
      setDeletingId(null)
      router.refresh()
      return
    }
    setPhotoError(result.error)
  }

  return (
    <div className="p-4 space-y-4">
      {canWrite && (
        <InventoryPhotoUploader
          itemId={item.id}
          existingPhotoCount={photos.length}
          onUploadComplete={() => router.refresh()}
        />
      )}

      {photoError && <p className="text-sm text-brand-accent">{photoError}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className={`${cardClasses} p-2 space-y-2`}>
              {photo.signed_url ? (
                <a href={photo.signed_url} target="_blank" rel="noreferrer">
                  {
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage signed URL, not a static local asset next/image can optimize
                    <img
                      src={photo.signed_url}
                      alt=""
                      className="w-full h-32 object-cover rounded cursor-pointer"
                    />
                  }
                </a>
              ) : (
                <div className="w-full h-32 rounded bg-gray-100 dark:bg-dark-border flex items-center justify-center text-xs text-mid-gray dark:text-dark-muted">
                  Unavailable
                </div>
              )}
              {canWrite && (
                <div className="flex items-center justify-between">
                  {photos.length > 1 ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(photo.id, 'up')}
                        disabled={index === 0}
                        aria-label="Move photo earlier"
                        className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(photo.id, 'down')}
                        disabled={index === photos.length - 1}
                        aria-label="Move photo later"
                        className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dark:text-dark-text dark:hover:bg-dark-surface/50"
                      >
                        ↓
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}
                  {deletingId === photo.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(photo.id)}
                      className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesTab({
  item,
  canWrite,
  canSeeNotes,
}: {
  item: InventoryItemWithStatus
  canWrite: boolean
  canSeeNotes: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!canSeeNotes) {
    return (
      <div className="p-4">
        <p className="text-sm text-mid-gray dark:text-dark-muted">
          Private notes are visible to Super Admin, Owner Admin, and Editors only.
        </p>
      </div>
    )
  }

  const notes = item.notes ?? []

  async function handleAddNote() {
    if (!content.trim()) {
      setError('Note content is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await addInventoryNote(item.id, content)
    setSubmitting(false)
    if ('success' in result) {
      setContent('')
      router.refresh()
      return
    }
    setError(result.error)
  }

  return (
    <div className="p-4 space-y-4">
      {notes.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className={`${cardClasses} p-3`}>
              <p className="text-xs text-mid-gray dark:text-dark-muted mb-1">
                {note.author_name ?? 'Unknown'} · {formatCT(note.created_at, 'MMM d, yyyy h:mm a')}
              </p>
              <p className="text-sm text-dark dark:text-dark-text whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {canWrite && (
        <div className={`${cardClasses} p-4 space-y-2`}>
          <label className="block text-sm font-semibold text-dark dark:text-dark-text">Add Private Note</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_NOTE_LENGTH}
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
          {error && <p className="text-sm text-brand-accent">{error}</p>}
          <button
            type="button"
            onClick={handleAddNote}
            disabled={submitting}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function InventoryDetailTabs({
  item,
  categories,
  canWrite,
  canDelete,
  canSeeNotes,
}: {
  item: InventoryItemWithStatus
  categories: InventoryCategory[]
  adminRole: AdminRole
  canWrite: boolean
  canDelete: boolean
  canSeeNotes: boolean
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const tabClasses = (tab: TabKey) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
      activeTab === tab
        ? 'border-brand-primary text-brand-primary dark:text-brand-primary-mid'
        : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
    }`

  return (
    <div className="max-w-5xl mx-auto">
      <div className={`${cardClasses}`}>
        <div className="flex border-b border-divider dark:border-dark-border px-2 overflow-x-auto">
          <button type="button" onClick={() => setActiveTab('overview')} className={tabClasses('overview')}>
            Overview
          </button>
          <button type="button" onClick={() => setActiveTab('photos')} className={tabClasses('photos')}>
            Photos
          </button>
          <button type="button" onClick={() => setActiveTab('notes')} className={tabClasses('notes')}>
            Notes
          </button>
          <button type="button" onClick={() => setActiveTab('checkouts')} className={tabClasses('checkouts')}>
            Checkouts
          </button>
          <button type="button" onClick={() => setActiveTab('qr')} className={tabClasses('qr')}>
            QR
          </button>
        </div>

        <div>
          {activeTab === 'overview' && (
            <OverviewTab item={item} categories={categories} canWrite={canWrite} canDelete={canDelete} />
          )}
          {activeTab === 'photos' && <PhotosTab item={item} canWrite={canWrite} />}
          {activeTab === 'notes' && <NotesTab item={item} canWrite={canWrite} canSeeNotes={canSeeNotes} />}
          {activeTab === 'checkouts' && (
            <div className="py-8 text-center text-mid-gray dark:text-dark-muted">
              <p>Checkout history and management coming soon.</p>
            </div>
          )}
          {activeTab === 'qr' && (
            <div className="py-8 text-center text-mid-gray dark:text-dark-muted">
              <p>QR code and tag printing coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
