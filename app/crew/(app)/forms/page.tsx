import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getForms } from '@/lib/actions/forms'
import FormList from '@/components/crew/forms/FormList'

export default async function FormsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const forms = await getForms()

  return <FormList forms={forms} adminRole={admin.role} />
}
