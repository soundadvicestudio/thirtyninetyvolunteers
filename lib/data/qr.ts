import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export type QRHistoryEntry = {
  id: string
  url: string
  label: string | null
  svg: string
  png_base64: string
  banner_text: string | null
  redirect_token: string | null
  target_url: string | null
  created_at: string
  created_by_admin: { name: string } | null
}

export async function getQRHistory(supabase: SupabaseClient): Promise<QRHistoryEntry[]> {
  const { data } = await supabase
    .from('qr_codes')
    .select(
      `
      id, url, label, svg, png_base64, banner_text, redirect_token, target_url,
      created_at,
      created_by_admin:admin_users!created_by(name)
      `
    )
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as QRHistoryEntry[]
}

export type QRAnalyticsSummary = {
  scanCount: number
  lastScannedAt: string | null
  deviceBreakdown: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export async function getQRScanStats(
  supabase: SupabaseClient,
  qrCodeIds: string[]
): Promise<Map<string, QRAnalyticsSummary>> {
  if (qrCodeIds.length === 0) return new Map()

  const { data } = await supabase
    .from('qr_scan_events')
    .select('qr_code_id, scanned_at, device_type')
    .in('qr_code_id', qrCodeIds)

  const map = new Map<string, QRAnalyticsSummary>()
  if (!data) return map

  for (const event of data) {
    const id = event.qr_code_id as string
    const existing = map.get(id) ?? {
      scanCount: 0,
      lastScannedAt: null,
      deviceBreakdown: {
        mobile: 0,
        tablet: 0,
        desktop: 0,
      },
    }

    existing.scanCount += 1

    if (!existing.lastScannedAt || event.scanned_at > existing.lastScannedAt) {
      existing.lastScannedAt = event.scanned_at as string
    }

    const dt = (event.device_type as string) ?? 'desktop'
    if (dt === 'mobile') {
      existing.deviceBreakdown.mobile += 1
    } else if (dt === 'tablet') {
      existing.deviceBreakdown.tablet += 1
    } else {
      existing.deviceBreakdown.desktop += 1
    }

    map.set(id, existing)
  }

  return map
}
