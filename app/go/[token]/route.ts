// PUBLIC ROUTE — getAdminClient() only,
// never getServerClient()

import { getAdminClient } from '@/lib/supabase/admin'

function parseUserAgent(ua: string | null): {
  deviceType: string
  browser: string
} {
  if (!ua) return { deviceType: 'desktop', browser: 'Other' }

  let deviceType: string
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    deviceType = 'tablet'
  } else if (/Mobi|iPhone|Android/i.test(ua)) {
    deviceType = 'mobile'
  } else {
    deviceType = 'desktop'
  }

  let browser: string
  if (/Edg\//i.test(ua)) {
    browser = 'Edge'
  } else if (/Chrome\//i.test(ua)) {
    browser = 'Chrome'
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Firefox'
  } else if (/Safari\//i.test(ua)) {
    browser = 'Safari'
  } else {
    browser = 'Other'
  }

  return { deviceType, browser }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = getAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const { data: row } = await supabase
    .from('qr_codes')
    .select('id, target_url')
    .eq('redirect_token', token)
    .maybeSingle()

  if (!row || !row.target_url) {
    return Response.redirect(new URL('/not-found', siteUrl), 302)
  }

  const ua = request.headers.get('user-agent')
  const { deviceType, browser } = parseUserAgent(ua)

  try {
    await supabase.from('qr_scan_events').insert({
      qr_code_id: row.id,
      user_agent: ua,
      device_type: deviceType,
      browser,
    })
  } catch {
    // Scan logging failure must never block the
    // redirect — swallow and continue.
  }

  return Response.redirect(row.target_url, 302)
}
