export type VolunteerFormData = {
  full_name: string
  email: string
  phone: string
  pronouns?: string
  pronouns_other?: string
  school?: string
  age_range?: string
  guardian_name?: string
  guardian_phone?: string
  requires_service_hours?: boolean
  category_ids: string[]
  referral_source_label?: string
  referral_source_other?: string
  referral_name?: string
}

export type UpdateFormData = Omit<VolunteerFormData, 'email'>

export type VolunteerListRow = {
  id: string
  full_name: string
  email: string
  phone: string
  pronouns: string | null
  age_range: string | null
  school: string | null
  is_minor: boolean
  guardian_name: string | null
  guardian_phone: string | null
  referral_source: string | null
  requires_service_hours: boolean
  status: 'active' | 'archived'
  total_hours: number
  created_at: string
  categories: { id: string; name: string }[]
  calls: number
  last_call: string | null
}

export type VolunteerProfile = {
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
  requires_service_hours: boolean
  status: 'active' | 'archived'
  total_hours: number
  created_at: string
  updated_at: string
}

