import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getAuditionDetail } from '@/lib/actions/auditions-admin'
import { generateQR } from '@/lib/qr'
import AuditionDetailTabs from '@/components/crew/auditions/AuditionDetailTabs'

export default async function AuditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await getServerClient()
  const admin = await getAdminUser()
  const flags = await getFeatureFlags(supabase)
  if (!flags.auditions) {
    redirect('/crew/dashboard')
  }
  if (!admin) {
    redirect('/crew/login')
  }

  // getAuditionDetail() returns null both when the audition doesn't exist
  // and when a Production caller isn't assigned to it (assertAuditionAccess)
  // — either way, the list page is the correct landing spot.
  const detail = await getAuditionDetail(id)
  if (!detail) {
    redirect('/crew/auditions')
  }

  // Pre-generated server-side (Level H, R6) — white container regardless of
  // theme, same scanability rule as rehearsal/show check-in QRs.
  const qr = await generateQR(`${process.env.NEXT_PUBLIC_SITE_URL}/audition-checkin/${detail.audition.check_in_token}`)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{detail.audition.title}</h1>
      </div>
      <AuditionDetailTabs detail={detail} adminRole={admin.role} adminId={admin.id} checkInQrPng={qr.pngBase64} />
    </div>
  )
}
