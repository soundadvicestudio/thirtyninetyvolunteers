'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { rotateCalendarToken } from '@/lib/actions/calendar'

export default function CalendarExportModal({
  subscriptionToken,
  onClose,
}: {
  subscriptionToken: string
  onClose: () => void
}) {
  const [token, setToken] = useState(subscriptionToken)
  const [copied, setCopied] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [rotateError, setRotateError] = useState<string | null>(null)

  const subscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/feed.ics?token=${token}`
  const downloadUrl = `/api/calendar/feed.ics?token=${token}`

  function handleCopy() {
    navigator.clipboard.writeText(subscribeUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleRotate() {
    setIsRotating(true)
    setRotateError(null)
    const result = await rotateCalendarToken()
    setIsRotating(false)
    if (result.success && result.newToken) {
      setToken(result.newToken)
    } else {
      setRotateError(result.error ?? 'Something went wrong.')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-divider dark:border-dark-border shrink-0">
            <h2 className="text-lg font-bold text-dark dark:text-dark-text">Export / Subscribe to Calendar</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-dark dark:text-dark-text mb-1">Subscribe (recommended)</h3>
              <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
                Your calendar app will automatically stay in sync as events are added or updated.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={subscribeUrl}
                  className="flex-1 min-w-0 rounded border border-divider dark:border-dark-border px-2 py-1.5 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="mt-3 text-sm text-mid-gray dark:text-dark-muted space-y-1">
                <p>
                  <strong className="text-dark dark:text-dark-text">Google Calendar:</strong> Settings → Other
                  calendars → &quot;From URL&quot; → paste the URL.
                </p>
                <p>
                  <strong className="text-dark dark:text-dark-text">Apple Calendar:</strong> File → New Calendar
                  Subscription → paste the URL.
                </p>
                <p>
                  <strong className="text-dark dark:text-dark-text">Outlook:</strong> Add calendar → Subscribe from
                  web → paste the URL.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-divider dark:border-dark-border">
                <button
                  type="button"
                  onClick={handleRotate}
                  disabled={isRotating}
                  className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:text-orange dark:hover:text-orange transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isRotating ? 'Rotating…' : 'Rotate subscription URL'}
                </button>
                {rotateError && <p className="text-xs text-orange mt-1">{rotateError}</p>}
                <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
                  Rotating invalidates your current subscription URL. All existing calendar app subscriptions will
                  stop updating.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-dark dark:text-dark-text mb-1">Download .ics file</h3>
              <p className="text-sm text-mid-gray dark:text-dark-muted mb-3">
                Download a snapshot of all current events. Re-download to get updates.
              </p>
              <a
                href={downloadUrl}
                download="30bn-calendar.ics"
                className="inline-block bg-navy text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-steel transition-colors"
              >
                Download calendar (.ics)
              </a>
            </div>
          </div>

          <div className="flex justify-end px-5 py-4 border-t border-divider dark:border-dark-border shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
