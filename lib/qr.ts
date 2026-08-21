import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'
import { Resvg } from '@resvg/resvg-js'

const BANNER_HEIGHT_UNITS = 10
const BANNER_FONT_SIZE = 2.8

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
// A bundled font ships in the repo at public/fonts/banner-font.ttf (Inter
// Regular, SIL Open Font License) instead of reaching into next's internal
// node_modules tree — createRequire().resolve() on a static string is
// statically analyzed by Turbopack, which then tries to import the .ttf as
// a module and fails the build. process.cwd() is a runtime-only expression
// Turbopack cannot resolve at build time, so it is never treated as an
// import.
function resolveBannerFontFile(): string | undefined {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'banner-font.ttf')
  return existsSync(fontPath) ? fontPath : undefined
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

  const bannerFontFile = trimmedBanner ? resolveBannerFontFile() : undefined
  const resvg = new Resvg(
    finalSvg,
    trimmedBanner
      ? {
          fitTo: { mode: 'width', value: 2000 },
          font: bannerFontFile
            ? {
                loadSystemFonts: false,
                fontFiles: [bannerFontFile],
                defaultFontFamily: 'Inter',
                sansSerifFamily: 'Inter',
              }
            : { loadSystemFonts: true },
        }
      : { fitTo: { mode: 'width', value: 2000 } }
  )
  const pngBuffer = resvg.render().asPng()
  const pngBase64 = pngBuffer.toString('base64')

  return { svg: finalSvg, pngBase64 }
}
