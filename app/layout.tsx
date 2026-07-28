import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { getAdminClient } from '@/lib/supabase/admin'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['favicon_url', 'org_name', 'org_tagline'])
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  const faviconUrl = map['favicon_url'] || null
  const orgName = map['org_name'] || '30 By Ninety Theatre'
  const description = map['org_tagline'] || 'Volunteer management platform'

  return {
    description,
    title: orgName,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  }
}

async function resolveBrandColors(): Promise<{
  primary: string
  accent: string
}> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['brand_primary', 'brand_accent'])
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    primary: map['brand_primary'] || '#293994',
    accent: map['brand_accent'] || '#F26522',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const brand = await resolveBrandColors()

  return (
    <html lang="en">
      <body className={openSans.className}>
        <style>{`
          :root {
            --brand-primary: ${brand.primary};
            --brand-accent: ${brand.accent};
            --brand-primary-mid: color-mix(in srgb, var(--brand-primary) 59%, white);
            --brand-primary-tint: color-mix(in srgb, var(--brand-primary) 47%, white);
            --brand-primary-light: color-mix(in srgb, var(--brand-primary) 8%, white);
            --brand-accent-light: color-mix(in srgb, var(--brand-accent) 5%, white);
          }
        `}</style>
        {children}
      </body>
    </html>
  )
}
