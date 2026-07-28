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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={openSans.className}>{children}</body>
    </html>
  )
}
