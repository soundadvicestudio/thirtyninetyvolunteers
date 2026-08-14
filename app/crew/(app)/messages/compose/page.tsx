import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import ComposeForm from '@/components/crew/messages/ComposeForm'
import type { AdminUserBasic } from '@/types/messages'

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string | string[] }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.messages) {
    redirect('/crew/dashboard')
  }

  const params = await searchParams
  const rawTo = params?.to
  const toId = typeof rawTo === 'string' ? rawTo : undefined

  let initialRecipient: AdminUserBasic | null = null
  if (toId) {
    const { data } = await supabase
      .from('admin_users')
      .select('id, name')
      .eq('id', toId)
      .eq('is_active', true)
      .neq('id', admin.id)
      .single()
    if (data) initialRecipient = data
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-neutral-border dark:border-dark-border mb-6 flex items-center gap-3">
        <Link
          href="/crew/messages"
          className="flex items-center gap-1.5 text-sm text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors"
        >
          <ArrowLeft size={16} />
          Inbox
        </Link>
        <span className="text-mid-gray dark:text-dark-muted">/</span>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">New Message</h1>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-lg border border-neutral-border overflow-hidden p-6">
        <ComposeForm initialRecipient={initialRecipient} />
      </div>
    </div>
  )
}
