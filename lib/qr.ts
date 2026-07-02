import 'server-only'
import QRCode from 'qrcode'

export async function generateQR(url: string): Promise<{
  svg: string
  pngBase64: string
}> {
  const options = {
    errorCorrectionLevel: 'H' as const,
    type: 'png' as const,
    width: 2000,
    margin: 2,
  }

  const pngBuffer = await QRCode.toBuffer(url, options)
  const pngBase64 = pngBuffer.toString('base64')

  const svg = await QRCode.toString(url, {
    errorCorrectionLevel: 'H',
    type: 'svg',
  })

  return { svg, pngBase64 }
}
