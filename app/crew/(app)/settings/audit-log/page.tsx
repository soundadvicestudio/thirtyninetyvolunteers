import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fromZonedTime } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import AuditLogFilters from '@/components/crew/settings/AuditLogFilters'
import AuditLogTable, { type AuditLogEntry } from '@/components/crew/settings/AuditLogTable'

const PAGE_SIZE = 25
const CT = 'America/Chicago'

type RawSearchParams = {
  page?: string
  adminId?: string
  action?: string
  targetType?: string
  dateFrom?: string
  dateTo?: string
}

type Filters = {
  adminId?: string
  action?: string
  targetType?: string
  dateFrom?: string
  dateTo?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAuditFilters(query: any, filters: Filters) {
  let q = query
  if (filters.adminId) q = q.eq('admin_id', filters.adminId)
  if (filters.action) q = q.eq('action', filters.action)
  if (filters.targetType) q = q.eq('target_type', filters.targetType)
  if (filters.dateFrom) {
    // DST-aware CT day boundary — a hardcoded UTC offset would be wrong for
    // roughly 8 months of the year (CDT is -05:00, not -06:00). Same
    // fromZonedTime() primitive lib/utils/date.ts's formatWallClockCT() uses.
    q = q.gte('created_at', fromZonedTime(`${filters.dateFrom} 00:00:00`, CT).toISOString())
  }
  if (filters.dateTo) {
    q = q.lte('created_at', fromZonedTime(`${filters.dateTo} 23:59:59.999`, CT).toISOString())
  }
  return q
}

function buildAuditLogHref(filters: Filters, page: number): string {
  const usp = new URLSearchParams()
  if (filters.adminId) usp.set('adminId', filters.adminId)
  if (filters.action) usp.set('action', filters.action)
  if (filters.targetType) usp.set('targetType', filters.targetType)
  if (filters.dateFrom) usp.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) usp.set('dateTo', filters.dateTo)
  if (page !== 1) usp.set('page', String(page))
  const qs = usp.toString()
  return qs ? `/crew/settings/audit-log?${qs}` : '/crew/settings/audit-log'
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/dashboard')
  }

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const filters: Filters = {
    adminId: params.adminId || undefined,
    action: params.action || undefined,
    targetType: params.targetType || undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
  }

  const supabase = await getServerClient()

  const entriesQuery = applyAuditFilters(
    supabase
      .from('audit_log')
      .select(
        `
        id, action, target_type, target_id,
        before_value, after_value, created_at,
        admin:admin_users(id, name, role)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1),
    filters
  )

  const [{ data: entries, count }, { data: allAdmins }] = await Promise.all([
    entriesQuery,
    supabase.from('admin_users').select('id, name, role').order('name'),
  ])

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasActiveFilters = !!(
    filters.adminId ||
    filters.action ||
    filters.targetType ||
    filters.dateFrom ||
    filters.dateTo
  )

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Audit Log</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Read-only record of all admin actions.
      </p>

      <AuditLogFilters allAdmins={allAdmins ?? []} currentFilters={filters} />

      {!entries || entries.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg py-16 px-6 text-center">
          <p className="text-mid-gray dark:text-dark-muted mb-3">
            No audit log entries match the current filters.
          </p>
          {hasActiveFilters && (
            <Link
              href="/crew/settings/audit-log"
              className="text-navy dark:text-steel hover:underline text-sm font-semibold"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <AuditLogTable entries={entries as unknown as AuditLogEntry[]} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <Link
                href={buildAuditLogHref(filters, Math.max(1, currentPage - 1))}
                className={`px-3 py-1.5 rounded border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors ${
                  currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Previous
              </Link>
              <span className="text-mid-gray dark:text-dark-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={buildAuditLogHref(filters, Math.min(totalPages, currentPage + 1))}
                className={`px-3 py-1.5 rounded border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors ${
                  currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
