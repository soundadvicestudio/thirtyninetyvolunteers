import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getInventoryItemById, getInventoryItems } from '@/lib/actions/inventory'
import { getInventoryCategories } from '@/lib/actions/inventory-settings'
import { getCheckoutsForItem } from '@/lib/actions/inventory-checkouts'
import InventoryDetailTabs from '@/components/crew/inventory/InventoryDetailTabs'

export default async function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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

  const [item, categories, checkouts, allItems] = await Promise.all([
    getInventoryItemById(id, supabase),
    getInventoryCategories(supabase),
    getCheckoutsForItem(id, supabase),
    getInventoryItems({ is_active: true }, supabase),
  ])

  if (!item) notFound()

  const canWrite =
    admin.role === 'super_admin' ||
    admin.role === 'owner_admin' ||
    (admin.role === 'editor' && admin.inventory_manager)

  const canDelete = admin.role === 'super_admin' || admin.role === 'owner_admin'

  const canSeeNotes = admin.role === 'super_admin' || admin.role === 'owner_admin' || admin.role === 'editor'

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <p className="font-mono text-sm text-mid-gray dark:text-dark-muted">{item.item_number}</p>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{item.name}</h1>
      </div>
      <InventoryDetailTabs
        item={item}
        categories={categories}
        checkouts={checkouts}
        availableItems={allItems}
        adminRole={admin.role}
        canWrite={canWrite}
        canDelete={canDelete}
        canSeeNotes={canSeeNotes}
      />
    </div>
  )
}
