import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/crew/Sidebar'
import TopBar from '@/components/crew/TopBar'
import { ServiceWorkerRegistration } from '@/components/crew/ServiceWorkerRegistration'
import { ThemeProvider } from '@/components/crew/ThemeProvider'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Production Crew',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default async function CrewLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()

  if (!admin) {
    redirect('/crew/login')
  }

  let pendingRegistrationCount = 0
  if (admin.role === 'super_admin') {
    const supabase = await getServerClient()
    const { count } = await supabase
      .from('pending_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    pendingRegistrationCount = count ?? 0
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var saved = localStorage.getItem(
                  'crew-theme'
                );
                var preferred = saved || (
                  window.matchMedia(
                    '(prefers-color-scheme: dark)'
                  ).matches ? 'dark' : 'light'
                );
                if (preferred === 'dark') {
                  document.body.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            })();
          `
        }}
      />
      <ThemeProvider>
        <div className="flex h-screen">
          <Sidebar admin={admin} pendingRegistrationCount={pendingRegistrationCount} />
          <div className="flex-1 flex flex-col">
            <TopBar admin={admin} />
            <main className="flex-1 overflow-y-auto bg-light-navy dark:bg-dark-bg p-6">{children}</main>
          </div>
        </div>
        <ServiceWorkerRegistration />
      </ThemeProvider>
    </>
  )
}
