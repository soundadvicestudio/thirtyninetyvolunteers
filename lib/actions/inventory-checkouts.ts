'use server'

// INVENTORY CHECKOUTS — getServerClient() only (authenticated admin session)
// Write access: SA, OA, or Editor with inventory_manager = true
// Read access: all authenticated admins

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import type { CreateCheckoutData, InventoryCheckout } from '@/types/inventory'

export type ActionResult = { success: true } | { error: string }
export type CreateCheckoutResult = { id: string } | { error: string }

function assertInventoryWriteAccess(admin: { role: string; inventory_manager: boolean }) {
  const allowed =
    admin.role === 'super_admin' ||
    admin.role === 'owner_admin' ||
    (admin.role === 'editor' && admin.inventory_manager)
  if (!allowed) throw new Error('Insufficient permissions')
}

async function requireWriteAccess(): Promise<AdminUser | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }
  try {
    assertInventoryWriteAccess(admin)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Insufficient permissions' }
  }
  return admin
}

function isAdminUser(value: AdminUser | { error: string }): value is AdminUser {
  return !('error' in value)
}

const CHECKOUT_COLUMNS =
  'id, checked_out_at, expected_return_date, returned_at, checked_out_by, target_type, target_show_id, target_user_id, target_custom_name, target_custom_contact, checkout_notes, return_notes, created_at'

// Attaches checked_out_by_name / target_show_name / target_user_name and
// computes is_overdue. Optionally attaches the per-checkout items list —
// the item-scoped getCheckoutsForItem() doesn't need it (the page is
// already scoped to one item); the cross-item getActiveCheckouts() panel
// does (its "Item(s)" column spans multiple items per checkout row).
async function enrichCheckouts(
  checkouts: InventoryCheckout[],
  client: SupabaseClient,
  includeItems: boolean
): Promise<InventoryCheckout[]> {
  if (checkouts.length === 0) return checkouts

  const adminIds = [
    ...new Set(
      checkouts.flatMap((c) => [c.checked_out_by, c.target_user_id].filter((v): v is string => !!v))
    ),
  ]
  const showIds = [...new Set(checkouts.map((c) => c.target_show_id).filter((v): v is string => !!v))]
  const checkoutIds = checkouts.map((c) => c.id)

  const [{ data: admins }, { data: shows }, itemsResult] = await Promise.all([
    adminIds.length > 0
      ? client.from('admin_users').select('id, name').in('id', adminIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    showIds.length > 0
      ? client.from('shows').select('id, name').in('id', showIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    includeItems
      ? client
          .from('inventory_checkout_items')
          .select('id, checkout_id, item_id, item:inventory_items(item_number, name)')
          .in('checkout_id', checkoutIds)
      : Promise.resolve({ data: null }),
  ])

  const adminNameById = new Map((admins ?? []).map((a) => [a.id, a.name]))
  const showNameById = new Map((shows ?? []).map((s) => [s.id, s.name]))

  const itemsByCheckoutId = new Map<string, InventoryCheckout['items']>()
  if (includeItems) {
    for (const row of itemsResult.data ?? []) {
      const item = Array.isArray(row.item) ? row.item[0] : row.item
      const list = itemsByCheckoutId.get(row.checkout_id) ?? []
      list.push({
        id: row.id,
        checkout_id: row.checkout_id,
        item_id: row.item_id,
        item_number: item?.item_number,
        item_name: item?.name,
      })
      itemsByCheckoutId.set(row.checkout_id, list)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return checkouts.map((checkout) => ({
    ...checkout,
    checked_out_by_name: checkout.checked_out_by ? adminNameById.get(checkout.checked_out_by) : undefined,
    target_show_name: checkout.target_show_id ? showNameById.get(checkout.target_show_id) : undefined,
    target_user_name: checkout.target_user_id ? adminNameById.get(checkout.target_user_id) : undefined,
    items: includeItems ? (itemsByCheckoutId.get(checkout.id) ?? []) : checkout.items,
    is_overdue: !checkout.returned_at && !!checkout.expected_return_date && checkout.expected_return_date < today,
  }))
}

export async function getCheckoutsForItem(
  itemId: string,
  supabase?: SupabaseClient
): Promise<InventoryCheckout[]> {
  const client = supabase ?? (await getServerClient())

  const { data: checkoutItemRows } = await client
    .from('inventory_checkout_items')
    .select('checkout_id')
    .eq('item_id', itemId)

  const checkoutIds = [...new Set((checkoutItemRows ?? []).map((r) => r.checkout_id))]
  if (checkoutIds.length === 0) return []

  const { data: checkouts } = await client
    .from('inventory_checkouts')
    .select(CHECKOUT_COLUMNS)
    .in('id', checkoutIds)
    .order('checked_out_at', { ascending: false })

  return enrichCheckouts((checkouts ?? []) as InventoryCheckout[], client, false)
}

export async function getActiveCheckouts(supabase?: SupabaseClient): Promise<InventoryCheckout[]> {
  const client = supabase ?? (await getServerClient())

  const { data: checkouts } = await client
    .from('inventory_checkouts')
    .select(CHECKOUT_COLUMNS)
    .is('returned_at', null)
    .order('checked_out_at', { ascending: true })

  return enrichCheckouts((checkouts ?? []) as InventoryCheckout[], client, true)
}

export async function getSearchableShows(query: string): Promise<{ id: string; name: string }[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  const term = query.trim()
  if (!term) return []

  const supabase = await getServerClient()
  const { data } = await supabase.from('shows').select('id, name').ilike('name', `%${term}%`).order('name').limit(10)

  return data ?? []
}

export async function getSearchableAdminUsers(
  query: string
): Promise<{ id: string; name: string; role: string }[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  const term = query.trim()
  if (!term) return []

  const supabase = await getServerClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id, name, role')
    .ilike('name', `%${term}%`)
    .eq('is_active', true)
    .order('name')
    .limit(10)

  return data ?? []
}

export async function createCheckout(data: CreateCheckoutData): Promise<CreateCheckoutResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  if (!data.item_ids || data.item_ids.length === 0) {
    return { error: 'No items selected' }
  }

  if (data.target_type === 'show' && !data.target_show_id) {
    return { error: 'A show is required.' }
  }
  if (data.target_type === 'user' && !data.target_user_id) {
    return { error: 'An admin user is required.' }
  }
  if (data.target_type === 'custom' && !data.target_custom_name?.trim()) {
    return { error: 'A name is required for a custom checkout target.' }
  }

  const supabase = await getServerClient()

  const { data: activeCheckouts } = await supabase.from('inventory_checkouts').select('id').is('returned_at', null)
  const activeCheckoutIds = (activeCheckouts ?? []).map((c) => c.id)

  if (activeCheckoutIds.length > 0) {
    const { data: conflicts } = await supabase
      .from('inventory_checkout_items')
      .select('item_id, item:inventory_items(item_number)')
      .in('checkout_id', activeCheckoutIds)
      .in('item_id', data.item_ids)

    if (conflicts && conflicts.length > 0) {
      const itemNumbers = conflicts
        .map((row) => {
          const item = Array.isArray(row.item) ? row.item[0] : row.item
          return item?.item_number
        })
        .filter(Boolean)
        .join(', ')
      return { error: `The following items are already checked out: ${itemNumbers}` }
    }
  }

  const { data: checkout, error } = await supabase
    .from('inventory_checkouts')
    .insert({
      checked_out_by: admin.id,
      target_type: data.target_type,
      target_show_id: data.target_type === 'show' ? data.target_show_id : null,
      target_user_id: data.target_type === 'user' ? data.target_user_id : null,
      target_custom_name: data.target_type === 'custom' ? data.target_custom_name?.trim() : null,
      target_custom_contact: data.target_type === 'custom' ? data.target_custom_contact?.trim() || null : null,
      expected_return_date: data.expected_return_date || null,
      checkout_notes: data.checkout_notes?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !checkout) {
    return { error: error?.message ?? 'Something went wrong creating this checkout.' }
  }

  const { error: itemsError } = await supabase.from('inventory_checkout_items').insert(
    data.item_ids.map((itemId) => ({ checkout_id: checkout.id, item_id: itemId }))
  )

  if (itemsError) {
    return { error: itemsError.message }
  }

  await logAction(admin.id, 'inventory_checkout.create', 'inventory_checkout', checkout.id, undefined, {
    target_type: data.target_type,
    item_count: data.item_ids.length,
  })

  revalidatePath('/crew/inventory')
  for (const itemId of data.item_ids) {
    revalidatePath('/crew/inventory/' + itemId)
  }

  return { id: checkout.id }
}

export async function returnCheckout(checkoutId: string, returnNotes?: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: checkout, error: fetchError } = await supabase
    .from('inventory_checkouts')
    .select('returned_at')
    .eq('id', checkoutId)
    .single()

  if (fetchError || !checkout) {
    return { error: 'Could not find this checkout.' }
  }
  if (checkout.returned_at) {
    return { error: 'This checkout has already been returned' }
  }

  const { error } = await supabase
    .from('inventory_checkouts')
    .update({ returned_at: new Date().toISOString(), return_notes: returnNotes?.trim() || null })
    .eq('id', checkoutId)

  if (error) {
    return { error: error.message }
  }

  const { data: checkoutItems } = await supabase
    .from('inventory_checkout_items')
    .select('item_id')
    .eq('checkout_id', checkoutId)

  await logAction(admin.id, 'inventory_checkout.return', 'inventory_checkout', checkoutId, undefined, undefined)

  revalidatePath('/crew/inventory')
  for (const row of checkoutItems ?? []) {
    revalidatePath('/crew/inventory/' + row.item_id)
  }

  return { success: true }
}
