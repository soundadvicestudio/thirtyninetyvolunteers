'use server'

// INVENTORY SETTINGS — getServerClient() only (authenticated admin session)
// Write access: SA, OA, or Editor with inventory_manager = true

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import type { InventoryCategory, InventoryLocation } from '@/types/inventory'

export type ActionResult = { success: true } | { error: string }

const PREFIX_PATTERN = /^[A-Z]{2,6}$/

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

// ─── Categories ────────────────────────────────────────────────

export async function getInventoryCategories(
  supabase?: SupabaseClient
): Promise<InventoryCategory[]> {
  const client = supabase ?? (await getServerClient())
  const { data } = await client
    .from('inventory_categories')
    .select('id, name, prefix, sort_order, is_active, created_at')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function createInventoryCategory(name: string, prefix: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = name.trim()
  const upperPrefix = prefix.trim().toUpperCase()
  if (!trimmedName) return { error: 'Name is required.' }
  if (!PREFIX_PATTERN.test(upperPrefix)) {
    return { error: 'Prefix must be 2–6 uppercase letters.' }
  }

  const supabase = await getServerClient()

  const { data: existing } = await supabase
    .from('inventory_categories')
    .select('id')
    .eq('prefix', upperPrefix)
    .maybeSingle()

  if (existing) return { error: 'Prefix already in use.' }

  const { data: maxRow } = await supabase
    .from('inventory_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const newSortOrder = (maxRow?.sort_order ?? 0) + 1

  const { data: category, error } = await supabase
    .from('inventory_categories')
    .insert({
      name: trimmedName,
      prefix: upperPrefix,
      sort_order: newSortOrder,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !category) {
    return { error: error?.message ?? 'Something went wrong adding the category.' }
  }

  await logAction(admin.id, 'inventory_category.create', 'inventory_category', category.id, undefined, {
    name: trimmedName,
    prefix: upperPrefix,
  })

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function updateInventoryCategory(
  id: string,
  name: string,
  prefix: string
): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = name.trim()
  const upperPrefix = prefix.trim().toUpperCase()
  if (!trimmedName) return { error: 'Name is required.' }
  if (!PREFIX_PATTERN.test(upperPrefix)) {
    return { error: 'Prefix must be 2–6 uppercase letters.' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('inventory_categories')
    .select('name, prefix')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this category.' }
  }

  const { data: existing } = await supabase
    .from('inventory_categories')
    .select('id')
    .eq('prefix', upperPrefix)
    .neq('id', id)
    .maybeSingle()

  if (existing) return { error: 'Prefix already in use.' }

  const { error } = await supabase
    .from('inventory_categories')
    .update({ name: trimmedName, prefix: upperPrefix })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'inventory_category.update',
    'inventory_category',
    id,
    { name: current.name, prefix: current.prefix },
    { name: trimmedName, prefix: upperPrefix }
  )

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function reorderInventoryCategory(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: categories, error: fetchError } = await supabase
    .from('inventory_categories')
    .select('id, name, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (fetchError || !categories) {
    return { error: 'Could not load categories.' }
  }

  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) {
    return { error: 'Could not find this category.' }
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= categories.length) {
    return { success: true }
  }

  const current = categories[index]
  const swapTarget = categories[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('inventory_categories')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)

  if (updateCurrentError) {
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('inventory_categories')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  await logAction(admin.id, 'inventory_category.reorder', 'inventory_category', id, undefined, {
    direction,
    swapped_with: swapTarget.name,
  })

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function toggleInventoryCategoryActive(id: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('inventory_categories')
    .select('is_active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this category.' }
  }

  const { error } = await supabase
    .from('inventory_categories')
    .update({ is_active: !current.is_active })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'inventory_category.deactivate',
    'inventory_category',
    id,
    { is_active: current.is_active },
    { is_active: !current.is_active }
  )

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

// ─── Locations ─────────────────────────────────────────────────

export async function getInventoryLocations(
  supabase?: SupabaseClient
): Promise<InventoryLocation[]> {
  const client = supabase ?? (await getServerClient())
  const { data } = await client
    .from('inventory_locations')
    .select('id, name, sort_order, is_active, created_at')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function createInventoryLocation(name: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Name is required.' }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('inventory_locations')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const newSortOrder = (maxRow?.sort_order ?? 0) + 1

  const { data: location, error } = await supabase
    .from('inventory_locations')
    .insert({ name: trimmedName, sort_order: newSortOrder, is_active: true })
    .select('id')
    .single()

  if (error || !location) {
    return { error: error?.message ?? 'Something went wrong adding the location.' }
  }

  await logAction(admin.id, 'inventory_location.create', 'inventory_location', location.id, undefined, {
    name: trimmedName,
  })

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function updateInventoryLocation(id: string, name: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Name is required.' }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('inventory_locations')
    .select('name')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this location.' }
  }

  const { error } = await supabase
    .from('inventory_locations')
    .update({ name: trimmedName })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'inventory_location.update',
    'inventory_location',
    id,
    { name: current.name },
    { name: trimmedName }
  )

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function reorderInventoryLocation(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: locations, error: fetchError } = await supabase
    .from('inventory_locations')
    .select('id, name, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (fetchError || !locations) {
    return { error: 'Could not load locations.' }
  }

  const index = locations.findIndex((l) => l.id === id)
  if (index === -1) {
    return { error: 'Could not find this location.' }
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= locations.length) {
    return { success: true }
  }

  const current = locations[index]
  const swapTarget = locations[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('inventory_locations')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)

  if (updateCurrentError) {
    return { error: 'Something went wrong reordering locations. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('inventory_locations')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    return { error: 'Something went wrong reordering locations. Please try again.' }
  }

  await logAction(admin.id, 'inventory_location.reorder', 'inventory_location', id, undefined, {
    direction,
    swapped_with: swapTarget.name,
  })

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}

export async function toggleInventoryLocationActive(id: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('inventory_locations')
    .select('is_active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this location.' }
  }

  const { error } = await supabase
    .from('inventory_locations')
    .update({ is_active: !current.is_active })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'inventory_location.deactivate',
    'inventory_location',
    id,
    { is_active: current.is_active },
    { is_active: !current.is_active }
  )

  revalidatePath('/crew/settings/inventory')

  return { success: true }
}
