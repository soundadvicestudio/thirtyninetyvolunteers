'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { lookupVolunteer } from '@/lib/actions/callboard'

export default function CallboardLookupForm() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setNotFound(false)

    startTransition(async () => {
      const result = await lookupVolunteer(input)
      if ('success' in result) {
        router.refresh()
      } else {
        setNotFound(true)
      }
    })
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-divider bg-white p-6 text-center">
        <p className="text-dark text-sm leading-relaxed mb-4">
          We don&apos;t have a record with that info. Want to join our volunteer community?
        </p>
        <Link
          href="/"
          className="inline-block bg-navy text-white font-semibold py-3 px-5 rounded hover:bg-opacity-90 transition-colors mb-3"
        >
          Sign Up
        </Link>
        <div>
          <button type="button" onClick={() => setNotFound(false)} className="text-navy text-sm underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-divider bg-white p-6">
      <h2 className="text-navy font-bold text-lg mb-1">Find your volunteer record</h2>
      <p className="text-mid-gray text-sm mb-4">
        Enter your email or phone to see your hours, milestones, and call history.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Email or phone number"
          disabled={isPending}
          className="w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Finding…' : 'Find Me'}
        </button>
      </form>
    </div>
  )
}
