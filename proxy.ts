import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags, type FeatureFlags } from '@/lib/feature-flags'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Feature flags: fetched once per request, only when the path is one of
  // the seven guarded routes (perf — skips the app_settings query entirely
  // for every other request).
  const needsFlagCheck =
    pathname.startsWith('/crew/calendar') ||
    pathname.startsWith('/crew/tools/checkin') ||
    pathname.startsWith('/crew/communication') ||
    pathname.startsWith('/crew/rehearsals') ||
    pathname === '/calendar' ||
    pathname.startsWith('/checkin/') ||
    pathname.startsWith('/rehearsal-checkin/') ||
    pathname.startsWith('/crew/auditions') ||
    pathname.startsWith('/auditions/') ||
    pathname.startsWith('/audition-checkin/') ||
    pathname.startsWith('/crew/inventory') ||
    pathname.startsWith('/crew/forums')

  let flags: FeatureFlags | null = null
  if (needsFlagCheck) {
    flags = await getFeatureFlags(getAdminClient())
  }

  // Public route blocks — run before auth checks; public (unauthenticated)
  // users must be blocked from disabled features too.
  if (pathname === '/calendar' && flags && !flags.calendar) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname.startsWith('/checkin/') && flags && !flags.checkin) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname.startsWith('/rehearsal-checkin/') && flags && !flags.rehearsals) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (
    (pathname.startsWith('/auditions/') || pathname.startsWith('/audition-checkin/')) &&
    flags &&
    !flags.auditions
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect all /crew/* routes except /crew/login
  if (
    pathname.startsWith('/crew') &&
    pathname !== '/crew/login' &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/crew/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (pathname === '/crew/login' && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/crew/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Platform Setup: hard-blocked at the route level for every role except
  // Super Admin, including Owner Admin. Additive check — runs only when a
  // signed-in user is headed into /crew/settings/setup, so it never affects
  // any other route's existing behavior.
  if (user && pathname.startsWith('/crew/settings/setup')) {
    const { data: setupAdminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (setupAdminUser?.role !== 'super_admin') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/crew/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // Production role: restricted to /crew/calendar, /crew/help, /crew/media,
  // /crew/rehearsals, /crew/forums, and /crew/shows/[id] (assigned shows
  // only). Additive
  // check — runs after all existing logic and only queries admin_users when
  // a signed-in user is headed somewhere under /crew that isn't already an
  // allowed path, so it never affects other roles' existing behavior.
  // /crew/media exception added 15.3 (Media Library, all roles) — same
  // pattern as the /crew/help exception added in HELP.2a. /crew/rehearsals
  // exception added 21.2 — per-schedule filtering happens at the data
  // layer (getRehearsalSchedules()), not here. /crew/shows/ exception added
  // AUDITIONS.2a — deliberately scoped with a trailing slash so it matches
  // /crew/shows/[id] but not /crew/shows (the list page); membership is
  // enforced by the page-level show_editors guard, not here. /crew/forums
  // exception added FORUMS.1 — Production has forum access; per-forum
  // access filtering happens at the query layer, not here.
  if (
    user &&
    pathname.startsWith('/crew') &&
    pathname !== '/crew/login' &&
    !pathname.startsWith('/crew/calendar') &&
    pathname !== '/crew/help' &&
    pathname !== '/crew/media' &&
    !pathname.startsWith('/crew/rehearsals') &&
    !pathname.startsWith('/crew/auditions') &&
    !pathname.startsWith('/crew/forums') &&
    !pathname.startsWith('/crew/shows/')
  ) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (adminUser?.role === 'production') {
      const calendarUrl = request.nextUrl.clone()
      calendarUrl.pathname = '/crew/calendar'
      return NextResponse.redirect(calendarUrl)
    }
  }

  // Crew route blocks — run after the existing auth/role checks above;
  // flags only matter for authenticated users who have already passed them.
  if (pathname.startsWith('/crew/calendar') && flags && !flags.calendar) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/tools/checkin') && flags && !flags.checkin) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/communication') && flags && !flags.blast) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/rehearsals') && flags && !flags.rehearsals) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/auditions') && flags && !flags.auditions) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/inventory') && flags && !flags.inventory) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }
  if (pathname.startsWith('/crew/forums') && flags && !flags.forums) {
    return NextResponse.redirect(new URL('/crew/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/crew/:path*',
    '/auth/callback',
    '/calendar',
    '/checkin/:path*',
    '/rehearsal-checkin/:path*',
    '/auditions/:path*',
    '/audition-checkin/:path*',
  ],
}
