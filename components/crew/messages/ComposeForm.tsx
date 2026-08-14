'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { createThread, searchUsers } from '@/lib/actions/messages'
import type { AdminUserBasic } from '@/types/messages'

interface ComposeFormProps {
  currentAdminId: string
  initialRecipient: AdminUserBasic | null
}

export default function ComposeForm({ currentAdminId, initialRecipient }: ComposeFormProps) {
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

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: '',
    immediatelyRender: false,
  })

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
    if (!recipient || !subject.trim() || !editor) return
    if (editor.getText().trim().length === 0) return
    const body = editor.getHTML()

    setError(null)
    startTransition(async () => {
      const result = await createThread(recipient.id, subject.trim(), body)
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

      {/* Body — TipTap */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark dark:text-dark-text mb-1.5">Message</label>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border border-b-0 border-neutral-border dark:border-dark-border rounded-t-lg bg-neutral-surface dark:bg-dark-nav">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded font-bold disabled:opacity-50 ${
              editor?.isActive('bold')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded italic disabled:opacity-50 ${
              editor?.isActive('italic')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded underline disabled:opacity-50 ${
              editor?.isActive('underline')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('bulletList')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('orderedList')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor?.getAttributes('link').href ?? ''
              const url = window.prompt('URL', previousUrl)
              if (url === null) return
              if (url === '') {
                editor?.chain().focus().unsetLink().run()
                return
              }
              editor?.chain().focus().setLink({ href: url }).run()
            }}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('link')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
            title="Insert or edit link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={!editor}
            className="px-2 py-1 text-xs rounded disabled:opacity-50 text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border"
            title="Insert horizontal rule"
          >
            —
          </button>
        </div>
        {/* Editor */}
        <div className="border border-neutral-border dark:border-dark-border rounded-b-lg bg-white dark:bg-dark-surface">
          <EditorContent
            editor={editor}
            className="text-sm text-dark dark:text-dark-text p-3 min-h-[140px] focus:outline-none
              [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]
              [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4
              [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4
              [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic"
          />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !selectedRecipient || !subject.trim() || !editor}
          className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}
