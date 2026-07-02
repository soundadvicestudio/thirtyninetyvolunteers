'use client'

import { useState } from 'react'
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

function reload() {
  window.location.href = window.location.href
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
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(category.name)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderCategory(category.id, direction)
    if ('success' in result) {
      reload()
      return
    }
    setError(result.error)
  }

  async function handleToggleVisibility() {
    setError(null)
    const result = await toggleVisibility(category.id, category.is_visible)
    if ('success' in result) {
      reload()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await renameCategory(category.id, draftName)
    if ('success' in result) {
      reload()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftName(category.name)
    setEditMode(false)
    setError(null)
  }

  return (
    <tr className="border-b border-divider">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleReorder('up')}
            disabled={isFirst}
            aria-label={`Move ${category.name} up`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={isLast}
            aria-label={`Move ${category.name} down`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
              className="rounded border border-divider px-2 py-1 text-sm text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
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
          <span className="text-dark font-medium">{category.name}</span>
        )}
        {error && <p className="text-xs text-orange mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3 text-mid-gray text-sm">{category.description || '—'}</td>
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
            className="p-1 rounded text-navy hover:bg-light-navy cursor-pointer"
          >
            <Pencil size={16} />
          </button>
        )}
      </td>
    </tr>
  )
}

function AddCategoryForm() {
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
      reload()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  return (
    <div className="bg-white border border-divider rounded-lg p-6 mb-6">
      <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Add Category</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-divider px-3 py-2 text-sm text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 rounded-lg border border-divider px-3 py-2 text-sm text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
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
        <p className="text-mid-gray text-sm">No categories yet. Add your first one above.</p>
      </div>
    )
  }

  return (
    <div>
      <AddCategoryForm />
      <div className="bg-white border border-divider rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider text-left">
              <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Order</th>
              <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Name</th>
              <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">
                Description
              </th>
              <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">
                Visibility
              </th>
              <th className="px-4 py-3 text-mid-gray font-semibold uppercase text-xs">Actions</th>
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
      <p className="text-xs text-mid-gray mt-3">
        Hidden categories are removed from the public signup form but remain on existing
        volunteer profiles.
      </p>
    </div>
  )
}
