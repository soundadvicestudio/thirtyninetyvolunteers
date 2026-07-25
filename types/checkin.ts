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

// A single rostered volunteer's check-in state
export type CheckInRosterEntry = {
  claimId: string
  volunteerName: string
  roleName: string
  attendance: {
    status: 'showed' | 'no_show' | 'excused'
    source: 'manual' | 'checkin'
    markedAt: string
  } | null
}

// A walk-in who signed up at the door via check-in page
export type CheckInWalkIn = {
  volunteerName: string
  markedAt: string
}

// Full roster data for one show date
export type CheckInRoster = {
  claims: CheckInRosterEntry[]
  walkIns: CheckInWalkIn[]
  checkedInCount: number // showed (claimed + walk-in)
  totalRostered: number // claimed slot_claims only
}

// Summary card for accordion (other future shows)
export type CheckInShowSummary = {
  showId: string
  showName: string
  locationName: string
  nearestDateId: string
  nearestDate: string // YYYY-MM-DD bare date string
  nearestTime: string // time string
  checkedInCount: number
  totalRostered: number
}

// Full dashboard data returned by getCheckInDashboardData
export type CheckInDashboardData =
  | { noUpcomingShows: true }
  | {
      noUpcomingShows: false
      topShow: {
        showId: string
        showName: string
        locationName: string
        upcomingDates: Array<{
          id: string
          show_date: string
          show_time: string
          end_time: string | null
        }>
        selectedDateId: string
        roster: CheckInRoster
      }
      otherShows: CheckInShowSummary[]
    }
