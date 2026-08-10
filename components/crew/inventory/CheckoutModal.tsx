'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createCheckout, getSearchableShows, getSearchableAdminUsers } from '@/lib/actions/inventory-checkouts'
import type { CheckoutTargetType, InventoryItemWithStatus } from '@/types/inventory'

type ShowHit = { id: string; name: string }
type AdminHit = { id: string; name: string; role: string }

function useDebouncedSearch<T>(
  search: (query: string) => Promise<T[]>,
  minLength = 2,
  delayMs = 300
) {
  const [results, setResults] = useState<T[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(query: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (query.trim().length < minLength) {
        setResults([])
        return
      }
      const hits = await search(query)
      setResults(hits)
    }, delayMs)
  }

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setResults([])
  }

  return { results, handleChange, clear }
}

export default function CheckoutModal({
  isOpen,
  onClose,
  initialItemIds,
  availableItems,
}: {
  isOpen: boolean
  onClose: () => void
  initialItemIds?: string[]
  availableItems: InventoryItemWithStatus[]
  canWrite: boolean
}) {
  const router = useRouter()

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(initialItemIds ?? [])
  const [itemSearch, setItemSearch] = useState('')

  const [targetType, setTargetType] = useState<CheckoutTargetType>('show')

  const [showSearch, setShowSearch] = useState('')
  const [selectedShow, setSelectedShow] = useState<ShowHit | null>(null)
  const showSearchState = useDebouncedSearch<ShowHit>(getSearchableShows)

  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminHit | null>(null)
  const userSearchState = useDebouncedSearch<AdminHit>(getSearchableAdminUsers)

  const [customName, setCustomName] = useState('')
  const [customContact, setCustomContact] = useState('')

  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [checkoutNotes, setCheckoutNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setSelectedItemIds(initialItemIds ?? [])
    setItemSearch('')
    setTargetType('show')
    setShowSearch('')
    setSelectedShow(null)
    showSearchState.clear()
    setUserSearch('')
    setSelectedUser(null)
    userSearchState.clear()
    setCustomName('')
    setCustomContact('')
    setExpectedReturnDate('')
    setCheckoutNotes('')
    setError(null)
  }

  function handleClose() {
    onClose()
    resetForm()
  }

  const selectedItems = selectedItemIds
    .map((id) => availableItems.find((i) => i.id === id))
    .filter((i): i is InventoryItemWithStatus => !!i)

  const itemCandidates = availableItems.filter((item) => {
    if (selectedItemIds.includes(item.id)) return false
    if (item.is_checked_out) return false
    if (!itemSearch.trim()) return true
    const term = itemSearch.trim().toLowerCase()
    return item.item_number.toLowerCase().includes(term) || item.name.toLowerCase().includes(term)
  })

  function addItem(itemId: string) {
    setSelectedItemIds((prev) => [...prev, itemId])
    setItemSearch('')
  }

  function removeItem(itemId: string) {
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId))
  }

  async function handleSubmit() {
    if (selectedItemIds.length === 0) {
      setError('Select at least one item.')
      return
    }
    if (targetType === 'show' && !selectedShow) {
      setError('Select a show.')
      return
    }
    if (targetType === 'user' && !selectedUser) {
      setError('Select an admin user.')
      return
    }
    if (targetType === 'custom' && !customName.trim()) {
      setError('Enter a name.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createCheckout({
      item_ids: selectedItemIds,
      target_type: targetType,
      target_show_id: targetType === 'show' ? selectedShow?.id : undefined,
      target_user_id: targetType === 'user' ? selectedUser?.id : undefined,
      target_custom_name: targetType === 'custom' ? customName.trim() : undefined,
      target_custom_contact: targetType === 'custom' ? customContact.trim() || undefined : undefined,
      expected_return_date: expectedReturnDate || undefined,
      checkout_notes: checkoutNotes.trim() || undefined,
    })

    setIsSubmitting(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    router.refresh()
    handleClose()
  }

  const segmentClasses = (active: boolean) =>
    `flex-1 px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
      active
        ? 'bg-brand-primary text-white'
        : 'bg-white dark:bg-dark-surface text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50'
    }`

  const inputClasses =
    'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'

  return (
    <Dialog open={isOpen} onOpenChange={(next) => (next ? undefined : handleClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check Out Items</DialogTitle>
          <DialogDescription>Select items and who they&rsquo;re being checked out to.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Items<span className="text-brand-accent ml-0.5">*</span>
            </label>
            {selectedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedItems.map((item) => (
                  <span
                    key={item.id}
                    className="flex items-center gap-1 bg-brand-primary-light text-brand-primary text-xs px-2 py-1 rounded-full dark:bg-dark-border dark:text-dark-text"
                  >
                    <span className="font-mono">{item.item_number}</span> {item.name}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="hover:text-brand-accent ml-1 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="Search items by ID or name..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className={inputClasses}
              />
              {itemSearch.trim() && itemCandidates.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg max-h-48 overflow-y-auto">
                  {itemCandidates.slice(0, 20).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
                    >
                      <span className="font-mono">{item.item_number}</span> {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Checkout Target<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <div className="inline-flex w-full rounded-lg border border-divider dark:border-dark-border overflow-hidden">
              <button type="button" onClick={() => setTargetType('show')} className={segmentClasses(targetType === 'show')}>
                Show
              </button>
              <button type="button" onClick={() => setTargetType('user')} className={segmentClasses(targetType === 'user')}>
                Admin User
              </button>
              <button
                type="button"
                onClick={() => setTargetType('custom')}
                className={segmentClasses(targetType === 'custom')}
              >
                Custom
              </button>
            </div>
          </div>

          {targetType === 'show' && (
            <div>
              {selectedShow ? (
                <div className="flex items-center justify-between rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text">
                  {selectedShow.name}
                  <button
                    type="button"
                    onClick={() => setSelectedShow(null)}
                    aria-label="Clear selected show"
                    className="text-mid-gray dark:text-dark-muted hover:text-brand-accent cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search shows..."
                    value={showSearch}
                    onChange={(e) => {
                      setShowSearch(e.target.value)
                      showSearchState.handleChange(e.target.value)
                    }}
                    className={inputClasses}
                  />
                  {showSearchState.results.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg">
                      {showSearchState.results.map((show) => (
                        <button
                          key={show.id}
                          type="button"
                          onClick={() => {
                            setSelectedShow(show)
                            setShowSearch('')
                            showSearchState.clear()
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
                        >
                          {show.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {targetType === 'user' && (
            <div>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text">
                  {selectedUser.name}
                  <span className="text-xs text-mid-gray dark:text-dark-muted">{selectedUser.role}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Clear selected admin user"
                    className="text-mid-gray dark:text-dark-muted hover:text-brand-accent cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search admin users..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value)
                      userSearchState.handleChange(e.target.value)
                    }}
                    className={inputClasses}
                  />
                  {userSearchState.results.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg">
                      {userSearchState.results.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user)
                            setUserSearch('')
                            userSearchState.clear()
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
                        >
                          {user.name} <span className="text-mid-gray dark:text-dark-muted">{user.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {targetType === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Name<span className="text-brand-accent ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Contact Info
                </label>
                <input
                  type="text"
                  value={customContact}
                  onChange={(e) => setCustomContact(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Expected Return Date
            </label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Checkout Notes
            </label>
            <textarea
              rows={3}
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              className={inputClasses}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedItemIds.length === 0}
              className="w-full bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Checking Out...' : 'Check Out Items'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full border border-divider text-dark hover:bg-gray-100 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface/50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
