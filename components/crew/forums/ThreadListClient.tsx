'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Pin, Lock, MessageSquare } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { markAllForumRead } from '@/lib/actions/forums'
import { createThread } from '@/lib/actions/forum-moderation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ForumDetail, ThreadSummary } from '@/types/forums'

function ThreadRow({
  forumId,
  thread,
  timezone,
}: {
  forumId: string
  thread: ThreadSummary
  timezone: string
}) {
  return (
    <Link
      href={`/crew/forums/${forumId}/${thread.id}`}
      className="flex items-start gap-3 px-4 py-3.5 border-b border-neutral-border dark:border-dark-border last:border-b-0 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
      style={{ borderLeftColor: 'var(--brand-primary)' }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {thread.prefix_label && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2 bg-neutral-surface dark:bg-dark-nav border border-neutral-border dark:border-dark-border text-mid-gray dark:text-dark-muted">
              [{thread.prefix_label}]
            </span>
          )}
          <span className={`text-sm ${thread.has_unread ? 'font-semibold' : 'font-medium'} text-dark dark:text-dark-text`}>
            {thread.title}
          </span>
          {thread.is_pinned && (
            <Pin className="w-3 h-3 text-mid-gray dark:text-dark-muted flex-shrink-0" aria-label="Pinned" />
          )}
          {thread.is_locked && (
            <Lock className="w-3 h-3 text-mid-gray dark:text-dark-muted flex-shrink-0" aria-label="Locked" />
          )}
        </div>
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
          {`Created by ${thread.created_by_name} on ${formatCT(thread.created_at, 'MMM d, yyyy h:mm a', timezone)}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
        <div className="flex items-center gap-2">
          {thread.has_unread && <span className="w-2 h-2 rounded-full bg-brand-primary" aria-label="Unread" />}
          <span className="flex items-center gap-1 text-xs text-mid-gray dark:text-dark-muted">
            <MessageSquare size={12} />
            {thread.reply_count}
          </span>
        </div>
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
          {thread.last_post_at
            ? `${formatCT(thread.last_post_at, 'MMM d, yyyy h:mm a', timezone)} by ${thread.last_post_author ?? 'Unknown'}`
            : 'No replies yet'}
        </p>
      </div>
    </Link>
  )
}

function ThreadEditorToolbar({ editor }: { editor: Editor | null }) {
  function handleSetLink() {
    const previousUrl = editor?.getAttributes('link').href ?? ''
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().unsetLink().run()
      return
    }
    editor?.chain().focus().setLink({ href: url }).run()
  }

  const btnClass = (active: boolean) =>
    `px-2 py-1 text-xs rounded ${
      active
        ? 'bg-brand-primary text-white'
        : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
    }`

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-divider dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 rounded-t-md">
      <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`${btnClass(!!editor?.isActive('bold'))} font-bold`}>
        B
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`${btnClass(!!editor?.isActive('italic'))} italic`}>
        I
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`${btnClass(!!editor?.isActive('underline'))} underline`}>
        U
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnClass(!!editor?.isActive('heading', { level: 1 }))} font-bold`}>
        H1
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnClass(!!editor?.isActive('heading', { level: 2 }))} font-semibold`}>
        H2
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnClass(!!editor?.isActive('heading', { level: 3 }))} font-semibold`}>
        H3
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={btnClass(!!editor?.isActive('bulletList'))}>
        • List
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={btnClass(!!editor?.isActive('orderedList'))}>
        1. List
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={btnClass(!!editor?.isActive('blockquote'))}>
        &ldquo; Quote
      </button>
      <button type="button" onClick={handleSetLink} className={btnClass(!!editor?.isActive('link'))} title="Insert or edit link">
        🔗
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 text-xs rounded text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border"
        title="Insert horizontal rule"
      >
        —
      </button>
    </div>
  )
}

function NewThreadModal({
  open,
  onOpenChange,
  forum,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  forum: ForumDetail
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [prefixId, setPrefixId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: '',
    immediatelyRender: false, // required for Next.js App Router to prevent hydration mismatch
  })

  function resetForm() {
    setTitle('')
    setPrefixId(null)
    setError(null)
    editor?.commands.clearContent()
  }

  function closeModal() {
    onOpenChange(false)
    resetForm()
  }

  async function handleCreate() {
    if (!title.trim()) {
      setError('Thread title is required.')
      return
    }
    if (!editor || editor.getText().trim().length === 0) {
      setError('Opening post cannot be empty.')
      return
    }

    setError(null)
    setIsCreating(true)
    const result = await createThread(forum.id, prefixId, title.trim(), editor.getHTML(), [])
    setIsCreating(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    onOpenChange(false)
    resetForm()
    router.push(`/crew/forums/${forum.id}/${result.threadId}`)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`New Thread in ${forum.name}`}</DialogTitle>
          <DialogDescription>Start a new discussion in this forum.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {forum.prefixes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Prefix</label>
              <select
                value={prefixId ?? ''}
                onChange={(e) => setPrefixId(e.target.value || null)}
                className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">— No prefix —</option>
                {forum.prefixes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Thread title<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this thread about?"
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Opening post</label>
            <ThreadEditorToolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="min-h-[120px] px-3 py-2 text-sm
                text-dark dark:text-dark-text
                bg-white dark:bg-dark-surface
                rounded-b-md border-x border-b
                border-divider dark:border-dark-border
                [&_.ProseMirror]:outline-none
                [&_.ProseMirror]:min-h-[100px]
                [&_.ProseMirror_p]:mb-3
                [&_.ProseMirror_ul]:list-disc
                [&_.ProseMirror_ul]:pl-5
                [&_.ProseMirror_ol]:list-decimal
                [&_.ProseMirror_ol]:pl-5
                [&_.ProseMirror_blockquote]:border-l-4
                [&_.ProseMirror_blockquote]:border-divider
                [&_.ProseMirror_blockquote]:pl-3
                [&_.ProseMirror_strong]:font-bold
                [&_.ProseMirror_em]:italic"
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
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating…' : 'Create Thread'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              disabled={isCreating}
              className="w-full text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ThreadListClient({
  forum,
  threads,
  isModerator,
  admin,
}: {
  forum: ForumDetail
  threads: ThreadSummary[]
  isModerator: boolean
  admin: { id: string; role: string; name: string }
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const router = useRouter()
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [markAllError, setMarkAllError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const isSaOa = admin.role === 'super_admin' || admin.role === 'owner_admin'
  const pinnedThreads = threads.filter((t) => t.is_pinned)
  const otherThreads = threads.filter((t) => !t.is_pinned)

  async function handleMarkAllRead() {
    setMarkAllError(null)
    setIsMarkingAllRead(true)
    const result = await markAllForumRead(forum.id)
    setIsMarkingAllRead(false)
    if (result.success) {
      router.refresh()
    } else {
      setMarkAllError('Something went wrong marking threads as read.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-4 flex-wrap">
        {threads.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer disabled:opacity-50"
          >
            {isMarkingAllRead ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
        {(isSaOa || isModerator) && (
          <Link
            href="/crew/forums/manage"
            className="text-sm text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Manage Forums
          </Link>
        )}
        {!forum.is_archived && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            New Thread
          </button>
        )}
      </div>
      {markAllError && <p className="text-sm text-brand-accent">{markAllError}</p>}

      {forum.is_archived && (
        <div className="border border-brand-accent bg-brand-accent-light rounded-lg p-3">
          <p className="text-sm text-dark font-semibold">Archived — no new threads or replies</p>
        </div>
      )}

      {threads.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No threads yet in this forum.</p>
      ) : (
        <div className="space-y-4">
          {pinnedThreads.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-1 mb-2">
                Pinned
              </p>
              <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
                {pinnedThreads.map((thread) => (
                  <ThreadRow key={thread.id} forumId={forum.id} thread={thread} timezone={tz} />
                ))}
              </div>
            </div>
          )}
          {otherThreads.length > 0 && (
            <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
              {otherThreads.map((thread) => (
                <ThreadRow key={thread.id} forumId={forum.id} thread={thread} timezone={tz} />
              ))}
            </div>
          )}
        </div>
      )}

      <NewThreadModal open={showCreateModal} onOpenChange={setShowCreateModal} forum={forum} />
    </div>
  )
}
