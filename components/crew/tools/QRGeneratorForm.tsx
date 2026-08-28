'use client'

import { useState } from 'react'
import { generateQRCode } from '@/lib/actions/qr'

const inputClasses =
  'w-full border border-neutral-border dark:border-dark-border rounded-md px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-primary'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

function sanitizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'qr-code'
}

export default function QRGeneratorForm() {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [bannerEnabled, setBannerEnabled] = useState(false)
  const [bannerText, setBannerText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrResult, setQrResult] = useState<{ svg: string; pngBase64: string } | null>(null)

  function handleUrlChange(value: string) {
    setUrl(value)
    if (qrResult) {
      setQrResult(null)
    }
  }

  const handleBannerToggle = (enabled: boolean) => {
    setBannerEnabled(enabled)
    if (!enabled) setBannerText('')
    setQrResult(null)
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    const result = await generateQRCode(
      url,
      label,
      bannerEnabled && bannerText.trim() ? bannerText : undefined
    )
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
      <div className="border border-neutral-border dark:border-dark-border rounded-lg overflow-hidden mb-6">
        <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border dark:border-dark-border px-6 py-4">
          <h2 className="font-semibold text-dark dark:text-dark-text">Generate a QR Code</h2>
        </div>

        <div className="bg-white dark:bg-dark-surface px-6 py-5 space-y-4">
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

          <div>
            <label className={labelClasses}>Banner Text</label>
            <label className="flex items-center gap-2 text-sm text-dark dark:text-dark-text">
              <input
                type="checkbox"
                checked={bannerEnabled}
                onChange={(e) => handleBannerToggle(e.target.checked)}
                className="rounded border-divider dark:border-dark-border text-brand-primary focus:ring-brand-primary"
              />
              Add banner below QR code
            </label>
            {bannerEnabled && (
              <input
                type="text"
                value={bannerText}
                onChange={(e) => {
                  setBannerText(e.target.value)
                  setQrResult(null)
                }}
                placeholder="e.g. Scan to Register"
                maxLength={50}
                className={`${inputClasses} mt-2`}
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark dark:text-dark-text">
              {error}
            </div>
          )}
        </div>

        <div className="bg-neutral-surface dark:bg-dark-nav border-t border-neutral-border dark:border-dark-border px-6 py-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="text-white rounded-lg px-6 py-2 font-medium text-sm hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {generating ? 'Generating…' : 'Generate QR Code'}
          </button>
        </div>
      </div>

      {qrResult && (
        <div className="border border-neutral-border dark:border-dark-border rounded-lg overflow-hidden mb-6">
          <div className="bg-white p-6 flex flex-col items-center gap-4">
            <div
              className="w-64 h-64 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrResult.svg }}
            />
            <div className="flex gap-4">
              {/* PNG is 2000×2000px — suitable for print use. */}
              <a
                href={`data:image/png;base64,${qrResult.pngBase64}`}
                download={`${sanitizedLabel}.png`}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                Download PNG
              </a>
              <a
                href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrResult.svg)}`}
                download={`${sanitizedLabel}.svg`}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                Download SVG
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
