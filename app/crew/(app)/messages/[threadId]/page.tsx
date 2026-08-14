import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getThreadData } from '@/lib/data/messages'
import ThreadView from '@/components/crew/messages/ThreadView'

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
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

  const { threadId } = await params

  const data = await getThreadData(supabase, threadId)
  if (!data) notFound()

  return (
    <ThreadView
      thread={data.thread}
      replies={data.replies}
      myLastReadAt={data.my_last_read_at}
      otherLastReadAt={data.other_last_read_at}
      currentAdminId={admin.id}
    />
  )
}
