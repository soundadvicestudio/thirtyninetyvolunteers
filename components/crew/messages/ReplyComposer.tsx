'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createReply } from '@/lib/actions/messages'
import DirectMessageComposer, {
  type DirectMessageComposerHandle,
} from '@/components/crew/messages/DirectMessageComposer'

interface ReplyComposerProps {
  threadId: string
}

export default function ReplyComposer({ threadId }: ReplyComposerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const composerRef = useRef<DirectMessageComposerHandle>(null)

  function handleSubmit() {
    if (!composerRef.current || isPending) return
    if (composerRef.current.isEmpty()) return

    const body = composerRef.current.getBody()
    const attachments = composerRef.current.getAttachments()

    setError(null)
    startTransition(async () => {
      const result = await createReply(threadId, body, attachments.length > 0 ? attachments : undefined)
      if ('error' in result) {
        setError(result.error)
        return
      }
      composerRef.current?.clear()
      router.refresh()
    })
  }

  return (
    <div className="border-t border-neutral-border dark:border-dark-border pt-6 mt-2">
      <h2 className="text-sm font-semibold text-dark dark:text-dark-text mb-3">Reply</h2>

      <DirectMessageComposer ref={composerRef} disabled={isPending} minHeight="100px" />

      {/* Error */}
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}

      {/* Submit */}
      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !composerRef.current}
          className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  )
}
