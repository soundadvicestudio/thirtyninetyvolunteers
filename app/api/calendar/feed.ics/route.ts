import { getAdminClient } from '@/lib/supabase/admin'
import { buildAdminCalendarEvents, wrapInCalendar } from '@/lib/utils/ical'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = getAdminClient()
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, name, is_active')
    .eq('calendar_subscription_token', token)
    .maybeSingle()

  if (!admin || !admin.is_active) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: events } = await supabase
    .from('calendar_events')
    .select(
      `
      id, title, event_type, start_time, end_time,
      description, requirements,
      location:locations ( name )
      `
    )
    .eq('status', 'approved')
    .order('start_time', { ascending: true })

  const vevents = buildAdminCalendarEvents(
    (events ?? []) as unknown as Parameters<typeof buildAdminCalendarEvents>[0]
  )
  const icsContent = wrapInCalendar(vevents, '30 By Ninety Theatre — Production Crew')

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="30bn-calendar.ics"',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
