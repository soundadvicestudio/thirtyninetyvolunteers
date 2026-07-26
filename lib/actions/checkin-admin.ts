'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import type { CheckInRoster, CheckInRosterEntry, CheckInWalkIn } from '@/types/checkin'

// Admin-session check-in actions for the /crew/tools/checkin dashboard
// (CheckInDashboard.tsx). Kept separate from lib/actions/checkin.ts, which
// serves the public /checkin/[token] route and uses getAdminClient()
// exclusively — no Supabase Auth session exists there. This file is the
// opposite: every export here is called from an authenticated admin session.

type RawClaimRow = {
  id: string
  volunteer_name: string
  volunteer_roles: { role_name: string } | null
  attendance: Array<{ status: 'showed' | 'no_show' | 'excused'; source: string; marked_at: string }> | null
}

type RawWalkInRow = {
  marked_at: string
  volunteers: { full_name: string } | null
}

export async function getCheckInRosterForDate(showDateId: string): Promise<CheckInRoster> {
  try {
    const supabase = await getServerClient()

    const flags = await getFeatureFlags(supabase)
    if (!flags.checkin) {
      return { claims: [], walkIns: [], checkedInCount: 0, totalRostered: 0 }
    }

    const [{ data: claimRows }, { data: walkInRows }] = await Promise.all([
      supabase
        .from('slot_claims')
        .select(
          `
          id,
          volunteer_name,
          volunteer_roles!inner ( role_name ),
          attendance ( status, source, marked_at )
          `
        )
        .eq('show_date_id', showDateId)
        .eq('status', 'claimed')
        .order('volunteer_name', { ascending: true }),
      supabase
        .from('attendance')
        .select(
          `
          marked_at,
          volunteers ( full_name )
          `
        )
        .eq('show_date_id', showDateId)
        .is('slot_claim_id', null)
        .eq('status', 'showed')
        .order('marked_at', { ascending: true }),
    ])

    const claims: CheckInRosterEntry[] = ((claimRows ?? []) as unknown as RawClaimRow[]).map((c) => {
      const record = (c.attendance ?? [])[0] ?? null
      return {
        claimId: c.id,
        volunteerName: c.volunteer_name,
        roleName: c.volunteer_roles?.role_name ?? 'Role',
        attendance: record
          ? {
              status: record.status,
              source: record.source === 'checkin' ? ('checkin' as const) : ('manual' as const),
              markedAt: record.marked_at,
            }
          : null,
      }
    })

    const walkIns: CheckInWalkIn[] = ((walkInRows ?? []) as unknown as RawWalkInRow[]).map((w) => ({
      volunteerName: w.volunteers?.full_name ?? 'Unknown Volunteer',
      markedAt: w.marked_at,
    }))

    const checkedInCount = claims.filter((c) => c.attendance?.status === 'showed').length + walkIns.length
    const totalRostered = claims.length

    return { claims, walkIns, checkedInCount, totalRostered }
  } catch (err) {
    console.error('getCheckInRosterForDate error:', err)
    return { claims: [], walkIns: [], checkedInCount: 0, totalRostered: 0 }
  }
}
