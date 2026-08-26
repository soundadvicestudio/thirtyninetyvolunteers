import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import { getUpcomingAuditions } from '@/lib/actions/auditions'
import { formatWallClockCT } from '@/lib/utils/date'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import Link from 'next/link'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import VolunteerForm from '@/components/VolunteerForm'
import PublicHeader from '@/components/public/PublicHeader'

export default async function HomePage() {
  // Public page — no Supabase Auth session exists, so the admin client is
  // required here (never the cookie-based session client). One client
  // instance for every DB read on this page; resolveOrgIdentity() and
  // getUpcomingAuditions() are the exceptions — both are self-contained
  // helpers that construct their own admin client internally.
  const supabase = getAdminClient()
  const flags = await getFeatureFlags(supabase)
  const tz = await getOrgTimezone(supabase)
  const [org, upcomingAuditions] = await Promise.all([resolveOrgIdentity(), getUpcomingAuditions()])

  // Banner settings
  const [{ data: bannerActive }, { data: bannerText }] = await Promise.all([
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'announcement_banner_active')
      .maybeSingle(),
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'announcement_banner_text')
      .maybeSingle(),
  ])

  // Categories and hearing options
  const { data: categories } = await supabase
    .from('volunteer_categories')
    .select('id, name')
    .eq('is_visible', true)
    .order('sort_order')

  const { data: hearingOptions } = await supabase
    .from('hearing_options')
    .select('id, label')
    .eq('is_active', true)
    .order('sort_order')

  // Signup form field toggles
  const [{ data: showSchoolSetting }, { data: showAgeRangeSetting }] =
    await Promise.all([
      supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'signup_show_school')
        .maybeSingle(),
      supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'signup_show_age_range')
        .maybeSingle(),
    ])

  const showBanner = bannerActive?.value === 'true' && !!bannerText?.value

  const showSchool = showSchoolSetting?.value !== 'false'
  const showAgeRange = showAgeRangeSetting?.value !== 'false'

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {showBanner && <AnnouncementBanner text={bannerText!.value!} />}

      {/* Hero */}
      <section className="w-full bg-brand-primary-light py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-brand-primary font-bold text-2xl md:text-3xl">
            Welcome to the {org.org_name} Volunteer Family
          </h2>
          <p className="text-dark text-base leading-relaxed max-w-xl mx-auto mt-4">
            Our volunteers are the heart of every production — from backstage
            to the box office. Whatever your talents or time, there&apos;s a
            place for you here.
          </p>
        </div>
      </section>

      {/* Sign-up section */}
      <section className="w-full bg-white py-10 px-6 flex-1">
        <div className="max-w-2xl mx-auto">
          <h3 className={`text-brand-primary font-bold text-xl text-center ${org.org_tagline ? 'mb-2' : 'mb-6'}`}>
            Join the <span className="font-extrabold">{org.org_name}</span> Volunteer
            Community
          </h3>
          {org.org_tagline && (
            <p className="text-mid-gray text-sm text-center mb-6">{org.org_tagline}</p>
          )}

          {upcomingAuditions.length > 0 && (
            <div className="mb-6 rounded-lg border border-divider bg-white p-5">
              <h2 className="text-lg font-semibold text-dark mb-3">Upcoming Auditions</h2>
              <ul className="space-y-3">
                {upcomingAuditions.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-dark">{a.title}</p>
                      {a.show_title && <p className="text-sm text-mid-gray">{a.show_title}</p>}
                      <p className="text-sm text-mid-gray">
                        {formatWallClockCT(a.date_start, null, 'MMMM d, yyyy', tz)}
                        {a.date_end &&
                          a.date_end !== a.date_start &&
                          ` – ${formatWallClockCT(a.date_end, null, 'MMMM d, yyyy', tz)}`}
                      </p>
                    </div>
                    <Link href={`/auditions/${a.id}`} className="shrink-0 text-sm font-medium text-brand-accent hover:underline">
                      {'Sign up →'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/update"
              className="flex-1 text-center bg-white border border-brand-primary text-brand-primary font-semibold py-3 px-6 rounded hover:bg-brand-primary-light transition-colors"
            >
              Update My Info
            </Link>
            <Link
              href="/callboard"
              className="flex-1 text-center bg-white border border-brand-primary text-brand-primary font-semibold py-3 px-6 rounded hover:bg-brand-primary-light transition-colors"
            >
              View Opportunities
            </Link>
            {flags.calendar && (
              <Link
                href="/calendar"
                className="flex-1 text-center bg-white border border-brand-primary text-brand-primary font-semibold py-3 px-6 rounded hover:bg-brand-primary-light transition-colors"
              >
                View Calendar
              </Link>
            )}
          </div>

          <h4 className="font-semibold text-brand-primary text-lg text-center mb-4">
            Sign up to add your name to our volunteer list
          </h4>

          <VolunteerForm
            categories={categories ?? []}
            hearingOptions={hearingOptions ?? []}
            showSchool={showSchool}
            showAgeRange={showAgeRange}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-2xl mx-auto">
          {(org.org_contact_email || org.org_website_url || org.org_location) && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-mid-gray text-xs mb-2">
              {org.org_contact_email && (
                <a href={`mailto:${org.org_contact_email}`} className="hover:text-brand-primary transition-colors">
                  {org.org_contact_email}
                </a>
              )}
              {org.org_website_url && (
                <a
                  href={org.org_website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary transition-colors"
                >
                  {org.org_website_url}
                </a>
              )}
              {org.org_location && <span>{org.org_location}</span>}
            </div>
          )}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-mid-gray text-xs">© {org.org_name}</p>
            <Link
              href="/crew/login"
              className="text-mid-gray text-xs hover:text-brand-primary transition-colors"
            >
              Production Crew
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
