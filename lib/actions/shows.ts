'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { showSubmitSchema, type ShowSubmitPayload } from '@/lib/validations/show'
import { buildCategoryMatchNotificationPayload, sendBatchEmails } from '@/lib/email'

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

  for (const d of value.dates) {
    const { data: insertedDate, error: dateError } = await supabase
      .from('show_dates')
      .insert({ show_id: showId, show_date: d.show_date, show_time: d.show_time })
      .select('id')
      .single()

    if (dateError || !insertedDate) {
      console.error('createShow date insert error:', dateError)
      return {
        error: 'The show was created, but dates failed to save. Edit the show to add dates.',
      }
    }

    const { error: rolesError } = await supabase.from('volunteer_roles').insert(
      d.roles.map((r) => ({
        show_date_id: insertedDate.id,
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

  // DATES + ROLES — fetch existing state for reconciliation
  const { data: existingDateRows } = await supabase
    .from('show_dates')
    .select('id')
    .eq('show_id', showId)

  const existingDateIds = new Set((existingDateRows ?? []).map((d) => d.id as string))
  const submittedDateIds = new Set(
    value.dates.filter((d) => d.dbId).map((d) => d.dbId as string)
  )

  const existingDateIdList = [...existingDateIds]
  const { data: existingRoleRows } =
    existingDateIdList.length > 0
      ? await supabase.from('volunteer_roles').select('id').in('show_date_id', existingDateIdList)
      : { data: [] as { id: string }[] }

  const existingRoleIds = new Set((existingRoleRows ?? []).map((r) => r.id as string))
  const submittedRoleIds = new Set(
    value.dates.flatMap((d) => d.roles.filter((r) => r.dbId).map((r) => r.dbId as string))
  )

  // DATES + ROLES — upsert (each date owns its own roles)
  for (const d of value.dates) {
    let dateId: string

    if (d.dbId) {
      dateId = d.dbId
      await supabase
        .from('show_dates')
        .update({ show_date: d.show_date, show_time: d.show_time })
        .eq('id', dateId)
    } else {
      const { data: insertedDate, error: insertDateError } = await supabase
        .from('show_dates')
        .insert({ show_id: showId, show_date: d.show_date, show_time: d.show_time })
        .select('id')
        .single()

      if (insertDateError || !insertedDate) {
        console.error('updateShow date insert error:', insertDateError)
        continue
      }
      dateId = insertedDate.id
    }

    for (const r of d.roles) {
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
          show_date_id: dateId,
          role_name: r.role_name,
          slots_available: r.slots_available,
          category_id: r.category_id || null,
        })
      }
    }
  }

  // DATES — remove (cascades to that date's roles and any unclaimed slot_claims)
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

  // ROLES — remove
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

export type CreateSeasonResult = { success: true; seasonId: string } | { error: string }

export async function createSeason(formData: {
  name: string
  startDate: string | null
  endDate: string | null
}): Promise<CreateSeasonResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const name = formData.name.trim()
  if (!name) {
    return { error: 'Season name is required.' }
  }

  const supabase = await getServerClient()

  const { data: season, error } = await supabase
    .from('seasons')
    .insert({
      name,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      is_current: false,
    })
    .select('id')
    .single()

  if (error || !season) {
    console.error('createSeason insert error:', error)
    return { error: 'Something went wrong creating the season. Please try again.' }
  }

  await logAction(admin.id, 'season.create', 'season', season.id, undefined, { name })

  return { success: true, seasonId: season.id }
}

export type ToggleShowStatusResult = { success: true } | { error: string }

export async function toggleShowStatus(
  showId: string,
  newStatus: 'draft' | 'live'
): Promise<ToggleShowStatusResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('shows')
    .select('status')
    .eq('id', showId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this show.' }
  }

  const { error: updateError } = await supabase
    .from('shows')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', showId)

  if (updateError) {
    console.error('toggleShowStatus error:', updateError)
    return { error: 'Something went wrong updating the show status. Please try again.' }
  }

  await logAction(
    admin.id,
    'show.status_change',
    'show',
    showId,
    { status: current.status },
    { status: newStatus }
  )

  return { success: true }
}

export type ShowEditorActionResult = { success: true } | { error: string }

export async function addShowEditor(showId: string, adminId: string): Promise<ShowEditorActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('show_editors')
    .upsert({ show_id: showId, admin_id: adminId }, { onConflict: 'show_id,admin_id', ignoreDuplicates: true })

  if (error) {
    console.error('addShowEditor error:', error)
    return { error: 'Something went wrong adding this editor. Please try again.' }
  }

  await logAction(admin.id, 'show.editor_add', 'show', showId, undefined, { admin_id: adminId })

  return { success: true }
}

export async function removeShowEditor(
  showId: string,
  adminId: string
): Promise<ShowEditorActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('show_editors')
    .delete()
    .eq('show_id', showId)
    .eq('admin_id', adminId)

  if (error) {
    console.error('removeShowEditor error:', error)
    return { error: 'Something went wrong removing this editor. Please try again.' }
  }

  await logAction(admin.id, 'show.editor_remove', 'show', showId, { admin_id: adminId }, undefined)

  return { success: true }
}

export async function updateShowStatus(
  showId: string,
  newStatus: 'draft' | 'live' | 'past' | 'archived'
): Promise<ToggleShowStatusResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('shows')
    .select('status')
    .eq('id', showId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this show.' }
  }

  const { error: updateError } = await supabase
    .from('shows')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', showId)

  if (updateError) {
    console.error('updateShowStatus error:', updateError)
    return { error: 'Something went wrong updating the show status. Please try again.' }
  }

  await logAction(
    admin.id,
    'show.status_change',
    'show',
    showId,
    { status: current.status },
    { status: newStatus }
  )

  return { success: true }
}

type NotificationTarget = {
  volunteer_id: string
  full_name: string
  email: string
  matching_roles: string[]
}

export type SendShowNotificationsResult = { sent: number; error?: string }

// Admin-authenticated action — called from admin UI only (show publish
// flow, Settings tab status panel, Overview tab manual trigger). Uses
// getServerClient() + getAdminUser(), matching every other export in this
// file, and matching get_show_notification_targets()'s
// `GRANT EXECUTE ... TO authenticated` (Migration 008) — the RPC is meant
// to be invoked under the admin's own session, not the service role.
export async function sendShowNotifications(showId: string): Promise<SendShowNotificationsResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { sent: 0, error: 'Unauthorized' }
  }

  try {
    const supabase = await getServerClient()

    // A. Fetch show, verify live.
    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('id, name, status')
      .eq('id', showId)
      .maybeSingle()

    if (showError || !show || show.status !== 'live') {
      return { sent: 0, error: 'Show not found or not live' }
    }

    // B. RPC call — zero matches is valid, not an error.
    const { data: targetRows, error: rpcError } = await supabase.rpc('get_show_notification_targets', {
      p_show_id: showId,
    })

    if (rpcError) {
      console.error('sendShowNotifications RPC error:', rpcError)
      return { sent: 0, error: 'Something went wrong finding matching volunteers. Please try again.' }
    }

    const targets = (targetRows ?? []) as NotificationTarget[]
    if (targets.length === 0) {
      return { sent: 0 }
    }

    // C. Build payloads — one per volunteer, with their own matching roles.
    const payloads = targets.map((t) =>
      buildCategoryMatchNotificationPayload({
        to: t.email,
        volunteerName: t.full_name,
        showName: show.name,
        matchingRoles: t.matching_roles,
      })
    )

    // D. Batch send (R8) — log failures, do not abort. Partial sends are
    // better than no send.
    try {
      await sendBatchEmails(payloads)
    } catch (err) {
      console.error('sendShowNotifications batch send error:', err)
    }

    // E. Update notifications_sent_at — after the send, not before.
    await supabase
      .from('shows')
      .update({ notifications_sent_at: new Date().toISOString() })
      .eq('id', showId)

    // F. Log to email_log — non-blocking.
    try {
      const { data: logRow } = await supabase
        .from('email_log')
        .insert({
          sent_by: admin.id,
          subject: `Volunteer opportunity — ${show.name}`,
          recipient_type: 'category',
          recipient_count: targets.length,
        })
        .select('id')
        .single()

      if (logRow) {
        await supabase.from('email_log_recipients').insert(
          targets.map((t) => ({
            email_log_id: logRow.id,
            volunteer_id: t.volunteer_id,
            email_address: t.email,
          }))
        )
      }
    } catch (err) {
      console.error('sendShowNotifications email_log error:', err)
    }

    // G. Return.
    return { sent: targets.length }
  } catch (err) {
    console.error('sendShowNotifications error:', err)
    return { sent: 0, error: 'Something went wrong sending notifications. Please try again.' }
  }
}
