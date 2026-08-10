import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Inventory</h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Inventory management is coming soon.
        </p>
      </div>
    </div>
  )
}
