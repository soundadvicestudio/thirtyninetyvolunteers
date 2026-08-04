export type RehearsalEventSummary = {
  id: string
  title: string
  start_time: string
  end_time: string
  location_id: string | null
  rehearsal_batch_id: string | null
  status: 'pending' | 'approved' | 'cancelled'
}

// Roster entry shape exposed on the public check-in route — name only,
// no email/role (unauthenticated route).
export type EffectiveRosterEntry = {
  id: string
  full_name: string
}

export type RehearsalCheckInData = {
  event: RehearsalEventSummary
  batchTitle: string
  effectiveRoster: EffectiveRosterEntry[]
}

export type CheckInToRehearsalResult =
  | { result: 'invalid-token' }
  | { result: 'not-on-roster' }
  | { result: 'already-checked-in'; checkedInAt: string }
  | { result: 'success'; checkedInAt: string }
  | { result: 'error' }

export type RehearsalScheduleRow = {
  id: string
  title: string
  submittedBy: string | null
  createdAt: string
  eventCount: number
  assigneeCount: number
  dateRangeStart: string | null
  dateRangeEnd: string | null
  nextDate: string | null
  status: 'pending' | 'approved' | 'cancelled' | 'partial'
}

export type RehearsalScheduleAssignee = {
  adminUserId: string
  name: string
  email: string
  role: string
  overrideCount: number
}

export type RehearsalEventRow = RehearsalEventSummary & {
  rosterCount: number
  overrideCount: number
  attendanceCount: number
  check_in_token: string | null
  location_name: string | null
}

export type RehearsalScheduleDetail = {
  batch: { id: string; title: string; submittedBy: string | null; createdAt: string }
  events: RehearsalEventRow[]
  scheduleAssignees: RehearsalScheduleAssignee[]
}

export type RehearsalActionResult = { success: boolean; error?: string }
