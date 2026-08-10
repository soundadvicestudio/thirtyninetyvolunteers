'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'
import {
  createInventoryCategory,
  updateInventoryCategory,
  reorderInventoryCategory,
  toggleInventoryCategoryActive,
  createInventoryLocation,
  updateInventoryLocation,
  reorderInventoryLocation,
  toggleInventoryLocationActive,
} from '@/lib/actions/inventory-settings'
import type { InventoryCategory, InventoryLocation } from '@/types/inventory'

const PREFIX_HINT = '2–6 uppercase letters only'

function CategoryRow({
  category,
  isFirst,
  isLast,
  canReorder,
}: {
  category: InventoryCategory
  isFirst: boolean
  isLast: boolean
  canReorder: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(category.name)
  const [draftPrefix, setDraftPrefix] = useState(category.prefix)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderInventoryCategory(category.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleToggleActive() {
    setError(null)
    const result = await toggleInventoryCategoryActive(category.id)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateInventoryCategory(category.id, draftName, draftPrefix)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(category.name)
    setDraftPrefix(category.prefix)
    setEditMode(false)
    setError(null)
  }

  return (
    <div
      className={`flex flex-col gap-2 border-b border-divider dark:border-dark-border px-4 py-3 last:border-b-0 ${
        category.is_active ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleReorder('up')}
            disabled={!canReorder || isFirst}
            aria-label={`Move ${category.name} up`}
            className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={!canReorder || isLast}
            aria-label={`Move ${category.name} down`}
            className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {editMode ? (
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
            <div>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                autoFocus
              />
            </div>
            <div>
              <input
                type="text"
                value={draftPrefix}
                onChange={(e) => setDraftPrefix(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-24 rounded border border-divider dark:border-dark-border px-2 py-1 text-sm font-mono uppercase text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">{PREFIX_HINT}</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              aria-label="Save category"
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
            <span className="text-dark dark:text-dark-text font-medium">{category.name}</span>
            <span className="text-xs font-mono font-semibold rounded px-2 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
              {category.prefix}
            </span>
            {!category.is_active && (
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-mid-gray/20 text-mid-gray">
                Deactivated
              </span>
            )}
          </div>
        )}

        {!editMode && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              aria-label={`Edit ${category.name}`}
              className="p-1 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:hover:bg-dark-surface/50"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`text-sm font-semibold px-3 py-1 rounded-md cursor-pointer transition-colors ${
                category.is_active
                  ? 'border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white'
                  : 'bg-brand-primary text-white hover:bg-brand-primary-mid'
              }`}
            >
              {category.is_active ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-brand-accent">{error}</p>}
    </div>
  )
}

function AddCategoryForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrefix, setNewPrefix] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!newName.trim()) {
      setError('Name is required.')
      return
    }
    if (!/^[A-Z]{2,6}$/.test(newPrefix)) {
      setError(PREFIX_HINT)
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createInventoryCategory(newName, newPrefix)
    if ('success' in result) {
      setNewName('')
      setNewPrefix('')
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
        Add Category
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide mb-3">Add Category</h3>
      <div className="flex items-start gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        <div>
          <input
            type="text"
            placeholder="Prefix"
            value={newPrefix}
            onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-28 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm font-mono uppercase text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">{PREFIX_HINT}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Adding…' : 'Add Category'}
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

function LocationRow({
  location,
  isFirst,
  isLast,
  canReorder,
}: {
  location: InventoryLocation
  isFirst: boolean
  isLast: boolean
  canReorder: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(location.name)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderInventoryLocation(location.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleToggleActive() {
    setError(null)
    const result = await toggleInventoryLocationActive(location.id)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateInventoryLocation(location.id, draftName)
    if ('success' in result) {
      setEditMode(false)
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(location.name)
    setEditMode(false)
    setError(null)
  }

  return (
    <div
      className={`flex flex-col gap-2 border-b border-divider dark:border-dark-border px-4 py-3 last:border-b-0 ${
        location.is_active ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleReorder('up')}
            disabled={!canReorder || isFirst}
            aria-label={`Move ${location.name} up`}
            className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={!canReorder || isLast}
            aria-label={`Move ${location.name} down`}
            className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
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
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              aria-label="Save location"
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
            <span className="text-dark dark:text-dark-text font-medium">{location.name}</span>
            {!location.is_active && (
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-mid-gray/20 text-mid-gray">
                Deactivated
              </span>
            )}
          </div>
        )}

        {!editMode && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              aria-label={`Edit ${location.name}`}
              className="p-1 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:hover:bg-dark-surface/50"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`text-sm font-semibold px-3 py-1 rounded-md cursor-pointer transition-colors ${
                location.is_active
                  ? 'border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white'
                  : 'bg-brand-primary text-white hover:bg-brand-primary-mid'
              }`}
            >
              {location.is_active ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-brand-accent">{error}</p>}
    </div>
  )
}

function AddLocationForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!newName.trim()) {
      setError('Name is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const result = await createInventoryLocation(newName)
    if ('success' in result) {
      setNewName('')
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
        Add Location
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide mb-3">Add Location</h3>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
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
          {isPending ? 'Adding…' : 'Add Location'}
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

export default function InventorySettingsClient({
  categories,
  locations,
}: {
  categories: InventoryCategory[]
  locations: InventoryLocation[]
  canWrite: boolean
}) {
  const activeCategories = categories.filter((c) => c.is_active)
  const activeLocations = locations.filter((l) => l.is_active)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1">Categories</h2>
        <p className="text-mid-gray dark:text-dark-muted text-sm mb-4">
          Categories group inventory items and define the prefix used in auto-generated item IDs
          (e.g. COST-0042 for a Costumes category with prefix &ldquo;COST&rdquo;).
        </p>
        <AddCategoryForm />
        {categories.length === 0 ? (
          <p className="text-mid-gray dark:text-dark-muted text-sm">
            No categories yet. Add your first category above.
          </p>
        ) : (
          <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
            {categories.map((category) => {
              const activeIndex = activeCategories.findIndex((c) => c.id === category.id)
              return (
                <CategoryRow
                  key={category.id}
                  category={category}
                  canReorder={category.is_active}
                  isFirst={activeIndex === 0}
                  isLast={activeIndex === activeCategories.length - 1}
                />
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1">Storage Locations</h2>
        <p className="text-mid-gray dark:text-dark-muted text-sm mb-4">
          Managed storage locations can be assigned to items. Items can also have freeform location
          notes.
        </p>
        <AddLocationForm />
        {locations.length === 0 ? (
          <p className="text-mid-gray dark:text-dark-muted text-sm">
            No locations yet. Add your first location above.
          </p>
        ) : (
          <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
            {locations.map((location) => {
              const activeIndex = activeLocations.findIndex((l) => l.id === location.id)
              return (
                <LocationRow
                  key={location.id}
                  location={location}
                  canReorder={location.is_active}
                  isFirst={activeIndex === 0}
                  isLast={activeIndex === activeLocations.length - 1}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
