import { Mail } from 'lucide-react'

export default function CommunicationPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center py-16">
      <Mail size={48} className="text-slate dark:text-dark-muted mb-6" />
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-3">Communication</h1>
      <span className="inline-flex items-center bg-steel text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
        Coming Soon
      </span>
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        The email blast system will let you message all volunteers, filter by category, and send
        targeted notifications about upcoming shows.
      </p>
    </div>
  )
}
