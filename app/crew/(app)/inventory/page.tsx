import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getInventoryCategories, getInventoryLocations } from '@/lib/actions/inventory-settings'
import { getInventoryItems } from '@/lib/actions/inventory'
import { getActiveCheckouts } from '@/lib/actions/inventory-checkouts'
import InventoryListClient from '@/components/crew/inventory/InventoryListClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function InventoryPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.inventory) {
    redirect('/crew/dashboard')
  }

  if (admin.role === 'production') {
    redirect('/crew/dashboard')
  }

  const canWrite =
    admin.role === 'super_admin' ||
    admin.role === 'owner_admin' ||
    (admin.role === 'editor' && admin.inventory_manager)

  const [categories, locations, items, activeCheckouts] = await Promise.all([
    getInventoryCategories(supabase),
    getInventoryLocations(supabase),
    getInventoryItems({ is_active: true }, supabase),
    getActiveCheckouts(supabase),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">
          Inventory <HelpTooltip anchor="inventory" label="Inventory" />
        </h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Track props, costumes, and other production inventory.
        </p>
      </div>

      <InventoryListClient
        categories={categories}
        locations={locations}
        items={items}
        activeCheckouts={activeCheckouts}
        adminRole={admin.role}
        canWrite={canWrite}
      />
    </div>
  )
}
