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
  category_ids: string[]
  referral_source_label?: string
  referral_source_other?: string
  referral_name?: string
}

export type UpdateFormData = Omit<VolunteerFormData, 'email'>
