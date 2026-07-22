import type { Location } from '@/types/show'

export default function CalendarLegend({ locations }: { locations: Location[] }) {
  if (locations.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2">
      <span className="text-xs font-medium text-mid-gray dark:text-dark-muted mr-2">Locations:</span>
      {locations.map((location) => (
        <div key={location.id} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: location.color }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-mid-gray dark:text-dark-muted">{location.name}</span>
        </div>
      ))}
    </div>
  )
}
