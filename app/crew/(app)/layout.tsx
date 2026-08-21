import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import { getNotificationCounts, getUserNotifications } from '@/lib/data/notifications'
import Sidebar from '@/components/crew/Sidebar'
import TopBar from '@/components/crew/TopBar'
import { ServiceWorkerRegistration } from '@/components/crew/ServiceWorkerRegistration'
import { ThemeProvider } from '@/components/crew/ThemeProvider'
import { MobileSidebarProvider } from '@/components/crew/MobileSidebarContext'
import type { SidebarNavOrder } from '@/types/sidebar'

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

  const [org, notificationCounts, initialNotifications, maintenanceResult, navOrderResult] =
    await Promise.all([
      resolveOrgIdentity(),
      getNotificationCounts(admin, flags, supabase),
      getUserNotifications(admin.id, supabase),
      getAdminClient()
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle(),
      getAdminClient()
        .from('app_settings')
        .select('value')
        .eq('key', 'sidebar_nav_order')
        .maybeSingle(),
    ])

  const maintenanceModeActive =
    maintenanceResult.data?.value === 'true'

  let navOrder: SidebarNavOrder | undefined = undefined
  try {
    const raw = navOrderResult?.data?.value
    if (raw) {
      navOrder = JSON.parse(raw) as SidebarNavOrder
    }
  } catch {
    navOrder = undefined
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
              navOrder={navOrder}
            />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar
                admin={admin}
                notificationCounts={notificationCounts}
                initialNotifications={initialNotifications}
                messagesEnabled={flags.messages}
              />
              {maintenanceModeActive && (
                <div className="bg-orange-500 text-white text-sm
                  text-center py-2 px-4 shrink-0">
                  ⚠ Maintenance Mode is ON — the crew portal is
                  locked for all other roles.
                </div>
              )}
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg p-6">{children}</main>
            </div>
          </div>
        </MobileSidebarProvider>
        <ServiceWorkerRegistration />
      </ThemeProvider>
    </>
  )
}
