import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import { getUpcomingAuditions } from '@/lib/actions/auditions'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { formatInTimeZone } from 'date-fns-tz'
import Link from 'next/link'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import VolunteerForm from '@/components/VolunteerForm'
import PublicHeader from '@/components/public/PublicHeader'
import { HomeCalendarWidget } from '@/components/calendar/HomeCalendarWidget'
import { getPublicCalendarEvents, type PublicCalendarEvent } from '@/lib/data/publicCalendar'

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

  const now = new Date()
  const currentYear = parseInt(formatInTimeZone(now, tz, 'yyyy'), 10)
  const currentMonth = parseInt(formatInTimeZone(now, tz, 'M'), 10)

  let calendarEvents: PublicCalendarEvent[] = []
  if (flags.calendar) {
    calendarEvents = await getPublicCalendarEvents(supabase, currentYear, currentMonth, tz)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {showBanner && <AnnouncementBanner text={bannerText!.value!} />}

      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="pb-4 border-b border-neutral-border mb-6">
            <h1 className="text-3xl font-bold text-dark mb-2">
              Welcome to the {org.org_name} Volunteer Family
            </h1>
            {org.org_tagline && (
              <p className="text-mid-gray">{org.org_tagline}</p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-mid-gray text-base leading-relaxed">
              Our volunteers are the heart of every production — from backstage
              to the box office. Whatever your talents or time, there&apos;s a
              place for you here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/update"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Update My Info
            </Link>
            <Link
              href="/callboard"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Upcoming Volunteer Opportunities
            </Link>
          </div>

          <h3 className="text-dark font-bold text-xl text-center mb-6">
            Join the <span className="font-extrabold">{org.org_name}</span> Volunteer
            Community
          </h3>

          <div className="flex flex-col xl:flex-row gap-6">
            {flags.calendar && (
              <div className="xl:w-[50%] min-w-0">
                <HomeCalendarWidget
                  initialYear={currentYear}
                  initialMonth={currentMonth}
                  initialEvents={calendarEvents}
                />
              </div>
            )}

            <div className={flags.calendar ? 'xl:w-[50%] min-w-0' : 'w-full max-w-2xl mx-auto'}>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-surface border-b border-neutral-border px-5 py-3">
                  <span className="font-semibold text-sm text-gray-700">
                    Sign Up to Volunteer
                  </span>
                </div>
                <div className="bg-white px-5 py-4">
                  <VolunteerForm
                    categories={categories ?? []}
                    hearingOptions={hearingOptions ?? []}
                    showSchool={showSchool}
                    showAgeRange={showAgeRange}
                  />
                </div>
              </div>
            </div>
          </div>

          {upcomingAuditions.length > 0 && (
            <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-surface border-b border-neutral-border px-5 py-3">
                <h2 className="font-semibold text-sm text-gray-700">
                  Upcoming Auditions
                </h2>
              </div>
              <ul className="bg-white divide-y divide-gray-100">
                {upcomingAuditions.map((audition) => (
                  <li key={audition.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark">{audition.title}</p>
                      {audition.show_title && (
                        <p className="text-xs text-mid-gray">{audition.show_title}</p>
                      )}
                    </div>
                    <Link
                      href={`/auditions/${audition.id}`}
                      className="text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap ml-4"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      Sign up →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

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
