import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendPendingRegistrationEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/crew/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (data.user) {
        try {
          const adminClient = getAdminClient()
          await adminClient
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id)
        } catch (err) {
          console.error('Failed to update last_login:', err)
        }

        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        if (adminUser?.role === 'production') {
          return NextResponse.redirect(`${origin}/crew/calendar`)
        }

        if (!adminUser) {
          // New or unresolved Google registrant — no admin_users row yet.
          // pending_registrations RLS only allows anon INSERT or authenticated
          // super_admin — this authenticated-but-not-admin user fails both,
          // so every operation here must use getAdminClient().
          const email = data.user.email
          if (!email) {
            return NextResponse.redirect(`${origin}/crew/login?error=auth_callback_failed`)
          }

          const adminClient = getAdminClient()

          const { data: pendingRow } = await adminClient
            .from('pending_registrations')
            .select('id')
            .eq('email', email)
            .eq('status', 'pending')
            .maybeSingle()

          if (pendingRow) {
            return NextResponse.redirect(`${origin}/crew/login?pending=true`)
          }

          const { data: declinedRow } = await adminClient
            .from('pending_registrations')
            .select('id')
            .eq('email', email)
            .eq('status', 'declined')
            .maybeSingle()

          if (declinedRow) {
            return NextResponse.redirect(`${origin}/crew/login?error=declined`)
          }

          const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email

          const { error: insertError } = await adminClient.from('pending_registrations').insert({
            name,
            email,
            auth_user_id: data.user.id,
            status: 'pending',
          })

          if (insertError) {
            if (insertError.code === '23505') {
              // Race condition — another request already inserted the pending
              // row for this email between our check above and this insert.
              return NextResponse.redirect(`${origin}/crew/login?pending=true`)
            }
            console.error('OAuth callback pending_registrations insert error:', insertError)
            return NextResponse.redirect(`${origin}/crew/login?error=auth_callback_failed`)
          }

          try {
            const { data: superAdmins } = await adminClient
              .from('admin_users')
              .select('email')
              .eq('role', 'super_admin')
              .eq('is_active', true)

            const recipients = ((superAdmins ?? []) as { email: string }[]).map((row) => row.email)
            await sendPendingRegistrationEmail({ to: recipients, name, email })
          } catch (err) {
            console.error('[email] sendPendingRegistrationEmail failed:', err)
          }

          return NextResponse.redirect(`${origin}/crew/login?registered=google`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(
    `${origin}/crew/login?error=auth_callback_failed`
  )
}
