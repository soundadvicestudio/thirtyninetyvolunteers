import Link from 'next/link'
import { ScanLine } from 'lucide-react'

export default function CheckInPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center py-16">
      <ScanLine size={48} className="text-slate dark:text-dark-muted mb-6" />
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-3">Check-In System</h1>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
        Check-in QR codes are now ready. You&apos;ll find them on each show&apos;s Dates tab — one QR for the
        whole show and one for each individual performance.
      </p>
      <Link
        href="/crew/shows"
        className="text-sm font-semibold text-navy dark:text-steel hover:underline mb-4"
      >
        Go to Shows →
      </Link>
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        A live check-in dashboard showing tonight&apos;s roster is coming soon.
      </p>
    </div>
  )
}
