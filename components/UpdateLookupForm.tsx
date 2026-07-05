'use client'

import { useState } from 'react'
import { sendUpdateLink } from '@/app/update/actions'
import Link from 'next/link'

export default function UpdateLookupForm() {
  const [input, setInput] = useState('')
  const [state, setstate] =
    useState<'idle' | 'success' | 'not_found' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsLoading(true)
    setErrorMsg(null)

    const result = await sendUpdateLink(input)

    setIsLoading(false)
    if (result.status === 'success') {
      setstate('success')
    } else if (result.status === 'not_found') {
      setstate('not_found')
    } else {
      setErrorMsg(result.message)
      setstate('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="max-w-md mx-auto text-center px-4 py-12">
        <div className="w-12 h-12 rounded-full bg-navy mx-auto
                        mb-4 flex items-center justify-center">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h2 className="text-navy font-bold text-xl mb-2">
          Check your email
        </h2>
        <p className="text-mid-gray text-sm leading-relaxed">
          We&apos;ve sent an update link to the email address on your
          record. Click the link in that email to update your
          information.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-navy font-bold text-2xl mb-2 text-center">
        Update Your Information
      </h1>
      <p className="text-mid-gray text-sm text-center mb-8
                    leading-relaxed">
        Enter the email address or phone number you signed up with
        and we&apos;ll send you a link to update your record.
      </p>

      {state === 'not_found' && (
        <div className="mb-4 rounded-lg bg-pale-orange border
                        border-orange p-4 text-sm text-dark">
          We couldn&apos;t find a record with that email or phone.{' '}
          <Link href="/"
                className="font-semibold text-navy underline">
            Sign up here
          </Link>
          {' '}to join our volunteer list.
        </div>
      )}

      {state === 'error' && errorMsg && (
        <div className="mb-4 rounded-lg bg-pale-orange border
                        border-orange p-4 text-sm text-dark">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold
                             text-dark mb-1">
            Email or Phone
          </label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="you@example.com or 555-555-5555"
            className="w-full rounded-lg border border-divider
                       px-4 py-3 text-base text-dark
                       focus:outline-none focus:border-navy
                       focus:ring-1 focus:ring-navy
                       transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-orange text-white font-bold
                     rounded-lg hover:bg-opacity-90
                     transition-colors disabled:opacity-50">
          {isLoading ? 'Sending…' : 'Send My Update Link'}
        </button>
      </form>
    </div>
  )
}
