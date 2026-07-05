import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendMilestoneEmail } from '@/lib/email'
import { MILESTONE_THRESHOLDS } from '@/lib/milestones-shared'

export { MILESTONE_THRESHOLDS, getNextMilestone, type MilestoneThreshold } from '@/lib/milestones-shared'

/**
 * First Call check — fires on the first attendance record with
 * status = 'showed' for a volunteer. R14: hours-independent trigger,
 * separate from checkMilestones().
 */
export async function checkFirstCall(volunteerId: string): Promise<void> {
  const client = getAdminClient()

  // Guard: check if First Call already logged
  const { data: existing } = await client
    .from('milestone_log')
    .select('id')
    .eq('volunteer_id', volunteerId)
    .eq('milestone_hours', 0)
    .maybeSingle()
  if (existing) return // already fired

  // Guard: confirm volunteer has at least one 'showed' attendance record
  const { data: firstAttendance } = await client
    .from('attendance')
    .select('id')
    .eq('volunteer_id', volunteerId)
    .eq('status', 'showed')
    .limit(1)
    .maybeSingle()
  if (!firstAttendance) return // not yet

  const { data: volunteer } = await client
    .from('volunteers')
    .select('id, full_name, email')
    .eq('id', volunteerId)
    .single()
  if (!volunteer) return

  // Insert milestone_log entry. The UNIQUE constraint (Migration 013) on
  // (volunteer_id, milestone_hours) backstops the race condition — a
  // concurrent call hitting insert first surfaces as error code 23505,
  // handled gracefully below (not an actual failure).
  const { error: insertError } = await client.from('milestone_log').insert({
    volunteer_id: volunteerId,
    milestone_hours: 0,
    milestone_label: 'First Call',
    email_sent: false,
    editor_notified: true,
    editor_acknowledged: false,
  })

  if (insertError) {
    if (insertError.code !== '23505') {
      console.error('checkFirstCall insert error:', insertError)
    }
    return
  }

  // Send congratulations email (non-blocking — milestone is already logged)
  try {
    await sendMilestoneEmail(volunteer.email, volunteer.full_name, 'First Call', 0, null)
    await client
      .from('milestone_log')
      .update({ email_sent: true })
      .eq('volunteer_id', volunteerId)
      .eq('milestone_hours', 0)
  } catch (err) {
    console.error('checkFirstCall email error:', err)
    // email_sent stays false — milestone still logged
  }
}

/**
 * Hours-based milestone check — runs after every hours change (attendance
 * mark, hours confirmation, manual entry). Inserts a milestone_log row (and
 * sends a congratulations email) for every threshold newly crossed by the
 * volunteer's current total_hours.
 */
export async function checkMilestones(volunteerId: string): Promise<void> {
  const client = getAdminClient()

  const { data: volunteer } = await client
    .from('volunteers')
    .select('total_hours, full_name, email')
    .eq('id', volunteerId)
    .single()
  if (!volunteer) return

  const totalHours = Number(volunteer.total_hours)

  // Fetch all previously earned milestones (hours > 0 — First Call excluded,
  // it's handled exclusively by checkFirstCall()).
  const { data: earned } = await client
    .from('milestone_log')
    .select('milestone_hours')
    .eq('volunteer_id', volunteerId)
    .gt('milestone_hours', 0)

  const earnedHours = new Set((earned ?? []).map((m) => Number(m.milestone_hours)))

  // Build complete threshold list (fixed + extended every-25h-after-100)
  const fixedThresholds = MILESTONE_THRESHOLDS.filter((t) => t.hours > 0)
  const extended: typeof MILESTONE_THRESHOLDS = []
  let next = 125
  while (next <= totalHours + 25) {
    extended.push({ hours: next, label: `${next} Hours` })
    next += 25
  }
  const allThresholds = [...fixedThresholds, ...extended]

  // Find all thresholds crossed but not yet logged
  const newMilestones = allThresholds.filter((t) => t.hours <= totalHours && !earnedHours.has(t.hours))

  if (newMilestones.length === 0) return

  for (const milestone of newMilestones) {
    const { error: insertError } = await client.from('milestone_log').insert({
      volunteer_id: volunteerId,
      milestone_hours: milestone.hours,
      milestone_label: milestone.label,
      email_sent: false,
      editor_notified: true,
      editor_acknowledged: false,
    })

    if (insertError) {
      if (insertError.code !== '23505') {
        console.error('checkMilestones insert error:', insertError)
      }
      continue // skip to next threshold
    }

    try {
      await sendMilestoneEmail(volunteer.email, volunteer.full_name, milestone.label, milestone.hours, totalHours)
      await client
        .from('milestone_log')
        .update({ email_sent: true })
        .eq('volunteer_id', volunteerId)
        .eq('milestone_hours', milestone.hours)
    } catch (err) {
      console.error('checkMilestones email error:', milestone.label, err)
    }
  }
}
