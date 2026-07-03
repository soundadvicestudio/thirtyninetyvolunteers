'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { volunteerProfileSchema, type VolunteerProfileFormValues } from '@/lib/validations/volunteerProfile'

// Public lookup used by the show-claiming pre-fill (ClaimForm onBlur).
// No admin session exists on public pages — getAdminClient() is required.
// Only the three display fields needed for pre-fill are ever returned.
export async function lookupVolunteer(
  value: string
): Promise<{ full_name: string; email: string; phone: string } | null> {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const client = getAdminClient()
    const isEmail = trimmed.includes('@')

    const { data } = await client
      .from('volunteers')
      .select('full_name, email, phone')
      .eq(isEmail ? 'email' : 'phone', isEmail ? trimmed.toLowerCase() : trimmed)
      .maybeSingle()

    if (!data) return null

    return { full_name: data.full_name, email: data.email, phone: data.phone }
  } catch (err) {
    console.error('lookupVolunteer error:', err)
    return null
  }
}

export type ActionResult = { success: true } | { error: string }

export async function updateVolunteer(
  volunteerId: string,
  data: VolunteerProfileFormValues
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const parsed = volunteerProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('volunteers')
    .select(
      'full_name, email, phone, pronouns, school, age_range, is_minor, guardian_name, guardian_phone, requires_service_hours, referral_source, referral_name'
    )
    .eq('id', volunteerId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this volunteer record.' }
  }

  if (value.email !== current.email) {
    const { data: emailConflict } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', value.email)
      .neq('id', volunteerId)
      .maybeSingle()
    if (emailConflict) {
      return { error: 'email_taken' }
    }
  }

  if (value.phone !== current.phone) {
    const { data: phoneConflict } = await supabase
      .from('volunteers')
      .select('id')
      .eq('phone', value.phone)
      .neq('id', volunteerId)
      .maybeSingle()
    if (phoneConflict) {
      return { error: 'phone_taken' }
    }
  }

  const afterRecord = {
    full_name: value.full_name,
    email: value.email,
    phone: value.phone,
    pronouns: value.pronouns || null,
    school: value.school || null,
    age_range: value.age_range || null,
    is_minor: value.is_minor,
    guardian_name: value.guardian_name || null,
    guardian_phone: value.guardian_phone || null,
    requires_service_hours: (value.school || null) ? (value.requires_service_hours ?? false) : false,
    referral_source: value.referral_source || null,
    referral_name: value.referral_name || null,
  }

  const { error: updateError } = await supabase
    .from('volunteers')
    .update(afterRecord)
    .eq('id', volunteerId)

  if (updateError) {
    console.error('updateVolunteer error:', updateError)
    return { error: 'Something went wrong saving changes. Please try again.' }
  }

  const { data: existingAssignments } = await supabase
    .from('volunteer_category_assignments')
    .select('category_id')
    .eq('volunteer_id', volunteerId)

  const existingIds = new Set((existingAssignments ?? []).map((a) => a.category_id as string))
  const nextIds = new Set(value.category_ids)

  const toRemove = [...existingIds].filter((id) => !nextIds.has(id))
  const toAdd = [...nextIds].filter((id) => !existingIds.has(id))

  if (toRemove.length > 0) {
    await supabase
      .from('volunteer_category_assignments')
      .delete()
      .eq('volunteer_id', volunteerId)
      .in('category_id', toRemove)
  }

  if (toAdd.length > 0) {
    await supabase
      .from('volunteer_category_assignments')
      .insert(toAdd.map((categoryId) => ({ volunteer_id: volunteerId, category_id: categoryId })))
  }

  await logAction(admin.id, 'volunteer.update', 'volunteer', volunteerId, current, afterRecord)

  return { success: true }
}

export async function addNote(volunteerId: string, body: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const trimmed = body.trim()
  if (!trimmed) {
    return { error: 'Note cannot be empty.' }
  }
  if (trimmed.length > 2000) {
    return { error: 'Note must be 2000 characters or fewer.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.from('volunteer_notes').insert({
    volunteer_id: volunteerId,
    author_id: admin.id,
    body: trimmed,
  })

  if (error) {
    console.error('addNote error:', error)
    return { error: 'Something went wrong adding the note. Please try again.' }
  }

  await logAction(admin.id, 'volunteer.note.add', 'volunteer', volunteerId)

  return { success: true }
}

export async function editNote(noteId: string, body: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const trimmed = body.trim()
  if (!trimmed) {
    return { error: 'Note cannot be empty.' }
  }
  if (trimmed.length > 2000) {
    return { error: 'Note must be 2000 characters or fewer.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('volunteer_notes')
    .update({ body: trimmed })
    .eq('id', noteId)

  if (error) {
    console.error('editNote error:', error)
    return { error: 'Something went wrong saving this note. Please try again.' }
  }

  await logAction(admin.id, 'volunteer.note.edit', 'volunteer_note', noteId)

  return { success: true }
}

export async function deleteNote(noteId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.from('volunteer_notes').delete().eq('id', noteId)

  if (error) {
    console.error('deleteNote error:', error)
    return { error: 'Something went wrong deleting this note. Please try again.' }
  }

  await logAction(admin.id, 'volunteer.note.delete', 'volunteer_note', noteId)

  return { success: true }
}

export async function toggleStatus(
  volunteerId: string,
  newStatus: 'active' | 'archived'
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  if (newStatus !== 'active' && newStatus !== 'archived') {
    return { error: 'Invalid status.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('volunteers')
    .update({ status: newStatus })
    .eq('id', volunteerId)

  if (error) {
    console.error('toggleStatus error:', error)
    return { error: 'Something went wrong updating status. Please try again.' }
  }

  await logAction(
    admin.id,
    newStatus === 'archived' ? 'volunteer.archive' : 'volunteer.unarchive',
    'volunteer',
    volunteerId
  )

  return { success: true }
}
