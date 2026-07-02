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
  show_id: string
  category_id: string | null
  role_name: string
  slots_available: number
}

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
