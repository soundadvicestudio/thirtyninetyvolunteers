'use server'

import { revalidatePath } from 'next/cache'
import { generateQR } from '@/lib/qr'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'

export type GenerateQRCodeResult =
  | { svg: string; pngBase64: string }
  | { error: string }

export async function generateQRCode(
  url: string,
  label: string,
  bannerText?: string
): Promise<GenerateQRCodeResult> {
  const trimmed = url.trim()
  if (!trimmed) {
    return { error: 'Please enter a URL.' }
  }

  const targetUrl =
    trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`

  const redirectToken = crypto.randomUUID()
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/go/${redirectToken}`

  let result: { svg: string; pngBase64: string }
  try {
    result = await generateQR(redirectUrl, bannerText?.trim() || undefined)
  } catch (err) {
    console.error('generateQRCode error:', err)
    return { error: 'Failed to generate QR code. Please check the URL and try again.' }
  }

  // Save to history — best-effort. A failure here must never block returning
  // the generated QR code to the caller.
  try {
    const admin = await getAdminUser()
    const supabase = await getServerClient()
    await supabase.from('qr_codes').insert({
      url: targetUrl,
      label: label.trim() || null,
      svg: result.svg,
      png_base64: result.pngBase64,
      banner_text: bannerText?.trim() || null,
      redirect_token: redirectToken,
      target_url: targetUrl,
      created_by: admin?.id ?? null,
    })
    revalidatePath('/crew/tools/qr-generator')
  } catch (err) {
    console.error('generateQRCode history save error:', err)
  }

  return result
}
