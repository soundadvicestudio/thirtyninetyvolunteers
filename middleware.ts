import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Production role: restricted to /crew/calendar only. Additive check —
  // runs after all existing logic and only queries admin_users when a
  // signed-in user is headed somewhere under /crew that isn't already
  // /crew/calendar, so it never affects other roles' existing behavior.
  if (
    user &&
    pathname.startsWith('/crew') &&
    pathname !== '/crew/login' &&
    !pathname.startsWith('/crew/calendar')
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/crew/:path*',
    '/auth/callback',
  ],
}
