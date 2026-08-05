// ─── Primitive union types ─────────────────────────────────────

export type AuditionType = 'open_call' | 'timed_slots'

export type AuditionStatus = 'draft' | 'published' | 'closed' | 'archived'

export type AuditionSignupStatus =
  'pending' | 'callback' | 'cast' | 'not_cast' | 'withdrawn'

export type AuditionMaterialType =
  'headshot' | 'resume' | 'sheet_music' | 'mp3' | 'video'

export type AuditionCalendarVisibility = 'admin_only' | 'public'

export type AuditionEmailStatusType = 'callback' | 'cast' | 'not_cast'

export type AuditionCheckInSource = 'checkin' | 'manual'

// ─── Row types (match DB schema exactly) ───────────────────────

export type Audition = {
  id: string
  title: string
  description: string | null
  show_id: string | null
  parent_audition_id: string | null
  location_id: string | null
  type: AuditionType
  status: AuditionStatus
  date_start: string
  date_end: string | null
  time_start: string | null
  time_end: string | null
  slot_duration_minutes: number | null
  slots_total: number | null
  slot_cap: number
  role_selection_enabled: boolean
  material_headshot: boolean
  material_resume: boolean
  material_sheet_music: boolean
  material_mp3: boolean
  material_video: boolean
  calendar_visibility: AuditionCalendarVisibility
  notification_emails_enabled: boolean
  check_in_token: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export type AuditionRole = {
  id: string
  audition_id: string
  name: string
  sort_order: number
  created_at: string
}

export type AuditionSlot = {
  id: string
  audition_id: string
  start_time: string
  cap: number
  created_at: string
}

// NOTE: `name` is a single text column on audition_signups — distinct from
// admin_users.full_name used throughout the rehearsal roster types. Every
// composite type below that surfaces auditioner identity uses `name`, never
// `full_name`, to avoid confusion with the rehearsal check-in pattern.
export type AuditionSignup = {
  id: string
  audition_id: string
  slot_id: string | null
  audition_role_id: string | null
  name: string
  email: string
  phone: string
  is_minor: boolean
  guardian_name: string | null
  guardian_phone: string | null
  status: AuditionSignupStatus
  cast_role: string | null
  cancel_token: string
  upload_token: string
  checked_in_at: string | null
  check_in_source: AuditionCheckInSource | null
  signed_up_at: string
}

export type AuditionSignupNote = {
  id: string
  signup_id: string
  content: string
  created_by: string | null
  created_at: string
}

export type AuditionMaterial = {
  id: string
  signup_id: string
  material_type: AuditionMaterialType
  storage_path: string
  original_filename: string | null
  uploaded_at: string
}

export type AuditionAssignment = {
  id: string
  audition_id: string
  admin_user_id: string
  created_at: string
}

export type AuditionEmailTemplate = {
  id: string
  audition_id: string
  status_type: AuditionEmailStatusType
  subject: string
  body_html: string
  updated_by: string | null
  updated_at: string
}

// ─── Composite types for server actions and UI ─────────────────

export type AuditionPublicData = {
  audition: Pick<
    Audition,
    | 'id'
    | 'title'
    | 'description'
    | 'type'
    | 'status'
    | 'date_start'
    | 'date_end'
    | 'time_start'
    | 'time_end'
    | 'slot_cap'
    | 'slots_total'
    | 'role_selection_enabled'
    | 'material_headshot'
    | 'material_resume'
    | 'material_sheet_music'
    | 'material_mp3'
    | 'material_video'
    | 'check_in_token'
  >
  roles: AuditionRole[]
  slots: (AuditionSlot & { signupCount: number })[]
  location: { id: string; name: string } | null
}

export type AuditionUploadData = {
  signupId: string
  auditionTitle: string
  auditionerName: string
  enabledMaterialTypes: AuditionMaterialType[]
  existingMaterials: Pick<
    AuditionMaterial,
    'material_type' | 'original_filename' | 'uploaded_at'
  >[]
}

export type AuditionCheckInData = {
  audition: Pick<Audition, 'id' | 'title' | 'date_start' | 'time_start' | 'check_in_token'>
  location: { name: string } | null
  // roster uses `name`, not `full_name` — audition_signups has a single
  // name column, unlike admin_users.full_name used by the rehearsal roster.
  roster: { id: string; name: string }[]
}

// Parallels CheckInToRehearsalResult from types/rehearsal.ts, with one key
// difference: checkInToAudition() takes a signupId (audition_signups.id),
// not an adminUserId — auditioners have no Supabase Auth identity, so the
// dropdown selection on the public check-in page IS the identity assertion.
export type AuditionCheckInResult =
  | { result: 'invalid-token' }
  | { result: 'not-on-roster' }
  | { result: 'success'; checkedInAt: string }
  | { result: 'already-checked-in'; checkedInAt: string }
  | { result: 'error' }

export type AuditionListItem = {
  id: string
  title: string
  status: AuditionStatus
  type: AuditionType
  date_start: string
  date_end: string | null
  show_id: string | null
  show_title: string | null
  signup_count: number
  location_name: string | null
}

export type AuditionDetailData = {
  audition: Audition
  roles: AuditionRole[]
  slots: AuditionSlot[]
  location: { id: string; name: string; color: string } | null
  show: { id: string; name: string } | null
  parent_audition: { id: string; title: string } | null
  assignments: (AuditionAssignment & {
    admin: { id: string; full_name: string; role: string }
  })[]
}

export type AuditionSignupWithDetails = {
  signup: AuditionSignup
  slot: Pick<AuditionSlot, 'start_time'> | null
  role: Pick<AuditionRole, 'name'> | null
  notes: AuditionSignupNote[]
  materials: AuditionMaterial[]
}
