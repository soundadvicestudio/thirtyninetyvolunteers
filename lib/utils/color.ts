/**
 * Computes a lightened tint of a hex color by
 * blending it with white at the given percentage.
 *
 * amount = 1.0 → pure hex color
 * amount = 0.0 → pure white (#ffffff)
 * amount = 0.08 → 8% hex + 92% white
 *   (matches --brand-primary-light derivation)
 *
 * Used for email templates and PDF exports where
 * CSS custom properties and color-mix() are not
 * supported — the tint must be a concrete hex
 * string computed server-side before rendering.
 *
 * @param hex - 6-digit hex color string
 *   (e.g. '#293994'). Must include the #.
 * @param amount - blend percentage (0.0–1.0)
 * @returns 6-digit hex string (e.g. '#eeeff6')
 */
export function lightenHex(hex: string, amount: number): string {
  const raw = hex.replace('#', '')
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  const lr = Math.round(r * amount + 255 * (1 - amount))
  const lg = Math.round(g * amount + 255 * (1 - amount))
  const lb = Math.round(b * amount + 255 * (1 - amount))
  return (
    '#' +
    lr.toString(16).padStart(2, '0') +
    lg.toString(16).padStart(2, '0') +
    lb.toString(16).padStart(2, '0')
  )
}

/**
 * darkenHex — blends a hex color toward black.
 * amount = 1.0 → pure hex (unchanged)
 * amount = 0.0 → pure black (#000000)
 * Example: darkenHex(primary, 0.82) → 82% primary + 18% black
 * Mirror convention of lightenHex() — same signature, different
 * blend target.
 */
export function darkenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const nr = Math.round(r * amount)
  const ng = Math.round(g * amount)
  const nb = Math.round(b * amount)
  return (
    '#' +
    nr.toString(16).padStart(2, '0') +
    ng.toString(16).padStart(2, '0') +
    nb.toString(16).padStart(2, '0')
  )
}
