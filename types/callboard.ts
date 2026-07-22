export type CallboardVolunteer = {
  id: string
  full_name: string
  email: string
  phone: string
  pronouns: string | null
  school: string | null
  age_range: string | null
  is_minor: boolean
  guardian_name: string | null
  guardian_phone: string | null
  referral_source: string | null
  referral_name: string | null
  total_hours: number
  update_token: string
  status: 'active' | 'archived'
  requires_service_hours: boolean
  created_at: string
}

export type CallboardMilestone = {
  id: string
  milestone_hours: number
  milestone_label: string
  triggered_at: string
}

export type CallboardActiveClaim = {
  id: string
  volunteer_role_id: string
  show_date_id: string
  role_name: string
  show_date: string
  show_id: string
}

export type CallboardCallHistoryRow = {
  id: string
  claimed_at: string
  status: 'claimed' | 'cancelled'
  claim_token: string | null
  role_name: string
  show_id: string | null
  show_name: string
  show_date: string
  attendance_status: 'showed' | 'no_show' | 'excused' | null
  hours_logged: number | null
}

export type CallboardManualHoursEntry = {
  hours: number
  note: string | null
  logged_date: string
}
