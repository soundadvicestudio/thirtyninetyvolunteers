import 'server-only'

/**
 * Milestone check — stub for Phase 9.2.
 * Called after every attendance mark or manual hours
 * entry. Phase 9.2 (30BN-9.2) implements the full
 * threshold logic, email send, and dashboard flag.
 */
export async function checkMilestones(volunteerId: string): Promise<void> {
  void volunteerId
  // TODO: implement in 30BN-9.2
  return
}

/**
 * First Call check — stub for Phase 9.2.
 * Called after the first attendance record with
 * status = 'showed' is inserted for a volunteer.
 * R14: First Call fires on first showed attendance,
 * not on hours.
 */
export async function checkFirstCall(volunteerId: string): Promise<void> {
  void volunteerId
  // TODO: implement in 30BN-9.2
  return
}
