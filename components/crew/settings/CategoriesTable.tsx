'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'
import {
  addCategory,
  renameCategory,
  toggleVisibility,
  reorderCategory,
} from '@/lib/actions/categories'

type Category = {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_visible: boolean
}

function CategoryRow({
  category,
  isFirst,
  isLast,
}: {
  category: Category
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(category.name)
  const [draftDescription, setDraftDescription] = useState(category.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderCategory(category.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleToggleVisibility() {
    setError(null)
    const result = await toggleVisibility(category.id, category.is_visible)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await renameCategory(category.id, draftName, draftDescription)
    if ('success' in result) {
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(category.name)
    setDraftDescription(category.description ?? '')
    setEditMode(false)
    setError(null)
  }

  return (
    <tr className="border-b border-divider dark:border-dark-border">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleReorder('up')}
            disabled={isFirst}
            aria-label={`Move ${category.name} up`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={isLast}
            aria-label={`Move ${category.name} down`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        {editMode ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              aria-label="Save name"
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
          <span className="text-dark dark:text-dark-text font-medium">{category.name}</span>
        )}
        {error && <p className="text-xs text-orange mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3 text-mid-gray dark:text-dark-muted text-sm align-top">
        {editMode ? (
          <textarea
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            rows={2}
            className="w-full rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-y"
          />
        ) : (
          category.description || '—'
        )}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleToggleVisibility}
          className={`text-xs font-semibold rounded-full px-2.5 py-1 cursor-pointer transition-colors ${
            category.is_visible ? 'bg-green-100 text-green-800' : 'bg-mid-gray/20 text-mid-gray'
          }`}
        >
          {category.is_visible ? 'Visible' : 'Hidden'}
        </button>
      </td>
      <td className="px-4 py-3">
        {!editMode && (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            aria-label={`Edit ${category.name}`}
            className="p-1 rounded text-navy hover:bg-light-navy cursor-pointer dark:hover:bg-dark-surface/50"
          >
            <Pencil size={16} />
          </button>
        )}
      </td>
    </tr>
  )
}

function AddCategoryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    const result = await addCategory(name, description || undefined)
    if ('success' in result) {
      setName('')
      setDescription('')
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-6">
      <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Add Category</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          className="flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-y"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Add Category
        </button>
      </div>
      {error && <p className="text-sm text-orange mt-2">{error}</p>}
    </div>
  )
}

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div>
        <AddCategoryForm />
        <p className="text-mid-gray dark:text-dark-muted text-sm">No categories yet. Add your first one above.</p>
      </div>
    )
  }

  return (
    <div>
      <AddCategoryForm />
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider dark:border-dark-border text-left">
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Order</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Name</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                Description
              </th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                Visibility
              </th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, i) => (
              <CategoryRow
                key={category.id}
                category={category}
                isFirst={i === 0}
                isLast={i === categories.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mid-gray dark:text-dark-muted mt-3">
        Hidden categories are removed from the public signup form but remain on existing
        volunteer profiles.
      </p>
    </div>
  )
}
