export type ShowType = 'mainstage' | 'studio_x' | 'one_off'
export type ShowStatus = 'draft' | 'live' | 'past' | 'archived'

export type Show = {
  id: string
  season_id: string | null
  name: string
  show_type: ShowType
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
  show_type: ShowType
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
  role: 'super_admin' | 'editor' | 'viewer'
}

export type AdminUserSummary = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'editor' | 'viewer'
}
