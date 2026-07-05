'use server'

import { getAdminUser } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

export type ActionResult = { success: true } | { error: string }

const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

export async function addCategory(name: string, description?: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: 'Name is required.' }
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { error: 'Name must be 100 characters or fewer.' }
  }

  const client = getAdminClient()

  const { data: maxRow } = await client
    .from('volunteer_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? -1) + 1
  const descriptionValue = description?.trim() || null

  const { data: inserted, error } = await client
    .from('volunteer_categories')
    .insert({
      name: trimmedName,
      description: descriptionValue,
      sort_order: sortOrder,
      is_visible: true,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('addCategory error:', error)
    return { error: 'Something went wrong adding the category. Please try again.' }
  }

  await logAction(admin.id, 'category.create', 'category', inserted.id, undefined, {
    name: trimmedName,
    description: descriptionValue,
  })

  return { success: true }
}

export async function renameCategory(
  id: string,
  name: string,
  description?: string
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: 'Name is required.' }
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { error: 'Name must be 100 characters or fewer.' }
  }
  if (description && description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Description must be 500 characters or fewer.' }
  }

  const client = getAdminClient()

  const { data: current, error: fetchError } = await client
    .from('volunteer_categories')
    .select('name, description')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this category.' }
  }

  const descriptionValue = description?.trim() || null

  const { error: updateError } = await client
    .from('volunteer_categories')
    .update({ name: trimmedName, description: descriptionValue })
    .eq('id', id)

  if (updateError) {
    console.error('renameCategory error:', updateError)
    return { error: 'Something went wrong renaming the category. Please try again.' }
  }

  await logAction(
    admin.id,
    'category.rename',
    'category',
    id,
    { name: current.name, description: current.description },
    { name: trimmedName, description: descriptionValue }
  )

  return { success: true }
}

export async function toggleVisibility(id: string, currentVisible: boolean): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const client = getAdminClient()

  const { error } = await client
    .from('volunteer_categories')
    .update({ is_visible: !currentVisible })
    .eq('id', id)

  if (error) {
    console.error('toggleVisibility error:', error)
    return { error: 'Something went wrong updating visibility. Please try again.' }
  }

  await logAction(
    admin.id,
    'category.visibility',
    'category',
    id,
    { is_visible: currentVisible },
    { is_visible: !currentVisible }
  )

  return { success: true }
}

export async function reorderCategory(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const client = getAdminClient()

  const { data: categories, error: fetchError } = await client
    .from('volunteer_categories')
    .select('id, sort_order')
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

  const { error: updateCurrentError } = await client
    .from('volunteer_categories')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)

  if (updateCurrentError) {
    console.error('reorderCategory error:', updateCurrentError)
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  const { error: updateSwapError } = await client
    .from('volunteer_categories')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    console.error('reorderCategory error:', updateSwapError)
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  await logAction(admin.id, 'category.reorder', 'category', id)

  return { success: true }
}
