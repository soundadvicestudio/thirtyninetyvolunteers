import { renderToBuffer } from '@react-pdf/renderer'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getVolunteersList } from '@/lib/volunteers/list'
import { parseVolunteersUrlState, type RawSearchParams } from '@/lib/volunteers/url'
import { buildFilterSummary } from '@/lib/volunteers/filterSummary'
import VolunteerListPDF from '@/lib/volunteers/VolunteerListPDF'
import { formatCT } from '@/lib/utils/date'
import { lightenHex } from '@/lib/utils/color'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return new Response('Unauthorized', { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams
  const rawParams: RawSearchParams = {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.getAll('category'),
    status: searchParams.get('status') ?? undefined,
    age_range: searchParams.get('age_range') ?? undefined,
    school: searchParams.get('school') ?? undefined,
    is_minor: searchParams.get('is_minor') ?? undefined,
    service_hours: searchParams.get('service_hours') ?? undefined,
    milestone_tier: searchParams.get('milestone_tier') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    dir: searchParams.get('dir') ?? undefined,
  }
  const state = parseVolunteersUrlState(rawParams)

  const supabase = await getServerClient()
  const [{ volunteers }, filterSummary, { data: brandRows }] = await Promise.all([
    getVolunteersList(supabase, state, { fetchAll: true }),
    buildFilterSummary(supabase, state),
    supabase.from('app_settings').select('key, value').in('key', ['brand_primary', 'org_timezone']),
  ])

  const brandMap = Object.fromEntries((brandRows ?? []).map((r) => [r.key, r.value]))
  const brandPrimary = brandMap['brand_primary'] || '#293994'
  const brandPrimaryLight = lightenHex(brandPrimary, 0.08)
  const tz = brandMap['org_timezone'] || 'America/Chicago'

  const buffer = await renderToBuffer(
    <VolunteerListPDF
      volunteers={volunteers}
      filters={filterSummary}
      generatedAt={formatCT(new Date(), 'MMM d, yyyy h:mm a', tz)}
      timezone={tz}
      brandPrimary={brandPrimary}
      brandPrimaryLight={brandPrimaryLight}
    />
  )

  const date = formatCT(new Date(), 'yyyy-MM-dd', tz)

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="volunteers-${date}.pdf"`,
    },
  })
}
