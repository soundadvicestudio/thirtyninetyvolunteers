import { format } from 'date-fns'

const formatICalDate = (d: Date): string => format(d, "yyyyMMdd'T'HHmmss'Z'")

// iCalendar text folding (RFC 5545): lines longer than 75 octets must be
// folded with CRLF + a leading space.
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = []
  chunks.push(line.slice(0, 75))
  let i = 75
  while (i < line.length) {
    chunks.push(' ' + line.slice(i, i + 74))
    i += 74
  }
  return chunks.join('\r\n')
}

// iCalendar text escaping for commas, semicolons, backslashes, and newlines
// in property values.
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function generateVEvent(event: {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
  location?: string
  description?: string
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'
  url?: string
}): string {
  const lines: string[] = []
  lines.push('BEGIN:VEVENT')
  lines.push(foldLine(`UID:${event.uid}`))
  lines.push(foldLine(`DTSTART:${formatICalDate(event.dtstart)}`))
  lines.push(foldLine(`DTEND:${formatICalDate(event.dtend)}`))
  lines.push(foldLine(`SUMMARY:${escapeICalText(event.summary)}`))
  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeICalText(event.location)}`))
  }
  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeICalText(event.description)}`))
  }
  if (event.url) {
    lines.push(foldLine(`URL:${event.url}`))
  }
  lines.push(foldLine(`STATUS:${event.status ?? 'CONFIRMED'}`))
  lines.push('END:VEVENT')

  return lines.map((line) => line + '\r\n').join('')
}

export function wrapInCalendar(events: string[], calName?: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//30 By Ninety Theatre//Volunteer Platform//EN',
    `X-WR-CALNAME:${escapeICalText(calName ?? '30 By Ninety Theatre')}`,
  ]
  const header = lines.map((line) => line + '\r\n').join('')
  return `${header}${events.join('')}END:VCALENDAR\r\n`
}

export function buildClaimICalEvent(params: {
  claimId: string
  showName: string
  roleName: string
  locationName: string
  startTime: Date
  endTime: Date
}): string {
  return generateVEvent({
    uid: `${params.claimId}@30byninetyvolunteers.com`,
    summary: `${params.showName} — ${params.roleName}`,
    dtstart: params.startTime,
    dtend: params.endTime,
    location: params.locationName,
    description:
      '30 By Ninety Theatre volunteer call.' +
      ' Visit https://30byninetyvolunteers.com/callboard to view your call history.',
    status: 'CONFIRMED',
  })
}

export function buildAdminCalendarEvents(
  events: Array<{
    id: string
    title: string
    start_time: string
    end_time: string
    location: { name: string } | null
    description: string | null
    requirements: string | null
    event_type: string
  }>
): string[] {
  return events.map((e) =>
    generateVEvent({
      uid: `${e.id}@30byninetyvolunteers.com`,
      summary: e.location ? `${e.title} — ${e.location.name}` : e.title,
      dtstart: new Date(e.start_time),
      dtend: new Date(e.end_time),
      location: e.location?.name,
      description: [e.description, e.requirements].filter(Boolean).join('\n\n') || undefined,
      status: 'CONFIRMED',
    })
  )
}
