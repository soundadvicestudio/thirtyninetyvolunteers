'use client'

import { useState } from 'react'
import { generateQRCode } from '@/lib/actions/qr'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

function sanitizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'qr-code'
}

export default function QRGeneratorForm() {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrResult, setQrResult] = useState<{ svg: string; pngBase64: string } | null>(null)

  function handleUrlChange(value: string) {
    setUrl(value)
    if (qrResult) {
      setQrResult(null)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    const result = await generateQRCode(url, label)
    setGenerating(false)
    if ('error' in result) {
      setError(result.error)
      setQrResult(null)
      return
    }
    setQrResult(result)
  }

  const sanitizedLabel = sanitizeLabel(label)

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>
            URL<span className="text-brand-accent ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Volunteer Signup, Spring Show 2026"
            className={inputClasses}
          />
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
            Used for the downloaded file name and saved history — it does not affect the QR code content.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {generating ? 'Generating…' : 'Generate QR Code'}
        </button>

        {error && (
          <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark dark:text-dark-text">
            {error}
          </div>
        )}
      </div>

      {qrResult && (
        <div className="mt-8">
          <div
            className="w-64 h-64 [&>svg]:w-full [&>svg]:h-full bg-white p-3 rounded-lg border border-divider dark:border-dark-border"
            dangerouslySetInnerHTML={{ __html: qrResult.svg }}
          />
          <div className="flex gap-4 mt-4">
            {/* PNG is 2000×2000px — suitable for print use. */}
            <a
              href={`data:image/png;base64,${qrResult.pngBase64}`}
              download={`${sanitizedLabel}.png`}
              className="inline-flex items-center justify-center bg-white dark:bg-dark-surface border border-brand-primary dark:border-brand-primary-mid text-brand-primary dark:text-brand-primary-mid font-semibold px-4 py-2 rounded-md text-sm hover:bg-brand-primary-light dark:hover:bg-dark-surface/50 transition-colors"
            >
              Download PNG
            </a>
            <a
              href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrResult.svg)}`}
              download={`${sanitizedLabel}.svg`}
              className="inline-flex items-center justify-center bg-white dark:bg-dark-surface border border-brand-primary dark:border-brand-primary-mid text-brand-primary dark:text-brand-primary-mid font-semibold px-4 py-2 rounded-md text-sm hover:bg-brand-primary-light dark:hover:bg-dark-surface/50 transition-colors"
            >
              Download SVG
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
