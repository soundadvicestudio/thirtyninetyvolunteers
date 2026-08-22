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
      ? 'w-full sm:w-auto bg-brand-primary text-white rounded-md px-3 py-2 text-sm font-medium text-center'
      : 'w-full sm:w-auto text-gray-600 dark:text-gray-400 rounded-md px-3 py-2 text-sm text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-nav'

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
          className="px-6 py-2 bg-brand-primary text-white rounded text-sm font-semibold hover:bg-brand-primary-mid"
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

        <div className="bg-white dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Subject
              </div>
              <div className="text-sm text-gray-900 dark:text-white mt-0.5">{subject}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Reply-To
              </div>
              <div className="text-sm text-gray-900 dark:text-white mt-0.5">{replyTo}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Recipients
              </div>
              <div className="text-sm text-gray-900 dark:text-white mt-0.5">
                {recipientMode === 'all' && 'All Active Volunteers'}
                {recipientMode === 'category' && 'By Category'}
                {recipientMode === 'individual' && 'Individual'}
                {' — '}
                <strong>{preview?.recipientCount ?? 0}</strong>
                {' volunteers'}
              </div>
              {preview?.sampleEmails && preview.sampleEmails.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {preview.sampleEmails.join(', ')}
                  {(preview.recipientCount ?? 0) > 5 ? ' and more...' : ''}
                </p>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preview
            </div>
            <p className="text-sm text-gray-900 dark:text-white mt-0.5">
              {(editor?.getText() ?? '').slice(0, 150)}
              {(editor?.getText() ?? '').length > 150 ? '...' : ''}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 rounded-lg px-4 py-3 text-sm">
            ⚠ This will send <strong>{preview?.recipientCount ?? 0}</strong> emails. This action{' '}
            {"can't"} be undone.
          </div>
        </div>

        {actionError && <p className="text-red-500 text-sm">{actionError}</p>}

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => {
              setStep('compose')
              setActionError(null)
            }}
            className="border border-neutral-border bg-neutral-surface dark:bg-dark-surface dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            ← Back
          </button>
          <button
            onClick={handleSend}
            disabled={sendLoading}
            className="bg-brand-accent text-white rounded-md px-6 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-brand-accent-dark"
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
        <div className="bg-neutral-surface dark:bg-dark-nav border border-neutral-border dark:border-dark-border rounded-lg p-1 flex flex-col sm:flex-row gap-1 mt-2">
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
                    className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border"
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
                  className="flex items-center gap-1 bg-brand-primary-light text-brand-primary text-xs px-2 py-1 rounded-full"
                >
                  {v.full_name}
                  <button
                    onClick={() => setSelectedIndividuals((prev) => prev.filter((s) => s.id !== v.id))}
                    className="hover:text-brand-accent ml-1 font-bold"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-neutral-border dark:border-dark-border rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-dark-surface"
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
        <div className="bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-t-md px-2 py-1.5 flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold cursor-pointer ${
              editor?.isActive('bold')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm italic cursor-pointer ${
              editor?.isActive('italic')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm underline cursor-pointer ${
              editor?.isActive('underline')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold cursor-pointer ${
              editor?.isActive('heading', { level: 1 })
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold cursor-pointer ${
              editor?.isActive('heading', { level: 2 })
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            className="w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav"
            title="Insert horizontal rule"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer ${
              editor?.isActive('bulletList')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer ${
              editor?.isActive('orderedList')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={handleSetLink}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer ${
              editor?.isActive('link')
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav'
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
            text-gray-700 dark:text-gray-300
            bg-white dark:bg-dark-surface
            rounded-b-md border-x border-b
            border-neutral-border dark:border-dark-border
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

      <div className="flex justify-end pt-2">
        <button
          onClick={handlePreview}
          disabled={previewLoading}
          className="bg-brand-primary text-white rounded-md px-6 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-brand-primary-dark"
        >
          {previewLoading ? 'Loading...' : 'Preview & Send →'}
        </button>
      </div>
    </div>
  )
}
