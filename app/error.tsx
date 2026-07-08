'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <Image
          src="/logo.png"
          alt="30 By Ninety Theatre"
          width={120}
          height={48}
          className="mx-auto mb-8"
          priority
        />
        <AlertTriangle size={48} className="text-orange mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-navy mb-3">Something went wrong</h1>
        <p className="text-mid-gray mb-8">
          An unexpected error occurred. You can try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center bg-navy text-white font-semibold px-6 py-3 rounded-md hover:bg-steel transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border-2 border-navy text-navy font-semibold px-6 py-3 rounded-md hover:bg-light-navy transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
