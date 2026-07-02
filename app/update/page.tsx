import { getAdminClient } from '@/lib/supabase/admin'
import { getServerClient } from '@/lib/supabase/server'
import UpdateLookupForm from '@/components/UpdateLookupForm'
import VolunteerUpdateForm from '@/components/VolunteerUpdateForm'
import Link from 'next/link'

export default async function UpdatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  // ── No token: show lookup form ──
  if (!token) {
    return <UpdateLookupForm />
  }

  // ── Token present: look up volunteer (admin client, bypasses RLS) ──
  const adminClient = getAdminClient()

  const { data: volunteer } = await adminClient
    .from('volunteers')
    .select(`
      id, full_name, email, phone, pronouns, school, age_range,
      guardian_name, guardian_phone, requires_service_hours,
      referral_source, referral_name, update_token,
      volunteer_category_assignments ( category_id )
    `)
    .eq('update_token', token)
    .maybeSingle()

  // ── Invalid token: error state ──
  if (!volunteer) {
    return (
      <div className="max-w-md mx-auto text-center px-4 py-16">
        <h1 className="text-navy font-bold text-2xl mb-3">
          This link is no longer valid
        </h1>
        <p className="text-mid-gray text-sm leading-relaxed mb-6">
          Update links expire after use. Request a new one below.
        </p>
        <Link
          href="/update"
          className="inline-block bg-navy text-white font-bold
                     px-6 py-3 rounded-lg hover:bg-opacity-90
                     transition-colors">
          Request a New Link
        </Link>
      </div>
    )
  }

  // ── Valid token: fetch form data and render update form ──
  const supabase = await getServerClient()

  const [{ data: categories }, { data: hearingOptions }] =
    await Promise.all([
      supabase
        .from('volunteer_categories')
        .select('id, name')
        .eq('is_visible', true)
        .order('sort_order'),
      supabase
        .from('hearing_options')
        .select('id, label')
        .eq('is_active', true)
        .order('sort_order'),
    ])

  // ── Reverse-map pronouns ──
  const knownPronouns =
    ['She/Her', 'He/Him', 'They/Them', 'Other', 'Prefer not to say']
  const storedPronouns = volunteer.pronouns ?? ''
  const pronounsValue =
    knownPronouns.includes(storedPronouns) ? storedPronouns
    : storedPronouns ? 'Other' : ''
  const pronounsOther =
    storedPronouns && !knownPronouns.includes(storedPronouns)
      ? storedPronouns : ''

  // ── Reverse-map referral source ──
  const knownLabels = (hearingOptions ?? []).map(h => h.label)
  const storedSource = volunteer.referral_source ?? ''
  const referralSourceLabel =
    knownLabels.includes(storedSource) ? storedSource
    : storedSource ? 'Other' : ''
  const referralSourceOther =
    storedSource && !knownLabels.includes(storedSource)
      ? storedSource : ''

  // ── Extract existing category IDs ──
  const existingCategoryIds =
    (volunteer.volunteer_category_assignments ?? [])
      .map((a: { category_id: string }) => a.category_id)

  const initialData = {
    full_name:              volunteer.full_name,
    phone:                  volunteer.phone,
    pronouns:               pronounsValue,
    pronouns_other:         pronounsOther,
    school:                 volunteer.school ?? '',
    age_range:              volunteer.age_range ?? '',
    guardian_name:          volunteer.guardian_name ?? '',
    guardian_phone:         volunteer.guardian_phone ?? '',
    requires_service_hours: volunteer.requires_service_hours ?? false,
    category_ids:           existingCategoryIds,
    referral_source_label:  referralSourceLabel,
    referral_source_other:  referralSourceOther,
    referral_name:          volunteer.referral_name ?? '',
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-navy font-bold text-2xl mb-1 text-center">
          Update Your Information
        </h1>
        <p className="text-mid-gray text-sm text-center mb-8">
          Your current information is pre-filled below. Make any
          changes and click Save.
        </p>
        <VolunteerUpdateForm
          volunteerId={volunteer.id}
          email={volunteer.email}
          initialData={initialData}
          categories={categories ?? []}
          hearingOptions={hearingOptions ?? []}
        />
      </div>
    </div>
  )
}
