import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getRehearsalScheduleDetail } from '@/lib/actions/rehearsals-admin'
import { generateQR } from '@/lib/qr'
import RehearsalDetailTabs from '@/components/crew/rehearsals/RehearsalDetailTabs'

export default async function RehearsalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await getServerClient()
  const admin = await getAdminUser()
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) {
    redirect('/crew/dashboard')
  }
  if (!admin) {
    redirect('/crew/login')
  }

  const [detailResult, { data: productionUserRows }] = await Promise.all([
    getRehearsalScheduleDetail(id),
    supabase
      .from('admin_users')
      .select('id, name, email')
      .eq('role', 'production')
      .eq('is_active', true)
      .order('name'),
  ])

  if (!detailResult.success) {
    redirect('/crew/rehearsals')
  }
  const detail = detailResult.detail

  // Production users may only view schedules they are assigned to.
  // Redirect target is the list, not the dashboard — matches the "not
  // assigned" flow specified in Brief §11 (data/page-layer guard, not a
  // proxy.ts-level block).
  if (admin.role === 'production') {
    const isAssigned = detail.scheduleAssignees.some((a) => a.adminUserId === admin.id)
    if (!isAssigned) {
      redirect('/crew/rehearsals')
    }
  }

  const qrEntries = await Promise.all(
    detail.events
      .filter((e): e is typeof e & { check_in_token: string } => Boolean(e.check_in_token))
      .map(async (e) => {
        const qr = await generateQR(`${process.env.NEXT_PUBLIC_SITE_URL}/rehearsal-checkin/${e.check_in_token}`)
        return [e.id, qr] as const
      })
  )
  const qrData = new Map(qrEntries)

  const productionUsers = (productionUserRows ?? []) as { id: string; name: string; email: string }[]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{detail.batch.title}</h1>
      </div>
      <RehearsalDetailTabs
        detail={detail}
        adminRole={admin.role}
        adminId={admin.id}
        productionUsers={productionUsers}
        qrData={qrData}
      />
    </div>
  )
}
