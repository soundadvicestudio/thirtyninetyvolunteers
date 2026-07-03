import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getForm } from '@/lib/actions/forms'
import FormBuilder from '@/components/crew/forms/FormBuilder'

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/forms')
  }

  const { id } = await params
  const form = await getForm(id)

  if (!form) {
    redirect('/crew/forms')
  }

  return (
    <div>
      <Link
        href="/crew/forms"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Forms
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-8">Edit Form — {form.title}</h1>

      <FormBuilder initialData={form} formId={id} />
    </div>
  )
}
