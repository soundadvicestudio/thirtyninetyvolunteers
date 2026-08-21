import 'server-only'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import QRCode from 'qrcode'
import { Resvg } from '@resvg/resvg-js'

const BANNER_HEIGHT_UNITS = 10
const BANNER_FONT_SIZE = 2.8

const nodeRequire = createRequire(import.meta.url)

// @resvg/resvg-js resolves `font-family` against fonts discovered on the
// host OS (font.loadSystemFonts defaults to true when no `font` option is
// passed). Vercel's serverless Node.js runtime does not ship a desktop
// font stack, so with no font configured, banner text silently renders as
// nothing — confirmed by testing: font.loadSystemFonts:false produces zero
// rendered text pixels, vs. thousands of pixels when a real font file is
// supplied. The QR matrix itself is unaffected (drawn as <path> geometry,
// not text) — only the banner text vanished, which is why the banner
// appeared completely missing rather than just malformed.
//
// Next.js already bundles a font (Geist, used by @vercel/og to solve this
// identical problem for OG image generation on Vercel) inside its own
// dependency tree — reusing it here avoids adding a new package or
// fabricating a font asset. Resolved defensively: if a future `next`
// version moves this internal file, generation falls back to
// loadSystemFonts's best-effort default rather than throwing.
function resolveBannerFontFile(): string | undefined {
  try {
    const fontPath = nodeRequire.resolve('next/dist/compiled/@vercel/og/Geist-Regular.ttf')
    return existsSync(fontPath) ? fontPath : undefined
  } catch {
    return undefined
  }
}

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

    // Curled-ribbon banner geometry — all coordinates in QR user units,
    // relative to N (parsed above, never hardcoded).
    const ribbonY = N + 1 // 1 unit padding below QR matrix
    const ribbonH = 6 // ribbon body height
    const curlDepth = 2 // depth of corner curl triangles
    const ribbonBottom = ribbonY + ribbonH
    const cx = N / 2 // horizontal center

    // Composited in z-order: white backing, ribbon body, corner curl
    // shadows, corner curl faces (overlapping the shadows), then text.
    const bannerMarkup = [
      `<rect x="0" y="${N}" width="${N}" height="${BANNER_HEIGHT_UNITS}" fill="white"/>`,
      `<rect x="0" y="${ribbonY}" width="${N}" height="${ribbonH}" fill="#EEF2FF" rx="0.5"/>`,
      `<polygon points="0,${ribbonBottom} ${curlDepth},${ribbonBottom} 0,${ribbonBottom - curlDepth}" fill="#B8C4E8"/>`,
      `<polygon points="${N},${ribbonBottom} ${N - curlDepth},${ribbonBottom} ${N},${ribbonBottom - curlDepth}" fill="#B8C4E8"/>`,
      `<polygon points="0,${ribbonBottom} ${curlDepth},${ribbonBottom} ${curlDepth},${ribbonBottom - curlDepth}" fill="#D4DCF5"/>`,
      `<polygon points="${N},${ribbonBottom} ${N - curlDepth},${ribbonBottom} ${N - curlDepth},${ribbonBottom - curlDepth}" fill="#D4DCF5"/>`,
      `<text x="${cx}" y="${ribbonY + ribbonH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${BANNER_FONT_SIZE}" font-weight="600" fill="#293994">${escapeXml(trimmedBanner)}</text>`,
    ].join('')
    finalSvg = finalSvg.replace('</svg>', `${bannerMarkup}</svg>`)
  }

  const bannerFontFile = resolveBannerFontFile()
  const resvg = new Resvg(finalSvg, {
    fitTo: { mode: 'width', value: 2000 },
    font: bannerFontFile
      ? {
          loadSystemFonts: false,
          fontFiles: [bannerFontFile],
          defaultFontFamily: 'Geist',
          sansSerifFamily: 'Geist',
        }
      : { loadSystemFonts: true },
  })
  const pngBuffer = resvg.render().asPng()
  const pngBase64 = pngBuffer.toString('base64')

  return { svg: finalSvg, pngBase64 }
}
