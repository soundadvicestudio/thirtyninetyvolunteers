'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { searchVolunteers, previewBlast, sendBlastEmail } from '@/lib/actions/blast'

type Props = {
  defaultReplyTo: string
  categories: Array<{ id: string; name: string }>
}

type Step = 'compose' | 'confirm' | 'sent'
type RecipientMode = 'all' | 'category' | 'individual'
type VolunteerHit = { id: string; full_name: string; email: string }

export default function BlastComposer({ defaultReplyTo, categories }: Props) {
  const [step, setStep] = useState<Step>('compose')

  // Compose form (all controlled)
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedIndividuals, setSelectedIndividuals] = useState<VolunteerHit[]>([])
  const [subject, setSubject] = useState('')
  const [replyTo, setReplyTo] = useState(defaultReplyTo)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: '',
    immediatelyRender: false, // required for Next.js App Router to prevent hydration mismatch
  })

  // Individual search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VolunteerHit[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Confirm state
  const [preview, setPreview] = useState<{ recipientCount: number; sampleEmails: string[] } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Send state
  const [sendLoading, setSendLoading] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  function handleSearchChange(query: string) {
    setSearchQuery(query)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      const results = await searchVolunteers(query)
      setSearchResults(results)
      setSearchLoading(false)
    }, 300)
  }

  function validateCompose(): boolean {
    const errs: Record<string, string> = {}
    if (!subject.trim()) errs.subject = 'Subject is required'
    if (!replyTo.trim()) errs.replyTo = 'Reply-To is required'
    const bodyText = editor?.getText() ?? ''
    if (!bodyText.trim()) errs.body = 'Message is required'
    if (recipientMode === 'category' && selectedCategoryIds.length === 0) {
      errs.recipients = 'Select at least one category'
    }
    if (recipientMode === 'individual' && selectedIndividuals.length === 0) {
      errs.recipients = 'Add at least one recipient'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePreview() {
    if (!validateCompose()) return
    setPreviewLoading(true)
    setActionError(null)
    const result = await previewBlast({
      recipientMode,
      categoryIds: selectedCategoryIds,
      individualIds: selectedIndividuals.map((v) => v.id),
      subject,
      replyTo,
      body: editor?.getHTML() ?? '',
    })
    setPreviewLoading(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
    setPreview(result)
    setStep('confirm')
  }

  async function handleSend() {
    setSendLoading(true)
    setActionError(null)
    const result = await sendBlastEmail({
      recipientMode,
      categoryIds: selectedCategoryIds,
      individualIds: selectedIndividuals.map((v) => v.id),
      subject,
      replyTo,
      body: editor?.getHTML() ?? '',
    })
    setSendLoading(false)
    if (!result.success) {
      setActionError(result.error ?? 'Send failed')
      return
    }
    setSentCount(result.recipientCount)
    setStep('sent')
  }

  function handleReset() {
    setStep('compose')
    setRecipientMode('all')
    setSelectedCategoryIds([])
    setSelectedIndividuals([])
    setSubject('')
    setReplyTo(defaultReplyTo)
    editor?.commands.clearContent()
    setSearchQuery('')
    setSearchResults([])
    setPreview(null)
    setActionError(null)
    setErrors({})
  }

  const modeButtonClass = (mode: RecipientMode) =>
    recipientMode === mode
      ? 'w-full sm:w-auto px-4 py-2 rounded bg-navy text-white text-sm'
      : 'w-full sm:w-auto px-4 py-2 rounded border border-divider dark:border-dark-border text-dark dark:text-dark-text bg-white dark:bg-dark-surface text-sm'

  function handleSetLink() {
    const previousUrl =
      editor?.getAttributes('link').href ?? ''
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return // user cancelled
    if (url === '') {
      editor?.chain().focus().unsetLink().run()
      return
    }
    editor?.chain().focus()
      .setLink({ href: url })
      .run()
  }

  if (step === 'sent') {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle className="mx-auto text-green-600" size={48} />
        <h2 className="text-xl font-bold text-dark dark:text-dark-text">Email sent successfully!</h2>
        <p className="text-mid-gray dark:text-dark-muted">
          {sentCount} volunteer{sentCount !== 1 ? 's' : ''} received your message.
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-navy text-white rounded text-sm font-semibold hover:bg-steel"
        >
          Send Another Email
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-dark dark:text-dark-text">Confirm &amp; Send</h2>

        <div className="bg-light-navy dark:bg-dark-surface rounded-lg p-5 space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
              Subject
            </span>
            <p className="text-dark dark:text-dark-text mt-0.5">{subject}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
              Reply-To
            </span>
            <p className="text-dark dark:text-dark-text mt-0.5">{replyTo}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
              Recipients
            </span>
            <p className="text-dark dark:text-dark-text mt-0.5">
              {recipientMode === 'all' && 'All Active Volunteers'}
              {recipientMode === 'category' && 'By Category'}
              {recipientMode === 'individual' && 'Individual'}
              {' — '}
              <strong>{preview?.recipientCount ?? 0}</strong>
              {' volunteers'}
            </p>
            {preview?.sampleEmails && preview.sampleEmails.length > 0 && (
              <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
                {preview.sampleEmails.join(', ')}
                {(preview.recipientCount ?? 0) > 5 ? ' and more...' : ''}
              </p>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
              Preview
            </span>
            <p className="text-dark dark:text-dark-text mt-0.5 text-sm">
              {(editor?.getText() ?? '').slice(0, 150)}
              {(editor?.getText() ?? '').length > 150 ? '...' : ''}
            </p>
          </div>
        </div>

        <div className="border border-orange bg-pale-orange rounded-lg p-4">
          <p className="text-sm text-dark font-semibold">
            ⚠ This will send <strong>{preview?.recipientCount ?? 0}</strong> emails. This action{' '}
            {"can't"} be undone.
          </p>
        </div>

        {actionError && <p className="text-red-500 text-sm">{actionError}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setStep('compose')
              setActionError(null)
            }}
            className="px-5 py-2 border border-divider dark:border-dark-border rounded text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-border"
          >
            ← Back
          </button>
          <button
            onClick={handleSend}
            disabled={sendLoading}
            className="px-6 py-2 bg-orange text-white rounded text-sm font-semibold disabled:opacity-50 hover:bg-steel"
          >
            {sendLoading ? 'Sending...' : 'Send Email Blast'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark dark:text-dark-text">New Email Blast</h2>

      {/* Recipient mode selector */}
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Recipients</label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button onClick={() => setRecipientMode('all')} className={modeButtonClass('all')}>
            All Volunteers
          </button>
          <button onClick={() => setRecipientMode('category')} className={modeButtonClass('category')}>
            By Category
          </button>
          <button onClick={() => setRecipientMode('individual')} className={modeButtonClass('individual')}>
            Individual
          </button>
        </div>
        {errors.recipients && <p className="text-red-500 text-sm mt-1">{errors.recipients}</p>}
      </div>

      {recipientMode === 'all' && (
        <p className="text-sm text-mid-gray dark:text-dark-muted">This will email all active volunteers.</p>
      )}

      {recipientMode === 'category' && (
        <div className="space-y-2">
          <p className="text-sm text-mid-gray dark:text-dark-muted">
            Volunteers matching ANY selected category will receive the email.
          </p>
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 text-sm text-dark dark:text-dark-text cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategoryIds((prev) => [...prev, cat.id])
                    } else {
                      setSelectedCategoryIds((prev) => prev.filter((id) => id !== cat.id))
                    }
                  }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {recipientMode === 'individual' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full border border-divider dark:border-dark-border rounded px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface"
            />
            {searchLoading && <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded mt-1 shadow-lg">
                {searchResults.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (!selectedIndividuals.find((s) => s.id === v.id)) {
                        setSelectedIndividuals((prev) => [...prev, v])
                      }
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-border"
                  >
                    {v.full_name}
                    <span className="text-mid-gray dark:text-dark-muted ml-1">{v.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedIndividuals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIndividuals.map((v) => (
                <span
                  key={v.id}
                  className="flex items-center gap-1 bg-light-navy text-navy text-xs px-2 py-1 rounded-full"
                >
                  {v.full_name}
                  <button
                    onClick={() => setSelectedIndividuals((prev) => prev.filter((s) => s.id !== v.id))}
                    className="hover:text-orange ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-divider dark:border-dark-border rounded px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface"
        />
        <div className="flex justify-between mt-1">
          {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
          <p className="text-xs text-mid-gray dark:text-dark-muted ml-auto">{subject.length}/200</p>
        </div>
      </div>

      {/* Reply-To */}
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Reply-To</label>
        <input
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          className="w-full border border-divider dark:border-dark-border rounded px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface"
        />
        {errors.replyTo && <p className="text-red-500 text-xs mt-1">{errors.replyTo}</p>}
      </div>

      {/* Message body — TipTap rich text editor */}
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Message</label>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-divider dark:border-dark-border bg-light-navy dark:bg-dark-surface rounded-t-md">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs rounded font-bold ${
              editor?.isActive('bold')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs rounded italic ${
              editor?.isActive('italic')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 text-xs rounded underline ${
              editor?.isActive('underline')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 text-xs rounded font-bold ${
              editor?.isActive('heading', { level: 1 })
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs rounded font-semibold ${
              editor?.isActive('heading', { level: 2 })
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            className="px-2 py-1 text-xs rounded text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border"
            title="Insert horizontal rule"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor?.isActive('bulletList')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor?.isActive('orderedList')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={handleSetLink}
            className={`px-2 py-1 text-xs rounded ${
              editor?.isActive('link')
                ? 'bg-navy text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
            title="Insert or edit link"
          >
            🔗
          </button>
        </div>

        {/* Editor content area */}
        <EditorContent
          editor={editor}
          className="min-h-[180px] px-3 py-2 text-sm
            text-dark dark:text-dark-text
            bg-white dark:bg-dark-surface
            rounded-b-md border-x border-b
            border-divider dark:border-dark-border
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:min-h-[160px]
            [&_.ProseMirror_p]:mb-3
            [&_.ProseMirror_ul]:list-disc
            [&_.ProseMirror_ul]:pl-5
            [&_.ProseMirror_ul]:mb-3
            [&_.ProseMirror_ol]:list-decimal
            [&_.ProseMirror_ol]:pl-5
            [&_.ProseMirror_ol]:mb-3
            [&_.ProseMirror_strong]:font-bold
            [&_.ProseMirror_em]:italic
            [&_.ProseMirror]:placeholder:text-mid-gray"
        />
        <div className="flex justify-between mt-1">
          {errors.body && <p className="text-red-500 text-xs">{errors.body}</p>}
          <p className="text-xs text-mid-gray dark:text-dark-muted ml-auto">
            {(editor?.getText() ?? '').length}/10,000
          </p>
        </div>
      </div>

      {actionError && <p className="text-red-500 text-sm">{actionError}</p>}

      <button
        onClick={handlePreview}
        disabled={previewLoading}
        className="px-6 py-2 bg-navy text-white rounded text-sm font-semibold disabled:opacity-50 hover:bg-steel"
      >
        {previewLoading ? 'Loading...' : 'Preview & Send →'}
      </button>
    </div>
  )
}
