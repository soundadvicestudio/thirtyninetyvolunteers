# 30 By Ninety Theatre — Build Governance
## 30BN_PROCESS_v1.md — v1.8
### Created: July 2026 | Last Updated: July 2026 — v1.8 (9.2 and 10.1 build corrections)

This document governs how every build session is run. It exists alongside the Brief as a required read at the start of every Claude Code session. These rules are not suggestions — they are the standards that keep builds clean, efficient, and error-free.

Conventions inherited and adapted from the Witching Hour build (TWH_PROCESS_v1.md), which itself inherited from Wizard Mansion. Rules here are either directly ported from TWH or are 30BN-specific preventive measures.

---

## 1. Session Starter Block

Every Claude Code prompt must open with this block verbatim.
No exceptions. Do not begin any build work until both files are confirmed read.

```
Before writing any code or SQL, read these two files in full
and confirm you have read them before proceeding:
1. 30BN_BRIEF_v1.md — the complete authoritative record of the
   tech stack, brand system, database schema, feature set, and
   all confirmed design decisions for the 30 By Ninety Theatre
   Volunteer Platform.
2. 30BN_PROCESS_v1.md — the build governance rules you must
   follow throughout this session.
Once you have read both, confirm you are ready and I will
provide the build prompt.
```

**CRITICAL:** Always use the exact versioned filenames. If you cannot find the versioned file, stop and flag it — never fall back to an unversioned file.

This single step prevents the majority of "built something that doesn't match the spec" errors.

---

## 2. Schema Verification Rule

Before writing any SQL or any server action that touches a database table, verify the actual live schema first. **Never assume column names from memory or from a previous session.**

**Required query before touching any table:**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

Run this for every table a prompt will touch. Confirm results match the 30BN_BRIEF_v1.md §9 schema before writing any code that references those columns.

**This rule is non-negotiable.** Inherited from confirmed TWH and Wizard Mansion failures caused by schema assumptions.

---

## 3. Scope Lock

Every prompt has a defined scope. Do not build anything outside that scope, even if it seems obviously related or helpful.

If during a build you notice something adjacent that needs doing, record it as a Q-item in the post-build summary. Do not build it. Do not "just fix it while you're here."

**Why:** Scope creep is the primary source of unexpected breakage. TWH had multiple incidents where "just fixing it" introduced regressions in untouched features.

**Follow-up Q pattern:** At the end of every build, list outstanding items as:
```
Q1. [Question or item noticed but not acted on]
Q2. [Another item]
```
These carry forward to the next prompt.

**Prompt size evaluation:** Before writing any build prompt, count how many of these it touches: {migration, server action, page, modal/component}. If more than one, evaluate splitting into sub-prompts (e.g., 30BN-3.2a/b pattern). The goal is one clear deliverable per prompt, fully verified before the next begins.

**ADMIN-prefixed prompts:** `30BN-ADMIN.[N]` prompts are for standalone admin or infrastructure features that don't belong to a specific phase sequence. May be executed at any point. Follow all the same standards. Numbering increments from 1.

**Document update prompts** use the prefix `30BN-DOC.[N]` to distinguish them from feature/infrastructure ADMIN prompts. Exception: the Phase 1 completion document updates were labeled `30BN-ADMIN.0a` (Brief) and `30BN-ADMIN.0b` (Process) before this convention was established. All future document-only updates use `30BN-DOC`.

---

## 4. Migration Discipline

### Naming Convention
Migrations are numbered sequentially: `001`, `002`, `003`, etc.
Filename format: `{number}_{descriptive_snake_case}.sql`
Examples: `001_core_schema.sql`, `002_volunteer_notes_role_rls.sql`

### Migration Rules
- One migration per logical unit of change
- Applied via Supabase MCP or Supabase dashboard SQL editor — this is the canonical workflow
- Every migration that creates a table with FK columns MUST add explicit indexes on those FK columns
- PostgreSQL does NOT automatically index FK columns
- Composite index column order: most selective / most-filtered column first
- Every migration is recorded in the Brief when it ships (add to schema section or note under relevant prompt)

---

## 5. Phase A / Phase B Structure (Debugging)

Any prompt that involves debugging, investigating unexpected behavior, or fixing something that "should work but doesn't" MUST use Phase A / Phase B structure.

**Phase A (Investigation — read-only):**
- Verify live state, not intended state
- Run actual queries against the live database
- Check `pg_policies`, `information_schema`, actual row counts
- Check deployed Vercel behavior (may lag commits by 1–2 minutes)
- Do NOT write any fixes in Phase A
- Report findings and wait for authorization to proceed

**Phase B (Targeted fix):**
- Only after Phase A findings are confirmed
- Addresses the root cause identified in Phase A
- Does not address anything else

**Why:** A fix based on assumed state rather than live state can create new failures. Phase A must verify against what is actually live.

**Read/audit/diagnose session pattern (established ADMIN.18):**
A read-only audit session is a Phase A with no Phase B — the entire output is a structured
findings document used to drive a separate execution prompt. No code is written, no files are
modified. The build report documents findings per audit topic with exact file paths, line
numbers, and specific recommended changes. The follow-up execution prompt (ADMIN.19 in this
case) executes all findings without needing to re-investigate. Use this pattern when multiple
unrelated areas need assessment before fixes can be confidently written.

**FIX prompt naming convention (established ADMIN.17-FIX):**
When a build report Flag item identifies a critical correctness issue that cannot wait for
the next scheduled prompt, a fix prompt is issued immediately. Naming: `[PROMPT-ID]-FIX`
(e.g., `30BN-ADMIN.17-FIX`). FIX prompts follow all the same standards as regular prompts
(Session Starter Block, schema verification, step tracker, build report). They may be issued
regardless of phase sequence. The original prompt's Flag item must reference the issue
clearly enough that the FIX prompt can proceed directly to Phase B without re-investigation.

---

## 6. RLS Pre-Prompt Verification

Before writing any prompt that touches Row Level Security, query `pg_policies` first:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table_name';
```

This is mandatory because:
- Missing UPDATE policies cause 503 errors in Server Actions that write then read
- Missing INSERT policies cause silent failures
- RLS must cover all operations your code performs (SELECT, INSERT, UPDATE, DELETE)

**Critical RLS rule for this project:**
`volunteer_notes` must have SELECT restricted to admin users only. The public-facing routes, the Call Board session, and any anonymous context must never be able to query this table. Verify this policy is in place before any prompt that touches volunteer profiles or Call Board pages.

**Call Board exception — RLS not applicable:**
The Call Board (`/callboard`) uses `getAdminClient()` for all data reads — there is no
Supabase Auth session in this context. RLS verification is not applicable to Call Board data
fetches; the admin client bypasses RLS by design. This is intentional and correct: volunteer
data is fetched server-side using the service role key, which is never exposed to the client.

**"RLS Policy Always True" Supabase advisory (known, accepted):**
Public INSERT policies with `WITH CHECK (true)` on `volunteers`, `slot_claims`,
`opportunity_submissions`, `form_responses`, `form_response_values`, and
`pending_registrations` are flagged by Supabase security advisors as "RLS Policy Always True."
This is a known and accepted pattern in this project — these tables intentionally allow
anonymous inserts from public-facing forms. The advisory is not actionable and should not
trigger alarm. All other access on these tables is restricted.

**SECURITY DEFINER function privilege verification (R28):**
Before shipping any migration that creates a SECURITY DEFINER function, verify execute privileges after creation:
```sql
SELECT proname, proacl
FROM pg_proc
WHERE proname = 'your_function_name';
```
The `proacl` result must NOT contain `=X/` (PUBLIC execute) or `anon=X/`. If either is present, immediately add REVOKE statements to the migration before committing. See R28 in Brief §13 for the required REVOKE/GRANT pattern. This check is mandatory — confirmed failure mode discovered in 30BN-5.3 (get_show_notification_targets) and retroactively fixed in ADMIN.13 (get_activity_feed).

---

## 7. Supabase Client Rules

Two Supabase clients exist in this project. Use the correct one for the context.

**`lib/supabase/server.ts` — `getServerClient()`**
- Uses `cookies()` — for Server Components and Server Actions
- Runs with the requesting user's session and RLS context
- Use for all data fetching in Server Components
- Use for all Server Actions that need user session context

**`lib/supabase/admin.ts` — `getAdminClient()`**
- Uses `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS entirely
- Server-only. Never import in Client Components.
- Use for: Super Admin account creation, sending admin welcome emails, any operation that must bypass RLS (e.g., looking up a volunteer by token without a user session), public Server Component reads where no user session exists (e.g., fetching active opportunities or shows for a public page — server-side only, key never exposed to client), and Vercel Cron route handlers (no session context)
- **Never expose to client side.** If you find yourself importing `admin.ts` in a `'use client'` file, stop — this is a security failure.
- **Do not use for admin server actions called from authenticated sessions.** If a server action is invoked only from the Production Crew UI (i.e., a logged-in Editor or Super Admin), use `getServerClient()` — the session exists and RLS should apply. `getAdminClient()` bypasses RLS and should only be used when there is genuinely no session. Confirmed pattern: `sendShowNotifications()` uses `getServerClient()` because it is always called by an authenticated admin. (30BN-5.3 Q1)

**Call Board session context — third use case for `getAdminClient()`:**
The Volunteer Call Board introduces a third auth context beyond the two described above.
Volunteers are not Supabase Auth users — there is no Supabase session cookie. The Call Board
uses a custom `callboard_session` cookie storing the volunteer's UUID. `getCallboardSession()`
in `lib/callboard/session.ts` reads this cookie and fetches the volunteer record using
`getAdminClient()` — because there is no RLS session to use. Server actions in the Call Board
context (`lookupVolunteer()`, `signOutCallboard()`) also use `getAdminClient()` for the same
reason. This is correct and intentional — never use `getServerClient()` in a Call Board
context where no Supabase Auth session exists.

**Server-only file split pattern (established 9.2):**
When a file carries `import 'server-only'` at the top, that directive poisons the entire
module for any client import chain — not just specific exports. If pure utilities (no DB
calls, no server-only dependencies) need to be shared with client components, extract them
into a `*-shared.ts` sibling file with no server-only imports. The server file can then
re-export those symbols for server-side callers who want a single import point.
Pattern confirmed: `lib/milestones.ts` (server-only) / `lib/milestones-shared.ts` (pure,
client-safe). Apply this pattern to any future server-only file that needs to export pure
utilities.

**DST-aware date-range filtering (established 10.1):**
When filtering records by a CT date boundary (e.g., "all records from this date in CT"),
use `fromZonedTime()` from `date-fns-tz` to compute the correct UTC boundary — never a
hardcoded UTC offset (`-06:00` or `-05:00`). Central Time alternates between CST (-06:00)
and CDT (-05:00) seasonally. A hardcoded offset is wrong for approximately 8 months of
the year. This is the same principle as R23 — use the date-fns-tz primitives, never raw
offsets. Confirmed failure mode avoided in 10.1 Q3.

**Never create a client inside a loop.** Create once per function, reuse.

---

## 8. Build Report Format

Every completed build prompt must end with a build report in this format:

```
## Build Report — [Prompt ID]

### Completed
- [What was built, specific and concrete]
- [Another item]

### Verified
- [What was tested and confirmed working]
- [Test method used]

### Migrations Applied
- [Migration filename and number, or "None"]

### Files Created / Modified
- [File path] — [what it does]

### Q-Items (carry to next prompt)
Q1. [Item noticed but not acted on]
Q2. [Another item, or "None"]

### Flags
F1. [Anything that needs attention before shipping, or "None"]
```

**Build report timing:** The build report is delivered at the conclusion of the build session — after code is pushed and the deploy is triggered — without waiting for manual verification steps. Manual verification items (owner-performed per R16) are listed in the Verified section as:
`⏳ Pending owner verification — [step reference]`
The owner performs and reports manual verification after receiving the build report. The prompt is not marked complete until the owner confirms all manual items pass. If any manual item fails, treat the failure as a Phase A/B debugging session per §5.

If a build is incomplete or something didn't work as expected, that goes in Flags. Never mark
something as Verified if it wasn't actually tested.

**Lint output must be captured in full (untruncated):**
Always run `npm run lint 2>&1` and capture complete output before asserting the number of
issues or affected files. Tail-truncated lint output caused undercounting of affected files
in this project (ADMIN.17 Q1 — four files were hidden by truncation). A lint baseline of
zero errors and zero warnings was achieved in ADMIN.17 and must be maintained. Any new lint
issue introduced by a build is a build defect.

**Read/audit/diagnose session build report format:**
When a prompt is a read-only audit session (no code written, no files modified), the build
report uses this abbreviated format:

```
## Build Report — [Prompt ID]

### Audit A — [Topic]
[Findings with exact files, line numbers, and ADMIN.19 actions]
Risk: LOW / MEDIUM / HIGH
Follow-up action: [exact change to make in next prompt]

### Audit B — [Topic]
[Same structure]

### Completed
Read-only audit session. No files modified.

### Verified
No code changes to verify.

### Migrations Applied
None

### Files Created / Modified
None

### Q-Items
Q1. [Anything noticed during reads out of scope]

### Flags
F1. [Critical finding needing immediate attention, or None]
```

**Database-state verification in build reports:** Some quality gate items can be confirmed by Claude Code directly via live database queries rather than deferred to manual owner verification. When a build report includes a live query result that confirms a fix (e.g., a `pg_proc.proacl` check confirming privilege state, or a row count confirming a migration applied), that item is listed in the Verified section as confirmed — not as pending owner verification. The build report must include the actual query result, not just a claim that it was checked. Established ADMIN.13.

**Step Tracker Convention (required from v1.3 onward):**
Every build prompt must declare a step tracker block after the SCOPE section. The tracker lists all planned steps at the start of the session. Claude Code updates it in place as work proceeds — marking each step ✓ (complete) or ✗ (blocked) when done.

Format:
```
Step tracker:
✓ Step 1: [completed]
☐ Step 2: [in progress]
☐ Step 3: [pending]
☐ Step 4: [pending]
```

**The tracker is a single persistent element.** It must not be re-emitted or repeated after individual steps — doing so produces multiple copies that obscure build progress rather than clarifying it. Claude Code manages live-update behavior natively when given an initial declaration. Prompts must not include the instruction to "re-emit the tracker after each step." See R27.

---

## 9. Quality Gates

Every prompt has a Quality Gate defined in 30BN_BRIEF_v1.md §10. Before marking a prompt complete:

1. Every item in the Quality Gate must be manually verified — not assumed
2. If any Quality Gate item fails, the prompt is not complete
3. Do not move to the next prompt until the current prompt's Quality Gate passes
4. If a fix is needed, treat it as a Phase A/B debugging session

---

## 10. Grep / Search Verification

Before marking a prompt complete, run a search to verify no unintended patterns exist:

```bash
# Check for hardcoded category names (R4)
grep -r "Ushers\|Band Members\|Concessions\|Backstage" app/ components/ lib/

# Check for service role key in client files (R10)
grep -r "SERVICE_ROLE_KEY" components/ app/

# Check for tailwind.config.ts (R7)
ls tailwind.config.ts 2>/dev/null && echo "EXISTS - REMOVE IT"

# Check for window.location.href on volunteer profile
# mutations — must be zero (standardized to
# router.refresh() in ADMIN.19 per R12 update)
grep -rn "window.location" \
  app/crew/\(app\)/volunteers/ \
  components/crew/volunteers/ \
  --include="*.tsx" --include="*.ts"
# Must return zero results on the profile page.
# window.location is still valid for navigation
# away to a different URL (e.g. categories page
# reload() — different context, not a mutation).

# Check for router.push after mutations (R12)
# router.push() does not re-run Server Component
# data fetches — use router.refresh() instead
grep -r "router.push" app/crew/ --include="*.tsx"
# Review any hits — confirm none are post-mutation
# nav that should be router.refresh() instead
```

```bash
# Check for shadcn default semantic color classes left in components (R15)
grep -r "bg-primary\|text-foreground\|border-input\|text-muted-foreground\|ring-ring\|bg-secondary\|bg-destructive\|bg-muted\|bg-accent\|bg-card" app/ components/
```

```bash
# Confirm no dark: classes on public routes (ADMIN.6)
grep -r "dark:" app/ --include="*.tsx" | \
  grep -v "/crew/"
# (Should return no results — dark mode is admin-only)

# Confirm migration files are at repo root (R21)
ls *.sql 2>/dev/null
# (Migration files must be here, not in supabase/migrations/)

# Confirm no Button component in files needing brand hover behavior (R19)
grep -r "from.*components/ui/button" \
  components/crew/
# (Review any hits — confirm none need brand hover states that would be blocked by tailwind-merge)
```

```bash
# Confirm no formatCT() on bare date-only columns (R23)
# Safe: timestamptz columns (created_at, updated_at,
#   claimed_at, last_login, submitted_at, etc.)
# Fix needed: date columns (show_date, start_date,
#   end_date) or constructed strings (date + 'T' + time)
grep -rn "formatCT(" app/ components/ \
  --include="*.tsx" --include="*.ts"
# Review hits — any call on a bare date column or
# constructed date+time string must use
# formatWallClockCT() instead
```

```bash
# Confirm no volunteer_roles queries use show_id (R26)
# show_id was removed from volunteer_roles in
# Migration 006 — all queries must join through
# show_dates instead
grep -rn "volunteer_roles" app/ components/ lib/ \
  --include="*.ts" --include="*.tsx" | grep "show_id"
# Must return zero results
```

```bash
# Confirm SECURITY DEFINER functions have no PUBLIC/anon
# execute privilege (R28) — run after any migration that
# creates a SECURITY DEFINER function
# Replace function_name with the actual function name
# Must NOT show =X/ (PUBLIC) or anon=X/ in proacl
```
```sql
SELECT proname, proacl
FROM pg_proc
WHERE proname IN (
  'get_activity_feed',
  'get_show_notification_targets'
);
```
-- Both must show only postgres, authenticated,
-- service_role in proacl. If =X/ or anon=X/ appears,
-- apply REVOKE immediately per R28.

```bash
# Confirm revalidatePath only in server-side files (R29)
# Never in a 'use client' file — server-only import
grep -rn "revalidatePath" app/ components/ \
  --include="*.tsx" --include="*.ts"
# Review every hit: must be in a file that has
# 'use server' at the top or is a server action file.
# A revalidatePath call in a client component will
# throw a runtime error.
```

```bash
# Confirm hours_confirmed explicitly set to false on
# all Showed attendance marks — never left to DEFAULT
# (9.1 requirement — the dashboard Pending Hours Review
# card depends on this being explicitly set)
grep -n "hours_confirmed" lib/actions/attendance.ts
# Must show: false on all insert/update paths.
# Must NOT show: true on any Showed mark.
```

```bash
# Confirm no drag library installed (Phase 6 decision)
# Field reorder uses arrow buttons only — no drag lib.
# Installing one would violate the explicit decision
# made when building the form builder (30BN-6.1).
cat package.json | grep -i "dnd\|drag\|sortable"
# Must return nothing.
```

```bash
# Confirm lint baseline is maintained (zero errors,
# zero warnings — achieved in ADMIN.17)
npm run lint 2>&1
# Any new issue = a defect introduced by this build.
# Lint output must be captured in full (untruncated).
# If suppressing with eslint-disable, the comment must
# include a documented reason explaining why suppression
# is correct (e.g. hydration-safe client-only API read).
```

```bash
# Confirm no window.location on volunteer profile
# components (router.refresh() standard, R12/ADMIN.19)
grep -rn "window.location" \
  app/crew/\(app\)/volunteers/ \
  components/crew/volunteers/ \
  --include="*.tsx" --include="*.ts"
# Must return zero results
```

Add project-specific checks as new standing rules emerge.

---

## 11. Post-Build Checklist

Run before every Vercel deployment:

```
□ All six env vars set in Vercel → Settings → Environment Variables
  (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
  NEXT_PUBLIC_SITE_URL, CRON_SECRET)
□ NEXT_PUBLIC_SITE_URL set to correct URL for this environment
□ No SUPABASE_SERVICE_ROLE_KEY referenced in any client component
□ Vercel framework preset confirmed as Next.js — Settings → General (not "Other")
□ After any shadcn init or add: confirm no tailwind.config.ts or tailwind.config.js was created — delete immediately if found
□ All Quality Gates for this prompt passed
□ Build report written
□ Q-items noted
□ Brief updated if schema or decisions changed (batch with owner approval)
□ Step tracker declared at session start — single persistent tracker, not re-emitted after individual steps (R27)
□ Any new date display: confirm formatWallClockCT() used for bare date columns (show_date, start_date, end_date), formatCT() for timestamptz columns (created_at, updated_at, claimed_at, etc.) (R23)
□ Any code touching volunteer_roles: confirm query joins through show_dates — no direct show_id reference (column removed in Migration 006) (R26)
□ All new /crew/* pages placed under app/crew/(app)/ — not app/crew/ directly (R20)
□ Any new shadcn component installed: check globals.css for var() injection (R17), check for tailwind.config.ts (R7), rebrand all semantic color classes (R15)
□ Migration files created at repo root, not in supabase/migrations/ (R21)
□ No Button component imported in files requiring brand hover behavior (R19)
□ Any new SECURITY DEFINER function in a migration: verify pg_proc.proacl
  shows no PUBLIC or anon execute privilege after applying (R28)
□ Any new mutating server action: confirm revalidatePath() calls are present
  for all routes that display the mutated data (R29)
□ Any prompt touching forms or field reorder: confirm no drag library was
  added to package.json (Phase 6 confirmed decision — arrow buttons only)
□ npm run lint returns zero errors, zero warnings — lint baseline maintained
  (ADMIN.17). Capture full untruncated output. Any new issue is a build defect.
□ Any mutation component on the volunteer profile page: uses router.refresh()
  not window.location.href for in-place re-renders (R12, ADMIN.19)
□ Any new attendance mutation marking Showed: confirm hours_confirmed = false
  set explicitly (not left to DEFAULT) on the insert/update (9.1 pattern)
□ Any new server action that increments volunteer hours (markAttendance,
  confirmHours, addManualHours): confirm both checkMilestones() and
  checkFirstCall() are called non-blocking after the hours update (9.2 pattern)
□ Any new SECURITY DEFINER function: verify pg_proc.proacl AND confirm
  lib/milestones.ts MILESTONE_THRESHOLDS is the single source of truth —
  no local threshold arrays in any component (9.2 pattern, Q3 from 8.1)
```

---

## 12. Document Update Protocol

The Brief (30BN_BRIEF_v1.md) and Process (30BN_PROCESS_v1.md) are living documents.

**Rules:**
- All document updates require owner approval before execution
- Updates are batched to maximize efficiency — do not update after every small change
- When a new standing rule is agreed upon, it goes in Brief §13 AND is noted here
- Document version increments (v1 → v1.1 → v1.2) happen at the end of each build phase
- Never edit a document mid-build-session without owner approval

**What triggers an update:**
- A new standing rule (R-number)
- A schema change (migration applied that differs from Brief §9)
- A feature decision that resolves an Open Decision (Brief §12)
- A phase completed (status tracking in Brief §10)
- Any confirmed deviation from the Brief

**Batching pattern (established DOC.13/DOC.14):**
Comprehensive document updates are batched at the completion of a multi-phase milestone
rather than after every ADMIN prompt. The recommended trigger point is after a natural
phase boundary (e.g., after Phase 10 before Phase 11). Minor corrections discovered during
a build are recorded as Q-items and included in the next batch update. The deferred
verification document (30BN_DEFERRED_VERIFICATIONS) is updated via DOC prompts as needed
and is not subject to the same batching requirement — it should be updated after any prompt
that adds pending verification items.

---

## 13. Phase Status Tracking

Updated at the end of each phase. Check marks = complete.

### Alpha Build
```
Phase 1 — Foundation ✓ Complete
  30BN-1.1  ✓ Database Schema & Supabase Setup
  30BN-1.2  ✓ Next.js Project Scaffold & Vercel Deploy
  30BN-1.3  ✓ Authentication System

Document & Admin Prompts
  30BN-ADMIN.0a  ✓ Brief Update v1.1 (Phase 1)
  30BN-ADMIN.0b  ✓ Process Update v1.1 (Phase 1)
  30BN-ADMIN.1   ✓ Write admin_users.last_login on sign-in
  30BN-ADMIN.2   ✓ Cleanup: sign-out button, timezone utility, landing page
  30BN-ADMIN.3   ✓ Cosmetic fix: hover states, CTA button position
  30BN-ADMIN.4   ✓ Service hours field
  30BN-ADMIN.5   ✓ Users table Super Admin fix + note edit/delete + PWA
  30BN-ADMIN.6   ✓ Light/Dark mode toggle
  30BN-ADMIN.7   ✓ Fix PWA start_url
  30BN-DOC.1     ✓ Brief Update v1.2 (Phase 2)
  30BN-DOC.2     ✓ Process Update v1.2 (Phase 2)
  30BN-DOC.3     ✓ Brief Update v1.3 (Phase 3)
  30BN-DOC.4     ✓ Process Update v1.3 (this prompt)
  30BN-ADMIN.8   ✓ (prior session — details in
                   "Volunteer Platform Build Pt 2")
  30BN-ADMIN.9   ✓ Timezone sweep — formatWallClockCT()
  30BN-ADMIN.10  ✓ Season display fix + opportunity
                   submission audit log
  30BN-ADMIN.11  ✓ Roles-per-date schema fix
                   (Migration 006)
  30BN-ADMIN.12  ✓ Activity feed with pagination and
                   per-user read state (Migration 007)
  30BN-DOC.5     ✓ Brief Update v1.4 (Phase 4)
  30BN-DOC.6     ✓ Process Update v1.4
  30BN-ADMIN.13  ✓ Security fix — REVOKE EXECUTE on
                   get_activity_feed() from PUBLIC/anon
                   (Migration 009)
  30BN-DOC.7     ✓ Brief Update v1.5 (Phase 5)
  30BN-DOC.8     ✓ Process Update v1.5
  30BN-ADMIN.14  ✓ Cache revalidation sweep
                   (revalidatePath in all mutating actions),
                   dialog close-button dark hover fix,
                   theme toggle hydration fix
                   (ThemeProvider → document.body), show
                   edit blank-role trap fix, opportunity
                   reactivate action and UI. R29/R30
                   established.
  30BN-DOC.9     ✓ Brief Update v1.6 (Phases 6 and 7)
  30BN-DOC.10    ✓ Process Update v1.6
  30BN-DOC.11    ✓ Brief Update v1.7 (Call Board redesign)
  30BN-DOC.12    ✓ Deferred Verification Document v3
                   (ADMIN.15–16 verification items added)
  30BN-ADMIN.15  ✓ Self-registration + pending approval
                   flow, change password (/crew/settings/
                   password), referral field label
                   corrections. Migration 010.
                   Patterns: registerAdminRequest(),
                   approveRegistration(),
                   declineRegistration().
  30BN-ADMIN.16  ✓ Add to Home Screen PWA card (mobile
                   dashboard), Opportunities sidebar link,
                   /crew → /crew/dashboard redirect fix,
                   Brief cleanup (DOC.11 Q1 + stale items)
  30BN-ADMIN.17  ✓ Lint sweep — zero errors/warnings
                   achieved across all 10 affected files
                   (3 fixed, 10 suppressed with documented
                   reasoning). Phase 12 quick wins:
                   sendReminderEmail() removed,
                   PDF Svc Hrs column added, page-param
                   clamp, Migration 012 (CASCADE on
                   form_response_values.field_id).
  30BN-ADMIN.17-FIX ✓ updateForm() diff-based field sync
                   (critical data-destruction fix).
                   updateForm() full-replace strategy
                   replaced with diff-based reconciliation:
                   UPDATE existing fields in place,
                   INSERT new fields, DELETE only
                   explicitly removed fields. revalidatePath
                   added to updateForm() and createForm().
                   FIX prompt pattern established.
  30BN-ADMIN.18  ✓ Read/audit/diagnose session — no code
                   changes. Six audits: call history sort,
                   all-pages CSV export design, category
                   description editing design, empty states
                   (5/6 already exist), image optimization
                   (all already <Image>), input sanitization
                   (R18 gaps + .max() caps needed).
                   Read/audit session pattern established.
  30BN-ADMIN.19  ✓ Targeted fixes (post-audit sweep):
                   markAttendance() + createForm()
                   revalidatePath (R29); call history JS
                   sort by show_date (admin profile +
                   Call Board); filter-aware CSV export
                   ("Export Matching"); category description
                   inline editing; R18 fix (8× ?? → ||);
                   .max() caps on public Zod schemas;
                   volunteer profile standardized to
                   router.refresh(); dark: gaps fixed on
                   profile header/status badge.
  30BN-DOC.13    ✓ Brief Update v1.8 (Phases 8–10,
                   ADMIN.15–19, comprehensive corrections)

Phase 2 — Public Volunteer Signup ✓ Complete
  30BN-2.1  ✓ Landing Page Design & Layout
  30BN-2.2  ✓ Volunteer Registration Form
  30BN-2.3  ✓ Form Submission Logic (+ 2.3-FIX: age_range
               constraint + required field)
  30BN-2.4  ✓ Volunteer Info Update Flow

Phase 3 — Production Crew Core ✓ Complete
  30BN-3.1   ✓ Admin Layout & Navigation
  30BN-3.2   ✓ Volunteers List View
  30BN-3.2b  ✓ PDF Export + Minor Fixes
  30BN-3.3   ✓ Volunteer Profile Page
  30BN-3.4   ✓ Category Management
  30BN-3.5   ✓ Super Admin User Management

Phase 4 — Shows & Season Management ✓ Complete
  30BN-4.1    ✓ Show Creation & Edit
  30BN-4.2    ✓ Season Management & Show List
  30BN-4.3    ✓ Admin Show Detail
  30BN-4.4a   ✓ Standing Volunteer Opportunities —
                Admin Management
  30BN-4.4b   ✓ Standing Volunteer Opportunities —
                Public Submission & Admin Viewer

Phase 5 — Public Show Claiming ✓ Complete
  30BN-5.1    ✓ Public Show Listing & Per-Show Page
  30BN-5.2    ✓ Slot Claiming Logic & Self-Cancel
  30BN-5.3    ✓ Category-Match Notification Emails

Phase 6 — Custom Forms & Surveys ✓ Complete
  30BN-6.1    ✓ Form Builder
  30BN-6.2    ✓ Public Form Page & Response Capture
  30BN-6.3    ✓ Form Response Viewer & Embed

Phase 7 — QR Code Generator ✓ Complete
  30BN-7.1    ✓ QR Code Utility & Generator Tool
                (per-form QR pulled forward into 6.3;
                standalone generator built here)

Phase 8 — Volunteer Call Board ✓ Complete
  30BN-8.1  ✓ Call Board (complete — redesigned from
              two-prompt to single-prompt delivery;
              single-page /callboard hub, cookie-only
              session, no magic link, no sub-routes,
              lib/callboard/session.ts,
              lib/actions/callboard.ts, types/callboard.ts)

Phase 9 — Volunteer Hours & Milestones ✓ Complete
  30BN-9.1  ✓ Hours Tracking (Migration 011:
              attendance.hours_confirmed +
              volunteer_hours_log.logged_date;
              confirmHours(); addManualHours();
              PendingHoursCard on dashboard;
              volunteer profile hours section +
              milestone history display)
  30BN-9.2  ✓ Milestone System (Migration 013:
              UNIQUE on milestone_log;
              checkMilestones() + checkFirstCall()
              real implementations;
              lib/milestones-shared.ts — new pure
              file (MILESTONE_THRESHOLDS +
              getNextMilestone(), client-safe);
              lib/milestones.ts re-exports both,
              carries 'server-only';
              sendMilestoneEmail() tier-specific,
              CTA → /callboard;
              acknowledgeMilestone() — audit entry
              added in 10.1, not 9.2;
              PendingMilestonesCard on dashboard;
              milestone tier filter activated;
              VolunteerCard imports from
              lib/milestones-shared;
              Call Board hours breakdown)

Phase 10 — Audit Log ✓ Complete
  30BN-10.1 ✓ Audit Log Viewer (no migration;
              AuditAction type union completed with
              9 comment groups including "Slot Claims"
              as distinct group + Phase 11 forward
              declarations; logAction() added to
              acknowledgeMilestone() (corrects 9.2
              spec which said no audit entry) and to
              changePassword() (also added
              getAdminUser() — ADMIN.15 had omitted
              it); DST-aware date filtering via
              fromZonedTime(); server-side paginated
              viewer at /crew/settings/audit-log;
              AuditLogFilters + AuditLogTable;
              expandable diff rows; Viewer redirect
              guard; Audit Log card added to
              /crew/settings hub)

Phase 11 — Stubs, 404 & App Settings
  30BN-11.1   Beta Stub Pages & Custom 404
  30BN-11.2   App Settings & Announcement Banner

Phase 12 — Polish, Mobile & Performance
  30BN-12.1   Mobile Optimization & Empty States
  30BN-12.2   Performance, Security & In-App Help
```

### Beta Build
```
Phase 13 — Email Blast System       (detail in v2)
Phase 14 — Check-In System          (detail in v2)
Phase 15 — Document Management      (detail in v2)
Phase 16 — Google SSO      ✓ Completed in Alpha (30BN-1.3)
Phase 17 — Launch                   (detail in v2)

New Beta features confirmed during Alpha build:
Phase 18 — Additional Alpha Features (moved to Alpha scope)
  - Volunteer communication history on profile
  - Show-level post-show reporting
  - Volunteer self-service hours history on Call Board
  - Bulk email from show detail
Phase 19 — Waitlist notification preferences
  (volunteer opt-in for notification method)
Phase 20 — Automated thank-you email after a show
  (24–48h post-show, sent to all Showed volunteers)
```

---

## 14. Process-Specific Standing Rules

Rules governing this build process itself, kept here rather than in Brief §13 because they concern session conduct and CLI tooling behavior rather than product/schema decisions. This is a deliberate deviation from the general §12 protocol ("new standing rule goes in Brief §13 AND is noted here") for these two rules specifically.

### R12 — router.refresh() for In-Place Re-Renders; window.location.href for Full Nav (cross-reference)
Documented in Brief §13 R12. Referenced here for R-number continuity. Core rule: router.refresh()
is the preferred pattern for Client Components that need to re-fetch Server Component data after
a mutation without navigating away. window.location.href is used only for full navigation to a
different URL. router.push() must not be used for post-mutation re-renders. Standardized across
volunteer profile mutations in ADMIN.19. See §10 for the grep check and §11 for the checklist item.

### R16 — No Browser Verification in Claude Code Sessions
Claude Code does not use browser automation tools (Claude in Chrome or any equivalent) for UI, flow, or auth verification. All such verification is performed manually by the owner, who reports results to Claude Code as pass/fail. Build prompts must express all verification steps as manual owner tasks — never as browser tool calls. Established during 30BN-1.3.

**Verification session pattern (R16 clarification):**
Claude in Chrome may be used in a separate, dedicated verification session — distinct from a
Claude Code build session — with explicit owner approval. This is not a violation of R16 because:
(a) it runs in Claude.ai, not in a Claude Code session, and (b) it is read/evaluate/audit only —
no code is written, no commits are made. The pattern established in this project uses a
structured sequence: SETUP-1 (data and account seeding), VERIFY-1 through VERIFY-N (grouped
browser checks), and DB-VERIFY.N (Supabase query-only checks). Each prompt returns a structured
PASS/FAIL/SKIP report which the owner pastes into the planning chat for analysis. Fixes from
FAIL items follow the normal Phase A/B debugging protocol and ship as ADMIN-prefixed prompts.
R16 continues to prohibit browser automation within any Claude Code build or debug session.

### R17 — shadcn Init: Revert var() Injection Into globals.css
The shadcn CLI (v4.12+) injects a var()-driven CSS custom property theme block into `globals.css` by default during `init`, and may repeat this on `npx shadcn@latest add` commands. This overwrites the R7-compliant `@theme` block and is incompatible with Tailwind v4. After any shadcn init or add, immediately inspect `globals.css` and revert any injected `var()` block. The canonical `@theme` block with static hex values must be restored exactly as specified in 30BN_BRIEF_v1.md §3 Critical Constraint. Known shadcn CLI behavior to guard against.

### R18 — Empty String Normalization (cross-reference)
Already in Brief §13. Referenced here for R-number continuity. See Brief §13 R18.

### R19 — Plain <button> (cross-reference)
Documented in Brief §13 R19. Referenced here for continuity. Core rule: never use the Button component in files requiring brand hover behavior due to tailwind-merge incompatibility with custom @theme color tokens.

### R20 — /crew/* Route Placement (cross-reference)
Documented in Brief §13 R20. Referenced here for continuity. All Production Crew pages under `app/crew/(app)/`. Login under `app/crew/(auth)/login/`.

### R21 — Migration Files at Repo Root (cross-reference)
Documented in Brief §13 R21. Referenced here for continuity. No `supabase/migrations/` directory.

### R22 — Vercel Deploy Verification Is Owner-Side
Documented in Brief §13 R22. Referenced here because it directly governs session conduct: Claude Code must not include "confirm Vercel deploy" as a step in its own build process or flag its absence in build reports. Owner confirms deploy independently.

### R23 — formatWallClockCT() for Date-Only Columns (cross-reference)
Documented in Brief §13 R23. Referenced here for R-number continuity. Core rule: use formatWallClockCT() for bare date column values and constructed date+time strings; use formatCT() only for full timestamptz values. See grep check in §10.

### R24 — Nested useFieldArray Requires Its Own Sub-Component (cross-reference)
Documented in Brief §13 R24. Referenced here for R-number continuity. Core rule: nested field arrays in react-hook-form must live in their own named component — not inline in a render loop over a parent field array.

### R25 — Public Submissions Use null admin_id in audit_log (cross-reference)
Documented in Brief §13 R25. Referenced here for R-number continuity. Core rule: logAction() accepts string | null as admin_id; pass null for public-facing actions with no admin session.

### R26 — Roles Belong to show_dates, Not shows (cross-reference)
Documented in Brief §13 R26. Referenced here for R-number continuity. Core rule: volunteer_roles.show_date_id is the FK parent as of Migration 006. Any query for "all roles for a show" must join through show_dates. See grep check in §10.

### R27 — Step Tracker Is a Single Persistent Widget
The step tracker declared at the start of a build session is a single element updated in place as work proceeds. It must not be re-emitted or repeated after individual steps. Claude Code manages the live-update behavior natively when given an initial declaration. Prompts must not include the instruction to "re-emit the tracker after each step" — this causes multiple tracker copies to appear, obscuring rather than clarifying progress. The correct instruction is to declare the tracker once in the SCOPE section and allow Claude Code to update it. Established Phase 4 build session.

Note on placement: R27 governs session conduct (how the tracker widget behaves during a Claude Code session), not a product or schema decision. It lives here in §14 rather than Brief §13 for the same reason as R16 and R22. Brief §13 carries a cross-reference to this entry.

### R28 — SECURITY DEFINER RPCs Must Revoke Public/Anon Execute (cross-reference)
Documented in Brief §13 R28. Referenced here for R-number continuity. Core rule: after creating any SECURITY DEFINER function, immediately REVOKE EXECUTE from PUBLIC and anon; GRANT EXECUTE to authenticated only. Verify via pg_proc.proacl check. Confirmed failure mode found in 30BN-5.3 and fixed retroactively in ADMIN.13. See §6 for the required verification query and §10 for the grep/query check.

### R29 — revalidatePath() Required After Every Mutation (cross-reference)
Documented in Brief §13 R29. Referenced here for R-number continuity. Core rule: every server
action that mutates data must call revalidatePath() for all routes that display that data.
Without it, Next.js serves stale cached Server Component renders. Never call revalidatePath()
in a 'use client' file. Confirmed failure modes:
- Show status change not reflected on /shows (VERIFY-1 C9) — fixed ADMIN.14
- Slot count not updating after claim (VERIFY-4) — fixed ADMIN.14
- createForm() missing revalidatePath('/crew/forms') — fixed ADMIN.17-FIX/ADMIN.19
- updateForm() missing revalidatePath calls — fixed ADMIN.17-FIX
- markAttendance() missing revalidatePath calls — fixed ADMIN.19
See §10 for the grep check and §11 for the checklist item.

### R30 — Theme Toggle Must Target document.body (cross-reference)
Documented in Brief §13 R30. Referenced here for R-number continuity. Core rule: the
data-theme attribute driving the Tailwind @variant dark rule must be set on document.body,
not on an inner wrapper element. Both ThemeProvider.tsx and the inline script in the crew
layout must target document.body explicitly. The ThemeProvider effect must include the current
theme in its dependency array. Confirmed failure mode: dark→light toggle required a hard reload
(VERIFY-1 A4). Fixed in ADMIN.14.

---

*This document must be updated whenever a new standing rule is agreed upon.*
*Version history:*
*v1.0 (July 2026 — initial)*
*v1.1 (July 2026 — Phase 1 complete: R16 (no browser verification in Claude Code) and R17 (shadcn var() injection revert) added in new §14 — deviation from §12 protocol, kept here rather than Brief §13 per owner decision; shadcn color class grep check added to §10; Vercel preset and shadcn tailwind.config checks added to §11; ADMIN/DOC numbering convention clarified in §3; Phase 1 marked complete and Document & Admin Prompts log added in §13)*
*v1.2 (July 2026 — Phase 2 complete: build report timing convention added to §8; Phase 2 marked complete in §13; DOC.1/DOC.2 added to prompt log)*
*v1.3 (July 2026 — Phase 3 complete: step tracker convention added to §8; new grep checks and post-build checklist items added to §10 and §11; ADMIN.1–ADMIN.7 and DOC.3–DOC.4 added to prompt log; Phase 3 marked complete; Phases 4 and 5 updated with new prompt slots 4.4 and 5.3; R19–R22 cross-references added to §14)*
*v1.4 (July 2026 — Phase 4 complete: step tracker re-emit behavior corrected (R27), admin client public-read use case documented (§7), src/ path errors fixed in grep checks (§10), R23/R26 grep checks added (§10), R23/R26 post-build checklist items added (§11), Phase 4 marked complete in §13, ADMIN.8–ADMIN.12 and DOC.5–DOC.6 added to prompt log, R23–R27 added to §14)*
*v1.5 (July 2026 — Phase 5 complete: SECURITY DEFINER privilege verification added to §6, getServerClient vs getAdminClient distinction clarified in §7 (confirmed pattern from 5.3 Q1), DB-query verification pattern added to §8 (established ADMIN.13), R28 pg_proc.proacl check added to §10, env var count updated to six and R28 checklist item added to §11, Phase 5 marked complete and ADMIN.13/DOC.7/DOC.8 added to prompt log in §13, R28 cross-reference added to §14)*
*v1.6 (July 2026 — Phases 6 and 7 complete: revalidatePath grep check added to §10 (R29), drag-library guard grep check added to §10 (Phase 6 decision), R29/drag-library checklist items added to §11, Phases 6 and 7 marked complete in §13, ADMIN.14/DOC.9/DOC.10 added to prompt log in §13, R16 clarified with verification session pattern in §14, R29/R30 cross-references added to §14)*
*v1.7 (July 2026 — Phases 8–10 complete, ADMIN.15–19: §1 unchanged; §4 migration example corrected (002 filename); §5 read/audit session and FIX prompt patterns added; §6 Call Board RLS exception + "RLS Always True" advisory note added; §7 Call Board third client context documented; §8 lint capture rule and read-only build report format added; §10 R12 grep updated, lint baseline check added, window.location check added, hours_confirmed check added; §11 four new checklist items added; §12 batching pattern documented; §13 ADMIN.15–19 + DOC.11–13 logged, Phases 8–10 marked complete, Beta phases 18–20 added; §14 R12 cross-reference stub added, R29 additional failure modes added; DOC.14 logged)*
*v1.8 (July 2026 — 9.2 and 10.1 build corrections: §7 server-only file split pattern documented (lib/milestones-shared.ts); §7 DST-aware date filtering note added; §13 9.2 entry corrected (lib/milestones-shared.ts, acknowledgeMilestone audit in 10.1 not 9.2, CTA destination); §13 10.1 entry corrected (Slot Claims group, DST-aware dates, changePassword getAdminUser gap, settings hub card); DOC.16 logged)*
*Cross-reference: 30BN_BRIEF_v1.md v1.9*
