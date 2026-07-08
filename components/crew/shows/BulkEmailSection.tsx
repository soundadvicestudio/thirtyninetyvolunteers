'use client'

import { useState } from 'react'
import { sendShowBulkEmail } from '@/lib/actions/shows'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

const DEFAULT_SUBJECT = 'Message from 30 By Ninety Theatre'

type SendResult = { success: boolean; sentCount?: number; error?: string }

function resultMessage(result: SendResult): string {
  if (result.success) {
    const count = result.sentCount ?? 0
    return `Sent to ${count} volunteer${count !== 1 ? 's' : ''}.`
  }
  switch (result.error) {
    case 'no_recipients':
      return 'No rostered volunteers found.'
    case 'send_failed':
      return 'Email send failed. Please try again.'
    case 'unauthorized':
      return "You don't have permission to send emails."
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function BulkEmailSection({
  showId,
  showName,
  recipientCount,
  defaultReplyTo,
}: {
  showId: string
  showName: string
  recipientCount: number
  defaultReplyTo: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState(defaultReplyTo)
  const [confirmStep, setConfirmStep] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  if (recipientCount === 0) {
    return (
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        No volunteers are currently rostered for this show.
      </p>
    )
  }

  function resetForm() {
    setSubject(DEFAULT_SUBJECT)
    setBody('')
    setReplyTo(defaultReplyTo)
    setConfirmStep(false)
    setResult(null)
  }

  function handleCancel() {
    setIsOpen(false)
    setConfirmStep(false)
  }

  function handleSendClick() {
    if (subject.trim() === '' || body.trim() === '' || isSending) return
    setConfirmStep(true)
  }

  async function handleConfirmSend() {
    setIsSending(true)
    const res = await sendShowBulkEmail({ showId, showName, subject, body, replyTo })
    setResult(res)
    setIsSending(false)
    setConfirmStep(false)

    if (res.success) {
      setBody('')
      setTimeout(() => {
        setIsOpen(false)
        resetForm()
      }, 2000)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
      >
        Message Volunteers ({recipientCount})
      </button>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1">Message Volunteers</h2>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
        This message will be sent to {recipientCount} volunteer{recipientCount !== 1 ? 's' : ''} rostered for this
        show.
      </p>

      <div className="space-y-4 max-w-xl">
        <div>
          <label className={labelClasses}>
            Subject<span className="text-orange ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClasses}
            disabled={isSending}
          />
        </div>

        <div>
          <label className={labelClasses}>
            Reply-To<span className="text-orange ml-0.5">*</span>
          </label>
          <input
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            className={inputClasses}
            disabled={isSending}
          />
        </div>

        <div>
          <label className={labelClasses}>
            Message<span className="text-orange ml-0.5">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className={inputClasses}
            disabled={isSending}
          />
        </div>

        {!confirmStep ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendClick}
              disabled={subject.trim() === '' || body.trim() === '' || isSending}
              className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Send Message
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSending}
              className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-divider dark:border-dark-border bg-light-navy/30 dark:bg-dark-bg/40 p-4 space-y-3">
            <p className="text-sm text-dark dark:text-dark-text">
              Send this message to {recipientCount} volunteer{recipientCount !== 1 ? 's' : ''}?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {isSending ? 'Sending…' : 'Yes, Send'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                disabled={isSending}
                className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <p className={`text-sm ${result.success ? 'text-green-700 dark:text-green-400' : 'text-orange'}`}>
            {resultMessage(result)}
          </p>
        )}
      </div>
    </div>
  )
}
