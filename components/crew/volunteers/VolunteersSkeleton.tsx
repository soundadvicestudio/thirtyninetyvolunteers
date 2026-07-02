const COLUMN_WIDTHS = ['w-4', 'w-32', 'w-40', 'w-24', 'w-28', 'w-16', 'w-12', 'w-20', 'w-24']

export default function VolunteersSkeleton() {
  return (
    <div className="bg-white border border-divider rounded-lg overflow-hidden">
      <div className="divide-y divide-divider">
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3">
            {COLUMN_WIDTHS.map((width, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 ${width} bg-divider rounded animate-pulse`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
