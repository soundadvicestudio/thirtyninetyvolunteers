import type { Location, ShowStatus } from '@/types/show'

export type PublicShowRole = {
  id: string
  category_id: string | null
  role_name: string
  slots_available: number
  claimed_count: number
  is_full: boolean
}

export type PublicShowDate = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  roles: PublicShowRole[]
}

export type PublicShow = {
  id: string
  name: string
  location_id: string
  location: Location | null
  status: ShowStatus
  description: string | null
  volunteer_instructions: string | null
  dates: PublicShowDate[]
}
