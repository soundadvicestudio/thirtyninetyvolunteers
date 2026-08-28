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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="pb-4 border-b border-neutral-border dark:border-dark-border mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">QR Code Generator</h1>
        <p className="text-mid-gray dark:text-dark-muted mt-1">
          Generate and track QR codes for shows, forms, and external links.
        </p>
      </div>

      <QRGeneratorForm />

      <QRHistoryPanel history={history} timezone={tz} scanStats={scanStats} />
    </div>
  )
}
