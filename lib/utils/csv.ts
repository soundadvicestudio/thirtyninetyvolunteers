import { formatCT } from '@/lib/utils/date'
import type { VolunteerListRow } from '@/types/volunteer'

const CSV_HEADERS = [
  'Full Name',
  'Email',
  'Phone',
  'Pronouns',
  'School',
  'Age Range',
  'Is Minor',
  'Guardian Name',
  'Guardian Phone',
  'Service Hours Required',
  'Preferred Contact',
  'Categories',
  'Total Hours',
  'Calls',
  'Status',
  'Joined Date',
  'How did you hear about us?',
]

export const AGE_RANGE_LABELS: Record<string, string> = {
  under_18: 'Under 18',
  '18_25': '18–25',
  '26_35': '26–35',
  '36_50': '36–50',
  '51_plus': '51+',
  prefer_not: 'Prefer not to say',
}

export const COMMUNICATION_PREFERENCE_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  either: 'No preference',
}

export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildVolunteersCsv(rows: VolunteerListRow[], timezone: string = 'America/Chicago'): string {
  const lines = [CSV_HEADERS.map(escapeCsvField).join(',')]

  for (const row of rows) {
    const fields = [
      row.full_name,
      row.email,
      row.phone,
      row.pronouns ?? '',
      row.school ?? '',
      row.age_range ? (AGE_RANGE_LABELS[row.age_range] ?? row.age_range) : '',
      row.is_minor ? 'Yes' : 'No',
      row.guardian_name ?? '',
      row.guardian_phone ?? '',
      row.requires_service_hours ? 'Yes' : 'No',
      row.communication_preference
        ? (COMMUNICATION_PREFERENCE_LABELS[row.communication_preference] ?? row.communication_preference)
        : '',
      row.categories.map((c) => c.name).join('|'),
      String(row.total_hours),
      String(row.calls),
      row.status === 'active' ? 'Active' : 'Archived',
      formatCT(row.created_at, 'MMM d, yyyy', timezone),
      row.referral_source ?? '',
    ]
    lines.push(fields.map((f) => escapeCsvField(String(f))).join(','))
  }

  return lines.join('\r\n')
}

export function csvExportFilename(timezone: string = 'America/Chicago'): string {
  return `volunteers-export-${formatCT(new Date(), 'yyyy-MM-dd', timezone)}.csv`
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
