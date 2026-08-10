'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Pin, Lock, Bell, BellOff, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { toggleThreadSubscription } from '@/lib/actions/forum-posts'
import {
  editPost,
  deletePost,
  lockThread,
  unlockThread,
  pinThread,
  unpinThread,
  moveThread,
} from '@/lib/actions/forum-moderation'
import { getForumsForMove } from '@/lib/actions/forum-admin'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ForumPostComposer from '@/components/crew/forums/ForumPostComposer'
import type { ThreadViewData, ForumPostWithDetails } from '@/types/forums'

function EditEditorToolbar({ editor }: { editor: Editor | null }) {
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

export default function ThreadViewClient({ data }: { data: ThreadViewData }) {
  const router = useRouter()
  const { thread, forum, posts } = data
  const [isSubscribed, setIsSubscribed] = useState(data.isSubscribed)
  const [isTogglingSubscription, setIsTogglingSubscription] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [isTogglingLock, setIsTogglingLock] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [moveTargetForumId, setMoveTargetForumId] = useState('')
  const [availableForums, setAvailableForums] = useState<Array<{ id: string; name: string; category_name: string }>>(
    []
  )
  const [forumsLoading, setForumsLoading] = useState(false)
  const [moderationError, setModerationError] = useState<string | null>(null)

  const isSAOA = ['super_admin', 'owner_admin'].includes(data.adminRole)
  const canModerate = isSAOA || data.isModerator

  const editEditor = useEditor({
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

  function canEditPost(post: ForumPostWithDetails): boolean {
    return post.author_id === data.adminId || canModerate
  }

  function canDeletePost(post: ForumPostWithDetails): boolean {
    return post.author_id === data.adminId || canModerate
  }

  async function handleToggleSubscription() {
    setSubscribeError(null)
    setIsTogglingSubscription(true)
    const result = await toggleThreadSubscription(thread.id)
    setIsTogglingSubscription(false)
    if ('error' in result) {
      setSubscribeError(result.error)
    } else {
      setIsSubscribed(result.subscribed)
    }
  }

  function startEditPost(post: ForumPostWithDetails) {
    setModerationError(null)
    setEditingPostId(post.id)
    // Async setContent pattern — set the existing body directly in the
    // click handler, not via useEditor's content prop or a useEffect.
    editEditor?.commands.setContent(post.body_html)
  }

  function cancelEditPost() {
    setEditingPostId(null)
    editEditor?.commands.clearContent()
  }

  async function saveEditPost() {
    if (!editingPostId || !editEditor) return
    const result = await editPost(editingPostId, editEditor.getHTML())
    if ('error' in result) {
      setModerationError(result.error)
      return
    }
    setEditingPostId(null)
    editEditor.commands.clearContent()
    router.refresh()
  }

  async function confirmDeletePost() {
    if (!deletingPostId) return
    const result = await deletePost(deletingPostId)
    if ('error' in result) {
      setModerationError(result.error)
      return
    }
    setDeletingPostId(null)
    router.refresh()
  }

  async function handleToggleLock() {
    setModerationError(null)
    setIsTogglingLock(true)
    const fn = thread.is_locked ? unlockThread : lockThread
    const result = await fn(thread.id)
    setIsTogglingLock(false)
    if ('error' in result) {
      setModerationError(result.error)
      return
    }
    router.refresh()
  }

  async function handleTogglePin() {
    setModerationError(null)
    setIsTogglingPin(true)
    const fn = thread.is_pinned ? unpinThread : pinThread
    const result = await fn(thread.id)
    setIsTogglingPin(false)
    if ('error' in result) {
      setModerationError(result.error)
      return
    }
    router.refresh()
  }

  async function openMoveDialog() {
    setModerationError(null)
    setShowMoveDialog(true)
    setForumsLoading(true)
    const forums = await getForumsForMove(thread.forum_id)
    setAvailableForums(forums)
    setForumsLoading(false)
  }

  async function handleMove() {
    if (!moveTargetForumId) return
    const result = await moveThread(thread.id, moveTargetForumId)
    if ('error' in result) {
      setModerationError(result.error)
      return
    }
    setShowMoveDialog(false)
    router.push(`/crew/forums/${result.newForumId}/${thread.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="text-sm text-mid-gray dark:text-dark-muted flex items-center gap-1.5 flex-wrap">
        <Link href="/crew/forums" className="hover:text-brand-primary">
          Forums
        </Link>
        <span>›</span>
        <Link href={`/crew/forums/${thread.forum_id}`} className="hover:text-brand-primary">
          {forum.name}
        </Link>
        <span>›</span>
        <span className="text-dark dark:text-dark-text">{thread.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {thread.prefix_label && (
              <span className="text-xs font-semibold rounded px-1.5 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
                [{thread.prefix_label}]
              </span>
            )}
            <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{thread.title}</h1>
            {thread.is_pinned && (
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-primary">
                <Pin size={14} /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 text-xs font-semibold text-mid-gray">
                <Lock size={14} /> Locked
              </span>
            )}
          </div>
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
            {`Posted by ${thread.created_by_name} on ${formatCT(thread.created_at, 'MMM d, yyyy h:mm a')}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleToggleSubscription}
            disabled={isTogglingSubscription}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer disabled:opacity-50"
          >
            {isSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
          {subscribeError && <p className="text-xs text-brand-accent">{subscribeError}</p>}
        </div>
      </div>

      {canModerate && (
        <div className="bg-gray-50 dark:bg-dark-surface/50 border border-divider dark:border-dark-border rounded-lg p-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
            Moderation
          </span>
          <button
            type="button"
            onClick={handleToggleLock}
            disabled={isTogglingLock}
            className="text-sm font-medium px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer disabled:opacity-50"
          >
            {thread.is_locked ? 'Unlock Thread' : 'Lock Thread'}
          </button>
          <button
            type="button"
            onClick={handleTogglePin}
            disabled={isTogglingPin}
            className="text-sm font-medium px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer disabled:opacity-50"
          >
            {thread.is_pinned ? 'Unpin Thread' : 'Pin Thread'}
          </button>
          {isSAOA && (
            <button
              type="button"
              onClick={openMoveDialog}
              className="text-sm font-medium px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
            >
              Move Thread
            </button>
          )}
          {moderationError && <p className="text-xs text-brand-accent w-full">{moderationError}</p>}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No posts in this thread yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 flex flex-col sm:flex-row gap-4"
            >
              <div className="sm:w-40 shrink-0">
                <p className="text-dark dark:text-dark-text font-bold text-sm">{post.author_name}</p>
                <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                  {formatCT(post.created_at, 'MMM d, yyyy h:mm a')}
                </p>
                {post.edited_at && <p className="text-xs text-mid-gray dark:text-dark-muted italic">(edited)</p>}
              </div>
              <div className="flex-1 min-w-0">
                {post.is_deleted ? (
                  <p className="text-mid-gray dark:text-dark-muted italic text-sm">[Post deleted]</p>
                ) : editingPostId === post.id ? (
                  <div className="space-y-2">
                    <EditEditorToolbar editor={editEditor} />
                    <EditorContent
                      editor={editEditor}
                      className="min-h-[100px] px-3 py-2 text-sm
                        text-dark dark:text-dark-text
                        bg-white dark:bg-dark-surface
                        rounded-b-md border-x border-b
                        border-divider dark:border-dark-border
                        [&_.ProseMirror]:outline-none
                        [&_.ProseMirror]:min-h-[80px]"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={saveEditPost}
                        className="text-sm font-semibold px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-mid cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditPost}
                        className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    {moderationError && <p className="text-xs text-brand-accent">{moderationError}</p>}
                  </div>
                ) : (
                  <>
                    <div
                      dangerouslySetInnerHTML={{ __html: post.body_html }}
                      className="prose prose-sm max-w-none dark:prose-invert"
                    />
                    {post.attachments.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-divider dark:border-dark-border pt-2">
                        {post.attachments.map((a) => (
                          <div key={a.id} className="flex items-center gap-1.5 text-sm">
                            <Paperclip size={13} className="text-mid-gray dark:text-dark-muted" />
                            {a.signed_url ? (
                              <a
                                href={a.signed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-primary dark:text-brand-primary-mid hover:underline"
                              >
                                {a.filename}
                              </a>
                            ) : (
                              <span className="text-dark dark:text-dark-text">{a.filename}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {deletingPostId === post.id ? (
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-divider dark:border-dark-border">
                        <span className="text-sm text-dark dark:text-dark-text">Delete this post?</span>
                        <button
                          type="button"
                          onClick={confirmDeletePost}
                          className="text-sm font-semibold text-white bg-brand-accent hover:bg-brand-primary-mid px-3 py-1 rounded-md cursor-pointer"
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPostId(null)}
                          className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      (canEditPost(post) || canDeletePost(post)) && (
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-divider dark:border-dark-border">
                          {canEditPost(post) && (
                            <button
                              type="button"
                              onClick={() => startEditPost(post)}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          )}
                          {canDeletePost(post) && (
                            <button
                              type="button"
                              onClick={() => {
                                setModerationError(null)
                                setDeletingPostId(post.id)
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {thread.is_locked ? (
        <p className="text-center text-sm text-mid-gray dark:text-dark-muted py-4">
          This thread is locked. No new replies can be added.
        </p>
      ) : (
        <ForumPostComposer threadId={thread.id} />
      )}

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Thread</DialogTitle>
            <DialogDescription>Move this thread to a different forum.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {forumsLoading ? (
              <p className="text-sm text-mid-gray dark:text-dark-muted">Loading forums…</p>
            ) : (
              <select
                value={moveTargetForumId}
                onChange={(e) => setMoveTargetForumId(e.target.value)}
                className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">Select a forum…</option>
                {availableForums.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.category_name} — {f.name}
                  </option>
                ))}
              </select>
            )}
            {moderationError && <p className="text-sm text-brand-accent">{moderationError}</p>}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleMove}
                disabled={!moveTargetForumId || forumsLoading}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move
              </button>
              <button
                type="button"
                onClick={() => setShowMoveDialog(false)}
                className="w-full text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
