// Result of resolving a URL token to a show date
export type CheckInTokenResolution =
  | {
      type: 'date'
      showDate: { id: string; show_date: string; show_time: string; end_time: string | null }
      show: { id: string; name: string; default_hours: number | null; location_id: string }
    }
  | {
      type: 'show'
      show: { id: string; name: string; default_hours: number | null; location_id: string }
      dates: Array<{ id: string; show_date: string; show_time: string; end_time: string | null }>
      selectedDate: { id: string; show_date: string; show_time: string; end_time: string | null }
    }
  | { type: 'invalid' }

// Result returned from checkInVolunteer()
export type CheckInResult =
  | { success: true; volunteerName: string }
  | { alreadyCheckedIn: true; volunteerName: string }
  | { notFound: true; showName: string; showDate: string; showTime: string; showId: string }
  | { error: 'invalid_token' | 'date_passed' | 'unknown' }

// Result returned from checkInNewVolunteer()
export type CheckInNewResult =
  | { success: true; volunteerName: string; isNew: boolean }
  | { error: 'invalid_token' | 'date_passed' | 'duplicate_handled'; result?: CheckInResult }
  | { error: 'unknown' }

// Form data for new volunteer check-in signup. Field names match the
// volunteers table INSERT columns confirmed in submitVolunteerForm()
// (app/actions/volunteer.ts) — the "Other" sub-field collapsing (pronouns,
// referral_source) happens client-side before this shape is sent.
export type CheckInSignupData = {
  full_name: string
  email: string
  phone: string
  pronouns?: string
  school?: string
  age_range?: string
  is_minor: boolean
  guardian_name?: string
  guardian_phone?: string
  requires_service_hours: boolean
  referral_source?: string
  referral_name?: string
  category_ids: string[]
}
