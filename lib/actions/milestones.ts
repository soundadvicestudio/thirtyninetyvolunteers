'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'

export type AcknowledgeMilestoneResult = { success: true } | { error: string }

export async function acknowledgeMilestone(milestoneId: string): Promise<AcknowledgeMilestoneResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  // The eq('editor_acknowledged', false) guard prevents double-acknowledging.
  // Chaining select() returns the updated row so the audit log can capture
  // which volunteer/milestone this was, with no extra round trip.
  const { data: milestone, error } = await supabase
    .from('milestone_log')
    .update({ editor_acknowledged: true })
    .eq('id', milestoneId)
    .eq('editor_acknowledged', false)
    .select('volunteer_id, milestone_label, milestone_hours')
    .maybeSingle()

  if (error) {
    console.error('acknowledgeMilestone error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  if (milestone) {
    await logAction(admin.id, 'milestone.acknowledge', 'milestone', milestoneId, undefined, {
      volunteer_id: milestone.volunteer_id,
      milestone_label: milestone.milestone_label,
      milestone_hours: milestone.milestone_hours,
    })
  }

  revalidatePath('/crew/dashboard')

  return { success: true }
}
