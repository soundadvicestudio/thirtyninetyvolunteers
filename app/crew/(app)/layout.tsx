import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import Sidebar from '@/components/crew/Sidebar'
import TopBar from '@/components/crew/TopBar'

export default async function CrewLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()

  if (!admin) {
    redirect('/crew/login')
  }

  return (
    <div className="flex h-screen">
      <Sidebar admin={admin} />
      <div className="flex-1 flex flex-col">
        <TopBar admin={admin} />
        <main className="flex-1 overflow-y-auto bg-light-navy p-6">{children}</main>
      </div>
    </div>
  )
}
