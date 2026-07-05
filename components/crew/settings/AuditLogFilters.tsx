'use client'

type AdminOption = { id: string; name: string; role: string }

type CurrentFilters = {
  adminId?: string
  action?: string
  targetType?: string
  dateFrom?: string
  dateTo?: string
}

const selectClasses =
  'rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-navy'
const labelClasses = 'block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1'

export default function AuditLogFilters({
  allAdmins,
  currentFilters,
}: {
  allAdmins: AdminOption[]
  currentFilters: CurrentFilters
}) {
  const hasActiveFilters = !!(
    currentFilters.adminId ||
    currentFilters.action ||
    currentFilters.targetType ||
    currentFilters.dateFrom ||
    currentFilters.dateTo
  )

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg mb-4 p-4">
      <form method="GET" className="flex flex-col md:flex-row md:flex-wrap items-start gap-4">
        <div>
          <label className={labelClasses}>Admin User</label>
          <select name="adminId" defaultValue={currentFilters.adminId ?? ''} className={selectClasses}>
            <option value="">All admins</option>
            {allAdmins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Action Type</label>
          <select name="action" defaultValue={currentFilters.action ?? ''} className={selectClasses}>
            <option value="">All actions</option>
            <optgroup label="Volunteers">
              <option value="volunteer.update">Profile update</option>
              <option value="volunteer.archive">Archive</option>
              <option value="volunteer.unarchive">Unarchive</option>
              <option value="volunteer.note.add">Note added</option>
              <option value="volunteer.note.edit">Note edited</option>
              <option value="volunteer.note.delete">Note deleted</option>
              <option value="volunteer.hours_add">Hours added</option>
            </optgroup>
            <optgroup label="Shows & Seasons">
              <option value="show.create">Show created</option>
              <option value="show.update">Show updated</option>
              <option value="show.status_change">Status changed</option>
              <option value="show.editor_add">Editor added</option>
              <option value="show.editor_remove">Editor removed</option>
              <option value="season.create">Season created</option>
            </optgroup>
            <optgroup label="Categories">
              <option value="category.create">Category created</option>
              <option value="category.rename">Category renamed</option>
              <option value="category.reorder">Category reordered</option>
              <option value="category.visibility">Visibility toggled</option>
            </optgroup>
            <optgroup label="Users & Auth">
              <option value="user.create">User created</option>
              <option value="user.deactivate">User deactivated</option>
              <option value="user.reactivate">User reactivated</option>
              <option value="user.role_change">Role changed</option>
              <option value="user.decline_registration">Registration declined</option>
              <option value="user.password_change">Password changed</option>
            </optgroup>
            <optgroup label="Opportunities">
              <option value="opportunity.create">Opportunity created</option>
              <option value="opportunity.update">Opportunity updated</option>
              <option value="opportunity.archive">Opportunity archived</option>
              <option value="opportunity.reactivate">Opportunity reactivated</option>
              <option value="opportunity.submission">Opportunity submission (public)</option>
            </optgroup>
            <optgroup label="Forms">
              <option value="form.create">Form created</option>
              <option value="form.update">Form updated</option>
            </optgroup>
            <optgroup label="Attendance & Hours">
              <option value="attendance.mark">Attendance marked</option>
              <option value="attendance.hours_confirm">Hours confirmed</option>
            </optgroup>
            <optgroup label="Slot Claims">
              <option value="slot_claim.cancel">Slot claim cancelled</option>
            </optgroup>
            <optgroup label="Milestones">
              <option value="milestone.acknowledge">Milestone acknowledged</option>
            </optgroup>
            <optgroup label="Settings (Phase 11)">
              <option value="settings.update">Setting changed</option>
              <option value="hearing_options.create">Hearing option created</option>
              <option value="hearing_options.update">Hearing option updated</option>
              <option value="hearing_options.reorder">Hearing options reordered</option>
              <option value="hearing_options.deactivate">Hearing option deactivated</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Target Type</label>
          <select name="targetType" defaultValue={currentFilters.targetType ?? ''} className={selectClasses}>
            <option value="">All targets</option>
            <option value="volunteer">Volunteer</option>
            <option value="show">Show</option>
            <option value="season">Season</option>
            <option value="category">Category</option>
            <option value="admin_user">Admin User</option>
            <option value="opportunity">Opportunity</option>
            <option value="form">Form</option>
            <option value="attendance">Attendance</option>
            <option value="milestone">Milestone</option>
            <option value="pending_registration">Registration Request</option>
            <option value="app_settings">Settings</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Date From</label>
          <input type="date" name="dateFrom" defaultValue={currentFilters.dateFrom ?? ''} className={selectClasses} />
        </div>

        <div>
          <label className={labelClasses}>Date To</label>
          <input type="date" name="dateTo" defaultValue={currentFilters.dateTo ?? ''} className={selectClasses} />
        </div>

        <div className="flex items-end gap-4">
          <button
            type="submit"
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <a href="/crew/settings/audit-log" className="text-sm text-orange font-semibold hover:underline">
              Clear Filters
            </a>
          )}
        </div>
      </form>
    </div>
  )
}
