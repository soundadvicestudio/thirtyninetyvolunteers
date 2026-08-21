import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import AnnouncementSection from '@/components/crew/settings/AnnouncementSection'

export default async function DashboardAnnouncementPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/crew/login')

  const isSA = admin.role === 'super_admin'
  const isOA = admin.role === 'owner_admin'

  if (!isSA && !isOA) redirect('/crew/settings')

  if (isOA) {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'announcements_oa_enabled')
      .maybeSingle()
    if (data?.value !== 'true') redirect('/crew/settings')
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-6">
        Dashboard Announcements
      </h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-6">
        {"Publish announcements that appear at the top of the Dashboard for targeted crew roles."}
      </p>
      <AnnouncementSection />
    </div>
  )
}
