export const SORT_VALUES = ['name', 'joined', 'hours', 'last_call', 'calls'] as const
export type VolunteersSort = (typeof SORT_VALUES)[number]

export type VolunteersUrlState = {
  q: string
  categoryIds: string[]
  status: 'active' | 'archived' | 'all'
  ageRange: string
  school: 'yes' | 'no' | 'all'
  isMinor: 'yes' | 'no' | 'all'
  sort: VolunteersSort
  dir: 'asc' | 'desc'
  page: number
}

export const DEFAULT_URL_STATE: VolunteersUrlState = {
  q: '',
  categoryIds: [],
  status: 'active',
  ageRange: '',
  school: 'all',
  isMinor: 'all',
  sort: 'name',
  dir: 'asc',
  page: 1,
}

type RawSearchParams = {
  q?: string
  category?: string | string[]
  status?: string
  age_range?: string
  school?: string
  is_minor?: string
  sort?: string
  dir?: string
  page?: string
}

export function parseVolunteersUrlState(params: RawSearchParams): VolunteersUrlState {
  const categoryIds = params.category
    ? Array.isArray(params.category)
      ? params.category
      : [params.category]
    : []

  const status =
    params.status === 'archived' || params.status === 'all' ? params.status : 'active'
  const school = params.school === 'yes' || params.school === 'no' ? params.school : 'all'
  const isMinor =
    params.is_minor === 'yes' || params.is_minor === 'no' ? params.is_minor : 'all'
  const sort = (SORT_VALUES as readonly string[]).includes(params.sort ?? '')
    ? (params.sort as VolunteersSort)
    : 'name'
  const dir = params.dir === 'desc' ? 'desc' : 'asc'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  return {
    q: (params.q ?? '').trim(),
    categoryIds,
    status,
    ageRange: params.age_range ?? '',
    school,
    isMinor,
    sort,
    dir,
    page,
  }
}

/**
 * Builds a volunteers list URL from a full state object, omitting any value
 * that matches its default so the URL stays clean.
 */
export function buildVolunteersUrl(pathname: string, state: VolunteersUrlState): string {
  const usp = new URLSearchParams()

  if (state.q) usp.set('q', state.q)
  for (const id of state.categoryIds) usp.append('category', id)
  if (state.status !== DEFAULT_URL_STATE.status) usp.set('status', state.status)
  if (state.ageRange) usp.set('age_range', state.ageRange)
  if (state.school !== DEFAULT_URL_STATE.school) usp.set('school', state.school)
  if (state.isMinor !== DEFAULT_URL_STATE.isMinor) usp.set('is_minor', state.isMinor)
  if (state.sort !== DEFAULT_URL_STATE.sort) usp.set('sort', state.sort)
  if (state.dir !== DEFAULT_URL_STATE.dir) usp.set('dir', state.dir)
  if (state.page !== DEFAULT_URL_STATE.page) usp.set('page', String(state.page))

  const qs = usp.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

export function isNonDefaultFilter(state: VolunteersUrlState): boolean {
  return (
    !!state.q ||
    state.categoryIds.length > 0 ||
    state.status !== DEFAULT_URL_STATE.status ||
    !!state.ageRange ||
    state.school !== DEFAULT_URL_STATE.school ||
    state.isMinor !== DEFAULT_URL_STATE.isMinor
  )
}
