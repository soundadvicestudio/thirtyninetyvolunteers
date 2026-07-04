'use server'

import { generateQR } from '@/lib/qr'

export type GenerateQRCodeResult =
  | { svg: string; pngBase64: string }
  | { error: string }

export async function generateQRCode(url: string): Promise<GenerateQRCodeResult> {
  const trimmed = url.trim()
  if (!trimmed) {
    return { error: 'Please enter a URL.' }
  }

  const targetUrl =
    trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`

  try {
    const { svg, pngBase64 } = await generateQR(targetUrl)
    return { svg, pngBase64 }
  } catch (err) {
    console.error('generateQRCode error:', err)
    return { error: 'Failed to generate QR code. Please check the URL and try again.' }
  }
}
