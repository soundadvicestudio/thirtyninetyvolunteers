import { fromZonedTime } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { buildClaimICalEvent, wrapInCalendar } from '@/lib/utils/ical'

const CT = 'America/Chicago'

type ClaimRow = {
  id: string
  status: string
  volunteer_name: string
  volunteer_role: {
    role_name: string
    show_date: {
      show_date: string
      show_time: string
      end_time: string | null
      show: {
        name: string
        location: { name: string } | null
      } | null
    } | null
  } | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) {
    return new Response('Not found', { status: 404 })
  }

  const supabase = getAdminClient()
  const { data: claim } = await supabase
    .from('slot_claims')
    .select(
      `
      id,
      status,
      volunteer_name,
      volunteer_role:volunteer_roles (
        role_name,
        show_date:show_dates (
          show_date,
          show_time,
          end_time,
          show:shows (
            name,
            location:locations ( name )
          )
        )
      )
      `
    )
    .eq('claim_token', token)
    .eq('status', 'claimed')
    .maybeSingle()

  const typedClaim = claim as unknown as ClaimRow | null

  if (!typedClaim || !typedClaim.volunteer_role?.show_date?.show) {
    return new Response('Not found', { status: 404 })
  }

  const sd = typedClaim.volunteer_role.show_date
  const show = sd.show!

  const startTime = fromZonedTime(`${sd.show_date} ${sd.show_time}`, CT)
  const endTime = sd.end_time
    ? fromZonedTime(`${sd.show_date} ${sd.end_time}`, CT)
    : new Date(startTime.getTime() + 3 * 3600000)

  const vevent = buildClaimICalEvent({
    claimId: typedClaim.id,
    showName: show.name,
    roleName: typedClaim.volunteer_role.role_name,
    locationName: show.location?.name ?? 'Theater',
    startTime,
    endTime,
  })
  const icsContent = wrapInCalendar([vevent], '30 By Ninety Theatre')

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="volunteer-call.ics"',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
