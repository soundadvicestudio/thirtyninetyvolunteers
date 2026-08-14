import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import { getNotificationCounts, getUserNotifications } from '@/lib/data/notifications'
import Sidebar from '@/components/crew/Sidebar'
import TopBar from '@/components/crew/TopBar'
import { ServiceWorkerRegistration } from '@/components/crew/ServiceWorkerRegistration'
import { ThemeProvider } from '@/components/crew/ThemeProvider'
import { MobileSidebarProvider } from '@/components/crew/MobileSidebarContext'

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

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)

  const [org, notificationCounts, initialNotifications] = await Promise.all([
    resolveOrgIdentity(),
    getNotificationCounts(admin, flags, supabase),
    getUserNotifications(admin.id, supabase),
  ])

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
                if (saved === 'dark') {
                  document.body.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            })();
          `
        }}
      />
      <ThemeProvider>
        <MobileSidebarProvider>
          <div className="flex h-screen">
            <Sidebar
              admin={admin}
              flags={flags}
              org={org}
              forumUnreadCount={notificationCounts.forumUnread}
              messagesUnreadCount={notificationCounts.messageUnread}
            />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar
                admin={admin}
                notificationCounts={notificationCounts}
                initialNotifications={initialNotifications}
                messagesEnabled={flags.messages}
              />
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg p-6">{children}</main>
            </div>
          </div>
        </MobileSidebarProvider>
        <ServiceWorkerRegistration />
      </ThemeProvider>
    </>
  )
}
