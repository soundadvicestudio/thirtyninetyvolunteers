'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'
import { createLocation, updateLocation, reorderLocation, toggleLocationActive } from '@/lib/actions/settings'

type LocationRowData = {
  id: string
  name: string
  color: string
  sort_order: number
  is_active: boolean
  default_hours: number | null
}

function hoursToDisplay(hours: number | null): string {
  return hours === null ? '—' : `${hours} hrs`
}

function LocationRow({
  location,
  isFirst,
  isLast,
  canReorder,
}: {
  location: LocationRowData
  isFirst: boolean
  isLast: boolean
  canReorder: boolean
}) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState(location.name)
  const [draftColor, setDraftColor] = useState(location.color)
  const [draftDefaultHours, setDraftDefaultHours] = useState(
    location.default_hours === null ? '' : String(location.default_hours)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderLocation(location.id, direction)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleToggleActive() {
    setError(null)
    const result = await toggleLocationActive(location.id, !location.is_active)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const hours = draftDefaultHours === '' ? null : parseFloat(draftDefaultHours)
    const result = await updateLocation(location.id, draftName, draftColor, hours)
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
    setDraftColor(location.color)
    setDraftDefaultHours(location.default_hours === null ? '' : String(location.default_hours))
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
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={!canReorder || isLast}
            aria-label={`Move ${location.name} down`}
            className="p-1 rounded text-dark hover:bg-light-navy cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-dark-text dark:hover:bg-dark-surface/50"
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
              className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-divider"
              />
              <span className="text-sm font-mono text-mid-gray dark:text-dark-muted">{draftColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={draftDefaultHours}
                onChange={(e) => setDraftDefaultHours(e.target.value)}
                placeholder="—"
                className="w-20 rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
              <span className="text-sm text-mid-gray dark:text-dark-muted">hrs (leave blank for global fallback)</span>
            </div>
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
              className="p-1 rounded text-orange hover:bg-pale-orange cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: location.color }}
              aria-hidden="true"
            />
            <span className="text-dark dark:text-dark-text font-medium">{location.name}</span>
            <span className="text-sm text-mid-gray dark:text-dark-muted">
              {hoursToDisplay(location.default_hours)}
            </span>
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
              className="p-1 rounded text-navy hover:bg-light-navy cursor-pointer dark:hover:bg-dark-surface/50"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`text-sm font-semibold px-3 py-1 rounded-md cursor-pointer transition-colors ${
                location.is_active
                  ? 'border border-orange text-orange hover:bg-orange hover:text-white'
                  : 'bg-navy text-white hover:bg-steel'
              }`}
            >
              {location.is_active ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-orange">{error}</p>}
    </div>
  )
}

function AddLocationForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#293994')
  const [newDefaultHours, setNewDefaultHours] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!newName.trim()) {
      setError('Name is required.')
      return
    }
    setError(null)
    setIsPending(true)
    const hours = newDefaultHours === '' ? null : parseFloat(newDefaultHours)
    const result = await createLocation(newName, newColor, hours)
    if ('success' in result) {
      setNewName('')
      setNewColor('#293994')
      setNewDefaultHours('')
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
        className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer mb-6"
      >
        Add Location
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-6">
      <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Add Location</h2>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-divider"
          />
          <span className="text-sm font-mono text-mid-gray dark:text-dark-muted">{newColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={newDefaultHours}
            onChange={(e) => setNewDefaultHours(e.target.value)}
            placeholder="—"
            className="w-20 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
          <span className="text-sm text-mid-gray dark:text-dark-muted">hrs (leave blank for global fallback)</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
      {error && <p className="text-sm text-orange mt-2">{error}</p>}
    </div>
  )
}

export default function LocationsManager({ locations }: { locations: LocationRowData[] }) {
  return (
    <div>
      <AddLocationForm />
      {locations.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-sm">No locations yet. Add your first one above.</p>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          {locations.map((location) => {
            // reorderLocation() only considers active locations when computing
            // swap neighbors, so up/down position must be evaluated against the
            // active-only subset — not the full list index — or the buttons'
            // enabled state would disagree with what the server can actually do.
            const activeLocations = locations.filter((l) => l.is_active)
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
      <p className="text-xs text-mid-gray dark:text-dark-muted mt-3">
        Deactivating a location hides it from new bookings without affecting existing events.
      </p>
    </div>
  )
}
