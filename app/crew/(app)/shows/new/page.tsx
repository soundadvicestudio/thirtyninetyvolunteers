import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ShowForm from '@/components/crew/shows/ShowForm'

export default async function NewShowPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/dashboard')
  }

  const supabase = await getServerClient()

  const [{ data: seasons }, { data: adminUsers }, { data: categories }, { data: settingsRows }, { data: locations }] =
    await Promise.all([
      supabase.from('seasons').select('id, name').order('created_at', { ascending: false }),
      supabase
        .from('admin_users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('volunteer_categories')
        .select('id, name')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['default_hours_mainstage', 'default_hours_studio_x', 'default_hours_one_off']),
      supabase
        .from('locations')
        .select('id, name, color, default_hours')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ])

  const settingsMap = new Map((settingsRows ?? []).map((r) => [r.key, r.value]))
  const defaultHours = {
    mainstage: Number(settingsMap.get('default_hours_mainstage') ?? 3),
    studio_x: Number(settingsMap.get('default_hours_studio_x') ?? 2),
    one_off: Number(settingsMap.get('default_hours_one_off') ?? 2),
  }

  return (
    <div>
      <Link
        href="/crew/shows"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Shows
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Create Show</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Set up a new show, its dates, and volunteer roles.
      </p>

      <ShowForm
        seasons={seasons ?? []}
        adminUsers={adminUsers ?? []}
        categories={categories ?? []}
        locations={locations ?? []}
        defaultHours={defaultHours}
      />
    </div>
  )
}
