'use client'

import { useState } from 'react'
import { QRScanEvent } from '@/lib/data/qr'
import { formatCT } from '@/lib/utils/date'

interface QRScanLogToggleProps {
  events: QRScanEvent[]
}

export default function QRScanLogToggle({ events }: QRScanLogToggleProps) {
  const [expanded, setExpanded] = useState(false)
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-brand-primary hover:underline cursor-pointer mt-0.5 focus:outline-none"
      >
        {expanded ? 'Hide scans' : `Show ${events.length} scan${events.length !== 1 ? 's' : ''}`}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          {events.map((event, i) => {
            const datePart = formatCT(event.scannedAt, 'MMM d, yyyy h:mm a', tz)
            const devicePart = event.deviceType
              ? event.deviceType.charAt(0).toUpperCase() + event.deviceType.slice(1)
              : 'Unknown'
            const browserPart = event.browser ?? 'Unknown'
            return (
              <p key={i} className="text-xs text-mid-gray dark:text-dark-muted">
                {datePart} · {devicePart} · {browserPart}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}
