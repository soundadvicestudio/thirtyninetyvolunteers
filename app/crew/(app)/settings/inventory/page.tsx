import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getServerClient } from '@/lib/supabase/server'
import { getInventoryCategories, getInventoryLocations } from '@/lib/actions/inventory-settings'
import InventorySettingsClient from '@/components/crew/settings/InventorySettingsClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function InventorySettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.inventory) {
    redirect('/crew/dashboard')
  }

  const hasWriteAccess =
    admin.role === 'super_admin' ||
    admin.role === 'owner_admin' ||
    (admin.role === 'editor' && admin.inventory_manager)
  if (!hasWriteAccess) {
    redirect('/crew/settings')
  }

  const [categories, locations] = await Promise.all([
    getInventoryCategories(supabase),
    getInventoryLocations(supabase),
  ])

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">
        Inventory Settings <HelpTooltip anchor="inventory" label="Inventory Settings" />
      </h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Manage inventory categories and storage locations used by the inventory system.
      </p>

      <InventorySettingsClient categories={categories} locations={locations} canWrite={hasWriteAccess} />
    </div>
  )
}
