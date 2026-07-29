# 30 By Ninety Theatre — Build Governance
## 30BN_PROCESS_v1.md — v4.0
### Created: July 2026 | Last Updated: July 2026 — v4.0 (Phase THEME complete — THEME.A through THEME.3b-4; lightenHex() server-side hex computation pattern; @react-pdf/renderer createStyles() factory pattern; resolveEmailSettings() brand params; new grep checks + checklist items; Phase 19+21 pre-launch; prompt log updated)

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

**Phone normalization at all write paths (established
ADMIN.21):**
All phone values written to or compared against the
database must be passed through `normalizePhone()` from
`lib/utils/phone.ts` before the DB operation. This
applies to: volunteer signup (submitVolunteerForm()),
volunteer update (updateVolunteerInfo()), slot claiming
(submitClaim()), admin profile edit (updateVolunteer()),
and the Call Board lookup (lookupVolunteer() in both
lib/actions/callboard.ts and lib/actions/volunteers.ts).
Never use an inline `.replace(/\D/g, '')` call in any
of these paths — the shared utility is the single source
of truth. Display formatting uses `formatPhone()` from
the same file. Both functions are pure (no DB calls, no
imports) and safe to call from any context.

**Calendar server actions use `getServerClient()` (established CAL.5a):**
All server actions in `lib/actions/calendar.ts` (`createCalendarEvent()`, `updateCalendarEvent()`,
`approveCalendarEvent()`, etc.) use `getServerClient()` — they are always invoked from
authenticated admin sessions. The same rule applies as `sendShowNotifications()`: calendar
actions are Production Crew actions, not public-facing actions, so the session exists and RLS
should apply.

**Utility functions accept supabase client as parameter (established CAL.3):**
`syncShowDateToCalendar(showDateId, supabase)` in `lib/actions/calendar-sync.ts` and
`hasConflict()` / `hasConflictWithBuffer()` in `lib/utils/calendar-conflict.ts` all receive the
Supabase client as a parameter from the calling action rather than constructing their own. This
is the correct pattern for utility functions that need DB access — the caller constructs the
client once and passes it in. Never create a Supabase client inside a utility function called
from a server action.

**`lib/utils/calendar-availability.ts` is pure client-safe (established CAL.4b):**
`getAvailableWindows()`, `getMonthGridDays()`, and `getWeekGridDays()` make no DB calls and have
no server-only imports. They are safe to import from Client Components — same pattern as
`lib/milestones-shared.ts`. The grid helpers use UTC-anchored date math to avoid timezone-
dependent behavior from `date-fns` primitives like `startOfMonth()` which silently depend on
the runtime's local timezone.

**`lib/utils/calendar-recurrence.ts` is pure client-safe (established CAL.10a):**
`generateOccurrenceDates()` and `describeRecurrence()` make no DB calls and have no server-only
imports. Safe to import from Client Components — required for the live N-events preview in
`CalendarRecurringEventForm`. Same pattern as `calendar-availability.ts`. The functions use
`date-fns` `addWeeks()`, `addMonths()`, `parseISO()`, `format()` — all pure, no timezone runtime
dependency.

**`lib/utils/calendar-layout.ts` is pure client-safe (established CAL.9):**
`computeColumnLayout()` and `computeEventPosition()` make no DB calls and have no server-only
imports. Used by `UnifiedWeekGrid.tsx` (Client Component) for the column-splitting algorithm and
absolute-position math. The `EventWithLayout` type is exported from this file. Safe to import
from any Client Component.

**iCalendar route handlers use `getAdminClient()` (established CAL.7):**
`/api/calendar/feed.ics/route.ts` and `/api/calendar/claim.ics/route.ts` use `getAdminClient()` —
these are public or token-authenticated route handlers with no Supabase Auth session. The feed
route authenticates via a per-admin `calendar_subscription_token` (UUID stored in `admin_users`).
The claim route authenticates via `claim_token` on `slot_claims`. This is the fourth sanctioned
`getAdminClient()` use case alongside: (1) Super Admin account creation (auth.admin.* calls),
(2) Call Board session context, (3) public/cron routes. Never use `getServerClient()` in these
route handlers — no session cookie exists to read.

**Public-route action file invariant (established 14.1):**
Files that serve public token-gated routes (no Supabase Auth session) must use
`getAdminClient()` exclusively. The canonical examples are `lib/actions/checkin.ts`
(public check-in page) and `lib/actions/consent.ts` (public consent upload page).
Both files carry a header comment documenting this invariant:

```typescript
// PUBLIC ROUTE — getAdminClient() only, never getServerClient()
```

Never add `getServerClient()` to these files. If an authenticated-session action is
needed for the same domain (e.g., an admin-side check-in roster fetch), create a
separate `*-admin.ts` sibling file that uses `getServerClient()`. The two files must
never be merged.

Pattern: `lib/actions/checkin.ts` (public, `getAdminClient()`) +
`lib/actions/checkin-admin.ts` (authenticated, `getServerClient()`). This split was
established in Phase 14 and confirmed again in Phase 15.2.

**`createUser()` auth.admin exception (confirmed ADMIN.26):**
`lib/actions/users.ts` `createUser()` must keep `getAdminClient()` for the two Supabase Auth Admin
API calls: `auth.admin.createUser()` and `auth.admin.deleteUser()`. These require the service
role key and cannot function on `getServerClient()` regardless of RLS policy. This is the
established sanctioned exception documented in Brief §7. All `admin_users` table reads/writes
within `createUser()` should use `getServerClient()` — only the two `auth.admin.*` calls require
`getAdminClient()`. Confirmed during ADMIN.26 Task A audit.

**Content-Disposition headers must use fixed filenames (established ADMIN.26):**
HTTP `Content-Disposition: attachment; filename="..."` headers must never interpolate
user-supplied or DB-sourced values (show names, volunteer names, etc.) into the filename field.
If a show name contains a `"` character, interpolation corrupts the header value. Always use a
fixed, safe filename: `'Content-Disposition': 'attachment; filename="volunteer-call.ics"'`
Confirmed failure pattern in CAL.7 F2: `filename="${show.name}.ics"` — fixed in ADMIN.26 to
`filename="volunteer-call.ics"`. Applies to all iCalendar routes and any other route handler
that generates downloadable files.

**Owner Admin role guard pattern (established and built SETUP.0):**
After Migration 023 / SETUP.0 ships and the `owner_admin` role exists, role guards throughout the codebase must be evaluated:

Operational features (email blast, attendance marking, show management, Settings hub sub-pages, email activity, audit log, location management, category management, user management, calendar admin): guards should pass `owner_admin` through alongside `super_admin`. Pattern: `role === 'super_admin' || role === 'owner_admin'` — or equivalently, checking that `role !== 'viewer' && role !== 'production'`.

EXCEPTIONS that remain Super Admin only: (1) `/crew/settings/setup` and all its server actions — middleware hard-blocks Owner Admin at route level. (2) Assigning or creating `super_admin` accounts — Owner Admin can create and manage Editor, Viewer, Production, and Owner Admin accounts, but cannot create or deactivate Super Admin accounts. (3) The `calendar_editor` toggle on Super Admin accounts (DB CHECK constraint prevents this). Updated ADMIN.33: OA can now create/assign OA accounts and deactivate other OA accounts. Super Admin is the only remaining account-creation privilege exclusive to Super Admin.

When writing a SETUP.0 role guard sweep prompt, every `role === 'super_admin'` check must be evaluated individually — most should become `['super_admin', 'owner_admin'].includes(role)` but the exceptions above must stay as `role === 'super_admin'`.

**P-DC upload pattern for file uploads (established 15.2):**
All file uploads use the P-DC (presigned-direct-client) pattern to bypass Vercel's
4.5MB serverless function body limit (R9). Never route file bytes through Server
Actions or route handlers. The two-step flow:

1. Server action generates a signed upload URL:
   `supabase.storage.from('media').createSignedUploadUrl(path)`
   Returns `{ signedUrl, path }` to the client.

2. Client PUTs the file directly to `signedUrl` using `XMLHttpRequest` (not `fetch`)
   when upload progress tracking is needed. `XHR.upload.onprogress` is the only
   browser-native way to report file upload progress — this is the one sanctioned
   use of XHR in this project and must include a comment explaining the deviation.

3. Client calls a confirmation server action with the `path`. The action records the
   storage path in the DB.

Two sanctioned storage buckets exist in this project:

`media` (private) — all platform media files. Signed URLs required for access. Namespaced paths:
- `consent-forms/[volunteer_id]/[submission_id]/` — consent form uploads
- `library/[folder_id]/[document_id]/` — media library files
- `attachments/[type]/[record_id]/[document_id]/` — show/rehearsal/audition attachments

`brand` (public) — brand asset files uploaded via the Setup Panel. Direct URL access without auth. Namespaced paths:
- `brand/logo/[uuid].png` — org logo uploads
- `brand/favicon/[uuid].png` — favicon uploads

`media` reads go through the `/documents/[token]` redirect route (access tier + signed URL generation). `brand` files are served directly via public URL — never through the redirect route (they're intentionally public). Never use `brand` for any access-controlled content. Never use `media` for brand assets that must be publicly accessible on landing pages.

**Never create a client inside a loop.** Create once per function, reuse.

**Feature flag pattern via getFeatureFlags() (built SETUP.1):**
All feature flag values must be read through `getFeatureFlags()` in `lib/feature-flags.ts`. This helper fetches all `feature_*` keys from `app_settings` in a single query and returns a typed object (`FeatureFlags`). Never read individual feature flag keys inline from `app_settings` — always use the shared helper. Key rules:

`getFeatureFlags()` uses `getServerClient()` — always called from Server Components or Server Actions with an active admin session. For public routes that need feature flags, use `getAdminClient()` (no session context on public routes). For `proxy.ts` (middleware context), use `getAdminClient()` — no cookie session in Edge runtime.

Middleware (`proxy.ts`) checks flags for route-level blocking. Flags are fetched conditionally — only when the request path matches one of the five guarded routes — not on every request. This avoids a DB call on every page load.

Sidebar conditionally renders links based on flags passed as props from the crew layout.

The typed return object prevents key-name typos and handles missing keys consistently. Missing keys default to `!== 'false'` (i.e., missing = enabled — never silently disables a feature).

Active feature flags (three only — core features are not flagged): `feature_calendar`, `feature_checkin`, `feature_blast`. `feature_opportunities`, `feature_hours_milestones`, `feature_documents` were deleted in Migration 026 — those are core features.

Any new prompt adding a feature-flagged route or component must import and call `getFeatureFlags()` — never a direct `app_settings` query for `feature_*` keys. See R34 in Brief §13 for the full flag-ready requirement.

Enforced from SETUP.1 onward. See R32 in Brief §13 and §10 grep check.

**`lib/actions/setup.ts` dual-client pattern (built SETUP.2):**
Setup Panel settings mutations (`saveOrgIdentity()`, `saveBrandColors()`, `saveLogoUrl()`, `saveFaviconUrl()`, `saveEmailConfig()`, `saveFeatureFlags()`, `saveInstanceLabel()`) use `getServerClient()` — always called from authenticated Super Admin sessions. Same principle as calendar actions (CAL.5a) and blast actions (13.3a).

Single exception: `getSignedBrandUploadUrl()` uses `getAdminClient()` for the Supabase Storage `createSignedUploadUrl()` call. The Storage Admin API requires the service role key regardless of session context. This is the only server action file in the project that uses both clients. Do not "normalize" by switching everything to one client — the dual-client pattern here is intentional and correct.

**Conditional zod schema factory pattern (established 14.1-FIX):**
When a zod schema has field requirements that depend on a runtime flag (e.g.,
`age_range` required when `showAgeRange = true`, optional when false), implement the
schema as a factory function rather than a static export:

```typescript
// WRONG — static schema ignores runtime flag
export const checkInSignupSchema = z.object({ ... })

// CORRECT — factory function
export function createCheckInSignupSchema(showAgeRange: boolean) {
  return z.object({
    age_range: showAgeRange
      ? z.string().min(1, 'Required')
      : z.string().optional(),
    // ...
  })
}
export type CheckInSignupInput =
  z.infer<ReturnType<typeof createCheckInSignupSchema>>
```

The factory must be used in BOTH locations:
- Client component: `zodResolver(createCheckInSignupSchema(showAgeRange))`
- Server action: `createCheckInSignupSchema(showAgeRange).safeParse(formData)`

A static schema that ignores the flag is a server-side validation gap even if the
client validates correctly. Confirmed failure mode caught in 14.1-FIX: the static
schema was accepting missing `age_range` on the server even when `showAgeRange` was
true.

**FK replacement migration pattern (established CAL.1):**
When a text CHECK constraint column is replaced by a FK to a new lookup table (e.g.,
`show_type` text → `location_id` FK to `locations`), the migration must follow this order:
1. Create the lookup table and seed its rows.
2. Add the FK column as nullable.
3. Backfill via `UPDATE ... SET fk_col = (SELECT id FROM lookup WHERE name = CASE old_col
   WHEN ... END)`.
4. Verify zero nulls remain: `SELECT COUNT(*) FROM table WHERE fk_col IS NULL` — abort with
   `RAISE EXCEPTION` if any are found.
5. Set NOT NULL on the FK column.
6. Add FK index.
7. Drop the old text column.
The RAISE EXCEPTION safety guard in step 4 is mandatory — it prevents silent data loss if any
rows had an unmapped value. Confirmed in CAL.1 Migration 016.

**`detectLinkType()` independence — recognized DRY exception (established 15.3/15.4):**
Three independent implementations of `detectLinkType()` (and related helpers
`isViewableMimeType()`, `isPlayable()`, `getPlayLabel()`) exist across the codebase:
- `app/documents/[token]/route.ts` — server-side route handler
- `components/crew/media/MediaLibrary.tsx` — `'use client'` Client Component
- `app/documents/view/[token]/page.tsx` — Server Component

This triplication is intentional and correct. The server/client boundary prevents
sharing a single implementation:
- A `'use client'` file cannot import from a server-only module
- A server module cannot be imported into a Client Component import chain without
  a `*-shared.ts` extraction — and these helpers have no server-only deps, but
  extracting them to a shared file adds complexity for three functions that are
  short and stable
- The route handler, the Client Component, and the Server Component all need
  slightly different behavior (the route handler redirects; the Client Component
  determines button labels; the Server Component renders the player)

Do not attempt to extract `detectLinkType()` to a shared utility. If the link
classification logic changes in the future, update all three locations. This is a
documented exception to the project's DRY principle — similar in rationale to the
`lib/milestones-shared.ts` split (§7), but applied differently because the three
contexts have divergent outputs.

**`lib/data/*.ts` parameter-passing pattern (confirmed 15.1, from showReport.ts):**
Data utility functions in `lib/data/` receive the supabase client as a parameter.
They never construct their own client. Pattern: `getCheckInDashboardData(supabase)`,
`getPostShowReportData(showId, supabase)`. Page Server Components construct
`getServerClient()` once and pass it in. Server Actions that need to call data
utilities must construct their own client internally — a raw Supabase client cannot
be passed across the client/server boundary. This is the same principle as
`syncShowDateToCalendar(showDateId, supabase)` in calendar-sync.ts.

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

**Commit and push before delivering the build report (established CAL.5b):**
Every build prompt must commit and push to origin/main before delivering the build report. The
build report describes what was actually deployed, not what was planned. Every prompt's closing
instruction block must include: "After completing all tasks, commit and push before delivering
the build report."

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

**Content-heavy pages and the react/no-unescaped-entities lint rule (established 12.2b Q1):**
When writing JSX for content-heavy pages (help pages, documentation, long prose sections) that contain apostrophes or quotes, use template literal expressions rather than raw JSX text to avoid lint errors:
- Wrong: `Don't forget to save.` (apostrophe in raw JSX text triggers lint error)
- Correct: `{"Don't forget to save."}`
This is not a content change — the rendered output is identical. It's a JSX authoring convention required to maintain the zero-error lint baseline. The `react/no-unescaped-entities` ESLint rule enforces this. Applies to any page with significant prose content. See §11 checklist.

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

**Live Task Tracking Convention (required from v1.3 onward, updated Phase 12):**
Every build prompt must enable live task tracking. Use the following instruction in the prompt after the SCOPE section:

```
Enable live task tracking for this build:

Task A: [first task]
Task B: [second task]
Task C: [third task]
```

Tasks use letters (A, B, C...) rather than numbers to avoid confusion with numbered steps elsewhere in the prompt. Claude Code updates the tracker natively as work proceeds — no "declare at session start" or "update in place" instruction needed.

**The tracker is a single persistent element.** It must not be re-emitted or repeated after individual tasks. Claude Code manages live-update behavior natively. Prompts must not include instructions to re-emit the tracker. See R27.

Note: earlier prompts used "Step tracker: ☐ Step 1" format. Both formats work; the lettered task format is the current standard.

**All build prompts must be contained in a single fenced code block (established 13.3b/13.4a):**
Every build prompt must be delivered as a single fenced code block — not as a Session Starter Block followed by a separate prompt block. The doc-read instruction ("Before writing any code, read these two files...") and the full prompt content (SCOPE, TASK A, TASK B, etc., Quality Gate, Build Report format) must all appear inside one continuous fenced code block. Splitting them into two blocks creates ambiguity: it implies the session starter is a standalone step that can be skipped or separated from the build context, which undermines its purpose. This rule was confirmed as a correction during Phase 13 after multiple prompts were flagged for having the session starter as a separate block. The owner's direction: "all prompts must be completely contained within a single code block." Applies to all future prompts including DOC and ADMIN prompts.

**XHR over fetch for upload progress (established 15.2; extended 15.3, SETUP.2):**
The project's default HTTP pattern is `fetch()`. There are three sanctioned deviations,
all in file upload components with progress tracking:
- `components/consent/ConsentUploadForm.tsx` — consent form upload (established 15.2)
- `components/crew/media/MediaLibrary.tsx` — media library file upload (established 15.3)
- `components/crew/settings/BrandImageUploader.tsx` — brand asset upload / logo + favicon (SETUP.2)

`fetch()` does not support upload progress events in any browser. `XHR.upload.onprogress`
is the only browser-native way to report real-time upload progress to the user. Any
component using XHR must include a comment explaining this deliberate deviation:

```typescript
// XHR used instead of fetch() — fetch() does not support upload progress events.
// xhr.upload.onprogress is the only browser-native way to report upload progress.
```

This is not a mistake to be "fixed." Do not replace XHR with fetch in upload progress
contexts. All other HTTP in this project uses fetch().

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
# Must return zero results. window.location is only
# valid for navigation away to an external URL —
# never for in-place re-renders after mutations.
# The CategoriesTable.tsx reload() was the last
# known use case; fixed in 12.1 (router.refresh()).

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

```bash
# Confirm show_type has been fully removed from the
# codebase (CAL.1 — column dropped in Migration 016)
# Any hit after CAL.1 is a regression
grep -rn "show_type\|ShowType\|showType" \
  app/ components/ lib/ types/ \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next
# Must return zero results (except historical comments
# in 001_core_schema.sql which need not be changed)
```

```bash
# Confirm no inline phone stripping outside
# lib/utils/phone.ts (ADMIN.21 — R pattern)
# All normalization must use normalizePhone()
grep -rn "replace(/\\D" \
  lib/actions/ app/actions/ \
  --include="*.ts" --include="*.tsx"
# Must return zero results. Any hit means a write
# path is normalizing inline instead of using the
# shared utility — fix before committing.
```

```bash
# Confirm normalizePhone() called before all
# calendar_event_contacts inserts (CAL.5a pattern —
# contacts store phone as digits-only, same as
# volunteers.phone and slot_claims.volunteer_phone)
grep -n "calendar_event_contacts" \
  lib/actions/calendar.ts
# Review every INSERT path — confirm normalizePhone()
# is applied to the phone value before insert.
# (Confirmed: createCalendarEvent() and
# createRehearsalBatch() both normalize via .map())
```

```bash
# Confirm blast body is sanitized before email payload
# build (R31 / 13.4a) — sanitizeHtml() must be called on
# the body param in sendBlastEmail() before it reaches
# buildBlastEmailHtml() — not escapeHtml()
grep -n "sanitizeHtml\|sanitize-html" lib/actions/blast.ts
# Must show: import at top + call site in sendBlastEmail()
# Any absence means TipTap HTML reaches the email
# template unsanitized.
```

```bash
# Confirm logEmailSent() is not exported from
# lib/email.ts (13.1 pattern)
grep -n "export.*logEmailSent" lib/email.ts
# Must return zero results — logEmailSent is internal only.
```

```bash
# Confirm proxy.ts exists and middleware.ts is gone (ADMIN.28)
# Next.js 16 renamed the middleware convention to proxy
ls proxy.ts 2>/dev/null || echo "proxy.ts MISSING — check for middleware.ts"
ls middleware.ts 2>/dev/null && echo "middleware.ts STALE — should have been renamed to proxy.ts"
```

```bash
# Confirm feature flags read through getFeatureFlags() (R32 / SETUP.1)
# Only three active flags remain after Migration 026:
#   feature_calendar, feature_checkin, feature_blast
# (feature_opportunities, feature_hours_milestones, feature_documents deleted — core features)
grep -rn "feature_calendar\|feature_checkin\|feature_blast" \
  app/ components/ lib/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "feature-flags.ts" \
  | grep -v "setup.ts" \
  | grep -v "SetupPanel.tsx"
# SetupPanel.tsx uses these key strings as FormData keys in the
# toggle UI — sanctioned. All other hits = R32 violation.
# Must return zero results.
```

```bash
# Confirm Owner Admin role guards are correct (Phase SETUP.0 sweep)
# After SETUP.0: any super_admin-only guard outside /crew/settings/setup
# and account creation is likely missing owner_admin
grep -rn "role === 'super_admin'\|role !== 'super_admin'" \
  lib/actions/ app/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "setup"
# Review every hit. After ADMIN.33, legitimate remaining hits are:
#   - createUser() super_admin-assignment guard (only SA can
#     create SA accounts — OA can create OA, editor, viewer,
#     production but NOT super_admin)
#   - approveRegistration() super_admin-assignment guard (same)
#   - deactivateUser() super_admin target guard (no one can
#     deactivate a super_admin account)
#   - /crew/settings/setup action guards and proxy.ts block
# Any other hit outside the above is likely an unswept guard
# that should use ['super_admin','owner_admin'].includes(role).
```

```bash
# Confirm storage uses only the two sanctioned buckets (SETUP.2)
# Sanctioned: 'media' (private, all platform files)
#             'brand' (public, Setup Panel brand assets)
grep -rn "\.storage\.from(['\"]documents['\"])" \
  app/ lib/ components/
# Must return zero results — 'documents' bucket was never built
# (superseded in Migration 025). Any hit is a stale reference.

grep -rn "\.storage\.from(" \
  app/ lib/ components/
# Review ALL hits. Only 'media' and 'brand' are sanctioned.
# Any other bucket name is a bug.
```

```bash
# Confirm no getServerClient in public-route action files
# (public-route invariant — established 14.1 / 15.2)
grep -n "getServerClient" \
  lib/actions/checkin.ts \
  lib/actions/consent.ts
# Must return zero results. These files are public-route
# only — getAdminClient() throughout. Any hit is a
# security violation.
```

```bash
# Confirm XHR usage is intentional (established 15.2/15.3/SETUP.2)
grep -rn "XMLHttpRequest\|new XHR" components/ app/
# Sanctioned XHR locations (upload progress tracking — three total):
#   - components/consent/ConsentUploadForm.tsx (15.2)
#   - components/crew/media/MediaLibrary.tsx (15.3)
#   - components/crew/settings/BrandImageUploader.tsx (SETUP.2)
# All three use XHR because fetch() does not support upload
# progress events. All must include the deviation comment.
# Any hit outside these three files requires review.
```

```bash
# Confirm proxy.ts matcher includes all guarded routes (SETUP.1 F1)
# When adding flag guards or role blocks to proxy.ts, the matcher
# array must include the paths being guarded — guards on unmatched
# paths never fire. Confirmed failure mode: flag guards for /calendar
# and /checkin/* were added but the matcher didn't include public
# routes, so guards were silently skipped. Fixed SETUP.1.
grep -n "matcher" proxy.ts
# Review output. Matcher must include:
#   /crew/:path* (admin routes)
#   /calendar (feature_calendar public guard)
#   /checkin/:path* (feature_checkin public guard)
# And any other paths that have active flag or role guards.
# Any guarded path absent from the matcher = silent no-op.
```

```bash
# Confirm FROM_ADDRESS and REPLY_TO constants are gone
# (ADMIN.34 — deleted; payload builders use inline defaults)
grep -rn "FROM_ADDRESS\|REPLY_TO" \
  lib/ app/ components/ \
  --include="*.ts" --include="*.tsx"
# Must return zero results. These constants were deleted
# in ADMIN.34. Any hit = a regression or stale reference.
# The 4 payload builders (buildReminderEmailPayload,
# buildThankYouEmailPayload, buildShowBulkEmailPayload,
# buildCategoryMatchNotificationPayload) now accept
# from?: string and replyTo?: string params with inline
# '30BN defaults' string literals as fallback.
```

```bash
# Confirm no brand static Tailwind token classes in new
# code after THEME.1 (R33 / THEME.1 — complete)
# After THEME, brand-driven colors in the web UI must
# use the @layer utilities classes (bg-brand-primary,
# text-brand-accent, etc.) — not the static @theme tokens.
grep -rn "bg-navy\|text-navy\|border-navy\|ring-navy\
|bg-orange\|text-orange\|border-orange\|ring-orange\
|bg-steel\|text-steel\|border-steel\|bg-light-navy\
|text-light-navy\|bg-pale-orange\|text-slate" \
  app/ components/ \
  --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules\|\.next"
# Must return zero results. Any hit in new code after
# THEME ships is an R33 violation. Exception: if a hit
# is in a KNOWN categorical exception (fixed to arbitrary
# hex like bg-[#293994]) it will not appear in this grep
# since that grep pattern searches for token names, not hex.
```

```bash
# Confirm no hardcoded brand hex in email templates
# (THEME.3/THEME.3b — brand colors must be dynamic)
grep -n "#293994\|#F26522\|#f26522\|#EEF1FA\|#eef1fa" \
  lib/email.ts \
  lib/actions/blast.ts
# Acceptable remaining hits — ONLY these:
#   lib/email.ts: the two fallback default strings inside
#   resolveEmailSettings() (brandPrimary || '#293994' and
#   brandAccent || '#F26522'). brandPrimaryLight is computed
#   from brandPrimary via lightenHex() — no #EEF1FA literal.
# Any other hit outside resolveEmailSettings() fallbacks
# is a hardcoded brand color — must be replaced with the
# dynamic value from resolveEmailSettings().
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
□ Any new write path that stores or compares phone values:
  confirm normalizePhone() from lib/utils/phone.ts is
  called before every DB insert, update, or query
  comparison. No inline .replace(/\D/g, '') anywhere
  outside phone.ts itself. (ADMIN.21 pattern)
□ Any new page containing internal navigation links
  (e.g. links to /, /crew/dashboard, or any in-app
  route): use next/link, never plain <a> tags. Plain
  <a> on internal routes triggers the
  @next/next/no-html-link-for-pages lint rule and breaks
  the zero-error lint baseline. R19's concern
  (tailwind-merge / Button component) does not apply to
  next/link. (Pattern established 30BN-11.1 F1)
□ Any new bulk email send (more than one recipient): use
  the shared sendBatchEmails() helper in lib/email.ts
  rather than duplicating the chunk-100 loop directly
  in the server action. Both sendShowNotifications() and
  sendShowBulkEmail() delegate to this helper.
  (Pattern confirmed ADMIN.23 — see R8 for the
  underlying resend.batch.send() requirement)
□ Any new public-facing form that creates or updates
  data: confirm a honeypot hidden input is present in
  the form component (name="website", positioned
  off-screen via CSS — NOT display:none, uncontrolled
  ref pattern) and the server action silently returns
  a fake success response when the field is non-empty,
  before any validation or DB work. Never reveal the
  honeypot's existence in error messages. (Pattern
  established 30BN-12.1 — applied to all 4 public
  form surfaces)
□ Any new page or component with significant prose
  content containing apostrophes or quotes in JSX
  text: use template literal expressions ({"text"})
  rather than raw JSX text to avoid the
  react/no-unescaped-entities lint error and maintain
  the zero-error lint baseline. (Established 12.2b Q1)
□ Any calendar event mutation (createCalendarEvent,
  updateCalendarEvent, approveCalendarEvent,
  cancelCalendarEvent, createRehearsalBatch): confirm
  revalidatePath('/crew/calendar') AND
  revalidatePath('/crew/calendar/pending') are both
  called. Both routes display calendar data and both
  must be invalidated after every calendar mutation.
  (CAL.5a pattern — two routes, not one)
□ Any new calendar contact insert (calendar_event_contacts
  rows): confirm normalizePhone() from lib/utils/phone.ts
  is called on the phone value before insert. Same
  digits-only storage rule as volunteers.phone and
  slot_claims.volunteer_phone. (CAL.5a pattern)
□ Any new event type selector in the calendar UI:
  confirm 'performance' is excluded from the available
  options. Performance events are auto-generated from
  shows via syncShowDateToCalendar() and must never
  be created manually. (CAL.5a confirmed behavior)
□ Any new route handler that returns a downloadable
  file (iCalendar, PDF, CSV, etc.): confirm the
  Content-Disposition header uses a fixed, safe
  filename — never interpolate show names, volunteer
  names, or any DB-sourced string into the filename
  field. A `"` character in a show name will corrupt
  the header. Pattern: `filename="fixed-name.ext"`
  (ADMIN.26 / CAL.7 confirmed failure mode)
□ Any new email send function added to lib/email.ts:
  confirm logEmailSent() is called AFTER the Resend
  send succeeds (never before), sentBy is null for
  system-triggered sends, and the call is wrapped so
  logging failures are swallowed and never block email
  delivery. (13.1 pattern)
□ Any new blast or communication send path that accepts
  TipTap HTML as body content: confirm sanitizeHtml()
  from sanitize-html is applied to the body before it
  reaches the email template. Never use escapeHtml()
  on TipTap HTML — it will encode angle brackets and
  corrupt the HTML structure. See R31. (13.4a pattern)
□ Any new 'use client' component with user-input fields:
  confirm no <form> elements are used. All state must
  be managed via controlled inputs and onClick handlers.
  (13.3a confirmed constraint)
□ Any new server action or page guard that restricts
  access by role: evaluate whether it should pass
  owner_admin through alongside super_admin. After
  ADMIN.33, only the Setup Panel (/crew/settings/setup)
  and super_admin account creation/deactivation remain
  super_admin-exclusive. Owner Admin can now create and
  manage Editor, Viewer, Production, and Owner Admin
  accounts. All other operational guards should use
  ['super_admin','owner_admin'].includes(role) or
  equivalent. (Owner Admin role guard pattern — §7)
□ Any route or component that reads feature flag values:
  confirm it uses getFeatureFlags() from lib/feature-
  flags.ts — never reads feature_* keys inline from
  app_settings. (R32 / §7 feature flag pattern)
□ Any new recurring event creation: confirm
  createRecurringEvent() uses generateOccurrenceDates()
  from lib/utils/calendar-recurrence.ts for date
  generation. Confirm all calendar_events rows
  created have recurrence_group_id set to the new
  recurrence_groups.id. Never generate occurrence
  dates with inline date arithmetic — the shared
  utility handles month-end edge cases (Jan 31 +
  1 month → Feb 28/29) and the 12-month cap.
  (CAL.10a pattern)
□ Any recurring event edit or cancel: confirm the
  scope ('this' / 'future' / 'all') is honored
  correctly. 'this' scope edit must detach the
  occurrence from the series (recurrence_group_id →
  null). 'future' scope must only affect events with
  start_time >= the target event's start_time. 'all'
  scope cancel must also set recurrence_groups.status
  = 'cancelled'. (CAL.10a–c pattern)
□ Any new file upload path: confirm P-DC pattern is
  used (signed URL from server action → client PUT to
  Supabase Storage → confirmation server action records
  path in DB). Never route file bytes through Server
  Actions or route handlers (Vercel 4.5MB serverless
  limit — R9). (15.2 pattern)
□ Any new public-route server action file (no session
  context): confirm getAdminClient() only throughout.
  Add file-level header comment:
  "// PUBLIC ROUTE — getAdminClient() only, never
  getServerClient()". Create a separate *-admin.ts
  file for any authenticated-session counterparts.
  Never merge public-route and admin-session actions
  into the same file. (14.1 / 15.2 invariant)
□ Any new storage operation: confirm bucket is 'media'
  (not 'documents' or any other name). Confirm storage
  path is correctly namespaced within the media bucket:
  consent-forms/ for consent submissions; library/ for
  media library files; attachments/ for show/rehearsal/
  audition attachments. (15.2 established; 15.3 extends)
□ Any new attendance insert with source = 'checkin':
  confirm slot_claim_id is explicitly set — either the
  slot_claims.id for a rostered volunteer, or null for
  a walk-in (checkInNewVolunteer() path). Never omit
  slot_claim_id — the column is nullable but the value
  must be intentional. (14.1 pattern)
□ Any new zod schema with field requirements that depend
  on a runtime flag: implement as a factory function,
  not a static export. Use the factory in both the
  client zodResolver and the server action safeParse.
  A static schema that ignores the flag is a server-
  side validation gap. (14.1-FIX pattern)
□ Any new document entry type or external URL type added
  to the media library or document system: evaluate
  against detectLinkType() in app/documents/[token]/
  route.ts and isViewableMimeType() to determine
  whether it should route to the /documents/view/[token]
  player page or redirect directly to the file/URL.
  Update all three detectLinkType() implementations
  (route.ts, MediaLibrary.tsx, view/[token]/page.tsx)
  consistently — they are intentionally independent (§7
  DRY exception). (15.3/15.4 pattern)
□ Any new non-core feature (defined in R34): confirm it
  is built flag-ready at the time of initial build. Flag-
  ready requires: (1) feature_X key seeded in migration;
  (2) getFeatureFlags() updated in lib/feature-flags.ts;
  (3) proxy.ts blocks the route when flag is 'false';
  (4) sidebar link conditional on the flag; (5) public
  routes return 404 when flag off; (6) server action
  early-return when flag off. Do NOT retrofit flag-ready
  after the fact — build it right the first time. (R34)
□ Any new email send function added to lib/email.ts:
  confirm resolveEmailSettings() is called to get the
  dynamic from address, logo URL, org name, contact email,
  and brand colors — NOT hardcoded constants or strings.
  Destructure: { from, logoUrl, orgName, orgContactEmail,
  brandPrimary, brandAccent, brandPrimaryLight } from
  resolveEmailSettings(). Thread emailSettings.from into
  the Resend send call, emailSettings.logoUrl into
  buildEmailHtml(), orgName / orgContactEmail in body copy,
  and brandPrimary + brandAccent + brandPrimaryLight into
  buildEmailHtml() and buildCtaButton() calls. No hardcoded
  hex colors (#293994, #F26522, #EEF1FA) anywhere in the
  function body — only the fallback defaults inside
  resolveEmailSettings() itself are acceptable.
  (SETUP.3/ADMIN.31/ADMIN.33/ADMIN.34/THEME.3/THEME.3b)
□ Any new payload builder function (batch email, cron
  route): confirm it accepts logoUrl?: string, from?:
  string, replyTo?: string, brandPrimary?: string, and
  brandAccent?: string parameters. Pass logoUrl,
  brandPrimary, brandAccent (and brandPrimaryLight if
  the builder produces light-tint backgrounds) to
  buildEmailHtml(). Confirm the call site calls
  resolveEmailSettings() (or equivalent inline
  app_settings fetch including brand_primary +
  brand_accent) before building the payload and threads
  all dynamic values into the builder call. FROM_ADDRESS
  and REPLY_TO constants must not exist anywhere in the
  codebase — deleted ADMIN.34. Any hit = regression.
  (ADMIN.31/ADMIN.34/THEME.3 pattern)
□ Any saveFeatureFlags() call or equivalent: confirm
  revalidatePath('/crew', 'layout') is included alongside
  individual route revalidations. The layout second
  argument propagates flag changes to the sidebar
  immediately. Without it, sidebar links remain stale
  until the next full navigation. (SETUP.4 pattern)
□ Any prompt that adds flag guards or role blocks to
  proxy.ts: audit the matcher array at the TOP of
  proxy.ts FIRST. Confirm all paths being guarded are
  included in the matcher. A guard on a path not in the
  matcher silently never fires. Extend the matcher before
  writing any guard logic. (SETUP.1 F1 / §14 rule)
□ Any code that reads an app_settings value and applies
  a fallback: use || not ??. app_settings values are
  seeded as empty strings '' — ?? only catches null/
  undefined and silently produces '' for unseeded-but-
  present keys. Confirmed failure mode: ADMIN.34 F2
  caught the org_tagline metadata description using ??
  which would have produced a blank <meta> tag on any
  deployment where org_tagline is empty (the default
  seed value). Pattern: value || 'fallback'.
  (§14 || vs ?? pattern)
□ Any new email send function or email body copy added
  to lib/email.ts: confirm no hardcoded org name or
  contact email strings appear. Use orgName and
  orgContactEmail from resolveEmailSettings() for all
  references. No 'by Ninety', no 'info@30byninety.com'
  or similar in body copy — only in the resolveEmail
  Settings() fallback defaults which are the one
  acceptable location. (ADMIN.33/ADMIN.34 pattern)
□ Any new web UI code (JSX/TSX) referencing brand-driven
  colors after THEME.1 ships: use the @layer utilities
  classes defined in globals.css (bg-brand-primary,
  text-brand-accent, border-brand-primary-light, etc.)
  — never the old static Tailwind token names (bg-navy,
  text-orange, bg-steel, bg-light-navy, etc.). Structural/
  neutral colors (footer-gray, divider, dark, mid-gray,
  dark mode palette) remain as static Tailwind tokens —
  unchanged. Run the brand static class grep in §10
  after any new UI code is written. (R33 / THEME.1)
□ Any new @react-pdf/renderer PDF component: use the
  createStyles(brandPrimary, brandPrimaryLight) factory
  pattern — call StyleSheet.create() inside the factory
  function, not at module scope. Module-scope
  StyleSheet.create() runs before props are available
  and cannot be overridden at render time. Pass brand
  color props from the route handler (which fetches from
  app_settings). Provide default prop values matching
  the 30BN colors as fallback. (THEME.4 pattern / §14)
□ Any new hardcoded hex color added to lib/email.ts or
  lib/actions/blast.ts: run the brand hex grep from §10
  before committing. The only acceptable hardcoded hex
  values in these files are the fallback defaults inside
  resolveEmailSettings(). All other brand hex = violation.
  (THEME.3/THEME.3b pattern)
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
  30BN-DOC.14    ✓ Process Update v1.7 (Phases 8–10,
                   ADMIN.15–19 — see v1.7 history entry)
  30BN-DOC.15    ✓ Brief Update v1.9 (9.2 and 10.1
                   build corrections)
  30BN-DOC.16    ✓ Process Update v1.8 (9.2 and 10.1
                   build corrections)
  30BN-ADMIN.20  ✓ Dashboard Season at a Glance, Quick
                   Stats, Super Admin season selector
                   (dashboard_season_id), PDF export
                   filter fix (milestoneTier +
                   service_hours). lib/actions/settings.ts
                   created (setPinnedSeason()).
  30BN-ADMIN.21  ✓ Phone normalization — Migration 014,
                   lib/utils/phone.ts (normalizePhone() +
                   formatPhone()), all write paths updated.
  30BN-ADMIN.22  ✓ Post-show Report tab on show detail
                   (status = 'past' only).
                   lib/data/showReport.ts +
                   getPostShowReportData(). PostShowReport
                   .tsx component.
  30BN-ADMIN.23  ✓ Bulk email from show detail —
                   sendShowBulkEmail() + BulkEmailSection
                   .tsx. Dedup by email, logs to
                   email_log (recipient_type = 'category',
                   recipient_filter = 'show:{showId}').
  30BN-ADMIN.24  ✓ Communication history on volunteer
                   profile — CommunicationHistory.tsx,
                   collapsible, all roles. Migration 015
                   skipped (index pre-existed).
  30BN-DOC.17    ✓ Brief Update v2.0 (Phase 11,
                   ADMIN.20–24, comprehensive corrections)
  30BN-DOC.18    ✓ Deferred Verification Document v5
                   (Phase 11 + ADMIN.20–24 items added,
                   89 new verification items)
  30BN-DOC.19    ✓ Process Update v2.0 (Phase 11,
                   ADMIN.20–24, comprehensive corrections)
  30BN-DOC.20    ✓ Header version sync — Brief + Process
                   headers updated to v2.0 (DOC.20)
  30BN-DOC.21    ✓ Brief Update v2.1 (Phase 12 complete,
                   Alpha build complete)
  30BN-12.1      ✓ (see Phase 12 above)
  30BN-12.2a     ✓ (see Phase 12 above)
  30BN-12.2b     ✓ (see Phase 12 above)
  30BN-12.2c     ✓ (see Phase 12 above)
  30BN-12.3      ✓ (see Phase 12 above)
  30BN-12.4      ✓ (see Phase 12 above)
  30BN-DOC.22    ✓ Process Update v2.1 (Phase 12
                   complete, Alpha build complete —
                   this prompt)
  30BN-ADMIN.25  ✓ Deferred item sweep: location-aware
                   default_hours lookup (Migration 020 +
                   locations.default_hours primary path,
                   app_settings bucket fallback); buffer
                   NaN Zod preprocess fix; end time range
                   on cancel page + reminder cron; season
                   filter in CalendarFilterBar + server-
                   side fetch in calendar/page.tsx.
  30BN-CAL.1     ✓ show_type → location_id (Migration
                   016). 19-file codebase sweep. locations
                   table seeded. ShowType union removed.
                   Show form loads locations from DB (R4).
                   FK replacement migration pattern
                   established.
  30BN-CAL.2     ✓ Calendar schema foundation (Migration
                   017): rehearsal_batches, calendar_events,
                   calendar_event_contacts, show_date_buffer.
                   admin_users: production role + calendar_
                   editor. Middleware production restriction.
                   Sidebar Calendar link. types/admin.ts
                   consolidated AdminRole type.
  30BN-CAL.3     ✓ Show-to-calendar auto-sync + conflict
                   detection (Migration 018). syncShowDate-
                   ToCalendar() in lib/actions/calendar-sync
                   .ts. hasConflict()/hasConflictWithBuffer()
                   in lib/utils/calendar-conflict.ts.
                   Buffer time UI on DateRow.
                   Google OAuth production role fix.
  30BN-CAL.4a    ✓ end_time on show_dates (Migration 019).
                   DateRow End Time field. Time range display
                   on admin show detail, /shows/[id],
                   /callboard, cancel page, reminder cron.
  30BN-CAL.4b    ✓ Full /crew/calendar page. Month view,
                   weekly room-booking grid, agenda view.
                   Filter bar. CalendarLegend.tsx. Day detail
                   panel with available windows.
                   lib/utils/calendar-availability.ts
                   (pure, UTC-anchored grid helpers).
  30BN-CAL.5a    ✓ Event creation + submission forms.
                   CalendarEventForm (role-adaptive, conflict
                   detection, contacts useFieldArray).
                   lib/actions/calendar.ts: checkEvent-
                   Conflict(), createCalendarEvent(),
                   updateCalendarEvent(). lib/validations/
                   calendar.ts created.
  30BN-CAL.5b    ✓ Seed data, CalendarLegend wired,
                   CalendarShell header restructure (dropdown,
                   Pending link + badge, Book Space).
                   rehearsalBatchSchema. New actions:
                   createRehearsalBatch(), approveCalendar-
                   Event(), approveBatch(), cancelCalendar-
                   Event(), findAvailableSlots(). Bulk form.
                   Pending queue + PendingQueueClient.
                   CalendarBookSpacePanel. calendarEditor
                   fully wired. Commit-before-build-report
                   standard established.
  30BN-CAL.5b-AUDIT ✓ Post-build read-only audit (84 items:
                   60 PASS, 17 PARTIAL, 7 FAIL). Post-build
                   audit session pattern established.
  30BN-CAL.5b-FIX ✓ 6 fixes: Legend label; initialDate
                   prop; default-time state + pre-fill +
                   auto-sort on add; initialConflicts +
                   adminRole + conflict column in pending
                   queue; pending/page.tsx hasConflict
                   pre-check; findAvailableSlots slots key.
  30BN-CAL.5b-FIX2 ✓ handleApproveSingle() fallback to
                   event.location_id via second parameter.
  30BN-DOC.25a   ✓ Brief Update v3.0 Part A (§1, §2, §7,
                   §8 — roles, Master Calendar feature set)
  30BN-DOC.25b   ✓ Brief Update v3.0 Part B (§9 schema,
                   §10 prompt log, §11 Beta phases,
                   version history)
  30BN-DOC.26    ✓ Process Update v3.0 (Phase CAL
                   active through CAL.5b: §7 calendar
                   client patterns + FK replacement
                   pattern; §8 commit-before-build-
                   report; §10 show_type + calendar
                   contact phone grep checks; §11
                   three calendar checklist items;
                   §14 five new rules)
  30BN-DOC.27    ✓ Deferred Verifications v7 (CAL.1–
                   CAL.5b-FIX2 items, 110 new items,
                   Quick Reference + Seed Data Cleanup
                   updated)
  30BN-CAL.6     ✓ calendar_editor toggle on user
                   management page (toggleCalendar
                   Editor() server action, CAL.6
                   AuditAction type). Production row
                   type fix in UsersTable.tsx (stale
                   AdminRole — ROLE_BADGE['production']
                   gap fixed). Batch Approve button
                   fallback (Q8 from CAL.5b-FIX2).
  30BN-CAL.7     ✓ Public /calendar page (Publish
                   CalendarGrid.tsx, month view,
                   needs-volunteers indicator). iCal
                   admin subscription feed (Migration
                   021: calendar_subscription_token;
                   /api/calendar/feed.ics route;
                   rotateCalendarToken() action;
                   CalendarExportModal.tsx). Volunteer
                   slot-claim .ics (/api/calendar/
                   claim.ics; sendSlotClaimEmail()
                   calendar link). lib/utils/ical.ts.
                   "View Calendar" links on / + /shows.
  30BN-CAL.8     ✓ Location Management settings
                   (/crew/settings/locations page +
                   LocationsManager.tsx). createLocation,
                   updateLocation, reorderLocation,
                   toggleLocationActive() in
                   lib/actions/settings.ts. location.*
                   AuditAction types. General Defaults
                   fallback hierarchy note (link to
                   Location Management). Batch location
                   conflict check loop in
                   handleApplyDefaultLocation()
                   (batchConflictChecking state,
                   Approve All disabled during check).
  30BN-CAL.9     ✓ Unified week grid — UnifiedWeekGrid
                   .tsx (computeColumnLayout column-
                   splitting, buffer blocks, current-
                   time indicator, location name on
                   blocks). WeekAgendaView.tsx (mobile
                   week view). CalendarWeekView.tsx
                   rewritten (hidden md:block /
                   md:hidden pattern, toggle removed).
                   CalendarFilterBar: toggle removed.
                   CalendarShell: mobile ⋯ More menu.
                   CalendarEventForm + BulkRehearsalForm:
                   bottom sheet on mobile. PendingQueue
                   Client batch rows: flex-col mobile
                   stacking. PublicCalendarGrid pills:
                   dot-only on smallest breakpoint.
                   lib/utils/calendar-layout.ts created.
  30BN-CAL.10a   ✓ Recurring events foundation.
                   Migration 022 (recurrence_groups +
                   calendar_events.recurrence_group_id,
                   RLS). lib/utils/calendar-recurrence
                   .ts (generateOccurrenceDates(),
                   describeRecurrence() — pure, client-
                   safe). recurringEventSchema in lib/
                   validations/calendar.ts. recurring_
                   event.* AuditAction types. Record
                   Group + frequency/status types in
                   types/calendar.ts. createRecurring
                   Event(), editRecurringOccurrence(),
                   cancelRecurringOccurrence() in lib/
                   actions/calendar.ts.
  30BN-CAL.10b   ✓ Recurring events creation UI.
                   CalendarRecurringEventForm.tsx (live
                   preview via describeRecurrence(),
                   frequency radio buttons, contacts
                   useFieldArray, role-adaptive). Record
                   ScopePicker.tsx (edit/cancel modes,
                   3 scope options, mobile bottom
                   sheet). CalendarShell: third dropdown
                   option, recurringFormOpen + scope
                   picker state + handlers + editScope.
                   CalendarEventForm: editScope prop +
                   editRecurringOccurrence() routing.
                   CalendarDayPanel: 3 optional props
                   added (wired in CAL.10c).
  30BN-CAL.10c   ✓ Recurring events display + queue.
                   CalendarDayPanel: Edit branches on
                   recurrence_group_id (scope picker
                   vs direct form). Cancel event button
                   (Super Admin, scope-picker-aware).
                   "↻ Part of a recurring series" note.
                   eslint-disable comments removed.
                   CalendarEventChip: ↻ overlay (compact
                   mode, aria-hidden) + "↻ Recurring"
                   label (full mode). pending/page.tsx:
                   recurrence_groups fetch. Pending
                   QueueClient: recurringGroups prop,
                   Recurring Events section, trueIndivid
                   ualEvents filter, handleApproveAll
                   Recurring() with busy/error state.
  30BN-ADMIN.26  ✓ CAL phase cleanup: users.ts — 4
                   actions (deactivateUser, reactivate
                   User, changeRole, non-auth parts of
                   createUser) migrated to getServer
                   Client() + revalidatePath('/crew/
                   settings/users'). createUser() keeps
                   getAdminClient() for auth.admin.*
                   calls (sanctioned exception). router
                   .refresh() replaces window.location
                   .href in UsersTable.tsx (dead reload()
                   helper removed; setIsSubmitting(false)
                   bug fixed). changeRole() Production
                   role guard. sendWaitlistPromotion
                   Email() updated with claimToken +
                   calendar link (addToCalendarLink
                   Html() helper reused from CAL.7).
                   claim.ics Content-Disposition fixed
                   to fixed filename "volunteer-call
                   .ics". CalendarWeekGrid.tsx deleted
                   (dead code since CAL.9).

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

Phase 11 — Stubs, 404 & App Settings ✓ Complete
  30BN-11.1 ✓ Beta Stub Pages & Custom 404
              (three admin stub pages: /crew/communication,
              /crew/tools/checkin, /crew/settings/documents;
              Check-In sidebar nav link; app/not-found.tsx
              branded 404; app/error.tsx global error
              boundary with 'use client' + reset())
  30BN-11.2 ✓ App Settings & Announcement Banner
              (/crew/settings hub with 8 LinkedCard/
              LockedCard cards; /crew/settings/announcement,
              /hearing-options, /signup-form, /general
              sub-pages; lib/actions/settings.ts server
              actions; Phase 11 AuditAction types wired)

Phase 12 — Polish, Mobile & Performance ✓ Complete
  30BN-12.1   ✓ Mobile optimization: 7 public pages
                responsive audit, 2 tap-target fixes,
                honeypot on 4 public forms, mobile
                sidebar (MobileSidebarContext + hamburger
                + drawer), CategoriesTable router.refresh()
                fix, VolunteersTable dark: badge fix,
                opportunity_submissions phone confirmed
                clean.
  30BN-12.2a  ✓ Performance/security audit + fixes:
                dashboard Promise.all parallelization,
                email escaping gap fixed, R18 fixes
                (4× ?? → || in volunteer.ts), length
                caps on sendShowBulkEmail(), RLS all
                clean, idx_attendance_slot_claim_id
                confirmed and documented.
  30BN-12.2b  ✓ In-app help page (/crew/help): 8
                sections, 23 subsections, 31 anchors,
                sticky TOC, tip/warning callouts, Help
                nav link (HelpCircle, all roles).
  30BN-12.2c  ✓ HelpTooltip component (Server Component,
                next/link, named export). 16 placements
                across Production Crew.
  30BN-12.3   ✓ Call Board volunteer card per-show
                hours breakdown. Hours summary simplified
                ("[X] hours across [Y] shows"). Show-
                grouped expandable section + "Other
                Hours" for manual entries. manualHoursTotal
                prop replaced with manualHoursEntries.
  30BN-12.4   ✓ Automated post-show thank-you email
                cron (app/api/cron/thankyou/route.ts,
                07:00 UTC daily, 48h after show). Migration
                015 (show_dates.thank_you_sent_at).
                buildThankYouEmailPayload() in lib/email.ts.
                E3 Waitlist heading + tooltip fix.
                Duplicate Editor Notes heading removed;
                HelpTooltip moved into EditorNotes.tsx.
```

### Beta Build
```
Phase CAL — Master Calendar System ✓ Complete
  CAL.1  ✓ show_type → location_id migration (016)
  CAL.2  ✓ Calendar schema + Production role (017)
  CAL.3  ✓ Show-to-calendar sync + conflict detection
           + buffer time UI (018)
  CAL.4a ✓ end_time on show_dates (019)
  CAL.4b ✓ Full /crew/calendar UI (month/week/agenda)
  CAL.5a ✓ Event creation + submission forms
  CAL.5b ✓ Seed data, bulk rehearsal form, pending
           approval queue, Book Space panel
  CAL.6  ✓ calendar_editor toggle on user management
           page. Production role row fix in
           UsersTable.tsx. Batch Approve button
           fallback fix (Q8 from CAL.5b-FIX2).
  CAL.7  ✓ Public /calendar page. iCalendar admin
           subscription feed (/api/calendar/feed.ics,
           token auth, Migration 021). Volunteer
           slot-claim .ics (/api/calendar/claim.ics).
           CalendarExportModal. sendSlotClaimEmail()
           + sendWaitlistPromotionEmail() calendar
           links. Call Board claim history links.
           lib/utils/ical.ts.
  CAL.8  ✓ Location Management settings
           (/crew/settings/locations): add/rename/
           reorder/deactivate/reactivate, color
           picker, per-location default_hours UI.
           General Defaults fallback note added.
           Batch location conflict check fix.
           location.* AuditAction types.
  CAL.9  ✓ Unified week grid (UnifiedWeekGrid.tsx
           replaces CalendarWeekGrid.tsx —
           CalendarWeekGrid.tsx deleted in ADMIN.26).
           Column-splitting algorithm (calendar-
           layout.ts). Mobile optimization: ⋯ More
           header menu, bottom sheet modals,
           WeekAgendaView.tsx for mobile week view.
  CAL.10a ✓ Recurring events — schema (Migration 022:
           recurrence_groups table +
           calendar_events.recurrence_group_id).
           lib/utils/calendar-recurrence.ts
           (generateOccurrenceDates(),
           describeRecurrence()). recurringEventSchema.
           recurring_event.* AuditAction types.
           createRecurringEvent(),
           editRecurringOccurrence(),
           cancelRecurringOccurrence() in
           lib/actions/calendar.ts.
  CAL.10b ✓ Recurring events — creation UI.
           CalendarRecurringEventForm.tsx (live
           N-events preview). RecurrenceScopePicker
           .tsx (edit/cancel scope modal). Calendar
           Shell: third dropdown option, scope picker
           state + handlers. CalendarEventForm:
           editScope prop + editRecurringOccurrence
           routing.
  CAL.10c ✓ Recurring events — display + pending
           queue. CalendarDayPanel: scope picker
           trigger, Cancel event button, "Part of
           a recurring series" note, eslint-disable
           comments removed. CalendarEventChip: ↻
           indicator (compact + full modes).
           PendingQueueClient: Recurring Events
           section, trueIndividualEvents filter.
           pending/page.tsx: recurrence_groups fetch.

Phase 13 — Email Blast System ✓ Complete (13.1–13.4b)
  13.1   ✓ Transactional email logging gap closed.
           logEmailSent() helper (lib/email.ts,
           internal). 11 email paths now log.
           recipient_filter tags added to 7 pre-
           existing inserts. Email Activity page
           (/crew/settings/email-activity, 3 tabs,
           Super Admin only). Email Activity card
           added to Settings hub.
  13.2   ✓ Branded HTML email templates. All 17
           send functions in lib/email.ts converted
           from plain text. buildEmailHtml() +
           buildCtaButton() helpers (internal). All
           volunteer CTAs → /callboard. Dead
           browseShowsButtonHtml() removed.
  13.3a  ✓ Blast composer backend + UI shell.
           lib/actions/blast.ts (searchVolunteers,
           previewBlast, sendBlastEmail,
           resolveBlastRecipients). BlastComposer
           .tsx (compose → confirm → sent step
           machine). /crew/communication stub
           replaced with live composer.
  13.3b  ✓ TipTap rich text editor integrated.
           @tiptap/react + @tiptap/pm +
           @tiptap/starter-kit v3.28.0.
           immediatelyRender:false (Next.js
           hydration guard). Toolbar: Bold/Italic/
           Bullet/Ordered lists. editor.getHTML()/
           .getText() replace body state.
  13.4a  ✓ Logging cleanup + HTML sanitization.
           sendUpdateLinkEmail() now logs
           (volunteerId param added, both call
           sites in update/actions.ts updated).
           sendPendingRegistrationEmail() now logs
           inline in admin-registration.ts (Case B
           — recipient list at call site; zero-
           recipient guard added). body_preview
           added to 5 pre-existing email_log
           inserts. 10× #555 → #555555 in
           milestoneEmailContent(). sanitize-html +
           @types/sanitize-html installed;
           sanitizeHtml() in sendBlastEmail()
           before payload build.
  13.4b  ✓ Mobile optimization for Phase 13 UI
           surfaces. BlastComposer: tab bar stacks
           vertically below sm breakpoint (flex-col
           sm:flex-row, w-full sm:w-auto), confirm
           row flex-wrap. email-activity page: tab
           bar flex-wrap + whitespace-nowrap, log
           table hidden below sm with mobile card
           layout above it. AboutSystemEmails.tsx:
           clean.
  13.4c ✓ npm vulnerability sweep. npm audit fix applied
           (brace-expansion + fast-uri resolved). next
           16.2.9 → ^16.2.11 (9 Next.js CVEs resolved).
           6 vulnerabilities remain (blocked upstream:
           postcss/sharp inside next@16.2.11; shadcn/hono/
           mcp chain requires major downgrade). All
           remaining are build-time/dev-CLI only — not
           runtime exploitable.

Phase HELP — In-App Help System ✓ Complete
  HELP.1 ✓ Read-only audit. Section inventory, staleness
           findings, HelpTooltip dependency map (9
           must-preserve anchors), missing content
           inventory (18 areas), role assignment map,
           proposed section structure.
  HELP.2a ✓ Structural scaffold. proxy.ts /crew/help
           exception for Production role. getAdminUser()
           in page.tsx. HelpContent.tsx created (ALL_SECTIONS
           registry, filterSections/isSectionVisible/
           flattenSections helpers, role-aware TocList).
           page.tsx: 494 → 10 lines.
  HELP.2b ✓ Existing sections updated. Settings → SA+
           Owner Admin only (owner decision — Editors
           excluded). 3 new Settings subsections (audit-log,
           location-management, email-activity-log). 3
           MAJOR stale content fixes (show_type → location;
           default hours hierarchy; four account types +
           Production + calendar_editor). 8 subsection
           role guards. Production Help sidebar link added.
  HELP.2c ✓ 3 new h2 sections: Dashboard (3 subsections),
           Master Calendar (9 subsections), Communication
           (1 subsection). ALL_SECTIONS: 8 → 11 top-level.
           HelpContent.tsx: 708 → 1006 lines.
  HELP.2d ✓ 5 new HelpTooltip placements (SeasonAtAGlance,
           communication/page.tsx, 3 settings pages).
           Count: 17 → 22. 4 calendar placements deferred
           to ADMIN.29 (Client Component heading issue).
  ADMIN.27 ✓ TipTap rich formatting + light mode default.
           @tiptap/extension-link + @tiptap/extension-
           underline installed. Toolbar: 9 buttons (B/I/U/
           H1/H2/—/•List/1.List/🔗). blast.ts allowlist
           updated (u, hr, rel on a). ThemeProvider.tsx +
           layout.tsx prefers-color-scheme branch removed —
           always defaults to light.
  ADMIN.28 ✓ middleware.ts → proxy.ts rename (Next.js 16).
           Function renamed middleware → proxy. One line
           changed. Deprecation warning resolved.
  ADMIN.29 ✓ 4 deferred calendar HelpTooltip placements.
           CalendarShell.tsx (×3 — calendar-submit,
           calendar-export, calendar-book-space as button
           siblings). PendingQueueClient.tsx (×1 —
           calendar-pending inside h1). Count: 22 → 26.
           Confirmed: HelpTooltip works correctly in
           Client Components (no server-only imports).

Phase 14 — Check-In System          (pending)
Phase 15 — Document Management      (pending)
Phase SETUP — OpenCall OS Setup Panel ✓ Complete
  SETUP.0 ✓ Migration 023 + role guard sweep. owner_admin
           role CHECK, is_editor() update, is_super_admin_
           or_owner_admin() helper + locations RLS fix, 17
           app_settings SETUP keys, AdminRole type update,
           proxy.ts setup route block, full 47-guard sweep
           (each evaluated individually). UsersTable/
           CreateUserModal/PendingRegistrations badge +
           toggle + deactivate + role selector. Sidebar/
           HelpContent/settings pages. TopBar exhaustive
           Record<AdminRole> maps (tsc --noEmit catch).
           29 files. Zero lint errors. Commit df8f907.
  30BN-DOC.36 ✓ Brief + Process Update v3.4 (this prompt)
  SETUP.1 ✓ lib/feature-flags.ts (getFeatureFlags() +
           FeatureFlags type). Migration 026 (delete 3
           stale flag rows; insert favicon_url). proxy.ts
           extended: 5 guarded routes (3 crew + 2 public),
           matcher extended, conditional flag fetch.
           Layout flag prop to Sidebar. Per-page guards
           (6 pages). Per-action guards (16 functions).
           syncShowDateToCalendar() no-op when calendar
           off. Email calendar link threading. Call Board
           .ics conditional. 22 files. Commit 2c2a388.
  SETUP.2 ✓ Setup Panel UI Sections 1–4 (Org Identity,
           Brand Colors, Logo, Favicon). lib/actions/
           setup.ts (6 actions + getSignedBrandUploadUrl).
           lib/utils/image-crop.ts (getCroppedImg).
           BrandImageUploader.tsx (URL input OR crop
           editor; free ratio for logo, 1:1 for favicon;
           P-DC to brand public bucket). SetupPanel.tsx
           (Sections 1–4). setup/page.tsx. generateMetadata
           reads favicon_url + org_name. Settings hub
           Platform Setup card. brand bucket created.
           react-easy-crop installed. Commit b63fae0.
  SETUP.3 ✓ Section 5 (Email Config). resolveEmailSettings()
           internal helper in lib/email.ts (fetches
           email_from_address, email_from_name, org_logo_url;
           falls back to 30BN defaults). buildEmailHtml()
           extended with logoUrl? param. All 16 direct-call
           send functions swept. saveEmailConfig() added.
           Commit 2cfb880.
  SETUP.4 ✓ Sections 6–7 (Feature Flags + Instance Label).
           saveFeatureFlags() + saveInstanceLabel() added.
           Flag section: 3 toggle rows, optimistic state.
           saveFeatureFlags() revalidates /crew layout +
           public routes. Instance label in page header.
           Phase SETUP complete. Commit 562f9d4.
  30BN-ADMIN.31 ✓ Seven-item deferred sweep: payload
           builder logoUrl threading (4 builders + 3 call
           sites in shows.ts/cron routes), resolveOrgIdentity()
           (lib/utils/org-identity.ts) + public pages org
           identity (landing page heading/footer/copyright
           dynamic), getAdminClient() fix on app/page.tsx,
           phone search strip, reminder cron DST fix
           (fromZonedTime pattern), volunteer.signup
           AuditAction + logAction() in submitVolunteerForm(),
           renumber_waitlist() RPC (Migration 027).
           Commit a6ab89c.
  30BN-ADMIN.31b ✓ Dead pre-Migration-025 documents query
           deleted from app/page.tsx (consentDoc +
           showConsentLink + JSX — 24 lines). Footer
           copyright © {org_name} dynamic. Commit 6540df9.
  30BN-DOC.43a ✓ Brief Update v3.9.
  30BN-DOC.43b-FIX ✓ One-line correction: Process v3.8
               version history "six new checklist items"
               → "five new checklist items" (DOC.43b F3).
  30BN-DOC.44  ✓ Brief Update v4.0 (ADMIN.32–34 complete).
  30BN-DOC.44-FIX ✓ Brief §8 QR Generator spec synced
               with ADMIN.34 (history panel, new
               components, generateQRCode signature).
  30BN-DOC.45  ✓ Process Update v3.9 (ADMIN.32–34).
  30BN-DOC.46  ✓ Deferred Verifications v15 (34 new
               items: 7.1 V11–V17 QR history, ADMIN.33
               V1–V23, ADMIN.34 V1–V4; 1 superseded).
  30BN-DOC.46-FIX ✓ Three corrections: ADMIN.23 V4
               attribution, item count 775→774, Brief
               "Seven"→"Eight" sections.
  30BN-THEME.A ✓ Read-only audit. 1,381 instances /
               130 files / 6 token families. Options A
               confirmed. 15 utility classes / 69 rules.
               3 blocking flags resolved in design.
  30BN-THEME.1 ✓ globals.css @layer utilities (69 rules).
               app/layout.tsx resolveBrandColors() +
               <style> injection. 30 public files, 305
               instances. Commit 406b188.
  30BN-THEME.2a ✓ 30 app/crew/ files, 110 instances.
               Categorical exceptions. Commit 6576a55.
  30BN-THEME.2b ✓ 21 crew shared + settings files.
               Role badge + System badge exceptions.
               Commit bf53e17.
  30BN-THEME.2c ✓ 28 shows/volunteers/opp/forms/dashboard
               files, 236 instances. Commit 1c40bc6.
  30BN-THEME.2d ✓ 21 calendar/comm/media/tools/help
               files, 201 instances. Final codebase grep:
               zero static brand tokens. Commit 8bc26d5.
  30BN-THEME.3 ✓ Email template sweep. resolveEmailSettings()
               +brandPrimary +brandAccent. 5 files, 42 hits
               replaced. Self-caught 4 additional helpers.
               Commit 69d7dfa.
  30BN-THEME.3b-4 ✓ Light-navy + PDF brand colors.
               lib/utils/color.ts (lightenHex). resolve
               EmailSettings() +brandPrimaryLight. Volunteer
               ListPDF.tsx createStyles() factory (module-
               scope StyleSheet.create() self-caught).
               4 files + 1 new. Commit 66d2ba7.
  30BN-DOC.47  ✓ Brief Update v4.1 (Phase THEME complete,
               Phase 17 expanded, Phase 19+21 pre-launch,
               color.ts, PDF brand colors).
  30BN-DOC.48  ✓ Process Update v4.0 (this prompt)
Phase THEME — Dynamic CSS Brand System ✓ Complete
  THEME.A ✓ Read-only audit. 1,381 brand-derived class
           instances across 130 files. 6 token families
           (navy, orange, steel, slate, light-navy,
           pale-orange). Confirmed Option A (CSS color-mix
           derivation). 15 base utility classes (69 rules
           with variants). F1: steel/slate hue mismatch —
           percentages adjusted (59%/47%). F3: opacity
           modifier pattern via color-mix(transparent).
           F4: categorical color exception policy defined.
           Email template THEME.3 preview (42 hex hits).
           No code written.
  THEME.1 ✓ CSS foundation + public pages (30 files,
           305 instances). globals.css @layer utilities
           (69 rules). app/layout.tsx resolveBrandColors()
           + <style> tag (6 CSS custom properties at
           adjusted percentages). Single injection point
           in root layout. 305 instances replaced. Commit
           406b188.
  THEME.2a ✓ Admin pages sweep (30 app/crew/ files,
           110 instances). Categorical exceptions:
           claim-type badges → fixed hex. Commit 6576a55.
  THEME.2b ✓ Crew shared + settings components (21
           files). Categorical exceptions: role badges
           (TopBar, UsersTable), System badge
           (DocumentTypesManager). LocationsManager
           useState default left untouched. Commit bf53e17.
  THEME.2c ✓ Shows, volunteers, opportunities, forms,
           dashboard (28 files, 236 instances). Categorical
           exceptions: claim-type badges, activity-feed
           borders. Commit 1c40bc6.
  THEME.2d ✓ Calendar, communication, media, tools, help
           (21 files, 201 instances). MediaLibrary access-
           tier badge → fixed hex (including dark: variants
           — categorical badges must be stable in dark mode
           too). Full-codebase final grep: zero remaining
           static brand token classes. Commit 8bc26d5.
  THEME.3 ✓ Email template brand color sweep (5 files).
           resolveEmailSettings() +brandPrimary +brand
           Accent. buildEmailHtml() +brandPrimary +brand
           Accent. All 42 hardcoded hex hits replaced with
           dynamic string interpolation. 4 payload builders
           gain brand params. Self-caught additional helpers
           needing extension: emailShell(), instructions
           BlockHtml(), cancelLinkHtml(), addToCalendar
           LinkHtml(), milestoneEmailContent(). Commit
           69d7dfa.
  THEME.3b-4 ✓ Light-navy + PDF brand colors (4 files +
           1 new). lib/utils/color.ts (new — lightenHex()
           utility). resolveEmailSettings() +brandPrimary
           Light (lightenHex(brandPrimary, 0.08)).
           instructionsBlockHtml() self-derives tint
           internally (called from payload builders without
           precomputed brandPrimaryLight). VolunteerList
           PDF.tsx refactored: createStyles() factory
           (StyleSheet.create() at module scope silently
           ignores props — factory required). PDF route
           handler passes brand props. Commit 66d2ba7.

Phase 14 — Check-In System ✓ Complete
  30BN-14.1  ✓ Migration 024 (show_dates.check_in_token
               + attendance.slot_claim_id nullable).
               Public /checkin/[token] (per-date and
               whole-show tokens, auto-date resolution,
               walk-in inline signup, all result states).
               lib/actions/checkin.ts (resolveCheckIn
               Token, checkInVolunteer, checkInNew
               Volunteer — getAdminClient() only, public-
               route invariant). lib/validations/
               checkin.ts: createCheckInSignupSchema()
               factory. types/checkin.ts. AuditAction
               types: attendance.checkin, volunteer.
               checkin_signup.
  30BN-14.1-FIX ✓ Server-side showAgeRange validation
               gap in checkInNewVolunteer (static schema
               → factory). 3-file fix.
  30BN-14.2  ✓ Show detail Dates tab: per-date + whole-
               show check-in QRs (always visible, PNG +
               SVG downloads). Volunteers tab: "Self
               Check-In" badge on source='checkin' rows.
  30BN-14.3  ✓ Live check-in dashboard at /crew/tools/
               checkin. lib/data/checkin.ts (getDashboard
               Data). lib/actions/checkin-admin.ts (get
               RosterForDate — getServerClient(), separate
               file from public checkin.ts). CheckIn
               Dashboard.tsx: 10s auto-refresh, roster
               grouped by role, walk-in section, accordion
               for other shows, "Last updated Xs ago".

Phase 15 — Document & Media System ✓ Complete
  30BN-15.1  ✓ Migration 025 (drop old documents table;
               create document_types, media_folders,
               media_folder_access, documents, document_
               access, consent_form_submissions; 5 seed
               rows). Media bucket (private). lib/
               actions/documents.ts (document type CRUD
               + consent submission review). /crew/
               settings/documents: DocumentTypesManager
               .tsx + ConsentSubmissionsQueue.tsx.
               Hub card: Beta badge removed, guard fixed
               to SA/OA only.
  30BN-15.2  ✓ app/documents/[token]/route.ts (universal
               redirect: access tier enforcement, signed
               URLs from media bucket, link redirect).
               app/consent/[token]/page.tsx + Consent
               UploadForm.tsx (P-DC upload, XHR progress,
               3 states). lib/actions/consent.ts (get
               ConsentUploadUrl, confirmConsentSubmission
               — getAdminClient() only). sendConsent
               FormRequestEmail() in lib/email.ts
               (conditional download CTA, upload CTA
               always, trigger:consent_form_request).
               submitVolunteerForm() consent trigger
               (non-blocking, is_minor check, active
               doc lookup for activeFormUrl). AuditAction:
               consent_submission.file_received.
  30BN-15.2-AUDIT ✓ Post-build read-only audit (81 items:
               71 PASS, 1 PARTIAL, 9 FAIL). Context
               compaction during Tasks D/E caused
               incomplete implementations. Mandatory
               trigger for AUDIT session confirmed: any
               mid-build compaction = immediate AUDIT.
  30BN-15.2-FIX ✓ All 9 FAILs resolved: activeFormUrl
               param added to email function + trigger,
               is_active filter on document_types query,
               active doc lookup for activeFormUrl,
               hidden file input + trigger button,
               Try Again button, volunteerName in success.
               recipientFilter corrected to
               'trigger:consent_form_request'.
  30BN-DOC.37a ✓ Brief Update v3.5 Part A (§1, §3, §5,
               §7, §8, §12)
  30BN-DOC.37b ✓ Brief Update v3.5 Part B (§9, §11,
               version history)
  30BN-DOC.38  ✓ Process Update v3.5 (Phases 14 +
               15.1–15.2 lessons learned)
  30BN-15.3  ✓ Master media library at /crew/media (all
               roles including Production).
               components/crew/media/MediaLibrary.tsx
               (Client Component): folder browser (left
               panel), document table (right panel), Copy
               Link, QR download, Play/View button per
               row, access tier badges. detectLinkType(),
               isPlayable(), getPlayLabel() helpers. P-DC
               upload via XHR (same pattern as
               ConsentUploadForm.tsx). Link entry form
               (URL + title). Commit: 26a4585.
  30BN-15.4  ✓ Media players + embed detection.
               app/documents/view/[token]/page.tsx (new
               public Server Component): access tier
               enforcement, signed URL for files, YouTube/
               Vimeo iframe embed, native <video>/<audio>
               players, <img> for images, PDF inline
               viewer, robots noindex.
               /documents/[token]/route.ts updated:
               detectLinkType() + isViewableMimeType()
               helpers; YouTube/Vimeo/audio links and
               viewable-mime-type files now redirect to
               player page. MediaLibrary.tsx updated:
               Play/View button, "no folders" empty state.
               Commit: 63570b8.
  30BN-ADMIN.30 ✓ Sidebar dual-highlight fix (Shows link
               special-case excludes /crew/shows/
               opportunities subtree; isActivePath()
               untouched globally). HelpContent.tsx: 2
               new h2 sections (Check-In System + Media
               Library); 2 new Settings subsections
               (document-types, consent-forms);
               ALL_SECTIONS 11 → 13. 6 new HelpTooltip
               placements (checkin/page.tsx →
               check-in-dashboard; ShowDetail.tsx Dates
               tab → check-in-qr; DocumentTypesManager →
               document-types; ConsentSubmissionsQueue ×2
               → consent-forms; MediaLibrary.tsx →
               media-library-access). Count: 26 → 32.
               7 files modified. Zero lint/tsc errors.
               Commit: 05f52e6.
  30BN-DOC.37c ✓ Brief Update v3.6 (Phase 15 complete +
               ADMIN.30: §1, §3, §7, §8 Help System/Media
               Library/Document Management, §9 schema
               blocks, §11, version history)
  30BN-DOC.39  ✓ Process Update v3.6 (this prompt)
  30BN-HELP.2e ✓ ALL_SECTIONS owner_admin sweep.
               HelpContent.tsx: owner_admin added to
               12 top-level + 35 subsection role arrays
               (47 total). Settings entries (1 top-level
               + 10 subsections) correctly excluded —
               already had owner_admin. Zero lint/tsc
               errors. Commit: f4394bd.
  30BN-DOC.41  ✓ Brief Update v3.7 (§7 Production row
               + §9 two stale CAL.8 notes corrected +
               HELP.2e prompt log entry). Commit: f4394bd.
  30BN-DOC.42  ✓ Doc Update v3.8/v3.7/v13 — HELP.2e
               completion logging across Brief, Process,
               Deferred Verifications (this prompt).
  30BN-SETUP.1 ✓ Feature flag infrastructure + Migration
               026. Commit 2c2a388.
  30BN-SETUP.2 ✓ Setup Panel UI Sections 1–4 + brand
               bucket + BrandImageUploader + react-
               easy-crop. Commit b63fae0.
  30BN-SETUP.3 ✓ Email Configuration section +
               resolveEmailSettings() + 16-function
               sweep. Commit 2cfb880.
  30BN-SETUP.4 ✓ Feature Flags + Instance Label
               sections. Phase SETUP complete.
               Commit 562f9d4.
  30BN-ADMIN.31 ✓ Seven-item deferred sweep: payload
               builders, org identity, getAdminClient
               fix, phone search, reminder cron DST,
               volunteer.signup audit, renumber_waitlist
               RPC (Migration 027). Commit a6ab89c.
  30BN-ADMIN.31b ✓ Dead documents query removed +
               dynamic copyright. Commit 6540df9.
  30BN-DOC.43a ✓ Brief Update v3.9.
  30BN-DOC.43b ✓ Process Update v3.8.
  30BN-DOC.43b-FIX ✓ One-line correction: Process
               v3.8 version history said "six new
               checklist items" — corrected to "five
               new checklist items" (F3 from DOC.43b
               build report).
  30BN-DOC.44 ✓ Brief Update v4.0 (ADMIN.32–34:
               OA permissions, OpenCall OS branding
               sweep, QR history, Setup Panel Section
               8, Migrations 028–029 documented).
  30BN-DOC.45 ✓ Process Update v3.9 (this prompt).

Phase 16 — Google SSO      ✓ Completed in Alpha (30BN-1.3)
Phase 17 — Launch                   (pending)

New Beta features confirmed during Alpha build:
Phase 18 — Additional Alpha Features ✓ Complete
  - Volunteer communication history on profile
    ✓ Built ADMIN.24 (CommunicationHistory.tsx)
  - Show-level post-show reporting
    ✓ Built ADMIN.22 (Report tab, status='past' only)
  - Volunteer self-service hours history on Call Board
    ✓ Built 30BN-12.3 (per-show grouped breakdown,
    "Other Hours" section, simplified summary line)
  - Bulk email from show detail
    ✓ Built ADMIN.23 (BulkEmailSection.tsx)
Phase 19 — Volunteer Communication Preferences
  (pending, pre-launch) — 3-prompt structure confirmed:
  19.1 (Migration 030 + server actions), 19.2 (public
  forms), 19.3 (Call Board + admin profile + list).
  communication_preference editable in admin volunteer
  profile (confirmed). Planned before Phase 17.
Phase 20 — Automated thank-you email after a show
  ✓ Built in Alpha (30BN-12.4). See Phase 12 above.
Phase 21 — Rehearsal Management System
  (planned, pre-launch) — /crew/rehearsals sidebar
  tab; role-filtered visibility (Production sees only
  assigned schedules); bulk rehearsal submission
  (surfacing CalendarBulkRehearsalForm as primary
  entry point); admin user assignment to schedules;
  individual rehearsal call management; rehearsal
  attendance tracking (Phase 14 check-in model).
  feature_rehearsals flag (R34). Calendar integration
  preserved (submissions → same pending queue flow).
  Owner Admin approval authority in pending queue.
  Pre-requisites: ADMIN.32 ✓ (Owner Admin permission
  audit — complete) + ADMIN.33 ✓ (role audit and
  sweep — complete). Phase 21 prerequisites met.
Phase CAST — Cast Member Portal (named future phase,
  post-Phase 21) — cast member entity (separate from
  admin_users), cast frontend login, rehearsal schedule
  view, materials distribution, cast check-in.
ADMIN.32 ✓ Read-only audit (Phase A only, no code):
  Owner Admin permission gaps (4 component files —
  OpportunityList, FormList, ShowList, ShowDetail —
  silently excluded OA via adminRole variable name
  miss in SETUP.0 grep sweep; CalendarDayPanel day-
  panel buttons OA gap; volunteer_notes RLS OA gap);
  Production role absent from all User Management
  paths; hardcoded 30BN string inventory across
  email body copy, public pages, iCal, HelpContent,
  BulkEmailSection; 404 page state (unmodified);
  role badge completeness confirmed (all 5 roles);
  changeRole() scope decision surfaces. Findings
  drove ADMIN.33.
ADMIN.33 ✓ (+ ADMIN.33-CONT) Role permissions +
  OpenCall OS branding sweep + Setup Panel Section 8.
  Commit 43f1b7d.
  Role permissions: OA canEdit in 5 component files;
  CreateUserModal Production option (SA only); Pending
  Registrations Production + OA options; changeRole()
  expanded (4 options, Production + OA target rows
  unlocked); deactivateUser() OA-on-OA lock removed;
  volunteer_notes OA app-layer guard; Migration 028
  (volunteer_notes RLS + not_found seeds).
  Branding sweep: resolveEmailSettings() +orgName
  +orgContactEmail; ~39 email body copy hits fixed;
  blast.ts from address dynamic; FROM_ADDRESS/REPLY_TO
  constants deleted; all 13 public pages + Sidebar
  wired through resolveOrgIdentity() (incl. org_logo_url
  extension + next.config.ts remotePatterns);
  BulkEmailSection defaultSubject prop; HelpContent
  2 generic language fixes; iCal PRODID + UID domains
  genericized; settings/page.tsx defense-in-depth.
  Setup Panel Section 8 (404 Page): saveNotFoundPage();
  SetupPanel.tsx Section 8; not-found.tsx dynamic.
  45 files. Commits 43f1b7d + 43f1b7d (CONT same).
ADMIN.34 ✓ QR history + payload cleanup + metadata
  OA approval fix. Commit 28e0c4e.
  QR history: Migration 029 (qr_codes table, 3 RLS
  policies); generateQRCode() extended (url, label,
  DB insert best-effort, revalidatePath); lib/data/
  qr.ts (getQRHistory, limit 50); QRGeneratorForm.tsx
  (Client) + QRHistoryPanel.tsx (Server) — page
  restructured from Client to Server+Client split.
  Payload cleanup: FROM_ADDRESS + REPLY_TO constants
  deleted; 4 builders gain from?/replyTo? params;
  all 3 call sites (shows.ts + 2 cron routes) pass
  dynamic values. Metadata: org_tagline added to
  generateMetadata() with || fallback (not ??).
  OA approval: PendingRegistrations.tsx OA-can-assign-
  OA; approveRegistration() guard corrected (self-
  caught F1 — SA-minting-SA path preserved).
  resolveEmailSettings() + orgContactEmail; 3 email
  functions fixed (sendInfoUpdatedEmail, sendWelcome
  Email, sendRegistrationDeclinedEmail). 13 files.

30BN-DOC.31    ✓ Brief Update v3.2 (Phase 13
                 complete: §1 phase updated; §3
                 TipTap + sanitize-html added; §6
                 email design expanded; §8
                 Communication page full spec,
                 Email Activity page + card, CTA +
                 stale note updates; §9 body_preview
                 note; §11 Phase 13 complete summary;
                 R31 added; v3.2 history entry)
30BN-DOC.32    ✓ Process Update v3.2 (this prompt —
                 Phase 13 complete: §14 logEmailSent()
                 pattern + blast.ts client rule; §8
                 single-code-block prompt rule; §10
                 blast sanitization + logEmailSent
                 export greps; §11 three new
                 checklist items; §13 Phase 13
                 complete summary + prompt log
                 13.1–13.4b + DOC.31–32; §14 single-
                 code-block rule + escapeHtml R31
                 cross-reference; v3.2 history)
30BN-13.1      ✓ (see Phase 13 above)
30BN-13.2      ✓ (see Phase 13 above)
30BN-13.3a     ✓ (see Phase 13 above)
30BN-13.3b     ✓ (see Phase 13 above)
30BN-13.4a     ✓ (see Phase 13 above)
30BN-13.4b     ✓ (see Phase 13 above)
30BN-DOC.33    ✓ Deferred Verifications v9 (Phase 13
                 items added — 44 new verification items,
                 11.1 V1 superseded, Quick Reference
                 updated, Phase 13 seed data cleanup SQL
                 added)
30BN-DOC.34    ✓ Brief Update v3.3 (HELP phase + OpenCall
                 OS: Owner Admin role, Phase SETUP/THEME
                 specs, app_settings keys, Migration 023
                 scope, Help System section, Platform Setup
                 section, R32/R33 added, prompt log updated)
30BN-HELP.1    ✓ (see Phase HELP above)
30BN-HELP.2a   ✓ (see Phase HELP above)
30BN-HELP.2b   ✓ (see Phase HELP above)
30BN-HELP.2c   ✓ (see Phase HELP above)
30BN-HELP.2d   ✓ (see Phase HELP above)
30BN-ADMIN.27  ✓ (see Phase HELP above)
30BN-ADMIN.28  ✓ (see Phase HELP above)
30BN-ADMIN.29  ✓ (see Phase HELP above)
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

### R27 — Live Task Tracking Is a Single Persistent Element
The task tracker enabled at the start of a build session is a single element updated in place as work proceeds. It must not be re-emitted or repeated after individual tasks. Claude Code manages the live-update behavior natively. Prompts must not include the instruction to "re-emit the tracker after each step."

Current convention (Phase 12 onward): prompts use "Enable live task tracking for this build:" followed by lettered tasks (Task A, Task B...). Earlier prompts used "Step tracker: ☐ Step 1..." format. Both work; the lettered task format is standard going forward. The core rule is unchanged: one tracker, updated in place, never re-emitted. Established Phase 4 build session.

Note on placement: R27 governs session conduct, not a product or schema decision. It lives here in §14 for the same reason as R16 and R22. Brief §13 carries a cross-reference.

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

### All Build Prompts in a Single Fenced Code Block (established 13.3b/13.4a)
Every build prompt must be delivered as a single fenced code block — not as a Session Starter Block followed by a separate prompt block. The doc-read instruction ("Before writing any code, read these two files...") and the full prompt content (SCOPE, TASK A, TASK B, etc., Quality Gate, Build Report format) must all appear inside one continuous fenced code block. Splitting them into two blocks creates ambiguity about whether the session starter is optional, which undermines its purpose. Confirmed correction during Phase 13: multiple prompts were flagged for having the session starter as a separate block before this rule was explicit. Owner direction: "all prompts must be completely contained within a single code block." Applies to all future prompts — build, DOC, and ADMIN.

### next/link for Internal Navigation (established 30BN-11.1)
In Next.js App Router, plain `<a>` tags used for internal navigation (links to routes within
the app, e.g. `/`, `/crew/dashboard`) trigger the `@next/next/no-html-link-for-pages` ESLint
rule, which breaks the maintained zero-error lint baseline. Always use `next/link` for internal
routes. Plain `<a>` tags are correct only for external URLs (links leaving the app domain). This
is distinct from R19 (which concerns the shadcn Button/cva component and tailwind-merge) —
`next/link` is not a cva component and has no tailwind-merge conflict. Confirmed when 11.1 spec
specified plain `<a>` tags for the 404 and error pages; Claude Code correctly substituted
`next/link` to maintain lint baseline (DOC.17 F1 note in Brief). Add to §11 checklist and §10
grep if needed.

### DOC Prompt Completeness Verification (established DOC.17)
Document update prompts (DOC.xx) that contain many discrete edits are vulnerable to a specific
failure mode: Claude Code applies a subset of the edits without flagging the omissions.
Confirmed in DOC.17, where Edits 1–21 were silently skipped and only Edits 22–26 were applied.
To prevent this:
- Every DOC prompt must assign a sequential edit number to every discrete str_replace operation.
- The step tracker must list every edit by number.
- After each str_replace, Claude Code must view the affected lines and report the line numbers
  confirmed before proceeding to the next edit.
- The build report Completed section must list every edit by number — any gap in the numbering
  is a defect that must be flagged.
- The owner must verify the build report covers all edit numbers before marking the DOC prompt
  complete.
This rule applies to all DOC prompts regardless of length. The view-after-each-edit step is
mandatory, not optional. A DOC prompt with 26 edits that reports only 5 in its build report is
incomplete, full stop.

### Codebase sweep before column removal (established CAL.1)
Before executing any migration that drops or renames a column, run a full codebase grep to
identify every file referencing that column. This is mandatory — missing even one reference
produces a runtime error or silent data mismatch after the migration deploys. The Task A audit
pattern in CAL.1 found 19 files referencing show_type before it was removed. The correct
sequence:
- Task A (audit): grep for all references, report every file and line number.
- Review findings; identify any that require owner decisions before proceeding (flag as F-items).
- Task B (migration): write and apply the migration only after all findings are confirmed safe.
- Tasks C–H (sweep): update every identified file.
- Final grep: confirm zero remaining references.
Never skip the pre-migration audit on a column removal. The confirmed failure mode is a build
that succeeds but crashes at runtime when a file reads a column that no longer exists.

### Commit-before-build-report (established CAL.5b)
Every build prompt must commit and push to origin/main before delivering the build report. The
closing instruction block of every prompt must include: "After completing all tasks, commit and
push before delivering the build report." Rationale: the build report must describe what was
actually deployed, not what was planned. A build report delivered before pushing can describe
work that was never committed.

### Post-build audit session pattern (established CAL.5b-AUDIT; extended 15.2-AUDIT)
Issue a dedicated read-only audit session (`[PROMPT-ID]-AUDIT`) immediately after a
build when either of these conditions is met:

1. **Context compaction mid-build:** The session was compacted before all tasks
   completed. Do not trust the build report from a compacted session — the rebuilt
   portion was produced without full prompt context and is likely incomplete or
   incorrect. 15.2-AUDIT established this as a mandatory trigger: 9 FAILs found,
   all tracing to work lost during compaction of Tasks D/E.

2. **High deliverable volume:** The prompt created/modified enough files that
   comprehensive verification during the build session itself was impractical.
   CAL.5b-AUDIT established this trigger (84 items checked).

Structure:
- Phase A only (no Phase B — no code changes)
- Read every new and modified file in full
- Compare each against its spec in the prompt
- Rate each check: PASS / PARTIAL / FAIL
- Report summary: total checked, PASS/PARTIAL/FAIL counts, list of items requiring
  a fix prompt
- Any FAIL or significant PARTIAL drives a separate `[PROMPT-ID]-FIX` prompt

Pattern history: CAL.5b-AUDIT (84 items, 60 PASS, 17 PARTIAL, 7 FAIL) →
CAL.5b-FIX (6 fixes) → CAL.5b-FIX2 (1 residual). 15.2-AUDIT (81 items, 71 PASS,
1 PARTIAL, 9 FAIL) → 15.2-FIX (all 9 resolved).

### Calendar server action client rule (established CAL.5a)
All server actions in `lib/actions/calendar.ts` use `getServerClient()`. They are always invoked
from authenticated admin sessions (Production Crew context — never public-facing). Utility
functions (`syncShowDateToCalendar()`, `hasConflict()`, `hasConflictWithBuffer()`) accept the
supabase client as a parameter from the calling action. The caller constructs the client once
and passes it in; utility functions never construct their own client. `lib/utils/calendar-
availability.ts` is pure (no DB calls) and safe to import from Client Components.

### lib/actions/blast.ts Uses getServerClient() (established 13.3a)
The blast composer server actions (`searchVolunteers()`, `previewBlast()`, `sendBlastEmail()`) all use `getServerClient()` — they are always invoked from authenticated Editor or Super Admin sessions. The private helper `resolveBlastRecipients()` receives the supabase client as a parameter from its callers (`previewBlast()` and `sendBlastEmail()`), following the same parameter-passing pattern as `syncShowDateToCalendar()` and the calendar utility functions. Never use `getAdminClient()` in blast actions — the session exists.

### DOC prompt task tracker ranges must match actual edits (established DOC.25a/DOC.25b)
DOC prompts list edits sequentially and track them in the task tracker (e.g., "Task B: Edits
1–8"). The task tracker ranges must be written after the edits are finalized, not before.
DOC.25a flagged a mismatch where the tracker said "Edits 14–38" but the prompt only contained
Edits 1–14; DOC.25b had a similar mismatch. Procedure: finalize all EDIT blocks first, count
them, then write the task tracker with accurate ranges.

### Content-Disposition headers must use fixed filenames (established ADMIN.26 / CAL.7)
HTTP `Content-Disposition: attachment; filename="..."` headers must never interpolate user-supplied or DB-sourced values (show names, volunteer names, record IDs, etc.) into the filename field. If the value contains a `"` character, the header value is malformed and the download may fail or behave unexpectedly across browsers. Use a fixed, safe filename for all downloadable route handlers: `'Content-Disposition': 'attachment; filename="volunteer-call.ics"'` Confirmed failure pattern: `filename="${show.name}.ics"` in `/api/calendar/claim.ics/route.ts` — fixed in ADMIN.26 to `filename="volunteer-call.ics"`. Applies to: iCalendar routes, PDF export routes, CSV export routes, and any future downloadable route.

### lib/utils/calendar-recurrence.ts is pure client-safe (established CAL.10a)
`generateOccurrenceDates()` and `describeRecurrence()` have no DB calls and no server-only imports. Safe to import from Client Components — required for the live N-events preview in `CalendarRecurringEventForm.tsx`. The functions use `date-fns` primitives only. `addMonths()` correctly handles month-end edge cases (Jan 31 + 1 month → Feb 28/29). Same pattern as `lib/utils/calendar-availability.ts` (CAL.4b) and `lib/milestones-shared.ts` (9.2). Do not add server-only imports to this file — it would break the Client Component import chain.

### logEmailSent() Internal Helper Pattern (established 13.1)
`logEmailSent()` is an internal, unexported helper in `lib/email.ts` used to write `email_log` + `email_log_recipients` rows after every system email send. Key rules:
- Always called AFTER `resend.emails.send()` succeeds — never before. A send failure means no log row. A log failure must never block email delivery.
- Uses `getAdminClient()` internally — correct for all contexts where system emails fire (public routes, cron routes, no session cookie).
- All errors are silently swallowed inside the helper. Logging failures are non-fatal.
- Not exported from `lib/email.ts` — only callable within that file.
- Action files and cron files that send email (e.g., `lib/actions/admin-registration.ts`, `lib/actions/users.ts`, `app/api/cron/reminders/route.ts`) use an inline log pattern directly with `getAdminClient()` rather than calling `logEmailSent()`. This is correct and intentional — the helper is scoped to `lib/email.ts` functions only.
- `sentBy` is null for all system-triggered emails. Pass the acting admin's UUID only when an admin explicitly triggered the send.

### escapeHtml() in Email Templates (established 12.2a)
All user-supplied values interpolated into HTML email strings must be wrapped in the escapeHtml() utility that lives inside lib/email.ts. This prevents stored XSS via email clients, which render HTML from the email body. Apply to: volunteer names, show names, message bodies, note content — anything sourced from user input that appears inside an HTML string template. Do NOT apply to: server-controlled enum values (show_type, status fields), formatted date strings, or hardcoded strings. Plain-text emails (no HTML tags) are not vulnerable and do not need escaping. Pattern confirmed in 12.2a audit — one gap fixed in sendVolunteerConfirmationEmail() (categoryNames was unescaped). The escapeHtml() utility is local to lib/email.ts and is not currently exported; use it within that file only.

**Storage paths and system-generated URLs are exempt:**
Storage paths (e.g., `consent-forms/[volunteer_id]/[submission_id]/file.pdf`) and
system-generated URLs (e.g., `/consent/[uploadToken]`, `/documents/[accessToken]`)
are produced by the system — not sourced from user input. Do NOT apply `escapeHtml()`
to these values when interpolating them into email HTML. The three escaping rules
together:
- User-supplied strings in email HTML → `escapeHtml()` (this rule)
- TipTap HTML blast body → `sanitizeHtml()` instead (R31 / Critical Exception above)
- System-generated paths and URLs → no escaping needed (established 15.2)

### Critical Exception — TipTap HTML / Blast Body (R31, established 13.4a)
The email blast body originates from TipTap's getHTML() output and must NOT be passed through escapeHtml(). TipTap output is already structured HTML — escaping it would encode all angle brackets and produce literal &lt;p&gt; text in the email body. Instead, sanitizeHtml() from the sanitize-html package is called in sendBlastEmail() before the body reaches buildBlastEmailHtml(). lib/actions/blast.ts has its own local escapeHtml() for subject and wrapper metadata (not extracted to lib/utils/string.ts — the blast file is self-contained). See R31 in Brief §13 for the full sanitization allowlist.

### R31 — Blast Body Uses sanitize-html, Not escapeHtml() (cross-reference)
Documented in Brief §13 R31. Referenced here for R-number continuity. Core rule: TipTap HTML output passed as the blast body in sendBlastEmail() must be processed by sanitizeHtml(), not escapeHtml(). Allowlist: p, strong, em, ul, ol, li, br, h1, h2, h3, blockquote, a[href]. Schemes: http, https, mailto only. Established 13.4a. See §10 grep check and §11 checklist item.

### ADMIN.28 — middleware.ts Renamed to proxy.ts

Next.js 16 deprecated the middleware.ts file convention in favor of proxy.ts. This project
completed the rename in ADMIN.28. Going forward: route protection logic lives in proxy.ts at
the repo root. Never create or reference middleware.ts — doing so will produce a deprecation
warning and eventual build failure in future Next.js versions. The file exports a function named
proxy (not middleware). The config export with the matcher array is unchanged. See §10
grep check for verification.

### ADMIN.27 — Theme Always Defaults to Light

The prefers-color-scheme: dark media query branch was deliberately removed from both
ThemeProvider.tsx and the pre-hydration inline script in app/crew/(app)/layout.tsx in
ADMIN.27. The platform always defaults to light mode when no localStorage preference is stored.
This was an explicit owner decision. Any future prompt touching ThemeProvider.tsx or the
layout pre-hydration script must NOT re-introduce the prefers-color-scheme branch. The only
two theme states are: (1) localStorage.getItem('crew-theme') === 'dark' → dark mode, and
(2) anything else → light mode. No OS preference detection.

### HelpTooltip Can Be Used in Client Components (confirmed ADMIN.29)

HelpTooltip.tsx is a Server Component (next/link + lucide-react — no server-only imports).
Despite this, it can be imported and used inside 'use client' component files without issue —
React's Server Component boundary rules only prohibit passing server-side data (like Promises or
DB results) from Server to Client, not importing Server Components into Client Component files
when those Server Components are pure render functions with no server-only dependencies.
Confirmed in ADMIN.29: 10 of the existing 26 HelpTooltip placements are in Client Components
(from 12.2c onward), all functioning correctly. ADMIN.30 added 6 more placements (total now
32), several in Client Components, all functioning correctly. There is no requirement to
restrict HelpTooltip placements to Server Component files only. When a UI heading lives
inside a Client Component, place the tooltip there directly.

### detectLinkType() Independence — Recognized DRY Exception (established 15.3/15.4)

`detectLinkType()` and related helpers (`isViewableMimeType()`, `isPlayable()`,
`getPlayLabel()`) exist as independent implementations in three files:

- `app/documents/[token]/route.ts` — route handler (server-side)
- `components/crew/media/MediaLibrary.tsx` — `'use client'` Client Component
- `app/documents/view/[token]/page.tsx` — Server Component

This triplication is intentional. The server/client boundary makes a shared
implementation impractical:

- The route handler needs to determine redirect target (player page vs. direct URL)
- The Client Component needs to determine Play/View button eligibility and label
- The Server Component needs to determine which player element to render

Extracting to a shared utility would require either a server-only or client-safe
constraint, but the helpers are used in all three contexts. The functions are short,
stable, and their logic is consistent — they just produce different outputs for each
context.

Do not attempt to DRY these implementations. If link classification logic changes,
update all three files. This is a documented exception to the DRY principle — similar
in structure to the `lib/milestones-shared.ts` split (§7), but the correct answer here
is independent implementations rather than extraction.

### Public-Route Action File Invariant (established 14.1 / 15.2)

Files serving public token-gated routes (no Supabase Auth session) use
`getAdminClient()` exclusively and carry a file-level header comment:

```typescript
// PUBLIC ROUTE — getAdminClient() only, never getServerClient()
```

This applies to: `lib/actions/checkin.ts`, `lib/actions/consent.ts`, and any future
file serving a public route with no session. The comment is not decorative — it is
an architectural invariant that prevents future contributors from adding
`getServerClient()` calls without recognizing the context.

When a domain needs both public-route actions and authenticated admin-session actions,
split them into separate files:
- `lib/actions/[domain].ts` — public route, `getAdminClient()` only
- `lib/actions/[domain]-admin.ts` — authenticated session, `getServerClient()`

Never merge the two patterns into one file. This is the same principle as the
iCalendar routes (CAL.7) — token-authenticated public routes use `getAdminClient()`
regardless of how the token was issued.

### R32 — Owner Admin Role Guard Pattern (cross-reference)

Documented in Brief §13 R32. Referenced here for R-number continuity. See also §7 Owner Admin
role guard pattern note. Core rule: after SETUP.0, operational role guards should pass
owner_admin through alongside super_admin. Only the Setup Panel (/crew/settings/setup),
owner_admin / super_admin account creation, and calendar_editor on Super Admin accounts
remain Super Admin exclusive. See §10 grep check and §11 checklist item.

### Sidebar Nav Exact-vs-Prefix Matching (established ADMIN.30)

`isActivePath(pathname, href)` uses prefix matching: it returns true when `pathname`
starts with `href`. This is correct for most nav links — e.g., `/crew/shows` should
highlight whenever the user is anywhere in the shows subtree (`/crew/shows/[id]`, etc.).

The dual-highlight bug: When two nav items share a prefix (e.g., `/crew/shows` and
`/crew/shows/opportunities`), prefix matching falsely activates the parent link when the
child route is active. The fix is to special-case the parent link in the `.map()`
render loop, not the child.

Pattern (established ADMIN.30):

```typescript
const active = href === '/crew/shows'
  ? isActivePath(pathname, href) &&
    !isActivePath(pathname, '/crew/shows/opportunities')
  : isActivePath(pathname, href)
```

Rules:
- Never modify `isActivePath()` globally — it is used correctly for all other links.
- Never use pure exact match on a parent link that has legitimate sub-routes.
- The special case belongs in the render-time active-state computation, not in the helper.
- When Opportunities has its own sub-routes (`/new`, `/[id]`, `/[id]/edit`), the child
  still uses prefix matching — only the parent needs the exclusion.

Any future nav link that would create a similar parent/child prefix collision must
follow the same pattern: special-case the parent, never touch the helper.

### Storage Bucket Naming — Single 'media' Bucket (established 15.2)

All Supabase Storage operations in this project use a single private bucket named
`media`. This bucket was created in Phase 15.2 (replacing the earlier spec for a
`documents` bucket). Never reference any other bucket name in storage calls.

The grep check in §10 confirms zero hits for `.from('documents')` in a storage
context. If you see a storage call referencing any bucket other than `media`, it is
a bug.

Path namespacing within the `media` bucket provides organizational separation:
- `consent-forms/` — under-18 consent form uploads
- `library/` — media library files (built Phase 15.3)
- `attachments/` — show/rehearsal/audition attachments (future phases)

The single-bucket design simplifies access control (one set of signed URL policies)
and avoids cross-bucket complexity in route handlers.

### proxy.ts Matcher Must Include All Guarded Paths (established SETUP.1 F1)

`proxy.ts` uses a `matcher` array (Next.js middleware config) to declare which request paths the middleware function runs on. If a path is not in the matcher, the middleware never executes for that path — including any flag guards or role blocks targeting it.

Confirmed failure mode (SETUP.1): Feature flag guards were written for the public `/calendar` and `/checkin/:path*` routes, but the matcher only declared `/crew/:path*`. The guards were silently skipped for all public path requests until the matcher was extended.

Rule: Before writing any new guard in `proxy.ts`, inspect the matcher array first. Confirm the paths being guarded are present. Extend the matcher if needed. The matcher extension must be the FIRST change — write guards only after confirming the matcher covers them.

Applies to: feature flag route blocks, Owner Admin setup route block, Production role route restriction, and any future role or flag guard on any path.

### lib/actions/setup.ts Dual-Client Pattern (established SETUP.2)

`lib/actions/setup.ts` is the only server action file in the project that uses both `getServerClient()` and `getAdminClient()` within the same file. This is intentional:

- All settings mutations (`saveOrgIdentity()`, `saveBrandColors()`, etc.) use `getServerClient()` — called from authenticated Super Admin sessions where session context and RLS should apply.
- `getSignedBrandUploadUrl()` uses `getAdminClient()` for the `supabase.storage.from('brand').createSignedUploadUrl()` call — the Supabase Storage Admin API requires the service role key regardless of session context.

Do not "normalize" this file to use a single client. The dual-client pattern is correct and documented. If a future storage-related setup action is added, use `getAdminClient()` for the storage call only — not for any `app_settings` reads/writes.

Cross-reference §7 for the dual-client pattern detail.

### resolveEmailSettings() and resolveOrgIdentity() Use getAdminClient() (established SETUP.3/ADMIN.31)

Two new `app_settings` helper functions were introduced in SETUP.3 and ADMIN.31. Both use `getAdminClient()` internally — not `getServerClient()`:

`resolveEmailSettings()` (internal to `lib/email.ts`, never exported): Fetches `email_from_address`, `email_from_name`, `org_logo_url`, `org_name`, `org_contact_email`, `brand_primary`, and `brand_accent` from `app_settings` in a single query. Returns `{ from: string, logoUrl: string, orgName: string, orgContactEmail: string, brandPrimary: string, brandAccent: string, brandPrimaryLight: string }` with 30BN defaults when keys are absent. `brandPrimaryLight` is derived server-side via `lightenHex(brandPrimary, 0.08)` from `lib/utils/color.ts` — an 8% tint of `brand_primary` (see lightenHex pattern below). Uses `getAdminClient()` because it is called from multiple contexts: cron routes (no session), `lib/email.ts` send functions (may be called from either context), and server actions. Extended ADMIN.33 (orgName), ADMIN.34 (orgContactEmail), THEME.3 (brandPrimary, brandAccent), THEME.3b (brandPrimaryLight). The `FROM_ADDRESS` and `REPLY_TO` module-level constants in `lib/email.ts` were deleted in ADMIN.34 — the 4 payload builders (`buildReminderEmailPayload`, `buildThankYouEmailPayload`, `buildShowBulkEmailPayload`, `buildCategoryMatchNotificationPayload`) now accept explicit `from?: string`, `replyTo?: string`, `brandPrimary?: string`, and `brandAccent?: string` params with inline 30BN string defaults as fallback. All call sites in `lib/actions/shows.ts` and both cron routes pass the dynamic values from their inline `app_settings` fetches. Email client constraint: Email clients do not support CSS custom properties (`var()`) or `color-mix()`. Brand hex values must be string-interpolated at send time — this is distinct from the CSS custom property approach used in the web UI. Never hardcode `#293994` or `#F26522` in email body copy or template helpers; always use the values destructured from `resolveEmailSettings()`.

`resolveOrgIdentity()` (exported from `lib/utils/org-identity.ts`): Fetches `org_name`, `org_tagline`, `org_contact_email`, `org_website_url`, `org_location`, and `org_logo_url` from `app_settings`. Returns `OrgIdentity` with 30BN defaults. Uses `getAdminClient()` because it is called from public Server Components (`app/page.tsx`) and cron routes with no Supabase Auth session. Extended ADMIN.33 to include `org_logo_url` — required for all public pages that display the org logo dynamically. Never import `resolveOrgIdentity()` from a Client Component. When a Client Component needs org identity data (e.g., `Sidebar.tsx`), the parent Server Component layout (`app/crew/(app)/layout.tsx`) calls `resolveOrgIdentity()` and passes the result as a prop — same pattern as flags and admin. This is the correct pattern for any Client Component that needs `getAdminClient()` data.

Pattern principle: `app_settings` helper functions should use `getAdminClient()` rather than `getServerClient()` when they need to work in both authenticated and unauthenticated contexts (public pages, cron routes, email functions). This avoids context-dependency errors.

`||` vs `??` for `app_settings` fallbacks (established ADMIN.34 F2):
When applying a fallback to an `app_settings` value in code, always use `||`, not `??`. The reason: `app_settings` values are seeded as empty strings `''` (e.g., `org_tagline` → `''`), not as `null` or `undefined`. The nullish coalescing operator (`??`) only triggers on `null`/`undefined` — an empty string `''` is falsy but not nullish, so `value ?? 'fallback'` silently produces `''` instead of `'fallback'` when the key is seeded but empty. The logical OR (`||`) triggers on any falsy value including `''`, which is the correct behavior for `app_settings` reads. Confirmed failure mode caught in ADMIN.34 Task D before commit — if `??` had been used for `org_tagline` metadata description, every deployment where `org_tagline` is empty would silently produce a blank `<meta name="description">` instead of the intended fallback. Pattern: `settingsMap['key'] || 'fallback'` — not `settingsMap['key'] ?? 'fallback'`.

### lightenHex() for Server-Side Hex Tint Computation (established THEME.3b)

When a brand color tint is needed in a context that does not support CSS custom properties or `color-mix()` — specifically email templates and PDF exports via `@react-pdf/renderer` — compute the tint server-side using `lightenHex()` from `lib/utils/color.ts`:

```typescript
import { lightenHex } from '@/lib/utils/color'
// amount = 0.08 → 8% brand + 92% white (matches --brand-primary-light)
const brandPrimaryLight = lightenHex(brandPrimary, 0.08)
```

`lightenHex(hex, amount)` blends a hex color with white at the given percentage (amount = 1.0 = pure hex; amount = 0.0 = pure white). The function is pure (no DB calls, no server-only imports) and safe to call from any server-side context. It produces a concrete hex string at call time — no deferred CSS evaluation.

Two call sites exist:
- `resolveEmailSettings()` in `lib/email.ts` — computes `brandPrimaryLight` and returns it alongside the other email settings. Every email send function receives it via destructuring.
- The PDF export route handler (`app/crew/(app)/volunteers/export/route.tsx`) — fetches `brand_primary` from `app_settings` and computes `brandPrimaryLight` via `lightenHex()` before passing both as props to `VolunteerListPDF`.

Do NOT use `color-mix()` in email templates or PDF stylesheets — email clients and `@react-pdf/renderer` do not evaluate CSS functions. Do NOT hardcode the tint hex value — it must derive from the live `brand_primary` at render time.

### @react-pdf/renderer — createStyles() Factory Pattern (established THEME.4)

`@react-pdf/renderer` evaluates `StyleSheet.create({...})` at module load time, before any component renders and before any props are available. This means that if brand colors are stored in module-scope constants and passed to `StyleSheet.create()` at the top level, those constants are frozen at their initial (imported) values — component props cannot override them at render time.

Confirmed failure mode (THEME.4 F2): the prompt suggested reassigning two constant declarations (`const NAVY = brandPrimary ?? '#293994'`) inside the component. This appeared correct at a code-review level but would silently have no effect — the `StyleSheet.create()` call that consumed those constants had already been evaluated at import time with the original hardcoded values. No error would be thrown; every PDF render would quietly use the original 30BN colors regardless of props.

Correct pattern: Move `StyleSheet.create()` inside a factory function called from within the component body:

```typescript
// WRONG — StyleSheet.create() at module scope, frozen before props arrive
const NAVY = '#293994'
const styles = StyleSheet.create({
  header: { backgroundColor: NAVY }
})

// CORRECT — factory function called at render time with resolved prop values
function createStyles(brandPrimary = '#293994', brandPrimaryLight = '#EEF1FA') {
  return StyleSheet.create({
    header: { backgroundColor: brandPrimary }
  })
}

export default function MyPdfComponent({ brandPrimary, brandPrimaryLight }) {
  const styles = createStyles(brandPrimary, brandPrimaryLight)
  // ... render
}
```

Apply this pattern to any new `@react-pdf/renderer` component that needs dynamic styling from props or DB values. The performance cost of calling `StyleSheet.create()` at render time (rather than module load) is negligible for document generation.

### R33 Enforcement — Brand Utility Classes in New UI Code (established THEME.1)

After Phase THEME ships, all new code that references brand-driven colors in the web UI must use the CSS utility classes defined in `app/globals.css`'s `@layer utilities` block — not the old static Tailwind token names. The static token names (`bg-navy`, `text-orange`, `bg-steel`, `bg-light-navy`, etc.) still exist in `@theme` as static hex values (R7 — `@theme` cannot use `var()`) but referencing them in new code after THEME produces static colors that never change when `brand_primary` / `brand_accent` are updated in the Setup Panel.

Correct new code (post-THEME):

```tsx
// ✓ Brand-driven color — uses the dynamic utility class
<button className="bg-brand-primary hover:bg-brand-primary/80">

// ✓ Structural/neutral color — static Tailwind token, stays forever
<div className="bg-footer-gray border-divider">

// ✗ Brand-driven color using old static token — never write after THEME
<button className="bg-navy hover:bg-navy/80">
```

The `@layer utilities` block defines these classes: `.bg-brand-primary`, `.text-brand-primary`, `.border-brand-primary`, `.ring-brand-primary`, `.hover:bg-brand-primary`, etc. (full list in `globals.css`). For opacity variants: `.bg-brand-primary\/80` (color-mix with transparent).

For brand-driven colors in email templates: use string interpolation from `resolveEmailSettings()` — not CSS classes. For PDF components: use the `createStyles()` factory pattern above.

Enforced via R33 in Brief §13. See §11 checklist item below.

`next.config.ts` `images.remotePatterns` for Supabase Storage (established ADMIN.33):
When `org_logo_url` (or any `app_settings` value) references a URL from Supabase Storage, `next/image` requires that the hostname be declared in `images.remotePatterns` in `next.config.ts`. The required entry is `{ hostname: '*.supabase.co' }`. Without this, any deployment with a custom uploaded logo will throw a runtime error ("hostname not configured under images"). This entry was added in ADMIN.33 F1 when the public page org identity sweep wired `org_logo_url` into `next/image` across 13 pages. Confirmed required for all OpenCall OS deployments. Do not remove this entry from `next.config.ts`.

### R33 — CSS Custom Properties After Phase THEME (cross-reference)

Documented in Brief §13 R33. Referenced here for R-number continuity. Core rule: after Phase
THEME ships, all new code referencing brand-driven colors must use var(--brand-primary) and
var(--brand-accent) CSS custom properties — not Tailwind brand utility classes (bg-navy,
text-orange, etc.). The @theme block in globals.css is NOT modified (R7 still applies).
Phase THEME.A audits all current usages before any replacements are made. Enforced from THEME.1
onward.

### R34 — All Non-Core Features Must Be Built Flag-Ready (cross-reference)

Documented in Brief §13 R34. Referenced here for R-number continuity. Core rule: any new
non-core feature must be built flag-ready at initial build time — not retrofitted. Flag-ready
requires: (1) feature_X seeded in migration; (2) getFeatureFlags() updated; (3) proxy.ts
route block; (4) sidebar conditional; (5) public route 404 when off; (6) action-level early
return. Core features (volunteer management, show/slot management, user management, forms,
media library, hours, opportunities, Call Board) are never flagged. Current flagged features:
feature_calendar, feature_checkin, feature_blast. Enforced from SETUP.4 onward.
See §11 checklist for the required verification item.

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
*v2.0 (July 2026 — Alpha feature-complete: §7 phone normalization utility pattern added (ADMIN.21); §10 phone normalization grep check added; §11 three new checklist items (phone normalization, next/link, sendBatchEmails helper); §13 Phase 11.1 and 11.2 marked complete; §13 DOC.14–DOC.19 + ADMIN.20–24 added to prompt log; §13 Phase 18 Beta items marked complete (ADMIN.22–24); §14 next/link internal navigation note added; §14 DOC prompt completeness verification note added (DOC.17 failure mode); DOC.18/DOC.19 logged)*
*v2.1 (July 2026 — Alpha build complete: §8 live task tracking convention updated (lettered tasks, "enable live task tracking" instruction); §8 react/no-unescaped-entities note added (12.2b Q1); §10 window.location comment corrected (CategoriesTable fixed in 12.1); §11 two new checklist items (honeypot on public forms 12.1, react/no-unescaped-entities 12.2b); §13 Phase 12 marked complete (12.1–12.4); §13 Phase 18 Call Board hours marked built (12.3); §13 Phase 20 thank-you email marked built in Alpha (12.4); §13 prompt log updated (DOC.20–22, 12.1–12.4); §14 R27 updated for lettered task convention; §14 escapeHtml() email template note added (12.2a); DOC.22 logged)*
*Cross-reference: 30BN_BRIEF_v1.md v3.3*
*v3.0 (July 2026 — Beta Phase CAL active: §7 calendar client patterns added (getServerClient() for calendar actions, parameter-passing pattern for utility functions, calendar-availability.ts pure client-safe); §7 FK replacement migration pattern added (CAL.1); §8 commit-before-build-report standard added (CAL.5b); §10 show_type regression grep check added (CAL.1); §10 calendar contact phone grep check added (CAL.5a); §11 three new checklist items (calendar mutations + two routes to revalidate, contact phone normalization, performance type exclusion from manual creation); §13 Phase CAL added to Beta Build section (CAL.1–CAL.5b complete, CAL.6–CAL.8 planned); §13 ADMIN.25 + CAL.1–CAL.5b + all fix prompts + DOC.25a/25b added to prompt log; §14 five new rules: codebase sweep before column removal, commit-before-build-report, post-build audit session pattern, calendar server action client rule, DOC prompt task tracker accuracy; DOC.26 logged)*
*v3.1 (July 2026 — Phase CAL complete: §7 iCalendar route getAdminClient() exception added (CAL.7); createUser() auth.admin exception clarified (ADMIN.26 confirmed pattern); Content-Disposition fixed-filename rule added (ADMIN.26); calendar-recurrence.ts + calendar-layout.ts pure client-safe noted (CAL.10a, CAL.9); §11 three new checklist items (Content-Disposition filename safety, recurring event creation pattern, recurring event edit/cancel scope pattern); §13 Phase CAL marked complete (CAL.1–CAL.10c); §13 DOC.26–27 + CAL.6–CAL.10c + ADMIN.26 added to prompt log; §14 two new rules: Content-Disposition fixed filename, calendar-recurrence.ts pure client-safe; DOC.29 logged)*
*v3.2 (July 2026 — Phase 13 complete: §2 header updated (Phase 13 complete, Phase 14 next); §14 logEmailSent() helper pattern added (13.1 — internal to lib/email.ts, getAdminClient(), errors swallowed, never before send, inline pattern for action/cron files); §14 blast.ts getServerClient() note added (13.3a — authenticated session, resolveBlastRecipients receives client as parameter); §8 single-fenced-code-block rule added for all prompts (13.3b/13.4a confirmed correction); §10 blast sanitization grep + logEmailSent export grep added; §11 three new checklist items (logEmailSent() after send, blast body sanitizeHtml not escapeHtml, no <form> in Client Components); §13 Phase 13 marked complete (13.1–13.4b each described, 13.4c pending); §13 prompt log updated (DOC.31–DOC.32 + 13.1–13.4b added); §14 single-fenced-code-block rule added; §14 escapeHtml() note updated (TipTap exception + blast.ts local copy); §14 R31 cross-reference added; DOC.32 logged)*
*v3.3 (July 2026 — HELP phase + OpenCall OS additions: §2 header updated (HELP phase + OpenCall OS, Phase 14 next); §7 Owner Admin role guard pattern added (SETUP.0 design — checks super_admin || owner_admin for operational features, super_admin-only for Setup Panel + account escalation); §7 getFeatureFlags() pattern added (Phase SETUP design — all feature flag reads through lib/feature-flags.ts); §7 lib/actions/setup.ts getServerClient() note added (Phase SETUP design); §10 three new grep checks added (proxy.ts/middleware.ts, feature flags, owner_admin role guards); §11 two new checklist items (owner_admin role guards, feature flags via getFeatureFlags()); §13 13.4c marked complete (npm sweep: next 16.2.11, 6 remaining blocked upstream); §13 Phase HELP section added (HELP.1–HELP.2d + ADMIN.27–29 all complete); §13 Phase SETUP section added (SETUP.0–4 pending); §13 Phase THEME section added (THEME.A/1–3 pending); §13 prompt log updated (DOC.33–34, HELP.1–HELP.2d, ADMIN.27–29); §14 ADMIN.28 proxy.ts rename note added; §14 ADMIN.27 light-mode-always note added; §14 HelpTooltip Client Component clarification added; §14 R32 cross-reference added (owner_admin role guard); §14 R33 cross-reference added (CSS custom properties post-THEME); DOC.35 logged)*
*v3.4 (July 2026 — SETUP.0 complete: §2 header updated (SETUP.0 complete, Phase 14 next); §7 Owner Admin role guard pattern note updated (not-yet-built language removed); §10 owner_admin grep check comment updated (post-sweep standing verification); §13 Phase SETUP updated (SETUP.0 ✓ with full summary, "(pending)" removed from header, DOC.36 added to prompt log); SETUP.1–4 still pending; DOC.36 logged)*
*v3.5 (July 2026 — Phase 14 complete + Phase 15.1–15.2 complete: §2 header updated (Phase 14 complete, Phase 15.3 next); §7 five new patterns added: public-route action file invariant (getAdminClient() only + header comment + *-admin.ts split — 14.1/15.2), P-DC upload pattern (signedUploadUrl → client PUT → confirm action, XHR for progress, media bucket only — 15.2), lib/data/*.ts parameter-passing pattern (client as parameter, never construct internally — 15.1/CAL.3 principle), conditional zod schema factory pattern (runtime flag → factory function in both client and server — 14.1-FIX), storage bucket single-bucket note; §8 XHR-over-fetch convention added (ConsentUploadForm.tsx — only sanctioned XHR use, must include deviation comment); §10 three new grep checks: media bucket (no documents bucket), getServerClient in public-route files (must be zero), XHR usage (ConsentUploadForm only); §11 five new checklist items: P-DC pattern, public-route file invariant, storage bucket + path namespacing, attendance slot_claim_id explicit, zod factory for conditional schemas; §13 Phase 14 marked complete (14.1, 14.1-FIX, 14.2, 14.3); §13 Phase 15 added (15.1 ✓, 15.2 ✓, 15.2-AUDIT ✓, 15.2-FIX ✓, DOC.37a ✓, DOC.37b ✓, DOC.38 ✓, 15.3–15.4 pending); §14 post-build audit session pattern updated (compaction mid-build = mandatory AUDIT trigger, extended from CAL.5b-AUDIT with 15.2-AUDIT evidence); §14 three new rules: public-route action file invariant, storage bucket naming (single media bucket), escapeHtml() storage path exemption; DOC.38 logged)*
*v3.6 (July 2026 — Phase 15 complete + ADMIN.30: §2 header updated (Phase 15 complete, SETUP.1–4 + THEME pending); §7 P-DC upload path note updated (library/ forward reference removed); §7 detectLinkType() independence pattern added (three intentional implementations — route handler, Client Component, Server Component — recognized DRY exception, do not extract to shared utility); §8 XHR-over-fetch note extended (MediaLibrary.tsx added as second sanctioned XHR use alongside ConsentUploadForm.tsx — both for upload progress); §10 XHR grep check updated (two sanctioned files: ConsentUploadForm.tsx + MediaLibrary.tsx); §11 one new checklist item (detectLinkType() / isViewableMimeType() evaluation for new document entry types); §13 Phase 15 marked complete (15.3 ✓ with commit 26a4585, 15.4 ✓ with commit 63570b8); §13 prompt log updated (15.3 ✓, 15.4 ✓, ADMIN.30 ✓, DOC.37c ✓, DOC.39 ✓); §14 HelpTooltip Client Component note updated (26 → 32 total placements); §14 Storage Bucket Naming library/ note updated (forward reference removed); §14 two new rules: detectLinkType() independence DRY exception (15.3/15.4); sidebar nav exact-vs-prefix matching pattern (ADMIN.30 — special-case parent link, never modify isActivePath() globally); document header v3.6; DOC.39 logged)*
*v3.7 (July 2026 — HELP.2e + DOC.41/42: §2 header updated (HELP.2e owner_admin sweep + DOC.41/42 logged); §13 prompt log updated (HELP.2e ✓ — 47 HelpContent.tsx ALL_SECTIONS entries updated, commit f4394bd; DOC.41 ✓ — Brief v3.7; DOC.42 ✓ — this prompt); document header v3.7; DOC.42 logged)*
*v3.8 (July 2026 — Phase SETUP complete + ADMIN.31/31b: §2 header updated (SETUP complete + ADMIN.31/31b); §7 feature flag pattern updated (built SETUP.1 — "not yet built" removed, three active flags noted, proxy.ts conditional fetch noted, missing key behavior noted); §7 setup.ts note updated (dual-client pattern documented — getServerClient() for mutations, getAdminClient() for getSignedBrandUploadUrl()); §7 P-DC storage bucket note updated (two sanctioned buckets: media + brand, path namespacing for each); §7 XHR sanctioned files updated (ConsentUploadForm + MediaLibrary + BrandImageUploader — count 2 → 3); §10 feature flags grep updated (flag list trimmed to 3 active flags, SetupPanel.tsx exclusion added); §10 XHR grep updated (3 sanctioned files); §10 storage grep updated (brand bucket note + second grep for all buckets); §10 new proxy.ts matcher grep check added (SETUP.1 F1); §11 five new checklist items: R34 flag-ready for new features, resolveEmailSettings() in new email functions, payload builder logoUrl param, revalidatePath layout cascade on flag saves, proxy.ts matcher audit before public guards; §13 Phase SETUP marked complete (SETUP.1–4 all ✓ with commit hashes); §13 ADMIN.31 + ADMIN.31b + DOC.43a logged; §13 Phase 19 description updated (expanded scope); §13 Phase 21 + Phase CAST + ADMIN.32/33 added; §14 four new rules: proxy.ts matcher must include all guarded paths (SETUP.1 F1), setup.ts dual-client pattern (SETUP.2), resolveEmailSettings/resolveOrgIdentity use getAdminClient() (SETUP.3/ADMIN.31), R34 cross-reference added; DOC.43b logged)*
*v3.9 (July 2026 — ADMIN.32–34 complete: §2 header updated (ADMIN.32–34 + DOC.44 logged); §7 Owner Admin role guard EXCEPTIONS updated (OA can now create/assign OA — only SA creation/deactivation remains SA-only); §14 resolveEmailSettings() return type updated (orgName + orgContactEmail added; FROM_ADDRESS/REPLY_TO deletion documented; payload builder from/replyTo params documented); §14 resolveOrgIdentity() return type updated (org_logo_url added; admin layout prop pattern documented); §14 new pattern: || vs ?? for app_settings fallbacks (confirmed failure mode ADMIN.34 F2); §14 new pattern: next.config.ts images.remotePatterns for Supabase Storage; §10 new grep check: FROM_ADDRESS/REPLY_TO must be zero; §10 Owner Admin grep comment updated (only SA-creation escalation guards remain legitimate SA-only hits); §11 payload builder checklist item updated (from/replyTo params, FROM_ADDRESS/REPLY_TO deleted); §11 resolveEmailSettings() checklist item updated (orgName + orgContactEmail); §11 Owner Admin role guard checklist item updated (OA can create OA); §11 two new checklist items (|| vs ?? pattern, no hardcoded org strings in email body copy); §13 ADMIN.32 + ADMIN.33 + ADMIN.34 all marked complete with summaries; Phase 21 prerequisites marked complete; DOC.43b-FIX + DOC.44 + DOC.45 added to prompt log; DOC.45 logged)*
*v4.0 (July 2026 — Phase THEME complete: §2 header updated (THEME complete + Phase 19/21 pre-launch + DOC.47/DOC.48 logged); §14 resolveEmailSettings() return type updated (brandPrimary + brandAccent + brandPrimaryLight added; email client constraint note added — string interpolation not CSS custom properties); §14 new pattern: lightenHex() from lib/utils/color.ts for server-side hex tint computation (email templates + PDF exports; do not use color-mix() in email or @react-pdf/renderer contexts); §14 new pattern: @react-pdf/renderer createStyles() factory pattern (StyleSheet.create() at module scope ignores props — confirmed failure mode THEME.4; factory function called inside component body is required); §14 R33 enforcement note added (post-THEME web UI code must use @layer utilities classes — bg-brand-primary etc. — never static token names); §10 two new grep checks (brand static Tailwind classes must be zero; brand hex in email templates outside resolveEmailSettings() fallbacks must be zero); §11 email send function checklist item updated (brand color params added); §11 payload builder checklist item updated (brand params added); §11 three new checklist items (post-THEME UI code uses utility classes, PDF factory pattern, email brand hex grep); §13 Phase THEME marked complete (THEME.A/1/2a–2d/3/3b-4 all ✓ with commit hashes); §13 Phase 19 status updated (pre-launch, 3-prompt structure confirmed); §13 Phase 21 updated (pre-launch); §13 prompt log: DOC.43b-FIX through DOC.48 + THEME.A through THEME.3b-4 added (14 new entries); DOC.48 logged)*
