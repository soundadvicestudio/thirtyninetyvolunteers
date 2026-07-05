// Pure milestone data and helpers — no server-only dependencies, safe to
// import from client components (e.g. components/callboard/VolunteerCard.tsx)
// as well as from lib/milestones.ts (server-only). Keeping this split avoids
// the 'server-only' import in lib/milestones.ts poisoning the client bundle.

export type MilestoneThreshold = { hours: number; label: string }

export const MILESTONE_THRESHOLDS: MilestoneThreshold[] = [
  { hours: 0, label: 'First Call' },
  { hours: 10, label: '10 Hours' },
  { hours: 20, label: '20 Hours' },
  { hours: 35, label: '35 Hours' },
  { hours: 50, label: '50 Hours' },
  { hours: 75, label: '75 Hours' },
  { hours: 100, label: '100 Hours' },
  // After 100: every 25h — generated dynamically, see getNextMilestone().
]

export function getNextMilestone(
  totalHours: number,
  earnedMilestoneHours: number[]
): MilestoneThreshold | null {
  // Find all fixed thresholds > 0 not yet earned
  const fixedThresholds = MILESTONE_THRESHOLDS.filter((t) => t.hours > 0)

  // Generate extended thresholds beyond 100 (every 25h after 100)
  const maxFixed = 100
  const maxEarned = Math.max(0, ...earnedMilestoneHours.filter((h) => h > 0))
  const extended: MilestoneThreshold[] = []
  let next = maxFixed + 25
  while (next <= maxEarned + 50) {
    extended.push({ hours: next, label: `${next} Hours` })
    next += 25
  }

  const all = [...fixedThresholds, ...extended]

  // Return the lowest threshold not yet earned and above the current total
  const upcoming = all.find((t) => !earnedMilestoneHours.includes(t.hours) && t.hours > totalHours)
  return upcoming ?? null
}
