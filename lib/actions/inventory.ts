'use server'

// INVENTORY ITEMS — getServerClient() only (authenticated admin session)
// Read: all authenticated admins
// Write: SA, OA, or Editor with inventory_manager = true

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import type {
  CreateItemData,
  InventoryItemWithStatus,
  UpdateItemData,
} from '@/types/inventory'

export type ActionResult = { success: true } | { error: string }
export type CreateItemResult = { id: string } | { error: string }

export type InventoryItemFilters = {
  category_id?: string
  condition?: string
  is_active?: boolean
  search?: string
  availability?: 'all' | 'available' | 'checked_out' | 'overdue'
}

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

async function generateItemNumber(categoryId: string, supabase: SupabaseClient): Promise<string> {
  const { data: category } = await supabase
    .from('inventory_categories')
    .select('prefix')
    .eq('id', categoryId)
    .single()

  const prefix = category?.prefix ?? 'ITEM'

  const { count } = await supabase
    .from('inventory_items')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  const nextNumber = (count ?? 0) + 1
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`
}

const ITEM_SELECT =
  'id, item_number, name, category_id, description, condition, is_active, created_by, created_at, updated_at, category:inventory_categories(id, name, prefix, sort_order, is_active, created_at), item_locations:inventory_item_locations(id, item_id, location_id, freeform_location, location:inventory_locations(id, name, sort_order, is_active, created_at))'

async function attachCheckoutStatus(
  items: InventoryItemWithStatus[],
  supabase: SupabaseClient
): Promise<InventoryItemWithStatus[]> {
  if (items.length === 0) return items

  const { data: activeCheckouts } = await supabase
    .from('inventory_checkouts')
    .select('id, expected_return_date')
    .is('returned_at', null)

  const activeCheckoutIds = (activeCheckouts ?? []).map((c) => c.id)
  if (activeCheckoutIds.length === 0) {
    return items.map((item) => ({ ...item, is_checked_out: false, is_overdue: false }))
  }

  const expectedReturnByCheckoutId = new Map(
    (activeCheckouts ?? []).map((c) => [c.id, c.expected_return_date as string | null])
  )

  const { data: checkoutItems } = await supabase
    .from('inventory_checkout_items')
    .select('item_id, checkout_id')
    .in('checkout_id', activeCheckoutIds)

  const today = new Date().toISOString().split('T')[0]
  const overdueByItemId = new Map<string, boolean>()
  const checkedOutItemIds = new Set<string>()

  for (const row of checkoutItems ?? []) {
    checkedOutItemIds.add(row.item_id)
    const expectedReturn = expectedReturnByCheckoutId.get(row.checkout_id)
    if (expectedReturn && expectedReturn < today) {
      overdueByItemId.set(row.item_id, true)
    }
  }

  return items.map((item) => ({
    ...item,
    is_checked_out: checkedOutItemIds.has(item.id),
    is_overdue: overdueByItemId.get(item.id) ?? false,
  }))
}

export async function getInventoryItems(
  filters: InventoryItemFilters = {},
  supabase?: SupabaseClient
): Promise<InventoryItemWithStatus[]> {
  const client = supabase ?? (await getServerClient())

  let query = client.from('inventory_items').select(ITEM_SELECT)

  query = query.eq('is_active', filters.is_active ?? true)

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }
  if (filters.search) {
    const term = filters.search.trim()
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    }
  }

  query = query.order('name', { ascending: true })

  const { data } = await query
  const items = (data ?? []) as unknown as InventoryItemWithStatus[]

  const withStatus = await attachCheckoutStatus(items, client)

  if (!filters.availability || filters.availability === 'all') {
    return withStatus
  }
  if (filters.availability === 'available') {
    return withStatus.filter((item) => !item.is_checked_out)
  }
  if (filters.availability === 'checked_out') {
    return withStatus.filter((item) => item.is_checked_out)
  }
  return withStatus.filter((item) => item.is_overdue)
}

export async function getInventoryItemById(
  id: string,
  supabase?: SupabaseClient
): Promise<InventoryItemWithStatus | null> {
  const client = supabase ?? (await getServerClient())

  const { data } = await client.from('inventory_items').select(ITEM_SELECT).eq('id', id).single()

  if (!data) return null

  const [withStatus] = await attachCheckoutStatus([data as unknown as InventoryItemWithStatus], client)
  return withStatus
}

export async function createInventoryItem(data: CreateItemData): Promise<CreateItemResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = data.name.trim()
  if (!trimmedName) return { error: 'Name is required.' }
  if (!data.category_id) return { error: 'Category is required.' }
  if (!data.locations || data.locations.length === 0) {
    return { error: 'At least one location is required.' }
  }

  const normalizedLocations: Array<{ location_id: string | null; freeform_location: string | null }> = []
  for (const entry of data.locations) {
    const locationId = entry.location_id?.trim() || null
    const freeform = entry.freeform_location?.trim() || null
    if (locationId && freeform) {
      return { error: 'Choose one location type per row, not both.' }
    }
    if (!locationId && !freeform) {
      return { error: 'Each location row needs a location or a freeform description.' }
    }
    normalizedLocations.push({ location_id: locationId, freeform_location: freeform })
  }

  const supabase = await getServerClient()

  const itemNumber = await generateItemNumber(data.category_id, supabase)

  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert({
      item_number: itemNumber,
      name: trimmedName,
      category_id: data.category_id,
      description: data.description?.trim() || null,
      condition: data.condition,
      is_active: true,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !item) {
    return { error: error?.message ?? 'Something went wrong creating this item.' }
  }

  const { error: locationsError } = await supabase.from('inventory_item_locations').insert(
    normalizedLocations.map((loc) => ({
      item_id: item.id,
      location_id: loc.location_id,
      freeform_location: loc.freeform_location,
    }))
  )

  if (locationsError) {
    return { error: locationsError.message }
  }

  await logAction(admin.id, 'inventory_item.create', 'inventory_item', item.id, undefined, {
    item_number: itemNumber,
    name: trimmedName,
    category_id: data.category_id,
  })

  revalidatePath('/crew/inventory')

  return { id: item.id }
}

export async function updateInventoryItem(id: string, data: UpdateItemData): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = data.name.trim()
  if (!trimmedName) return { error: 'Name is required.' }
  if (!data.category_id) return { error: 'Category is required.' }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('inventory_items')
    .select('name, category_id, description, condition')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this item.' }
  }

  const { error } = await supabase
    .from('inventory_items')
    .update({
      name: trimmedName,
      category_id: data.category_id,
      description: data.description?.trim() || null,
      condition: data.condition,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'inventory_item.update',
    'inventory_item',
    id,
    {
      name: current.name,
      category_id: current.category_id,
      description: current.description,
      condition: current.condition,
    },
    {
      name: trimmedName,
      category_id: data.category_id,
      description: data.description?.trim() || null,
      condition: data.condition,
    }
  )

  revalidatePath('/crew/inventory')
  revalidatePath('/crew/inventory/' + id)

  return { success: true }
}
