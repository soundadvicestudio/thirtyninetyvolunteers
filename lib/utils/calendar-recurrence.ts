import { addWeeks, addMonths, parseISO, format, getDate } from 'date-fns'

export function generateOccurrenceDates(
  startDate: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  endDate: string | null,
  capMonths: number = 12
): string[] {
  const start = parseISO(startDate)
  const capDate = addMonths(start, capMonths)

  // Effective end: earlier of endDate and capDate. Compare as YYYY-MM-DD
  // strings — lexicographic comparison is correct for ISO dates.
  const capDateStr = format(capDate, 'yyyy-MM-dd')
  const effectiveEndStr = endDate ? (endDate < capDateStr ? endDate : capDateStr) : capDateStr

  const dates: string[] = []
  let current = start

  while (true) {
    const currentStr = format(current, 'yyyy-MM-dd')
    if (currentStr > effectiveEndStr) break
    dates.push(currentStr)
    switch (frequency) {
      case 'weekly':
        current = addWeeks(current, 1)
        break
      case 'biweekly':
        current = addWeeks(current, 2)
        break
      case 'monthly':
        current = addMonths(current, 1)
        break
    }
  }

  return dates
}

export function describeRecurrence(
  frequency: 'weekly' | 'biweekly' | 'monthly',
  startDate: string,
  endDate: string | null,
  capMonths: number = 12
): string {
  const dates = generateOccurrenceDates(startDate, frequency, endDate, capMonths)
  const count = dates.length
  if (count === 0) {
    return 'No occurrences in the selected range'
  }

  const lastDate = format(parseISO(dates[dates.length - 1]), 'MMM d, yyyy')
  const dayOfMonth = getDate(parseISO(startDate))

  function ordinal(n: number): string {
    if (n >= 11 && n <= 13) return `${n}th`
    switch (n % 10) {
      case 1:
        return `${n}st`
      case 2:
        return `${n}nd`
      case 3:
        return `${n}rd`
      default:
        return `${n}th`
    }
  }

  const dayName = format(parseISO(startDate), 'EEEE')

  switch (frequency) {
    case 'weekly':
      return `Weekly on ${dayName}s — ${count} event${count === 1 ? '' : 's'} through ${lastDate}`
    case 'biweekly':
      return `Every 2 weeks — ${count} event${count === 1 ? '' : 's'} through ${lastDate}`
    case 'monthly':
      return `Monthly on the ${ordinal(dayOfMonth)} — ${count} event${count === 1 ? '' : 's'} through ${lastDate}`
  }
}
