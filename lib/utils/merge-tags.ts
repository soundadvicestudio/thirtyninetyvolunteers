export type MergeTagValues = {
  auditioner_name?: string
  show_title?: string
  audition_title?: string
  audition_date?: string
  audition_location?: string
  role_name?: string
  cast_role?: string
  org_name?: string
}

export const MERGE_TAGS = [
  { tag: '{{auditioner_name}}', label: 'Auditioner Name' },
  { tag: '{{show_title}}', label: 'Show Title' },
  { tag: '{{audition_title}}', label: 'Audition Title' },
  { tag: '{{audition_date}}', label: 'Audition Date' },
  { tag: '{{audition_location}}', label: 'Audition Location' },
  { tag: '{{role_name}}', label: 'Role' },
  { tag: '{{cast_role}}', label: 'Cast Role' },
  { tag: '{{org_name}}', label: 'Organization Name' },
] as const

export type MergeTag = (typeof MERGE_TAGS)[number]

// Local copy of escapeHtml — lib/email.ts's version is unexported. This
// utility must be client/server safe so importing from lib/email.ts is
// not possible. Four-line function is an intentional documented duplication.
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function substituteMergeTags(html: string, values: MergeTagValues): string {
  let result = html
  for (const { tag } of MERGE_TAGS) {
    // Extract the key from {{key}} format
    const key = tag.slice(2, -2) as keyof MergeTagValues
    const value = values[key]
    if (value !== undefined && value !== null) {
      result = result.replaceAll(tag, escapeHtml(value))
    }
    // If no value: leave {{tag}} as literal string. This makes missing
    // values visible rather than silently producing empty strings in
    // the email.
  }
  return result
}
