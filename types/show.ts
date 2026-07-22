import type { AdminRole } from '@/types/admin'

export type ShowStatus = 'draft' | 'live' | 'past' | 'archived'

export type Location = {
  id: string
  name: string
  color: string
}

// Extends the base Location with the optional per-location default-hours
// override (30BN-ADMIN.25) — only fetched by the show form pages, which
// need it for the auto-fill effect. Not part of the shared Location shape
// since most Location consumers (show display, calendar views, etc.)
// never select this column.
export type LocationWithDefaultHours = Location & { default_hours: number | null }

export type Show = {
  id: string
  season_id: string | null
  name: string
  location_id: string
  location: Location | null
  description: string | null
  status: ShowStatus
  volunteer_instructions: string | null
  default_hours: number | null
  notifications_sent_at: string | null
  created_at: string
  updated_at: string
}

export type ShowDate = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  end_time: string | null
  buffer_before_minutes: number
  buffer_after_minutes: number
}

export type ShowRole = {
  id: string
  show_date_id: string
  category_id: string | null
  role_name: string
  slots_available: number
}

export type ShowDateWithRoles = ShowDate & { roles: ShowRole[] }

export type Season = {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
}

export type ShowWithStaffing = {
  id: string
  name: string
  location_id: string
  location: Location | null
  status: ShowStatus
  season_id: string | null
  created_at: string
  updated_at: string
  total_slots: number
  filled_slots: number
  earliest_date: string | null
  latest_date: string | null
}

export type SlotClaim = {
  id: string
  volunteer_role_id: string
  show_date_id: string
  volunteer_id: string | null
  volunteer_name: string
  volunteer_email: string
  status: 'claimed' | 'cancelled' | 'waitlisted'
  waitlist_position: number | null
  claimed_at: string
}

export type AttendanceRecord = {
  id: string
  slot_claim_id: string
  status: 'showed' | 'no_show' | 'excused'
  hours_logged: number
}

export type ShowEditor = {
  admin_id: string
  name: string
  email: string
  role: AdminRole
}

export type AdminUserSummary = {
  id: string
  name: string
  email: string
  role: AdminRole
}

export type PostShowDateStats = {
  dateId: string
  showDate: string
  showTime: string
  totalClaimed: number
  showedCount: number
  noShowCount: number
  excusedCount: number
  unmarkedCount: number
  totalHours: number
  pendingHours: number
}

export type PostShowReportData = {
  perDate: PostShowDateStats[]
  totalClaimedAppearances: number
  uniqueVolunteerCount: number
  totalShowedCount: number
  totalNoShowCount: number
  totalExcusedCount: number
  totalUnmarkedCount: number
  totalHours: number
  totalPendingHoursCount: number
  attendanceRate: number | null
}
