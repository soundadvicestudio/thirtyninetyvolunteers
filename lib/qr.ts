import 'server-only'
import QRCode from 'qrcode'
import { Resvg } from '@resvg/resvg-js'

const BANNER_HEIGHT_UNITS = 6
const BANNER_FONT_SIZE = 2.5

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function generateQR(
  url: string,
  bannerText?: string
): Promise<{ svg: string; pngBase64: string }> {
  const svg = await QRCode.toString(url, {
    errorCorrectionLevel: 'H',
    type: 'svg',
  })

  let finalSvg = svg
  const trimmedBanner = bannerText?.trim()
  if (trimmedBanner) {
    // Parse module count N from viewBox="0 0 N N"
    const viewBoxParts = svg.match(
      /viewBox="0 0 (\d+(?:\.\d+)?) \d+(?:\.\d+)?"/
    )
    const N = viewBoxParts ? parseFloat(viewBoxParts[1]) : 37
    const newHeight = N + BANNER_HEIGHT_UNITS
    // Replace viewBox to extend height
    finalSvg = svg.replace(
      /viewBox="0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?"/,
      `viewBox="0 0 ${N} ${newHeight}"`
    )
    // Inject white rect + text before closing </svg>
    const bannerMarkup = [
      `<rect x="0" y="${N}" width="${N}" `,
      `height="${BANNER_HEIGHT_UNITS}" fill="#ffffff"/>`,
      `<text x="${N / 2}" y="${N + BANNER_HEIGHT_UNITS / 2}" `,
      `text-anchor="middle" dominant-baseline="middle" `,
      `font-family="sans-serif" font-size="${BANNER_FONT_SIZE}" `,
      `fill="#000000">${escapeXml(trimmedBanner)}</text>`,
    ].join('')
    finalSvg = finalSvg.replace('</svg>', `${bannerMarkup}</svg>`)
  }

  const resvg = new Resvg(finalSvg, {
    fitTo: { mode: 'width', value: 2000 },
  })
  const pngBuffer = resvg.render().asPng()
  const pngBase64 = pngBuffer.toString('base64')

  return { svg: finalSvg, pngBase64 }
}
