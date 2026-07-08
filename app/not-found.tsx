import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
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
        <h1 className="text-3xl font-bold text-navy mb-3">Page Not Found</h1>
        <p className="text-mid-gray mb-8">We couldn&apos;t find what you were looking for.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center border-2 border-navy text-navy font-semibold px-6 py-3 rounded-md hover:bg-light-navy transition-colors"
          >
            Go to volunteer signup
          </Link>
          <Link
            href="/crew/dashboard"
            className="inline-flex items-center justify-center border-2 border-navy text-navy font-semibold px-6 py-3 rounded-md hover:bg-light-navy transition-colors"
          >
            Go to Production Crew
          </Link>
        </div>
      </div>
    </div>
  )
}
