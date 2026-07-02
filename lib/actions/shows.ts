'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { showSubmitSchema, type ShowSubmitPayload } from '@/lib/validations/show'

export type ShowActionResult =
  | { success: true; showId: string; warnings?: { blockedDates: string[]; blockedRoles: string[] } }
  | { error: string }

export async function createShow(payload: ShowSubmitPayload): Promise<ShowActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const parsed = showSubmitSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  let seasonId = value.seasonId
  if (value.newSeasonName?.trim()) {
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        name: value.newSeasonName.trim(),
        start_date: value.newSeasonStartDate || null,
        end_date: value.newSeasonEndDate || null,
      })
      .select('id')
      .single()

    if (seasonError || !season) {
      console.error('createShow season insert error:', seasonError)
      return { error: 'Something went wrong creating the season. Please try again.' }
    }
    seasonId = season.id
  }

  const { data: show, error: showError } = await supabase
    .from('shows')
    .insert({
      season_id: seasonId,
      name: value.name,
      show_type: value.show_type,
      description: value.description || null,
      volunteer_instructions: value.volunteer_instructions || null,
      default_hours: value.default_hours,
      status: value.status,
    })
    .select('id')
    .single()

  if (showError || !show) {
    console.error('createShow insert error:', showError)
    return { error: 'Something went wrong creating the show. Please try again.' }
  }

  const showId = show.id as string

  const { error: datesError } = await supabase.from('show_dates').insert(
    value.dates.map((d) => ({
      show_id: showId,
      show_date: d.show_date,
      show_time: d.show_time,
    }))
  )
  if (datesError) {
    console.error('createShow dates insert error:', datesError)
    return {
      error: 'The show was created, but dates failed to save. Edit the show to add dates.',
    }
  }

  const { error: rolesError } = await supabase.from('volunteer_roles').insert(
    value.roles.map((r) => ({
      show_id: showId,
      role_name: r.role_name,
      slots_available: r.slots_available,
      category_id: r.category_id || null,
    }))
  )
  if (rolesError) {
    console.error('createShow roles insert error:', rolesError)
    return {
      error: 'The show was created, but roles failed to save. Edit the show to add roles.',
    }
  }

  if (value.editorIds.length > 0) {
    const { error: editorsError } = await supabase
      .from('show_editors')
      .insert(value.editorIds.map((adminId) => ({ show_id: showId, admin_id: adminId })))
    if (editorsError) {
      console.error('createShow editors insert error:', editorsError)
    }
  }

  await logAction(admin.id, 'show.create', 'show', showId, undefined, {
    name: value.name,
    show_type: value.show_type,
    status: value.status,
  })

  return { success: true, showId }
}

export async function updateShow(
  showId: string,
  payload: ShowSubmitPayload
): Promise<ShowActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const parsed = showSubmitSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('shows')
    .select('season_id, name, show_type, description, volunteer_instructions, default_hours, status')
    .eq('id', showId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this show.' }
  }

  let seasonId = value.seasonId
  if (value.newSeasonName?.trim()) {
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        name: value.newSeasonName.trim(),
        start_date: value.newSeasonStartDate || null,
        end_date: value.newSeasonEndDate || null,
      })
      .select('id')
      .single()

    if (seasonError || !season) {
      console.error('updateShow season insert error:', seasonError)
      return { error: 'Something went wrong creating the season. Please try again.' }
    }
    seasonId = season.id
  }

  const afterShow = {
    season_id: seasonId,
    name: value.name,
    show_type: value.show_type,
    description: value.description || null,
    volunteer_instructions: value.volunteer_instructions || null,
    default_hours: value.default_hours,
    status: value.status,
  }

  const { error: updateError } = await supabase
    .from('shows')
    .update({ ...afterShow, updated_at: new Date().toISOString() })
    .eq('id', showId)

  if (updateError) {
    console.error('updateShow update error:', updateError)
    return { error: 'Something went wrong saving the show. Please try again.' }
  }

  // DATES — reconcile
  const { data: existingDateRows } = await supabase
    .from('show_dates')
    .select('id')
    .eq('show_id', showId)

  const existingDateIds = new Set((existingDateRows ?? []).map((d) => d.id as string))
  const submittedDateIds = new Set(
    value.dates.filter((d) => d.dbId).map((d) => d.dbId as string)
  )

  for (const d of value.dates) {
    if (d.dbId) {
      await supabase
        .from('show_dates')
        .update({ show_date: d.show_date, show_time: d.show_time })
        .eq('id', d.dbId)
    } else {
      await supabase.from('show_dates').insert({
        show_id: showId,
        show_date: d.show_date,
        show_time: d.show_time,
      })
    }
  }

  const blockedDates: string[] = []
  const datesToRemove = [...existingDateIds].filter((id) => !submittedDateIds.has(id))
  for (const dateId of datesToRemove) {
    const { data: activeClaims } = await supabase
      .from('slot_claims')
      .select('id')
      .eq('show_date_id', dateId)
      .in('status', ['claimed', 'waitlisted'])
      .limit(1)

    if (activeClaims && activeClaims.length > 0) {
      blockedDates.push(dateId)
      continue
    }
    await supabase.from('show_dates').delete().eq('id', dateId)
  }

  // ROLES — reconcile
  const { data: existingRoleRows } = await supabase
    .from('volunteer_roles')
    .select('id')
    .eq('show_id', showId)

  const existingRoleIds = new Set((existingRoleRows ?? []).map((r) => r.id as string))
  const submittedRoleIds = new Set(
    value.roles.filter((r) => r.dbId).map((r) => r.dbId as string)
  )

  for (const r of value.roles) {
    if (r.dbId) {
      await supabase
        .from('volunteer_roles')
        .update({
          role_name: r.role_name,
          slots_available: r.slots_available,
          category_id: r.category_id || null,
        })
        .eq('id', r.dbId)
    } else {
      await supabase.from('volunteer_roles').insert({
        show_id: showId,
        role_name: r.role_name,
        slots_available: r.slots_available,
        category_id: r.category_id || null,
      })
    }
  }

  const blockedRoles: string[] = []
  const rolesToRemove = [...existingRoleIds].filter((id) => !submittedRoleIds.has(id))
  for (const roleId of rolesToRemove) {
    const { data: activeClaims } = await supabase
      .from('slot_claims')
      .select('id')
      .eq('volunteer_role_id', roleId)
      .in('status', ['claimed', 'waitlisted'])
      .limit(1)

    if (activeClaims && activeClaims.length > 0) {
      blockedRoles.push(roleId)
      continue
    }
    await supabase.from('volunteer_roles').delete().eq('id', roleId)
  }

  // EDITORS — sync
  const { data: existingEditorRows } = await supabase
    .from('show_editors')
    .select('admin_id')
    .eq('show_id', showId)

  const currentEditorIds = new Set((existingEditorRows ?? []).map((e) => e.admin_id as string))
  const nextEditorIds = new Set(value.editorIds)

  const editorsToRemove = [...currentEditorIds].filter((id) => !nextEditorIds.has(id))
  const editorsToAdd = [...nextEditorIds].filter((id) => !currentEditorIds.has(id))

  if (editorsToRemove.length > 0) {
    await supabase
      .from('show_editors')
      .delete()
      .eq('show_id', showId)
      .in('admin_id', editorsToRemove)
  }
  if (editorsToAdd.length > 0) {
    await supabase
      .from('show_editors')
      .insert(editorsToAdd.map((adminId) => ({ show_id: showId, admin_id: adminId })))
  }

  await logAction(admin.id, 'show.update', 'show', showId, current, afterShow)

  if (blockedDates.length > 0 || blockedRoles.length > 0) {
    return { success: true, showId, warnings: { blockedDates, blockedRoles } }
  }

  return { success: true, showId }
}
