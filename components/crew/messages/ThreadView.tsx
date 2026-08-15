'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { markThreadRead, archiveThread } from '@/lib/actions/messages'
import { formatCT } from '@/lib/utils/date'
import ReplyComposer from './ReplyComposer'
import type { MessageThread, ThreadReplyWithDetails } from '@/types/messages'

interface ThreadViewProps {
  thread: MessageThread & {
    other_person_id: string
    other_person_name: string
  }
  replies: ThreadReplyWithDetails[]
  otherLastReadAt: string | null
  currentAdminId: string
}

export default function ThreadView({
  thread,
  replies,
  otherLastReadAt,
  currentAdminId,
}: ThreadViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Effect 1 — Mark thread as read on mount (fires once)
  useEffect(() => {
    void markThreadRead(thread.id)
  }, [thread.id])

  // Effect 2 — Auto-refresh polling (15s interval, cleanup on unmount)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 15000)
    return () => clearInterval(interval)
  }, [router])

  function handleArchive() {
    startTransition(async () => {
      await archiveThread(thread.id)
      router.push('/crew/messages')
    })
  }

  // Read receipt logic — shown only when the current user sent the most
  // recent reply AND the other participant has read it after it was sent.
  const mostRecentReply = replies[replies.length - 1]
  const showReadReceipt =
    otherLastReadAt !== null &&
    mostRecentReply !== undefined &&
    mostRecentReply.sender_id === currentAdminId &&
    new Date(otherLastReadAt) > new Date(mostRecentReply.created_at)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Heading zone */}
      <div className="pb-4 border-b border-neutral-border dark:border-dark-border mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href="/crew/messages"
            className="flex items-center gap-1.5 text-sm text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors flex-shrink-0 mt-1"
          >
            <ArrowLeft size={16} />
            Inbox
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-dark dark:text-dark-text truncate">{thread.subject}</h1>
            <p className="text-sm text-mid-gray dark:text-dark-muted mt-0.5">
              Conversation with {thread.other_person_name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleArchive}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-mid-gray dark:text-dark-muted border border-neutral-border dark:border-dark-border rounded-lg hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
        >
          Archive
        </button>
      </div>

      {/* Reply list */}
      {replies.length === 0 ? (
        <div className="text-center py-12 text-sm text-mid-gray dark:text-dark-muted">
          No messages yet. Send the first reply below.
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {replies.map((reply, index) => {
            const isOwnMessage = reply.sender_id === currentAdminId
            const isLast = index === replies.length - 1

            return (
              <div
                key={reply.id}
                className={`rounded-lg p-4 ${
                  isOwnMessage ? 'bg-brand-primary-subtle ml-8' : 'bg-neutral-surface dark:bg-dark-nav mr-8'
                }`}
              >
                {/* Reply header */}
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold text-dark dark:text-dark-text">
                    {isOwnMessage ? 'You' : reply.sender_name}
                  </span>
                  <span className="text-xs text-mid-gray dark:text-dark-muted flex-shrink-0">
                    {formatCT(reply.created_at, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                {/* Reply body — sanitized at write time (lib/actions/messages.ts),
                    safe for dangerouslySetInnerHTML. @tailwindcss/typography is not
                    installed, so TipTap output is styled via arbitrary variants. */}
                <div
                  className="text-sm text-dark dark:text-dark-text leading-relaxed
                    [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
                    [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-0.5
                    [&_strong]:font-semibold [&_em]:italic
                    [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-border
                    [&_blockquote]:pl-3 [&_blockquote]:text-mid-gray
                    [&_a]:text-brand-primary [&_a]:underline [&_hr]:my-3"
                  dangerouslySetInnerHTML={{ __html: reply.body }}
                />

                {/* Attachments — bodies sanitized at write time (MESSAGES.5 Task B) */}
                {reply.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1 pt-2 border-t border-neutral-border dark:border-dark-border">
                    {reply.attachments.map((att) => (
                      <li key={att.id}>
                        <a
                          href={att.signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
                        >
                          <Paperclip size={12} />
                          {att.file_name}
                          <span className="text-mid-gray dark:text-dark-muted ml-1">
                            ({Math.round(att.file_size / 1024)}KB)
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Read receipt — only on the last reply, only if we sent it */}
                {isLast && showReadReceipt && (
                  <p className="text-xs text-mid-gray dark:text-dark-muted mt-2 text-right">
                    Read {formatCT(otherLastReadAt!, 'h:mm a')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reply composer */}
      <ReplyComposer threadId={thread.id} />
    </div>
  )
}
