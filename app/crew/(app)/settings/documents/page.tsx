import { FileText } from 'lucide-react'

export default function DocumentManagementPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center py-16">
      <FileText size={48} className="text-slate dark:text-dark-muted mb-6" />
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-3">Document Management</h1>
      <span className="inline-flex items-center bg-steel text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
        Coming Soon
      </span>
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        Document management will let you upload and manage the volunteer consent form PDF, which
        appears as a download link on the public volunteer signup page.
      </p>
    </div>
  )
}
