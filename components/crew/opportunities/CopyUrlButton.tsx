'use client'

import { useState } from 'react'

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
