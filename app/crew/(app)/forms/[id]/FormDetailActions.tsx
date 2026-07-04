'use client'

import { useState } from 'react'

export default function FormDetailActions({
  publicUrl,
  embedCode,
}: {
  publicUrl: string
  embedCode: string
}) {
  const [urlCopied, setUrlCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    })
  }

  function handleCopyEmbed() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setEmbedCopied(true)
      setTimeout(() => setEmbedCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-dark dark:text-dark-text mb-1">Public URL</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-dark dark:text-dark-text font-mono bg-light-navy dark:bg-dark-surface px-3 py-1.5 rounded break-all">
            {publicUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
          >
            {urlCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-dark dark:text-dark-text mb-1">Embed Code</p>
        <pre className="text-xs text-dark dark:text-dark-text font-mono bg-light-navy dark:bg-dark-surface px-3 py-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
          {embedCode}
        </pre>
        <button
          type="button"
          onClick={handleCopyEmbed}
          className="mt-2 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
        >
          {embedCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
