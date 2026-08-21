import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export type QRHistoryEntry = {
  id: string
  url: string
  label: string | null
  svg: string
  png_base64: string
  banner_text: string | null
  created_at: string
  created_by_admin: { name: string } | null
}

export async function getQRHistory(supabase: SupabaseClient): Promise<QRHistoryEntry[]> {
  const { data } = await supabase
    .from('qr_codes')
    .select(
      `
      id, url, label, svg, png_base64, banner_text,
      created_at,
      created_by_admin:admin_users!created_by(name)
      `
    )
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as QRHistoryEntry[]
}
