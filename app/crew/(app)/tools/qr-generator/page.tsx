import { getServerClient } from '@/lib/supabase/server'
import { getQRHistory, getQRScanStats } from '@/lib/data/qr'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import QRGeneratorForm from '@/components/crew/tools/QRGeneratorForm'
import QRHistoryPanel from '@/components/crew/tools/QRHistoryPanel'

export default async function QRGeneratorPage() {
  const supabase = await getServerClient()
  const history = await getQRHistory(supabase)
  const tz = await getOrgTimezone(supabase)

  const qrCodeIds = history.map((row) => row.id)
  const scanStats = await getQRScanStats(supabase, qrCodeIds)

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">QR Code Generator</h1>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-6">
        Generate a scannable QR code for any URL. Level H error correction — scannable even with up
        to 30% damage or obstruction.
      </p>

      <QRGeneratorForm />

      <QRHistoryPanel history={history} timezone={tz} scanStats={scanStats} />
    </div>
  )
}
