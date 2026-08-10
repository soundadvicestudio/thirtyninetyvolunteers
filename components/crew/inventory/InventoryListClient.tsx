'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getInventoryItems, createInventoryItem } from '@/lib/actions/inventory'
import type {
  InventoryCategory,
  InventoryItemLocationInput,
  InventoryItemWithStatus,
  InventoryLocation,
  InventoryCondition,
} from '@/types/inventory'
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

function statusBadge(item: InventoryItemWithStatus) {
  if (item.is_overdue) {
    return { label: 'Overdue', className: 'bg-red-100 text-red-800 font-bold dark:bg-red-900/30 dark:text-red-400' }
  }
  if (item.is_checked_out) {
    return {
      label: 'Checked Out',
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    }
  }
  return null
}

function primaryLocationLabel(item: InventoryItemWithStatus): string {
  const first = item.item_locations?.[0]
  if (!first) return '—'
  return first.location?.name ?? first.freeform_location ?? '—'
}

type FilterState = {
  category: string
  availability: string
  condition: string
  location: string
  search: string
}

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  availability: 'all',
  condition: 'all',
  location: 'all',
  search: '',
}

function CreateItemModal({
  open,
  onOpenChange,
  categories,
  locations,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: InventoryCategory[]
  locations: InventoryLocation[]
}) {
  const router = useRouter()
  const activeCategories = categories.filter((c) => c.is_active)
  const activeLocations = locations.filter((l) => l.is_active)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState<InventoryCondition>('good')
  const [locationRows, setLocationRows] = useState<Array<{ locationId: string; freeform: string }>>([
    { locationId: '', freeform: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setCategoryId('')
    setDescription('')
    setCondition('good')
    setLocationRows([{ locationId: '', freeform: '' }])
    setError(null)
  }

  function closeModal() {
    onOpenChange(false)
    resetForm()
  }

  function updateLocationRow(index: number, field: 'locationId' | 'freeform', value: string) {
    setLocationRows((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row
        // Selecting a managed location clears the freeform text on this row
        // (and vice versa) — the two inputs are mutually exclusive per row.
        if (field === 'locationId') return { locationId: value, freeform: value ? '' : row.freeform }
        return { locationId: value ? '' : row.locationId, freeform: value }
      })
    )
  }

  function addLocationRow() {
    setLocationRows((rows) => [...rows, { locationId: '', freeform: '' }])
  }

  function removeLocationRow(index: number) {
    setLocationRows((rows) => rows.filter((_, i) => i !== index))
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!categoryId) {
      setError('Category is required.')
      return
    }
    const locationInputs: InventoryItemLocationInput[] = locationRows
      .filter((row) => row.locationId || row.freeform.trim())
      .map((row) =>
        row.locationId ? { location_id: row.locationId } : { freeform_location: row.freeform.trim() }
      )
    if (locationInputs.length === 0) {
      setError('At least one location is required.')
      return
    }

    setSubmitting(true)
    setError(null)
    const result = await createInventoryItem({
      name: name.trim(),
      category_id: categoryId,
      description: description.trim() || undefined,
      condition,
      locations: locationInputs,
    })
    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
      return
    }
    router.push(`/crew/inventory/${result.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            The item ID is generated automatically from the selected category&rsquo;s prefix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Category<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">Select a category...</option>
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

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Location{locationRows.length > 1 ? 's' : ''}
              <span className="text-brand-accent ml-0.5">*</span>
            </label>
            <div className="space-y-2">
              {locationRows.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={row.locationId}
                    onChange={(e) => updateLocationRow(index, 'locationId', e.target.value)}
                    className="flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="">Select a location...</option>
                    {activeLocations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-mid-gray dark:text-dark-muted">or</span>
                  <input
                    type="text"
                    placeholder="Or type a freeform location..."
                    value={row.freeform}
                    onChange={(e) => updateLocationRow(index, 'freeform', e.target.value)}
                    className="flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                  {locationRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocationRow(index)}
                      aria-label="Remove location"
                      className="text-mid-gray dark:text-dark-muted hover:text-brand-accent cursor-pointer px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLocationRow}
              className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer mt-2"
            >
              + Add Another Location
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="w-full bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Item'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="w-full border border-divider text-dark hover:bg-gray-100 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryListClient({
  categories,
  locations,
  items,
  canWrite,
}: {
  categories: InventoryCategory[]
  locations: InventoryLocation[]
  items: InventoryItemWithStatus[]
  adminRole: AdminRole
  canWrite: boolean
}) {
  const router = useRouter()
  const [allItems, setAllItems] = useState(items)
  const [showInactive, setShowInactive] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)

  const activeCategories = categories.filter((c) => c.is_active)
  const activeLocations = locations.filter((l) => l.is_active)

  function handleShowInactiveToggle() {
    const next = !showInactive
    setShowInactive(next)
    startTransition(async () => {
      const refreshed = await getInventoryItems({ is_active: next ? undefined : true })
      setAllItems(refreshed)
    })
  }

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filters.category !== 'all' && item.category_id !== filters.category) return false
      if (filters.condition !== 'all' && item.condition !== filters.condition) return false
      if (filters.availability === 'available' && item.is_checked_out) return false
      if (filters.availability === 'checked_out' && !item.is_checked_out) return false
      if (filters.availability === 'overdue' && !item.is_overdue) return false
      if (filters.location !== 'all') {
        const hasLocation = (item.item_locations ?? []).some((loc) => loc.location_id === filters.location)
        if (!hasLocation) return false
      }
      if (filters.search.trim()) {
        const term = filters.search.trim().toLowerCase()
        const matchesName = item.name.toLowerCase().includes(term)
        const matchesDescription = (item.description ?? '').toLowerCase().includes(term)
        if (!matchesName && !matchesDescription) return false
      }
      return true
    })
  }, [allItems, filters])

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filteredItems.length ? new Set() : new Set(filteredItems.map((i) => i.id))
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">All Categories</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filters.availability}
            onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
            className="rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked Out</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filters.condition}
            onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
            className="rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            className="rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">All Locations</option>
            {activeLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Item
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={handleShowInactiveToggle}
          className="rounded border-divider dark:border-dark-border text-brand-primary focus:ring-brand-primary"
        />
        <span className="text-sm text-dark dark:text-dark-text">
          Show inactive {isPending && <span className="text-mid-gray dark:text-dark-muted">(loading…)</span>}
        </span>
      </label>

      {filteredItems.length === 0 ? (
        <div className={`${cardClasses} p-8 text-center`}>
          <p className="text-mid-gray dark:text-dark-muted">
            {canWrite ? 'No items found. Add your first item using the button above.' : 'No items found.'}
          </p>
        </div>
      ) : (
        <div className={`${cardClasses} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredItems.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all items"
                    className="rounded border-divider dark:border-dark-border text-brand-primary focus:ring-brand-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Item ID
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const badge = statusBadge(item)
                return (
                  <tr
                    key={item.id}
                    className="border-b border-divider dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {/* Tag printing wired in INVENTORY.5 */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        aria-label={`Select ${item.name}`}
                        className="rounded border-divider dark:border-dark-border text-brand-primary focus:ring-brand-primary"
                      />
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 font-mono text-dark dark:text-dark-text cursor-pointer"
                    >
                      {item.item_number}
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 text-dark dark:text-dark-text font-medium cursor-pointer"
                    >
                      {item.name}
                      {!item.is_active && (
                        <span className="ml-2 text-xs font-semibold rounded-full px-2 py-0.5 bg-mid-gray/20 text-mid-gray">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 text-dark dark:text-dark-text cursor-pointer"
                    >
                      {item.category?.name ?? '—'}
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 cursor-pointer"
                    >
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${CONDITION_BADGE[item.condition]}`}
                      >
                        {CONDITION_LABELS[item.condition]}
                      </span>
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 cursor-pointer"
                    >
                      {badge ? (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded ${badge.className}`}>
                          {badge.label}
                        </span>
                      ) : (
                        <span className="text-xs text-mid-gray dark:text-dark-muted">Available</span>
                      )}
                    </td>
                    <td
                      onClick={() => router.push(`/crew/inventory/${item.id}`)}
                      className="px-4 py-3 text-dark dark:text-dark-text cursor-pointer"
                    >
                      {primaryLocationLabel(item)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateItemModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        categories={categories}
        locations={locations}
      />
    </div>
  )
}
