import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import CategoriesTable from '@/components/crew/settings/CategoriesTable'

export default async function CategoriesPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role !== 'super_admin') {
    redirect('/crew/dashboard')
  }

  const supabase = await getServerClient()
  const { data: categories } = await supabase
    .from('volunteer_categories')
    .select('id, name, description, sort_order, is_visible')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark mb-1">Category Management</h1>
      <p className="text-mid-gray text-sm mb-8">
        Categories shown on the public volunteer signup form. Changes take effect immediately.
      </p>

      <CategoriesTable categories={categories ?? []} />
    </div>
  )
}
