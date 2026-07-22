import { getServerClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import VolunteerForm from '@/components/VolunteerForm'

export default async function HomePage() {
  const supabase = await getServerClient()

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

  // Consent form document
  const { data: consentDoc } = await supabase
    .from('documents')
    .select('file_path, name')
    .eq('document_type', 'consent_under18')
    .eq('is_active', true)
    .maybeSingle()

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

  const showConsentLink = !!consentDoc

  const showSchool = showSchoolSetting?.value !== 'false'
  const showAgeRange = showAgeRangeSetting?.value !== 'false'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-divider">
        <div className="max-w-2xl mx-auto py-6 px-6 text-center">
          <Image
            src="/logo.png"
            alt="30 By Ninety Theatre"
            width={112}
            height={64}
            className="mx-auto"
          />
          <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
        </div>
      </header>

      {showBanner && <AnnouncementBanner text={bannerText!.value!} />}

      {/* Hero */}
      <section className="w-full bg-light-navy py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-navy font-bold text-2xl md:text-3xl">
            Welcome to the 30 By Ninety Volunteer Family
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
          <h3 className="text-navy font-bold text-xl mb-6 text-center">
            Join the <span className="font-extrabold">30 By Ninety Theatre</span> Volunteer
            Community
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/update"
              className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-3 px-6 rounded hover:bg-light-navy transition-colors"
            >
              Update My Info
            </Link>
            <Link
              href="/callboard"
              className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-3 px-6 rounded hover:bg-light-navy transition-colors"
            >
              View Opportunities
            </Link>
            <Link
              href="/calendar"
              className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-3 px-6 rounded hover:bg-light-navy transition-colors"
            >
              View Calendar
            </Link>
          </div>

          <h4 className="font-semibold text-navy text-lg text-center mb-4">
            Sign up to add your name to our volunteer list
          </h4>

          <VolunteerForm
            categories={categories ?? []}
            hearingOptions={hearingOptions ?? []}
            showSchool={showSchool}
            showAgeRange={showAgeRange}
          />

          {showConsentLink && (
            <div className="mt-4 text-center">
              <a
                href={`/storage/v1/object/public/documents/${consentDoc!.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel text-sm underline"
              >
                Download Volunteer Consent Form (Under 18)
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© 30 By Ninety Theatre</p>
          <Link
            href="/crew/login"
            className="text-mid-gray text-xs hover:text-navy transition-colors"
          >
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
