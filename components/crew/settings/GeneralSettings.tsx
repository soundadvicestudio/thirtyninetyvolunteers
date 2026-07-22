'use client'

import { useState } from 'react'
import { saveDefaultHours, saveDefaultReplyTo } from '@/lib/actions/settings'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

function Feedback({ feedback }: { feedback: { type: 'success' | 'error'; message: string } | null }) {
  if (!feedback) return null
  return (
    <p
      className={`text-sm ${
        feedback.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-orange'
      }`}
    >
      {feedback.message}
    </p>
  )
}

export default function GeneralSettings({
  initialMainstage,
  initialStudioX,
  initialOneOff,
  initialReplyTo,
}: {
  initialMainstage: number
  initialStudioX: number
  initialOneOff: number
  initialReplyTo: string
}) {
  const [mainstage, setMainstage] = useState(String(initialMainstage))
  const [studioX, setStudioX] = useState(String(initialStudioX))
  const [oneOff, setOneOff] = useState(String(initialOneOff))
  const [isSavingHours, setIsSavingHours] = useState(false)
  const [hoursFeedback, setHoursFeedback] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const [replyTo, setReplyTo] = useState(initialReplyTo)
  const [isSavingReplyTo, setIsSavingReplyTo] = useState(false)
  const [replyToFeedback, setReplyToFeedback] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  async function handleSaveHours() {
    setIsSavingHours(true)
    setHoursFeedback(null)
    const result = await saveDefaultHours(Number(mainstage), Number(studioX), Number(oneOff))
    setIsSavingHours(false)
    if ('success' in result) {
      setHoursFeedback({ type: 'success', message: 'Saved.' })
      return
    }
    setHoursFeedback({ type: 'error', message: result.error })
  }

  async function handleSaveReplyTo() {
    setIsSavingReplyTo(true)
    setReplyToFeedback(null)
    const result = await saveDefaultReplyTo(replyTo)
    setIsSavingReplyTo(false)
    if ('success' in result) {
      setReplyToFeedback({ type: 'success', message: 'Saved.' })
      return
    }
    setReplyToFeedback({ type: 'error', message: result.error })
  }

  return (
    <div className="max-w-xl space-y-8">
      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1 flex items-center gap-1.5">
          Default Volunteer Hours
          <HelpTooltip anchor="default-hours" label="Default Volunteer Hours" />
        </h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
          These values are applied when creating a new show. Changing them does not affect
          existing shows.
        </p>
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>Mainstage</label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={mainstage}
              onChange={(e) => setMainstage(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Studio X</label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={studioX}
              onChange={(e) => setStudioX(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>One-Off</label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={oneOff}
              onChange={(e) => setOneOff(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSaveHours}
            disabled={isSavingHours}
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {isSavingHours ? 'Saving…' : 'Save Hours'}
          </button>
          <Feedback feedback={hoursFeedback} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1">
          Default Reply-To Email
        </h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
          Used as the reply-to address on outgoing volunteer emails unless overridden per send.
        </p>
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6">
          <label className={labelClasses}>Reply-To Email</label>
          <input
            type="email"
            maxLength={254}
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="info@30byninety.com"
            className={inputClasses}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSaveReplyTo}
            disabled={isSavingReplyTo}
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {isSavingReplyTo ? 'Saving…' : 'Save Email'}
          </button>
          <Feedback feedback={replyToFeedback} />
        </div>
      </section>
    </div>
  )
}
