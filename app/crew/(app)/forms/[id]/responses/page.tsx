import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getFormResponses } from '@/lib/data/forms'
import ResponseViewer from './ResponseViewer'

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const { id } = await params
  const data = await getFormResponses(id)

  if (!data) {
    redirect('/crew/forms')
  }

  return (
    <div>
      <Link
        href={`/crew/forms/${id}`}
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Form
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">{data.form.title} — Responses</h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted">
          {data.responses.length} response{data.responses.length === 1 ? '' : 's'}
        </p>
      </div>

      <ResponseViewer form={data.form} fields={data.fields} responses={data.responses} />
    </div>
  )
}
