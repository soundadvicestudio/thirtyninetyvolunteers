import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import LocationsManager from '@/components/crew/settings/LocationsManager'

export default async function LocationsSettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role !== 'super_admin') {
    redirect('/crew/settings')
  }

  const supabase = await getServerClient()
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, color, sort_order, is_active, default_hours')
    .order('sort_order')

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Location Management</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Manage bookable spaces in the theater. Locations appear in the master calendar, show
        booking form, and event creation. Deactivating a location hides it from new bookings
        without affecting existing events.
      </p>

      <LocationsManager locations={locations ?? []} />
    </div>
  )
}
