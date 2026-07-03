'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'

export type ActivityEvent = {
  event_type: 'signup' | 'claim' | 'cancellation' | 'opportunity_submission'
  event_id: string
  volunteer_name: string
  volunteer_id: string | null
  detail: string | null
  detail_id: string | null
  occurred_at: string
}

export type ClearActivityFeedResult = { success: true } | { error: string }

export async function clearActivityFeed(): Promise<ClearActivityFeedResult> {
  const admin = await getAdminUser()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('admin_users')
    .update({ activity_cleared_at: new Date().toISOString() })
    .eq('id', admin.id)

  if (error) {
    console.error('clearActivityFeed error:', error)
    return { error: 'Something went wrong marking activity as read. Please try again.' }
  }

  return { success: true }
}

export type LoadMoreActivityResult = { events: ActivityEvent[] }

export async function loadMoreActivity(offset: number): Promise<LoadMoreActivityResult> {
  const admin = await getAdminUser()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await getServerClient()

  const { data } = await supabase.rpc('get_activity_feed', { p_limit: 10, p_offset: offset })

  return { events: (data ?? []) as ActivityEvent[] }
}
