import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import HelpContent from '@/components/crew/help/HelpContent'

export default async function HelpPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/crew/login')

  return <HelpContent role={admin.role} calendarEditor={admin.calendar_editor} />
}
