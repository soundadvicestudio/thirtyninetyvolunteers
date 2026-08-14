'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createThread, searchUsers } from '@/lib/actions/messages'
import DirectMessageComposer, {
  type DirectMessageComposerHandle,
} from '@/components/crew/messages/DirectMessageComposer'
import type { AdminUserBasic } from '@/types/messages'

interface ComposeFormProps {
  initialRecipient: AdminUserBasic | null
}

export default function ComposeForm({ initialRecipient }: ComposeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Recipient state — three modes:
  // 1. Pre-filled (initialRecipient prop) — locked, no clear
  // 2. Search mode (selectedRecipient === null, no pre-fill) — input shown
  // 3. Selected (clicked from search results) — locked with Clear button
  const [selectedRecipient, setSelectedRecipient] = useState<AdminUserBasic | null>(initialRecipient)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdminUserBasic[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const [subject, setSubject] = useState('')

  const composerRef = useRef<DirectMessageComposerHandle>(null)

  function handleSearchChange(query: string) {
    setSearchQuery(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchUsers(query)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }

  function handleSelectRecipient(user: AdminUserBasic) {
    setSelectedRecipient(user)
    setSearchResults([])
    setSearchQuery('')
  }

  function handleClearRecipient() {
    setSelectedRecipient(null)
    setSearchQuery('')
    setSearchResults([])
  }

  function handleSend() {
    const recipient = selectedRecipient
    if (!recipient || !subject.trim() || !composerRef.current) return
    if (composerRef.current.isEmpty()) return

    const body = composerRef.current.getBody()
    const attachments = composerRef.current.getAttachments()

    setError(null)
    startTransition(async () => {
      const result = await createThread(
        recipient.id,
        subject.trim(),
        body,
        attachments.length > 0 ? attachments : undefined
      )
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push(`/crew/messages/${result.threadId}`)
    })
  }

  return (
    <div>
      {/* Recipient field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark dark:text-dark-text mb-1.5">To</label>

        {selectedRecipient ? (
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-surface dark:bg-dark-nav rounded-lg border border-neutral-border dark:border-dark-border">
            <span className="text-sm font-medium text-dark dark:text-dark-text">{selectedRecipient.name}</span>
            {!initialRecipient && (
              <button
                type="button"
                onClick={handleClearRecipient}
                className="text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text text-xs ml-2"
              >
                × Clear
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 text-sm border border-neutral-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-dark dark:text-dark-text placeholder-mid-gray dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {isSearching && (
              <p className="absolute top-full left-0 mt-1 text-xs text-mid-gray dark:text-dark-muted">Searching...</p>
            )}
            {searchResults.length > 0 && !isSearching && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectRecipient(user)}
                      className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                    >
                      {user.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <p className="absolute top-full left-0 mt-1 text-xs text-mid-gray dark:text-dark-muted">No results found.</p>
            )}
          </div>
        )}
      </div>

      {/* Subject field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark dark:text-dark-text mb-1.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
          placeholder="Message subject..."
          className="w-full px-3 py-2 text-sm border border-neutral-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-dark dark:text-dark-text placeholder-mid-gray dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-1 text-right">{subject.length}/150</p>
      </div>

      {/* Message body with attachment support */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark dark:text-dark-text mb-1.5">Message</label>
        <DirectMessageComposer ref={composerRef} disabled={isPending} minHeight="140px" />
      </div>

      {/* Error */}
      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !selectedRecipient || !subject.trim() || !composerRef.current}
          className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}
