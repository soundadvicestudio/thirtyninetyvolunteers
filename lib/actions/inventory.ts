'use server'

// INVENTORY ITEMS — getServerClient() only (authenticated admin session)
// Read: all authenticated admins
// Write: SA, OA, or Editor with inventory_manager = true

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'
import type {
  CreateItemData,
  InventoryItemWithStatus,
  InventoryNote,
  InventoryPhoto,
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

// Storage requires service role on the 'media' bucket — it has zero
// storage.objects RLS policies (confirmed via live Supabase query, same
// finding as lib/actions/media.ts / app/documents/[token]/route.ts).
// getServerClient() cannot call any storage.* method here regardless of
// session; getAdminClient() is used for storage calls only — all
// inventory_photos table reads/writes still go through getServerClient().
async function getInventoryPhotoSignedUrl(path: string): Promise<string | null> {
  const admin = getAdminClient()
  const { data, error } = await admin.storage.from('media').createSignedUrl(path, 3600)
  if (error || !data) return null
  return data.signedUrl
}

async function attachPhotosAndNotes(
  item: InventoryItemWithStatus,
  client: SupabaseClient
): Promise<InventoryItemWithStatus> {
  const [{ data: photoRows }, { data: noteRows }] = await Promise.all([
    client
      .from('inventory_photos')
      .select('id, item_id, storage_path, sort_order, uploaded_by, uploaded_at')
      .eq('item_id', item.id)
      .order('sort_order', { ascending: true }),
    client
      .from('inventory_notes')
      .select('id, item_id, content, created_by, created_at, author:admin_users(name)')
      .eq('item_id', item.id)
      .order('created_at', { ascending: true }),
  ])

  const photos: InventoryPhoto[] = await Promise.all(
    (photoRows ?? []).map(async (photo) => ({
      ...photo,
      signed_url: (await getInventoryPhotoSignedUrl(photo.storage_path)) ?? undefined,
    }))
  )

  const notes: InventoryNote[] = (noteRows ?? []).map((note) => {
    const author = Array.isArray(note.author) ? note.author[0] : note.author
    return {
      id: note.id,
      item_id: note.item_id,
      content: note.content,
      created_by: note.created_by,
      created_at: note.created_at,
      author_name: author?.name,
    }
  })

  return { ...item, photos, notes }
}

export async function getInventoryItemById(
  id: string,
  supabase?: SupabaseClient
): Promise<InventoryItemWithStatus | null> {
  const client = supabase ?? (await getServerClient())

  const { data } = await client.from('inventory_items').select(ITEM_SELECT).eq('id', id).single()

  if (!data) return null

  const [withStatus] = await attachCheckoutStatus([data as unknown as InventoryItemWithStatus], client)
  return attachPhotosAndNotes(withStatus, client)
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

// ─── Photos ────────────────────────────────────────────────────

const MAX_NOTE_LENGTH = 2000

function getExtFromFilename(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg'
}

export async function getInventoryPhotoUploadUrl(
  itemId: string,
  filename: string,
  contentType: string
): Promise<{ signedUrl: string; path: string } | { error: string }> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  if (!contentType.startsWith('image/')) {
    return { error: 'Only image files are allowed.' }
  }

  const path = `inventory/${itemId}/${crypto.randomUUID()}.${getExtFromFilename(filename)}`

  // Storage requires service role on this private bucket — see the note on
  // getInventoryPhotoSignedUrl() above.
  const storageClient = getAdminClient()
  const { data, error } = await storageClient.storage.from('media').createSignedUploadUrl(path)

  if (error || !data) {
    return { error: 'Something went wrong preparing this upload. Please try again.' }
  }

  return { signedUrl: data.signedUrl, path }
}

export async function confirmInventoryPhotoUpload(
  itemId: string,
  path: string,
  sortOrder: number
): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: photo, error } = await supabase
    .from('inventory_photos')
    .insert({
      item_id: itemId,
      storage_path: path,
      sort_order: sortOrder,
      uploaded_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !photo) {
    return { error: error?.message ?? 'Something went wrong saving this photo.' }
  }

  await logAction(admin.id, 'inventory_photo.upload', 'inventory_photo', photo.id, undefined, {
    item_id: itemId,
    storage_path: path,
  })

  revalidatePath('/crew/inventory/' + itemId)

  return { success: true }
}

export async function deleteInventoryPhoto(photoId: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: photo, error: fetchError } = await supabase
    .from('inventory_photos')
    .select('item_id, storage_path')
    .eq('id', photoId)
    .single()

  if (fetchError || !photo) {
    return { error: 'Could not find this photo.' }
  }

  // Storage requires service role on this private bucket — see the note on
  // getInventoryPhotoSignedUrl() above.
  const storageClient = getAdminClient()
  const { error: storageError } = await storageClient.storage.from('media').remove([photo.storage_path])

  if (storageError) {
    return { error: 'Something went wrong deleting this photo. Please try again.' }
  }

  const { error } = await supabase.from('inventory_photos').delete().eq('id', photoId)

  if (error) {
    return { error: error.message }
  }

  await logAction(admin.id, 'inventory_photo.delete', 'inventory_photo', photoId, {
    item_id: photo.item_id,
    storage_path: photo.storage_path,
  })

  revalidatePath('/crew/inventory/' + photo.item_id)

  return { success: true }
}

export async function reorderInventoryPhoto(
  photoId: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: current, error: currentError } = await supabase
    .from('inventory_photos')
    .select('item_id, sort_order')
    .eq('id', photoId)
    .single()

  if (currentError || !current) {
    return { error: 'Could not find this photo.' }
  }

  const { data: photos, error: fetchError } = await supabase
    .from('inventory_photos')
    .select('id, sort_order')
    .eq('item_id', current.item_id)
    .order('sort_order', { ascending: true })

  if (fetchError || !photos) {
    return { error: 'Could not load photos.' }
  }

  const index = photos.findIndex((p) => p.id === photoId)
  if (index === -1) {
    return { error: 'Could not find this photo.' }
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= photos.length) {
    return { success: true }
  }

  const currentPhoto = photos[index]
  const swapTarget = photos[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('inventory_photos')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', currentPhoto.id)

  if (updateCurrentError) {
    return { error: 'Something went wrong reordering photos. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('inventory_photos')
    .update({ sort_order: currentPhoto.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    return { error: 'Something went wrong reordering photos. Please try again.' }
  }

  await logAction(admin.id, 'inventory_photo.reorder', 'inventory_photo', photoId, undefined, {
    direction,
    item_id: current.item_id,
  })

  revalidatePath('/crew/inventory/' + current.item_id)

  return { success: true }
}

// ─── Notes ─────────────────────────────────────────────────────

// Note write access is Editor-tier (SA/OA/any Editor) — NOT gated on
// inventory_manager. inventory_manager controls item/category/checkout
// write access; note visibility (SA/OA/Editor only, Viewer excluded) is a
// separate restriction enforced by the inventory_notes RLS SELECT policy.
export async function addInventoryNote(itemId: string, content: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }
  if (!['super_admin', 'owner_admin', 'editor'].includes(admin.role)) {
    return { error: 'Insufficient permissions' }
  }

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Note content is required.' }
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return { error: `Notes are limited to ${MAX_NOTE_LENGTH} characters.` }
  }

  const supabase = await getServerClient()

  const { data: note, error } = await supabase
    .from('inventory_notes')
    .insert({ item_id: itemId, content: trimmed, created_by: admin.id })
    .select('id')
    .single()

  if (error || !note) {
    return { error: error?.message ?? 'Something went wrong adding this note.' }
  }

  await logAction(admin.id, 'inventory_note.add', 'inventory_note', note.id, undefined, {
    item_id: itemId,
  })

  revalidatePath('/crew/inventory/' + itemId)

  return { success: true }
}

// ─── Deactivation / deletion ───────────────────────────────────

export async function deactivateInventoryItem(itemId: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { data: activeCheckouts } = await supabase.from('inventory_checkouts').select('id').is('returned_at', null)
  const activeCheckoutIds = (activeCheckouts ?? []).map((c) => c.id)

  if (activeCheckoutIds.length > 0) {
    const { count } = await supabase
      .from('inventory_checkout_items')
      .select('id', { count: 'exact', head: true })
      .eq('item_id', itemId)
      .in('checkout_id', activeCheckoutIds)

    if (count && count > 0) {
      return { error: 'This item has active checkouts. Return all checked-out items before deactivating.' }
    }
  }

  const { error } = await supabase.from('inventory_items').update({ is_active: false }).eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  await logAction(admin.id, 'inventory_item.deactivate', 'inventory_item', itemId, undefined, undefined)

  revalidatePath('/crew/inventory')
  revalidatePath('/crew/inventory/' + itemId)

  return { success: true }
}

export async function reactivateInventoryItem(itemId: string): Promise<ActionResult> {
  const admin = await requireWriteAccess()
  if (!isAdminUser(admin)) return admin

  const supabase = await getServerClient()

  const { error } = await supabase.from('inventory_items').update({ is_active: true }).eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  await logAction(admin.id, 'inventory_item.reactivate', 'inventory_item', itemId, undefined, undefined)

  revalidatePath('/crew/inventory')
  revalidatePath('/crew/inventory/' + itemId)

  return { success: true }
}

export async function deleteInventoryItem(itemId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }
  if (!['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Insufficient permissions' }
  }

  const supabase = await getServerClient()

  const { data: item, error: fetchError } = await supabase
    .from('inventory_items')
    .select('is_active, item_number')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: 'Could not find this item.' }
  }

  if (item.is_active) {
    return { error: 'Deactivate this item before deleting it permanently.' }
  }

  const { data: photos } = await supabase
    .from('inventory_photos')
    .select('storage_path')
    .eq('item_id', itemId)

  if (photos && photos.length > 0) {
    // Storage requires service role on this private bucket — see the note
    // on getInventoryPhotoSignedUrl() above.
    const storageClient = getAdminClient()
    const { error: storageError } = await storageClient.storage
      .from('media')
      .remove(photos.map((p) => p.storage_path))
    if (storageError) {
      return { error: 'Something went wrong deleting this item’s photos. Please try again.' }
    }
  }

  const { error } = await supabase.from('inventory_items').delete().eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  await logAction(admin.id, 'inventory_item.delete', 'inventory_item', itemId, {
    item_number: item.item_number,
  })

  revalidatePath('/crew/inventory')

  return { success: true }
}
