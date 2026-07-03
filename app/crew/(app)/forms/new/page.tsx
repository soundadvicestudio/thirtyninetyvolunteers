import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import FormBuilder from '@/components/crew/forms/FormBuilder'

export default async function NewFormPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
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

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-8">New Form</h1>

      <FormBuilder />
    </div>
  )
}
