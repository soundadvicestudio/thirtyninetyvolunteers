'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'
import {
  addHearingOption,
  updateHearingOption,
  reorderHearingOption,
  toggleHearingOptionActive,
} from '@/lib/actions/settings'

type HearingOption = {
  id: string
  label: string
  sort_order: number
  is_active: boolean
}

function HearingOptionRow({
  option,
  isFirst,
  isLast,
}: {
  option: HearingOption
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftLabel, setDraftLabel] = useState(option.label)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderHearingOption(option.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleToggleActive() {
    setError(null)
    const result = await toggleHearingOptionActive(option.id, !option.is_active)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateHearingOption(option.id, draftLabel)
    if ('success' in result) {
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancel() {
    setDraftLabel(option.label)
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
            aria-label={`Move ${option.label} up`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={isLast}
            aria-label={`Move ${option.label} down`}
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
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              aria-label="Save label"
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
          <span className="text-dark dark:text-dark-text font-medium">{option.label}</span>
        )}
        {error && <p className="text-xs text-orange mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleToggleActive}
          className={`text-xs font-semibold rounded-full px-2.5 py-1 cursor-pointer transition-colors ${
            option.is_active ? 'bg-green-100 text-green-800' : 'bg-mid-gray/20 text-mid-gray'
          }`}
        >
          {option.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-4 py-3">
        {!editMode && (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            aria-label={`Edit ${option.label}`}
            className="p-1 rounded text-navy hover:bg-light-navy cursor-pointer dark:hover:bg-dark-surface/50"
          >
            <Pencil size={16} />
          </button>
        )}
      </td>
    </tr>
  )
}

function AddHearingOptionForm() {
  const router = useRouter()
  const [label, setLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!label.trim()) {
      setError('Label is required.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    const result = await addHearingOption(label)
    if ('success' in result) {
      setLabel('')
      router.refresh()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-6">
      <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Add Hearing Option</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Add Option
        </button>
      </div>
      {error && <p className="text-sm text-orange mt-2">{error}</p>}
    </div>
  )
}

export default function HearingOptionsManager({
  hearingOptions,
}: {
  hearingOptions: HearingOption[]
}) {
  if (hearingOptions.length === 0) {
    return (
      <div>
        <AddHearingOptionForm />
        <p className="text-mid-gray dark:text-dark-muted text-sm">
          No hearing options yet. Add your first one above.
        </p>
      </div>
    )
  }

  return (
    <div>
      <AddHearingOptionForm />
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider dark:border-dark-border text-left">
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Order</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Label</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Status</th>
              <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hearingOptions.map((option, i) => (
              <HearingOptionRow
                key={option.id}
                option={option}
                isFirst={i === 0}
                isLast={i === hearingOptions.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mid-gray dark:text-dark-muted mt-3">
        Inactive options are hidden from the signup form but kept on file for existing volunteer
        records.
      </p>
    </div>
  )
}
