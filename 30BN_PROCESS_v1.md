# 30 By Ninety Theatre — Build Governance
## 30BN_PROCESS_v1.md — v6.7
*Created: July 2026 | Last session: DOC.108 (Aug 2026). Version history table
below. Full build history by phase and prompt: §13. Doc-maintenance notes
(ordering corrections, sync failures): end of §14.*

| Version | Date | Summary |
|---|---|---|
| v6.7 | Aug 2026 | ADMIN.72–77 + UPSTYLE.7–8 — convert unlinked slot claims, public calendar UTC boundary fix, callboard chronological sort, VolunteerForm input tint, Q-item cleanup batch, QR Generator + Forums Option A restyling (DOC.107/108) |
| v6.6 | Aug 2026 | ADMIN.65–71 + UPSTYLE.6A/6B — PublicHeader unification, HomeCalendarWidget infrastructure, home page two-column redesign, org logo img fix, show times on claiming page date picker (DOC.106) |
| v6.5 | Aug 2026 | ADMIN.61–64 complete — Resend error detection wrappers, lookup-first slot claim gate, Call Board Upcoming Slots + cancel, editor notification → in-app + volunteer cancellation email; Migration 046 (DOC.104) |
| v6.4 | Aug 2026 | UPSTYLE.1–5 + fixes complete — Platform Setup tabs + Option A section cards, Media Library two-panel rebuild, Communication + Check-In restyled; 6 mockups removed (DOC.101) |
| v6.3 | Aug 2026 | ADMIN.58–60 complete — show deletion single-guard + cascade, updateShowStatus() archive side-effect, NavOrderSection self-healing mirror, TopBar icon sizing convention (DOC.92) |
| v6.2 | Aug 2026 | ADMIN.52–57 complete — SeasonAtAGlance self-contained component, TipTap click-to-focus, notifications row cap removed, public/fonts/ font convention (DOC.90) |
| v6.1 | Aug 2026 | ADMIN.47–51 + Phase BETA complete — resolveGroupHrefs() self-healing nav, hide-not-lock Settings hub rule, feature flags 8→9 (feature_beta) (DOC.88) |
| v6.0 | Aug 2026 | Phases QRBANNER/QRANALYTICS/SIDEBAR/NAVORDER complete — Beta Build Complete declared, thirteen new patterns incl. @resvg/resvg-js, grouped sidebar (DOC.87) |
| v5.9 | Aug 2026 | Beta phases FORUMS-FIX/FORUMS-UX/ANNOUNCE/SHOWDELETE/SHOWARCHIVE complete — revalidatePath-during-render prohibition, six new patterns (DOC.85) |
| v5.8 | Aug 2026 | Phase MM (Maintenance Mode) complete — proxy.ts maintenance gate, SetupPanel dual-client pattern, six new patterns (DOC.82) |
| v5.7 | Aug 2026 | Phase TZ complete — TZ.5b calendar subsystem sweep, useNowPosition() hook, four new patterns (DOC.79) |
| v5.6 | Aug 2026 | ADMIN.45/46 + Phase TZ foundation (TZ.A–TZ.4b) documented — getOrgTimezone(), six new patterns (DOC.77) |
| v5.5 | Aug 2026 | Phase MESSAGES complete — XHR list 7→8, forwardRef+useImperativeHandle editor pattern, six new patterns (DOC.75) |
| v5.4 | Aug 2026 | Phase MESSAGES.A–4 documented (in progress) — feature flags 7→8 (feature_messages), six new patterns (DOC.74) |
| v5.3 | Aug 2026 | Phase NOTIFY complete — sidebar atomic edit four-part→three-part (TOOLTIP_ANCHOR_MAP removed), five new patterns (DOC.73) |

---

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
the year. After Phase TZ (TZ.1), the timezone identifier itself must also be dynamic —
resolved via `getOrgTimezone(supabase)` from `lib/utils/org-timezone.ts` rather than
hardcoded to `'America/Chicago'`. The pattern: `const tz = await
getOrgTimezone(supabase)`, then `fromZonedTime(new Date(), tz)`. This is the same
principle as R23 — use the date-fns-tz primitives with the org timezone, never raw
offsets or hardcoded IANA strings. Confirmed failure mode avoided in 10.1 Q3.

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

**Phase TZ C5#4 resolved (TZ.5b ✓):** `getAvailableWindows()` in this file
was timezone-sensitive — it hardcoded a '7 AM–10 PM' business-day window using
`fromZonedTime()` with `'America/Chicago'`. Fixed in TZ.5b: `getAvailableWindows()`
now accepts `timezone: string` as a fourth parameter. Its sole caller,
`CalendarDayPanel.tsx`, passes `tz` (the SSR-guarded body attribute read).
The UTC-anchored grid helpers (`startOfWeekUTC()`, `endOfWeekUTC()`,
`enumerateDays()`, `getMonthGridDays()`, `getWeekGridDays()`) remain truly
timezone-agnostic and are unchanged.

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

**Phase TZ C5#4 resolved (TZ.5b ✓):** `computeEventPosition()` was timezone-
sensitive — it called `toZonedTime(time, CT)` with a hardcoded `'America/Chicago'`
const. Fixed in TZ.5b: `computeEventPosition()` now accepts `timezone: string`
as a fifth parameter. Its sole caller, `UnifiedWeekGrid.tsx`, passes `tz`.
`computeColumnLayout()` remains truly timezone-agnostic and is unchanged.

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
(public check-in page), `lib/actions/consent.ts` (public consent upload page),
`lib/actions/rehearsals.ts` (public rehearsal self check-in — added Phase 21), and
`lib/actions/auditions.ts` (public audition signup, upload, check-in, and cancel
flows — added Phase AUDITIONS). All four carry the // PUBLIC ROUTE header comment.

```typescript
// PUBLIC ROUTE — getAdminClient() only, never getServerClient()
```

Never add `getServerClient()` to these files. If an authenticated-session action is
needed for the same domain (e.g., an admin-side check-in roster fetch), create a
separate `*-admin.ts` sibling file that uses `getServerClient()`. The two files must
never be merged.

Pattern: `lib/actions/checkin.ts` (public, `getAdminClient()`) +
`lib/actions/checkin-admin.ts` (authenticated, `getServerClient()`). Extended in Phase 21:
`lib/actions/rehearsals.ts` (public, `getAdminClient()`) +
`lib/actions/rehearsals-admin.ts` (authenticated, `getServerClient()`). Extended in Phase AUDITIONS:
`lib/actions/auditions.ts` (public, `getAdminClient()`) +
`lib/actions/auditions-admin.ts` (authenticated, `getServerClient()`). This split pattern is
established in Phase 14, confirmed in Phase 15.2, confirmed in Phase 21, and confirmed in Phase AUDITIONS.
Extended in Phase QRANALYTICS: `app/go/[token]/route.ts` is a public route handler (no Supabase
Auth session, `getAdminClient()` only) added as the fifth sanctioned public route context — alongside
`lib/actions/checkin.ts`, `lib/actions/consent.ts`, `lib/actions/rehearsals.ts`, and
`lib/actions/auditions.ts`. Route handlers at `app/api/*/route.ts` or `app/*/route.ts` that handle
public token-gated or redirect paths follow the same invariant: `// PUBLIC ROUTE` header comment,
`getAdminClient()` only, never `getServerClient()`. See `/go/[token]` pattern note below.

**`createUser()` auth.admin exception (confirmed ADMIN.26):**
`lib/actions/users.ts` `createUser()` must keep `getAdminClient()` for the two Supabase Auth Admin
API calls: `auth.admin.createUser()` and `auth.admin.deleteUser()`. These require the service
role key and cannot function on `getServerClient()` regardless of RLS policy. This is the
established sanctioned exception documented in Brief §7. All `admin_users` table reads/writes
within `createUser()` should use `getServerClient()` — only the two `auth.admin.*` calls require
`getAdminClient()`. Confirmed during ADMIN.26 Task A audit.

**Google OAuth callback dual-client pattern (established ADMIN.36/38):**
`app/auth/callback/route.ts` uses both clients with different responsibilities:
- Session client (`createServerClient()`): code exchange (`supabase.auth.exchangeCodeForSession()`), `admin_users` query, and `supabase.auth.signOut()` when blocking an inactive account.
- Admin client (`getAdminClient()`): all `pending_registrations` operations (INSERT + SELECT) and `email_log`/`email_log_recipients` inserts in the new-registrant branch.

A newly Google-OAuth'd user with no `admin_users` row is authenticated (has a valid Supabase Auth session) but is not a Super Admin. The `pending_registrations` RLS policy only grants INSERT to anon and full access to `is_super_admin()`. The authenticated-but-not-admin user fails both policies. `getAdminClient()` is required to bypass RLS for these inserts — this is a fourth distinct sanctioned context alongside (1) account creation, (2) Call Board session, (3) public/cron routes, (4) iCalendar route handlers.

**`is_active` check must sign out before redirecting (established ADMIN.38):**
When a deactivated admin (`adminUser.is_active === false`) completes Google OAuth, the callback must call `supabase.auth.signOut()` using the session client BEFORE redirecting to `?error=not_authorized`. A bare redirect without sign-out leaves a valid Supabase Auth session in the browser. On next navigation, the session client would return a live user and the proxy would pass them through before the session expires. Sign out + redirect is the required pattern — matches what `emailLogin()` does via `getAdminUser()` for the email/password path.

**`updateVolunteerInfo()` is the public-route submit action for `/update` (established 19.2):**
`app/update/actions.ts` — `updateVolunteerInfo()` — is the server action called by `VolunteerUpdateForm.tsx` on the `/update` public form. It uses `getAdminClient()` (no session — public route). It is NOT the same as `updateVolunteer()` in `lib/actions/volunteers.ts` (admin-session, `getServerClient()`). These are two separate action files at two different auth levels. When adding a new field to the volunteer profile that must also be editable via the `/update` self-service form, BOTH files must be updated:
1. `updateVolunteerInfo()` in `app/update/actions.ts` — for volunteers editing their own record
2. `updateVolunteer()` in `lib/actions/volunteers.ts` — for admins editing via the crew backend
Failing to update `app/update/actions.ts` causes the field to be silently dropped on `/update` saves. Confirmed gap caught in 19.2 — `communication_preference` was missing from `updateVolunteerInfo()` and would have been silently dropped without this fix.

**Dark mode cascade defect — execution patterns (established ADMIN.39a–c):**
The root cause (R35 — see §14) was documented in the ADMIN.35-AUDIT §14 note. ADMIN.39a–c established the following concrete execution patterns for any dark mode fix work and for avoiding re-introduction of the defect:

**GOVERNING HOVER RULE** (authoritative — overrides per-file audit prescriptions when they conflict). Determine the correct hover replacement by the dark: target on the element:
```
dark:hover:bg-dark-bg      → hover:bg-gray-50
dark:hover:bg-dark-surface → hover:bg-gray-100
dark:hover:bg-dark-border  → hover:bg-gray-100
```
WHITE-ON-WHITE CHECK — apply before every hover fix:
- Resting bg is bg-white → use hover:bg-gray-100 (not hover:bg-white — would be invisible)
- Resting bg is bg-gray-50 → use hover:bg-white (not hover:bg-gray-50 — would be invisible)

**STATIC NEUTRAL SUBSTITUTION TABLE** (base class replacements for bg-brand-primary-light):
```
dark: target         → Replace base class with
---------------------|------------------------
dark:bg-dark-bg      → bg-gray-50
dark:bg-dark-nav     → bg-gray-50
dark:bg-dark-surface → bg-white
dark:bg-dark-border  → bg-gray-100  (badges/chips)
/NN opacity suffix   → always preserved:
                       bg-brand-primary-light/30
                       → bg-gray-50/30
```

**TEXT COLOR FIX PATTERN:**
When `text-brand-primary` pairs with `dark:text-dark-text` the native dark: class loses to the hand-authored base via the same cascade defect. Use the hand-authored variant `dark:text-brand-primary-mid` instead — defined in the `@layer utilities` block after its base class, compiles correctly relative to `text-brand-primary`.
```
WRONG:   text-brand-primary dark:text-dark-text
CORRECT: text-brand-primary dark:text-brand-primary-mid
```

**DARK TARGET CORRECTION — two-part fix pattern:**
When an element's dark: target value is itself wrong (e.g. `dark:hover:bg-dark-surface` matches the parent panel background, making hover invisible), the fix requires changing BOTH the base class AND the dark: target value in the same edit:
```
OLD: hover:bg-brand-primary-light dark:hover:bg-dark-surface
NEW: hover:bg-gray-100 dark:hover:bg-dark-border
```
Confirmed instances in ADMIN.39a–c:
- RecurrenceScopePicker: dark-surface → dark-border
- Zebra stripes (×3 files): dark-surface/30 → dark-bg
- FieldRow badge: dark-nav → dark-border

**has-[:checked]: AND VARIANT SCOPE RULE:**
When fixing a cascade defect on a `hover:` state, inspect the same element for `has-[:checked]:`, `has-[:focus]:`, `aria-expanded:`, or any other variant-prefixed class on the same CSS property. If the same defect exists on a sibling variant, fix all affected variants in the same edit. Leaving one fixed and one broken on the same line is a half-fix. Confirmed: VolunteerProfileForm.tsx:359 had both `hover:bg-brand-primary-light` and `has-[:checked]:bg-brand-primary-light` with the same defective dark: target — both required correction (ADMIN.39b).

**READ-BEFORE-EDIT DISCIPLINE (confirmed essential for sweep prompts):**
The ADMIN.39-AUDIT's per-line prescriptions contained synthesis errors where prose descriptions of an element's context did not match the live file. Three recurring mismatch categories:
1. Dark target mismatch: audit described dark-nav but live code showed dark-surface (or vice versa). → Governing hover rule resolves this.
2. Opacity suffix not noted in audit: audit prescribed bare bg-gray-50 but live code had /30 or /50 suffix. → "Always preserve /NN" rule resolves this.
3. Element type mismatch: audit described a hover state as a base class or vice versa.
In all cases the governing rules took precedence over per-file audit prescriptions. This is now the authoritative build discipline for any future dark mode sweep work — direct file reads resolve conflicts, not audit table values.

**Hand-authored @layer utilities opacity-variant gap (R36 — established ADMIN.41/ADMIN.42-AUDIT/ADMIN.42):**
In Tailwind v4, native utility classes auto-generate opacity-suffix variants (`/NN`) and pseudo-class-stacked combinations via the JIT engine. Hand-authored classes in the `@layer utilities` block do NOT. Each specific combination requires its own explicitly authored rule.

This is a distinct bug class from R35 (which concerns cascade ordering between hand-authored and native classes). R36 concerns missing rules that produce silent CSS failures — no build error, no lint error. The element renders as if the class is not present, or falls back silently to a sibling class.

```
WRONG assumption: bg-brand-primary exists in globals.css,
therefore hover:bg-brand-primary/80 also works.
→ hover:bg-brand-primary/80 produces zero CSS output
  because no .hover\:bg-brand-primary\/80:hover rule
  exists.

CORRECT: check globals.css for the exact combination.
If absent, author the rule following the existing
pattern:
.hover\:bg-brand-primary\/80:hover {
  background-color: color-mix(in srgb,
    var(--brand-primary) 80%, transparent);
}
```

**Confirmed impact in ADMIN.42-AUDIT:**
12 missing rules found across all `components/ui/` files (button.tsx, dialog.tsx, alert-dialog.tsx). Three had ACCESSIBILITY impact — keyboard focus rings on button variants and dialog close buttons produced no brand color. All closed in ADMIN.42.

**When this applies:**
- Adding a brand utility class to any component with an opacity suffix: `/10`, `/20`, `/30`, `/40`, `/50`, `/60`, `/70`, `/80`, `/90`
- Adding a brand utility class with a stacked variant: `hover:/NN`, `focus-visible:/NN`, `dark:/NN`, `dark:hover:/NN`, `dark:focus-visible:/NN`, `aria-invalid:/NN`, etc.
- Adding any of the above to `components/ui/` shadcn primitives (which are used throughout the app and affect all surfaces)

**Enforcement:** See §10 grep check and §11 checklist item.

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
   browser-native way to report file upload progress. XHR must include a comment
   explaining the deviation (see §8 XHR section for the required comment text).
   **Body format:** Use `FormData` with `cacheControl: '3600'` and the file appended
   under an empty field name (`''`) — NOT a raw file body with an explicit
   `Content-Type` header. Confirmed correct pattern across all five sanctioned XHR
   locations. AUDITIONS.3a F1 caught a prompt spec that described raw file body;
   the build correctly used FormData instead.

3. Client calls a confirmation server action with the `path`. The action records the
   storage path in the DB.

Two sanctioned storage buckets exist in this project:

`media` (private) — all platform media files. Signed URLs required for access. Namespaced paths:
- `consent-forms/[volunteer_id]/[submission_id]/` — consent form uploads
- `library/[folder_id]/[document_id]/` — media library files
- `attachments/[type]/[record_id]/[document_id]/` — show/rehearsal/audition attachments
- `audition-materials/[signup_id]/[type]-[uuid].[ext]` — audition material uploads
  (headshot, resume, sheet_music, mp3, video — Phase AUDITIONS)
- `inventory/[item_id]/[uuid].[ext]` — inventory item photo uploads (Phase INVENTORY.3)
- `forums/[post_id]/[uuid].[ext]` — forum post attachments (Phase FORUMS.4); final path after temp-key move
- `forums/temp/[tempKey]/[uuid].[ext]` — forum post attachment staging (temp-key pre-post upload — moved to final path at post creation via `adminClient.storage.from('media').move()`)
- `messages/temp/[tempKey]/[uuid].[ext]` — DM message attachment temp upload staging (Phase MESSAGES.6)
- `messages/[replyId]/[uuid].[ext]` — final path after `adminClient.storage.from('media').move()` at submit time. Per-attachment move errors are swallowed with `continue` — the message is already sent when the loop runs.

`brand` (public) — brand asset files uploaded via the Setup Panel. Direct URL access without auth. Namespaced paths:
- `brand/logo/[uuid].png` — org logo uploads
- `brand/favicon/[uuid].png` — favicon uploads

`media` reads go through the `/documents/[token]` redirect route (access tier + signed URL generation). `brand` files are served directly via public URL — never through the redirect route (they're intentionally public). Never use `brand` for any access-controlled content. Never use `media` for brand assets that must be publicly accessible on landing pages.

**Storage API calls require `getAdminClient()` regardless of session context (confirmed INVENTORY.3 F1):**
The Supabase `storage.objects` table has zero RLS policies — access is governed by the service role key, not by the user's session. This means all storage API operations (`createSignedUrl`, `createSignedUploadUrl`, `remove`) on the `media` bucket must use `getAdminClient()`, even when the calling function is running inside an authenticated server action context that otherwise uses `getServerClient()`.

The correct dual-client pattern for functions that combine storage operations with DB row operations:
```typescript
// DB operations — use the authenticated session client
const supabase = getServerClient()
const { data: row } = await supabase.from('inventory_photos').select('*')...

// Storage operations — always use the admin client (service role required)
const adminClient = getAdminClient()
const { data: signedUrl } = await adminClient.storage
  .from('media').createSignedUrl(row.storage_path, 3600)
```

This is not a security weakness — the admin client is server-side only and the path is derived from an authenticated DB query, not from user input. The dual-client pattern is intentional and correct. Confirmed failure mode before INVENTORY.3 F1 fix: using `getServerClient()` for storage calls returned null signed URLs silently with no error thrown, because the session client lacks the service role key required for storage access.

Apply this pattern to all future functions that need both: (1) authenticated DB access via `getServerClient()` and (2) storage operations on the `media` bucket.

**Supabase JS client cannot alias dual self-joins — two-fetch-plus-TypeScript-join pattern (established INVENTORY.4 Q2):**
When a query needs two different JOINs on the same table (e.g., `inventory_checkouts` needs `checked_out_by → admin_users` AND `target_user_id → admin_users`), the Supabase JS client `.select()` syntax cannot alias the joins to differentiate them. Attempting this produces a single merged result or a type error.

Established workaround — the two-fetch-plus-TypeScript-join pattern:
```typescript
// Step 1: Fetch the primary rows
const { data: checkouts } = await supabase.from('inventory_checkouts').select('*')

// Step 2: Collect all distinct FK IDs needed
const adminUserIds = [
  ...new Set([
    ...checkouts.map(c => c.checked_out_by).filter(Boolean),
    ...checkouts.map(c => c.target_user_id).filter(Boolean),
  ])
]
const showIds = checkouts.map(c => c.target_show_id).filter(Boolean)

// Step 3: Fetch referenced rows by ID in two queries
const { data: adminUsers } = await supabase
  .from('admin_users').select('id, name').in('id', adminUserIds)
const { data: shows } = await supabase
  .from('shows').select('id, name').in('id', showIds)

// Step 4: Build lookup maps and join in TypeScript
const adminMap = Object.fromEntries((adminUsers || []).map(u => [u.id, u]))
const showMap = Object.fromEntries((shows || []).map(s => [s.id, s]))
return checkouts.map(c => ({
  ...c,
  checked_out_by_name: adminMap[c.checked_out_by ?? '']?.name,
  target_show_name: showMap[c.target_show_id ?? '']?.name,
  target_user_name: adminMap[c.target_user_id ?? '']?.name,
}))
```

This pattern produces 3 queries instead of 1 but avoids the alias limitation entirely. Extract to a named helper function (e.g., `enrichCheckouts()`) — do not inline in the main query function. Confirmed pattern across INVENTORY.2 (`attachCheckoutStatus()`), INVENTORY.3 (`attachPhotosAndNotes()`), and INVENTORY.4 (`enrichCheckouts()`). Apply to any future cross-table enrichment where two FKs reference the same table.

**Never create a client inside a loop.** Create once per function, reuse.

**Feature flag pattern via getFeatureFlags() (built SETUP.1):**
All feature flag values must be read through `getFeatureFlags()` in `lib/feature-flags.ts`. This helper fetches all `feature_*` keys from `app_settings` in a single query and returns a typed object (`FeatureFlags`). Never read individual feature flag keys inline from `app_settings` — always use the shared helper. Key rules:

`getFeatureFlags(supabase: SupabaseClient)` is client-agnostic — it accepts the Supabase client as a parameter and never constructs its own. Pass whichever client is appropriate for the calling context: authenticated Server Components and Server Actions pass `getServerClient()`; public routes and cron contexts pass `getAdminClient()`; `proxy.ts` (middleware/Edge runtime context) passes `getAdminClient()` — no cookie session exists there. The caller is always responsible for constructing the client; `getFeatureFlags()` does not require or imply any particular client type. (Corrected DOC.62 — the earlier text in this paragraph incorrectly stated `getFeatureFlags()` "uses `getServerClient()`"; the corrective block below at "client-agnostic" was already authoritative but the stale text above it created a contradiction. Both now agree.)

Middleware (`proxy.ts`) checks flags for route-level blocking. Flags are fetched conditionally — only when the request path matches one of the five guarded routes — not on every request. This avoids a DB call on every page load.

Sidebar conditionally renders links based on flags passed as props from the crew layout.

The typed return object prevents key-name typos and handles missing keys consistently. Missing keys default to `!== 'false'` (i.e., missing = enabled — never silently disables a feature).

Active feature flags (nine — core features are not flagged): `feature_calendar`, `feature_checkin`, `feature_blast`, `feature_rehearsals`, `feature_auditions`, `feature_inventory`, `feature_forums`, `feature_messages` (added Migration 037 / Phase MESSAGES — MESSAGES.1), `feature_beta` (added Migration 043 / Phase BETA). `feature_calendar` through `feature_blast` were present since SETUP.1. `feature_rehearsals` was added in Migration 031 (Phase 21). `feature_auditions` was added in Migration 032 (Phase AUDITIONS). `feature_inventory` was added in Migration 034 (Phase INVENTORY — INVENTORY.1). `feature_forums` was added in Migration 035 (Phase FORUMS — FORUMS.1, commit dde841d, applied). `feature_beta` was added in Migration 043 (Phase BETA). This is the second flag that defaults to `'false'` (opt-in, disabled by default — same evaluation logic as `feature_messages`). Enables the `/crew/settings/beta` Beta Feedback page. `feature_opportunities`, `feature_hours_milestones`, and `feature_documents` were deleted in Migration 026 — those are core features.

Note: `feature_messages` and `feature_beta` are the only two flags
that default to `'false'` (opt-in, disabled). All other flags default
to enabled (`''` or `'true'`). The `!== 'false'` evaluation logic means
a missing key evaluates as enabled — an explicit `'false'` seed is
required to disable at initialization. Private
Messaging is opt-in; enabling it activates /crew/messages, /crew/users,
MessagesIcon in TopBar, and Messages + Directory sidebar links.

Any new prompt adding a feature-flagged route or component must import and call `getFeatureFlags()` — never a direct `app_settings` query for `feature_*` keys. See R34 in Brief §13 for the full flag-ready requirement.

**`getFeatureFlags()` is client-agnostic — pass whichever client the caller constructed (corrected AUDITIONS.2a):** `getFeatureFlags(supabase: SupabaseClient)` in `lib/feature-flags.ts` accepts the Supabase client as a parameter and never constructs its own — it does NOT require `getServerClient()`. Public-route and cron contexts pass `getAdminClient()`; authenticated contexts pass `getServerClient()`. `syncAuditionToCalendar()` (`lib/actions/calendar-sync.ts`) calls `getFeatureFlags(supabase)` with whichever client its caller passed in — same pattern as `syncShowDateToCalendar()`. An earlier build comment in that file incorrectly claimed `getFeatureFlags()` calls `getServerClient()` internally; this was corrected in AUDITIONS.2a and the corrected reasoning is preserved as a comment at the call site. Do not reintroduce that misconception.

**Inline single-key `app_settings` read as a lightweight alternative for public routes (established Phase AUDITIONS):** `getUpcomingAuditions()` in `lib/actions/auditions.ts` (a public-route file) reads `feature_auditions` via a direct single-key `app_settings` query rather than calling `getFeatureFlags(getAdminClient())`. This is a legitimate minor-efficiency choice when a public route needs exactly one flag — `getFeatureFlags()` fetches all five keys in one query, which is unnecessary overhead for a single-flag check. It is NOT because `getFeatureFlags()` is unusable from a public-route context (it is usable — see above). Either approach is acceptable for a public route: call `getFeatureFlags(getAdminClient())` (simplest, consistent with the rest of the codebase) or inline a single-key query when only one flag is needed and the extra columns are wasteful.
```typescript
const supabase = getAdminClient()
const { data: flagRow } = await supabase
  .from('app_settings')
  .select('value')
  .eq('key', 'feature_auditions')
  .single()
if (flagRow?.value === 'false') return []
```
NOTE (DOC.60 Q-item, resolved ADMIN.44): the comment above `getUpcomingAuditions()` in the live file previously described this as "the same pattern as `syncAuditionToCalendar()`" — that claim was stale since `syncAuditionToCalendar()` was corrected in AUDITIONS.2a to call `getFeatureFlags()`. The comment also incorrectly stated `getFeatureFlags()` "cannot be used" from a public-route context. Both inaccuracies were corrected in ADMIN.44 (commit b654083). The live comment now accurately describes `getUpcomingAuditions()` as using an inline single-key fetch as a lightweight alternative — not because `getFeatureFlags()` is unusable, but as a minor-efficiency choice.

**5-file pattern for adding a new feature flag (confirmed AUDITIONS.1a F2):**
Every new feature flag requires exactly 5 file changes. Missing any one produces a silent failure — wrong TypeScript types, a toggle that doesn't save, or stale cache on flag change:
1. Migration SQL — seed the key in `app_settings` with `ON CONFLICT DO NOTHING`
2. `lib/feature-flags.ts` — add to `FeatureFlags` type, `getFeatureFlags()` fetch array, and return object
3. `components/crew/settings/SetupPanel.tsx` — new toggle in Section 6
4. `app/crew/(app)/settings/setup/page.tsx` — companion edit for `SetupPanelInitialValues` type widening (this type propagates from `lib/feature-flags.ts` — the tsc error surfaces here and only here when step 2 is applied without step 4)
5. `lib/actions/setup.ts` — add `revalidatePath('/crew/[new-route]')` inside `saveFeatureFlags()`

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

**`revalidatePath()` via `.select()` for parent ID retrieval (established ADMIN.37):**
When a server action operates on a child record by its own ID (e.g. `deleteNote(noteId)`, `editNote(noteId, body)`) and needs to call `revalidatePath` for the parent record's page, but the parent record's ID is not a direct parameter, the action must retrieve it from the query result:

```typescript
// WRONG — no parent ID available for revalidatePath
const { error } = await supabase
  .from('volunteer_notes')
  .delete()
  .eq('id', noteId)

// CORRECT — retrieve volunteer_id via .select()
const { data: deletedNote, error } = await supabase
  .from('volunteer_notes')
  .delete()
  .eq('id', noteId)
  .select('volunteer_id')
  .single()

if (!error && deletedNote) {
  revalidatePath(`/crew/volunteers/${deletedNote.volunteer_id}`)
}
```

This pattern avoids a separate pre-delete SELECT query and retrieves the parent ID in a single operation. Confirmed in ADMIN.37: `editNote()` and `deleteNote()` both required this pattern when `revalidatePath()` was added — the functions had only `noteId` as a parameter and no other way to obtain `volunteer_id`.

**`admin_users.id` is the Supabase Auth UUID — no `auth_user_id` column (established 21.1 F1 / R37):**
When writing RLS policies that self-scope to the calling admin user, use `admin_user_id = auth.uid()` directly for FK columns referencing `admin_users.id`. Do not join through a non-existent `auth_user_id` column.

The `admin_users` table has no `auth_user_id` column. The `id` column IS the Supabase Auth UUID — they are the same value. All existing RLS helper functions (`is_editor()`, `is_super_admin()`, `is_super_admin_or_owner_admin()`, `is_admin()`) verify role via:
`EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN (...))` — this pattern is correct and consistent.

For FK columns referencing `admin_users.id` (e.g. `rehearsal_schedule_assignments.admin_user_id`):
```sql
-- WRONG — auth_user_id column does not exist
CREATE POLICY "production_select_own" ON table
  FOR SELECT TO authenticated
  USING (
    admin_user_id IN (
      SELECT id FROM admin_users
      WHERE auth_user_id = auth.uid()  -- column does not exist
    )
  );

-- CORRECT — admin_users.id IS auth.uid()
CREATE POLICY "production_select_own" ON table
  FOR SELECT TO authenticated
  USING (admin_user_id = auth.uid());
```

Confirmed failure mode (21.1 F1): Migration 031 draft used `auth_user_id = auth.uid()` in RLS policies for Production self-scoping. Schema verification (R2) before applying confirmed the column does not exist. Corrected to `admin_user_id = auth.uid()` before the migration was run.

Cross-reference: Brief §13 R37 (new rule in v4.5).

**Sidebar data-driven three-part atomic edit (established 21.A Audit E / 21.2; extended INVENTORY.1; updated NOTIFY.1/NOTIFY.4-CLEANUP):**
The crew sidebar is data-driven via three locations in `components/crew/Sidebar.tsx`:
1. `NAV_ITEMS` — the nav item object (icon, label, href)
2. `FLAG_GATED_HREFS` — the set of hrefs gated by feature flags
3. Production role allowlist — the set of hrefs accessible to the Production role (not just SA/OA/Editor/Viewer)

All three must be edited atomically when adding a new flagged nav link. Missing any single location produces a silent failure:
- Missing NAV_ITEMS: the link does not appear at all for any role
- Missing FLAG_GATED_HREFS: the link appears even when the flag is off, bypassing the feature gate entirely
- Missing the Production allowlist: the link appears for all roles EXCEPT Production, even when the spec requires Production access — no error, no warning, just invisibility for that role

**TOOLTIP_ANCHOR_MAP removed (NOTIFY.1/NOTIFY.4-CLEANUP):**
The `TOOLTIP_ANCHOR_MAP` (formerly the 4th required location) was removed in its entirety during Phase NOTIFY. The render block was removed in NOTIFY.1; the const definition was removed in NOTIFY.4-CLEANUP. HelpTooltips no longer appear on any sidebar nav link. HelpTooltips on page-level headers and component content areas (e.g., Rehearsals list page header, AuditionDetailTabs section headers) are in separate component files and are unchanged. Any new flagged nav link requires only three atomic edits — the fourth location no longer exists.

Confirmed in 21.2: three-part atomic edit required. INVENTORY.1: extended to four-part (TOOLTIP_ANCHOR_MAP added). NOTIFY.1/NOTIFY.4-CLEANUP: reverted to three-part (TOOLTIP_ANCHOR_MAP removed).

This is the same class of silent failure mode as SETUP.1 F1 (proxy.ts matcher must cover all guarded paths before guards are written). The pattern: audit all three locations before making any edit, confirm all three are updated in the same commit.

**`createNotification()` companion-module pattern (established
NOTIFY.2):**
The notification write helper `createNotification()` lives in
`lib/utils/notifications.ts` — a plain TypeScript module with
NO `'use server'` directive. It accepts the Supabase client as a
parameter (same pattern as `syncShowDateToCalendar()` from CAL.3)
and never throws — errors are swallowed so notification failure
never blocks a primary server action.

This extends two existing patterns simultaneously:
1. **Companion-module pattern (FORUMS.5-FIX):** A function
   needed by multiple `'use server'` action files that is NOT
   itself a server action must live in a companion module without
   `'use server'`. Exporting a non-async-function from a
   `'use server'` file causes Vercel build failure.
2. **Client-as-parameter pattern (CAL.3):** The caller
   constructs the supabase client and passes it in — the helper
   never creates its own client.

Call sites in `lib/actions/forum-posts.ts`,
`lib/actions/auditions.ts`, and `lib/actions/calendar.ts` all
use the void IIFE pattern — createNotification() is never
awaited in the primary action flow.

**`sendForumNotificationEmail()` return shape (established
NOTIFY.3):**
`sendForumNotificationEmail()` in `lib/email.ts` was refactored
from `Promise<void>` to `Promise<{ notifiedUserIds: string[] }>`.
The returned `notifiedUserIds` array drives in-app notification
creation independently of email deliverability — if a subscriber
has no email address, they still receive an in-app notification.

Critical: ALL return paths must return `{ notifiedUserIds }` (the
array, populated or empty as appropriate). The early-return path
where subscribers exist but have no email address must return
`{ notifiedUserIds }` (the populated array collected from the
subscriber fetch) — NOT `{ notifiedUserIds: [] }`. Returning an
empty array on that path would silently drop in-app notifications
for those users. Confirmed failure mode caught and fixed in
NOTIFY.3-FIX (bundled into NOTIFY.4).

**`resolveCalendarRecipients()` private unexported helper
(established NOTIFY.3):**
A private `async function resolveCalendarRecipients(eventId,
supabase)` defined at module scope in `lib/actions/calendar.ts`
but NOT exported. This is the correct pattern for a
module-private helper in a `'use server'` file — same as
`assertAuditionAccess()` in `lib/actions/auditions-admin.ts`
and `isModeratableBy()` in `lib/actions/forum-moderation.ts`.

An unexported async function in a `'use server'` file is NOT a
server action endpoint — it is only callable from within that
file. The `'use server'` files-may-only-export-async-functions
constraint applies only to EXPORTED symbols. An unexported
function is a module-private utility.

**`getForumUnreadCount()` — must filter archived forums via
forum_threads join (established NOTIFY.3):**
`forum_posts` does not have a direct `forum_id` column. The
join chain to reach `forums.is_archived` is:
`forum_posts → forum_threads → forums`

Any query counting unread forum posts must traverse this chain
and filter `forums.is_archived = false`. Archived forum posts
must NOT contribute to the unread badge count. Confirmed fix
in NOTIFY.3: the initial implementation in NOTIFY.2 was missing
this filter — added in NOTIFY.3 before commit.

**Ephemeral vs. persistent notification distinction (established
NOTIFY.1/NOTIFY.2):**
Two distinct notification tracks exist in this system:

*Ephemeral (Track A):* Derived live from existing tables at
render time. No `notifications` table row. Clears when the
underlying queue item is resolved by admin action — NOT when a
user clicks through. Examples: pending registrations, pending
calendar events, pending consent forms. Each is a live SELECT
COUNT query. No `createNotification()` call needed.

*Persistent (Track B):* Written to the `notifications` table at
event time via `createNotification()`. Per-user `read_at`
(nullable). Individually dismissible. History retained. Clears
only when the user marks it read. Examples: audition signups,
material uploads, calendar approved/changed/cancelled,
forum replies to subscribed threads.

Never confuse the two: an ephemeral item clears platform-wide
when the work is done; a persistent item clears per-user when
they dismiss it. The forum unread sidebar badge is a third
distinct track — derived from `forum_post_reads`, separate from
both the ephemeral and persistent tracks, not included in the
TopBar bell badge total.

**`inventory_manager` boolean toggle pattern (established INVENTORY.1):**
`inventory_manager` is a boolean column on `admin_users` (NOT NULL DEFAULT false, added Migration 034). It gates write access to the inventory system for Editor-role accounts. SA and OA always have full inventory write access regardless of this flag.

Key constraints — all must be enforced together:

1. **DB CHECK constraint:** `(role NOT IN ('production', 'viewer')) OR (inventory_manager = false)` — enforced at the DB level. Production and Viewer accounts can never have `inventory_manager = true`, regardless of what the app layer does.

2. **App-layer role guard in `toggleInventoryManager()`:** The toggle action must verify that the target user's role is `'editor'` before performing the UPDATE. The DB CHECK prevents the actual write from succeeding on non-editor accounts, but the app-layer guard is required for defense in depth — the function should return an error before attempting the update, not rely solely on the DB constraint to reject it.

3. **Toggle visible on Editor rows only:** In `UsersTable.tsx`, the toggle control renders only on rows where `adminUser.role === 'editor'`. It is absent on Super Admin, Owner Admin, Viewer, and Production rows. SA and OA always have inventory access (no toggle needed); Viewer and Production have no inventory access at all (toggle would be misleading).

4. **Caller guard:** Only SA and OA callers may invoke `toggleInventoryManager()`. Editor accounts cannot promote themselves to inventory_manager.

5. **AuditAction:** Logged as `user.inventory_manager_change` in `lib/audit.ts` (confirmed INVENTORY.2 F1 — the AuditAction type union lives in `lib/audit.ts`; there is no `types/audit.ts` file in this project).

6. **Query must include the column:** Any page that renders `UsersTable.tsx` must SELECT `inventory_manager` from `admin_users` in its data fetch. Missing this column causes the toggle to render permanently unchecked (undefined prop).

This pattern is intentionally parallel to `calendar_editor` (same location, same caller guard, same audit log approach) but differs in which roles receive the toggle (calendar_editor appears on Editor + Viewer + OA rows; inventory_manager appears on Editor rows only).

**Audition Production access — two independent assignment paths (established AUDITIONS.2a):**
Production-role users gain access to auditions through two independent mechanisms, and neither implies the other:

1. **Show assignment** (existing mechanism — `show_editors` table): Adding a Production user as an editor on a show grants full read/write on that show AND on all auditions linked to that show via `auditions.show_id`. The show_editors join is the access credential — no separate audition assignment is needed for show-linked auditions.

2. **Direct audition assignment** (`audition_assignments` table — new in Migration 032): Adding a Production user directly to a standalone audition (one with `show_id = null`) grants full read/write on that audition only. Managed from the audition detail Settings tab via `assignProductionUser()` / `removeProductionUser()` server actions.

Both paths are independent. A Production user with show assignment does NOT automatically get access to standalone auditions from that show's creative team. A Production user with direct audition assignment does NOT automatically get access to the show that audition is later linked to.

Access enforcement: `lib/actions/auditions-admin.ts` checks (1) whether the caller has show_editors membership for any show linked to the requested audition, OR (2) whether the caller has a row in `audition_assignments` for the requested audition. Either is sufficient. This check is in addition to the standard `is_editor()` guard — Production users who pass neither check are rejected with an auth error.

**`formatWallClockCT()` — confirmed 3-argument signature (established AUDITIONS.3a F1 / R23 correction):**
The actual function signature is `formatWallClockCT(dateStr, timeStr, fmt)` — three arguments. The second argument is `timeStr: string | null` (NOT the format string). This was a recurring failure across three Phase AUDITIONS prompts, each writing `formatWallClockCT(date, 'MMMM d, yyyy')` (2 args), which silently passed the format string as `timeStr`.

Correct usage:
```typescript
// date column only (no time)
formatWallClockCT(audition.date_start, null, 'MMMM d, yyyy')
// date + time columns
formatWallClockCT(audition.date_start, audition.time_start, 'MMMM d, yyyy h:mm a')
```

Wrong: `formatWallClockCT(date_start, 'MMMM d, yyyy')` — format string passed as timeStr. Produces incorrect output silently. Confirmed in live `lib/utils/date.ts`.

**`time without time zone` columns — local `formatTime()` helper, NOT date utilities (established AUDITIONS.3a/3b/4a):**
Columns like `auditions.time_start`, `auditions.time_end` are stored as bare `'HH:MM:SS'` strings. They are NOT ISO date strings. Never pass them to `formatCT()`, `formatWallClockCT()`, or any date-fns utility — doing so produces incorrect output or a runtime error. Use a local helper defined in each component or action that needs it:
```typescript
function formatTime(t: string | null): string | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}
```
Do not extract this to a shared utility — callers have different return type needs and the function is 5 lines. Define locally wherever needed. Established AUDITIONS.3a/3b/4a.

**TipTap `useEditor()` — `immediatelyRender: false` required in Next.js App Router (established AUDITIONS.2c F2):**
All TipTap editor instances in admin crew components must pass `immediatelyRender: false` to `useEditor()`. Without this option, Next.js App Router produces an SSR/hydration mismatch — the server renders an empty editor shell while the client initializes the full editor DOM — causing a React hydration error.

```typescript
// WRONG — SSR/hydration mismatch in App Router
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
})

// CORRECT — always pass immediatelyRender: false
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  immediatelyRender: false,
})
```

This is a Next.js App Router constraint, not a TipTap default. Confirmed in `BlastComposer.tsx` and all three Email Templates tab editors. All future TipTap editor instances must include this option.

**TipTap async content initialization — `setContent()` not `useEffect` state dependency (established AUDITIONS.2c F7):**
When a TipTap editor receives content loaded asynchronously (after mount), do NOT initialize via the `useEditor()` content prop (it only applies at initialization — async data arrives after mount) and do NOT use a `useEffect` with state dependency (triggers the `react-hooks/set-state-in-effect` lint rule enforced in this project).

Correct pattern — call `editor.commands.setContent(html)` directly inside the async load function at the moment data arrives:
```typescript
// In the tab-load handler (called once when tab first opens):
async function loadTemplates() {
  if (templatesLoaded) return
  const data = await getAuditionEmailTemplates(auditionId)
  if (data.callbackTemplate && callbackEditor) {
    callbackEditor.commands.setContent(
      data.callbackTemplate.body_html || '')
  }
  setTemplatesLoaded(true)
}
```
This avoids both the stale-content problem and the lint violation. Established AUDITIONS.2c Email Templates tab.

**`show_editors.admin_id` — column name differs from newer conventions (confirmed AUDITIONS.A Audit G3):**
The `show_editors` table uses `admin_id` as the FK column referencing `admin_users.id`. This differs from newer tables: `rehearsal_schedule_assignments.admin_user_id` and `audition_assignments.admin_user_id` both use `admin_user_id`. Any Production access check against `show_editors` must use `admin_id`, not `admin_user_id`. Always verify with R2 (schema check) before writing membership queries — writing `.eq('admin_user_id', admin.id)` on `show_editors` silently returns zero results, not an error.

**Supabase to-one FK join return type normalization (established AUDITIONS.4a F2):**
Supabase's JS client is inconsistent about whether a to-one FK join returns an object or a single-element array, depending on the join type and query syntax. Using `as any` to bypass the type mismatch is a regression — it removes compile-time safety without solving the underlying issue. The established idiom in this codebase:
```typescript
// WRONG — bypasses type safety
const showName = (row.shows as any)?.name

// CORRECT — handles both object and array return shapes
const showName = (Array.isArray(row.shows)
  ? row.shows[0]
  : row.shows)?.name
```
This pattern is used throughout `lib/actions/auditions-admin.ts` and other action files that use FK joins with `!table_fk_column` Supabase join syntax. Confirmed correct in AUDITIONS.4a F2.

**Migration file / live DB drift — document inline fixes in a follow-up migration (established Phase AUDITIONS):**
When inline schema fixes are applied via Supabase MCP during a build (bypassing a named `.sql` migration file), they create drift between the committed migration files and the live database. A fresh Supabase project seeded from the repo's `.sql` files alone would NOT match production.

Five inline fixes were applied during Phase AUDITIONS without a corresponding migration file:
1. `audition_signups.phone SET NOT NULL` (AUDITIONS.2a)
2. `calendar_events.source_audition_id` column + partial unique index (AUDITIONS.1b)
3. `calendar_events_source_check` updated to include `'audition'` (AUDITIONS.1b)
4. `consent_form_submissions.audition_signup_id` column + index (AUDITIONS.1a)
5. `email_log.recipient_type` CHECK updated to include `'audition'` (AUDITIONS.2a)

Resolution: `033_audition_schema_fixes.sql` was written and applied in DB-VERIFY.5 (commit 0ed3b5d). All five inline fixes are now captured in a committed migration file. The migration/DB drift from Phase AUDITIONS is cleared. See §11 checklist for the updated pre-Phase-17 note.

Rule going forward: whenever an inline schema fix is applied via Supabase MCP rather than a named migration file, flag it explicitly in the build report Flags section, add a Q-item tracking the follow-up migration debt, and update the Brief §9 migration status block to reflect the inline fix. Inline fixes are acceptable during active builds; the debt must be cleared before the next phase launch.

**`getRehearsalAttendanceForEvent()` — effective-roster-first pattern (established 21.3):**
Any server action or data function that returns per-person attendance status for a rehearsal event must compute the effective roster first, then LEFT JOIN attendance records onto it. Never query `rehearsal_attendance` alone to produce a roster — that table only contains rows for people who have already been marked, so roster members with no attendance record yet would be silently absent from the result.

Correct pattern:
1. Compute effective roster: schedule assignees MINUS exclude overrides PLUS include overrides (same set-math as `getEffectiveRoster()` via `rehearsal-roster.ts`).
2. Query `rehearsal_attendance` WHERE `calendar_event_id = eventId` AND `admin_user_id IN (rosterIds)` — build a Map<adminUserId, row>.
3. For each roster member: look up in the Map. If found, use the attendance row's status and checked_in_at. If absent, return `status: null, checkedInAt: null`.

This ensures all effective roster members are returned, including those not yet marked. The Attendance tab depends on this: "X of Y attended" requires knowing Y (roster size), which is not derivable from the attendance table alone.

Failure mode: querying only `rehearsal_attendance` returns only people with attendance records. The UI shows no entries for unmarked roster members — they silently disappear from the Attendance tab. The quality gate in 21.3 explicitly checks: "getRehearsalAttendanceForEvent() — computes effective roster first, then maps attendance rows onto it."

Apply this pattern to any new attendance-summary function in the rehearsal system. Do not replicate the simpler `SELECT * FROM rehearsal_attendance WHERE event_id = X` shortcut — it produces an incomplete result by design.

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

**`lib/data/*.ts` must NOT have 'use server' — extended parameter-passing rule (confirmed FORUMS.3):**
The `lib/data/*.ts` parameter-passing pattern (established 15.1) has an explicit companion
constraint: data modules in `lib/data/` must NOT include `'use server'` at the top of the file.
Adding `'use server'` to a data module turns ALL of its exports into publicly callable server
actions, which is incorrect — these are internal utilities, not public-facing action endpoints.

Correct architecture:
- `lib/data/forums.ts` — NO 'use server'; pure data logic; accepts supabase client as param
- `lib/actions/forums.ts` — 'use server'; constructs client; calls into lib/data/forums.ts

The `'use server'` directive belongs only in files under `lib/actions/` and `app/*/actions/`.
Any new file in `lib/data/` that uses the parameter-passing pattern must not have it. Confirmed
FORUMS.3: `lib/data/forums.ts` with 'use server' was one of the quality gate checks — must
return zero results.

**TipTap `useEditor` overload: always type `Editor | null` explicitly (confirmed FORUMS.5 Q3):**
`ReturnType<typeof useEditor>` is unreliable when `immediatelyRender: false` is passed.
TypeScript resolves the last matching overload signature, which may return `Editor`
(non-null) instead of `Editor | null`. This causes silent null-safety failures: the
TypeScript compiler does not warn, but runtime null dereferences occur when the editor
has not yet initialized.

Correct pattern:
```typescript
import { useEditor, EditorContent, Editor } from '@tiptap/react'

// WRONG — inferred type may be Editor, not Editor|null
const editor = useEditor({ ..., immediatelyRender: false })

// CORRECT — explicit typing required
const editor: Editor | null = useEditor({ ..., immediatelyRender: false })
```

Also applies to toolbar helper function props:
```typescript
// WRONG
function FormatButton({ editor }: { editor: ReturnType<typeof useEditor> })

// CORRECT
function FormatButton({ editor }: { editor: Editor | null })
```

Import `Editor` from `@tiptap/react` (not from `@tiptap/core` — use the re-export from
the React package). Apply to ALL TipTap editor variables regardless of where they appear.
Confirmed failure mode (FORUMS.5 Q3): both `ThreadListClient.tsx` and `ThreadViewClient.tsx`
required the fix before `tsc --noEmit` would pass.

**Non-blocking void IIFE pattern for fire-and-forget async side-effects in server actions (FORUMS.5):**
When a server action must trigger an async side-effect (e.g., sending a notification email)
that must never block the action's return value, use the void IIFE pattern:

```typescript
// Non-blocking notification
// Errors must never block post creation
void (async () => {
  try {
    await sendForumNotificationEmail(threadId, postId)
  } catch {
    // Swallow — notification failure is non-fatal
  }
})()
```

This fires the async operation without awaiting it, so the server action returns
immediately. The `void` keyword explicitly discards the Promise (preventing TypeScript
`@typescript-eslint/no-floating-promises` lint warnings in strict configs). The try/catch
ensures errors in the side-effect can never surface to the caller.

Use this pattern ONLY for genuinely non-critical side-effects where failure is acceptable
and must be invisible to the user. Examples: subscription notification emails, audit log
writes that cannot be allowed to fail silently. Do NOT use for operations where failure
matters (storage moves, DB mutations that are part of the core business logic) — those
should be awaited and their errors handled.

Applied in `lib/actions/forum-posts.ts`: `createForumPost()` fires
`sendForumNotificationEmail(threadId, postId)` via this pattern after the post is
created and revalidatePath calls are made.

**'use server' files may only export async functions — never plain objects or constants (confirmed FORUMS.5-FIX, commit 02f4569):**
Next.js/Turbopack strictly enforces that any file with `'use server'` at the top may only
export async functions. Exporting a plain object, constant, type alias (at runtime), or
any non-function value from a `'use server'` file causes a Vercel production build failure:

```
Error: A "use server" file can only export async
functions, found object.
Read more: https://nextjs.org/docs/messages/
invalid-use-server-value
```

**Critical:** This error does NOT surface in `npm run lint` or `npx tsc --noEmit`. Local
tooling passes cleanly. The failure only appears at Next.js build time via Turbopack's
module evaluation. It will not be caught by any pre-commit check in the current quality
gate unless the grep below (§10) is run.

**Confirmed failure mode (FORUMS.5-FIX):**
`FORUM_POST_SANITIZE_OPTIONS` was defined and exported as a plain object
(`export const FORUM_POST_SANITIZE_OPTIONS: IOptions = { ... }`) from
`lib/actions/forum-posts.ts`, which has `'use server'`. This caused the Vercel build
to fail after commit 002a818. The fix: extract the constant to
`lib/actions/forum-post-sanitize.ts` (no `'use server'` directive) and import it into
both consumer files.

**The correct pattern for shared constants used by multiple 'use server' files:**
```typescript
// lib/actions/my-shared-constants.ts
// NO 'use server' — this is a pure shared module
import type { IOptions } from 'sanitize-html'
export const MY_CONSTANT: IOptions = { ... }

// lib/actions/my-action.ts
'use server'
import { MY_CONSTANT } from './my-shared-constants'
// MY_CONSTANT is usable here; it is not re-exported
```

**`export type` is safe:** TypeScript type exports (`export type Foo = ...`) are erased
at compile time and do not violate the constraint. Only runtime value exports (functions,
objects, arrays, primitives) are affected — and only async functions are permitted.

**Full audit after fix:** All `'use server'` files in `lib/actions/` and `app/` were
grepped for `export const` non-function patterns. Zero other violations found.
`FORUM_POST_SANITIZE_OPTIONS` was the only offending export in the codebase.

This constraint is in the same class as the `lib/data/*.ts` no-`'use server'` rule
documented above — both arise from mismatches between a file's directive and what it
exports or how it is used. The companion quality gate grep is in §10.

**`darkenHex()` for server-side hex darkening (established
STYLE.A):**
When a darker variant of a brand color is needed (hover
states, pressed states), compute it server-side using
`darkenHex()` from `lib/utils/color.ts`:

```typescript
import { darkenHex } from '@/lib/utils/color'
// amount = 0.82 → 82% primary + 18% black
const brandPrimaryDark = darkenHex(brandPrimary, 0.82)
```

Convention mirrors `lightenHex()`: amount = 1.0 → pure hex;
amount = 0.0 → pure black. Both functions live in
`lib/utils/color.ts` and are pure (no DB calls, no
server-only imports). `darkenHex()` is used by
`resolveBrandColors()` in `app/layout.tsx` to compute
`--brand-primary-dark` and `--brand-accent-dark`.

**`resolveBrandColors()` return shape (confirmed STYLE.A F2):**
`resolveBrandColors()` in `app/layout.tsx` fetches
`brand_primary` and `brand_accent` from `app_settings` and
returns `{ primary, accent }`. The values are bound as
`brand.primary` and `brand.accent` in the template literal —
NOT as `brandPrimary` / `brandAccent` local variables. Any
prompt that writes additions to the `<style>` tag template
literal must use `brand.primary` and `brand.accent`. Using
`brandPrimary`/`brandAccent` produces a TypeScript error
(undefined identifiers). Confirmed STYLE.A F2 pre-commit.

**`@theme` token naming — `--color-` prefix required
(confirmed STYLE.A F3):**
In Tailwind v4, `@theme` tokens that should auto-generate
color utility classes (`bg-*`, `text-*`, `border-*`, `dark:*`)
must use the `--color-` prefix. Example:
- CORRECT: `--color-neutral-surface: #F8F9FA;` → generates
  `bg-neutral-surface`, `dark:bg-neutral-surface`, etc.
- WRONG: `--neutral-surface: #F8F9FA;` → inert custom property
  only; no utility classes generated; no error thrown.
This was the STYLE.A F3 pre-commit correction. When adding
any new color token to `@theme`, always use the `--color-`
prefix.

**`@layer utilities` dark variant selector (confirmed
STYLE.A F4):**
The correct dark variant selector for hand-authored
`@layer utilities` classes in this project is:

```css
.dark\:bg-brand-primary-dark:where(
  [data-theme="dark"],
  [data-theme="dark"] *
) {
  background-color: var(--brand-primary-dark);
}
```

The prompt-described two-selector pattern
(`.dark .class / [data-theme="dark"] .class`) is incorrect —
the live file uses the single `:where()` form. Always read
the live `app/globals.css` `@layer utilities` block before
writing new dark variants to confirm the exact selector
pattern in use.

**Left border accent pattern (established STYLE.6):**
To apply a colored left border accent without overriding all
four border sides on an element that also has a full `border`
class, use:
- `border-l-4` — Tailwind native class, sets left border
  width to 4px. No color effect.
- `style={{ borderLeftColor: 'var(--brand-primary)' }}` —
  inline style, sets left border color via CSS custom
  property.

These two must coexist on the same element. Do NOT use
`border-brand-primary` alongside a full `border` class —
`border-brand-primary` sets `border-color` on all four sides,
overriding the neutral color on top/right/bottom.

For a neutral left accent (collapsed state), use:
`style={{ borderLeftColor: 'var(--color-neutral-border)' }}`

**Hardcoded class string requirement for computed-looking
values (established STYLE.3/STYLE.6):**
Tailwind's content scanner cannot see class names assembled
at runtime from parts (template literals, array joins,
conditional ternaries building class strings). This applies
beyond the obvious dynamic cases — even when all pieces are
literal strings, assembling them into a class name is
prohibited if the full class name doesn't appear as a literal
somewhere in the scanned file.

The affected pattern in the mockup codebase:
- Progress bar widths: `w-[87.5%]`, `w-[58.3%]`, `w-0`
- Progress bar fill colors: `bg-green-500`, `bg-yellow-400`,
  `bg-red-500`
- All must appear as complete unbroken string literals in JSX.

Rule: every Tailwind class used in a file must appear as a
complete literal string in that file's source code.

**`SetupPanel.tsx` uses `fd.append()` for feature flag toggles — not hidden inputs (confirmed MESSAGES.3 F1):**
`SetupPanel.tsx` is a 'use client' component. The R13.3a rule ("no form elements in Client Components") means there is no `<form>` element and therefore no `<input type="hidden">` elements. Feature flag values are submitted by calling `fd.append('feature_[key]', enabled ? 'true' : 'false')` inside `handleSave()` for each toggle. Every new feature flag toggle added to Section 6 requires all four of these additions:
1. State declaration: `const [xyzEnabled, setXyzEnabled] = useState(initialValues.feature_xyz === 'true')`
2. `ToggleRow` JSX in Section 6
3. `SetupPanelInitialValues` type widening: `feature_xyz: string`
4. `fd.append('feature_xyz', xyzEnabled ? 'true' : 'false')` in `handleSave()`

Missing the `fd.append()` call means the flag value is never sent to `saveFeatureFlags()`. The build compiles cleanly, TypeScript passes — the failure is silent at runtime only. Established MESSAGES.3 F1.

**`Sidebar.tsx` prop interface requires both the type declaration AND the destructured default (confirmed MESSAGES.3 F3):**
When adding a new prop to `Sidebar.tsx`, two locations require editing — not one:
1. The TypeScript interface (prop type declaration, e.g. `messagesUnreadCount?: number`)
2. The function's destructured parameter list with an explicit default value (e.g. `messagesUnreadCount = 0`)

Pattern to follow exactly: `forumUnreadCount = 0` and `messagesUnreadCount = 0`. Adding the interface type without the destructured default causes TS2304 ("Cannot find name 'messagesUnreadCount'") anywhere the prop is referenced in JSX — the error surfaces in JSX, not at the interface definition, which can be confusing. The default value in the destructuring brings the prop into scope as a variable. Confirmed failure mode (MESSAGES.3 F3): TS2304 ×3 in badge JSX after interface-only addition.

**`EMPTY_COUNTS` fallback literal cascades when `NotificationCounts` is expanded (confirmed MESSAGES.2 F1):**
`lib/actions/notifications.ts` contains an `EMPTY_COUNTS` constant that must be structurally complete for the `NotificationCounts` type. When a new field is added to `NotificationCounts` in `types/notifications.ts`, TypeScript raises TS2741 (missing required property) on `EMPTY_COUNTS` because it no longer satisfies the type. This cascade is predictable — any prompt that expands `NotificationCounts` must include `EMPTY_COUNTS` as a planned modification. Check: `grep -n "EMPTY_COUNTS" lib/actions/notifications.ts` before planning any `NotificationCounts` expansion.

**Style Sandbox text color tokens are not the live production token system (confirmed MESSAGES.4 F1):**
The Style Sandbox mockup components (`components/crew/settings/StyleSandbox.tsx` and its 15 mockup files) use `text-gray-900 dark:text-white` and `text-gray-500 dark:text-gray-400` for heading and subtitle text. These are static Tailwind tokens and do NOT match the live production system. The live convention for crew admin pages (confirmed from Forums, Audit Log, Volunteers, and all other live crew pages) is:
- Headings: `text-dark dark:text-dark-text`
- Subtitles/descriptions: `text-mid-gray dark:text-dark-muted`

When building production pages that reference the Style Sandbox as a design source, use container, hover, border, and layout classes from the mockups (these use confirmed live tokens like `border-neutral-border`, `hover:bg-neutral-surface dark:hover:bg-dark-nav`), but substitute live production text tokens for all text color classes. Never copy sandbox `text-gray-*` classes to production pages.

Phase STYLE-ROLLOUT must explicitly reconcile sandbox text tokens against the live production token system before applying mockup classes globally. A naive sweep using sandbox classes directly would break dark mode text rendering on all production pages.

**`getServerClient()` exclusively for all DM table operations — DM privacy model (established MESSAGES.2/MESSAGES.3):**
All reads and writes on the four Phase MESSAGES tables (`message_threads`, `thread_replies`, `thread_reads`, `thread_reply_attachments`) must use `getServerClient()`. The entire privacy model for private messages depends on RLS enforcement — `getAdminClient()` bypasses RLS and would expose any user's DM threads to any authenticated caller regardless of role.

Two `getAdminClient()` uses are intentional and confined exclusively to void IIFEs:
- `createNotification()` calls — notification inserts require the service role because the notification is written for the OTHER participant (not auth.uid())
- `sendDirectMessageEmail()` → `resolveEmailSettings()` uses `getAdminClient()` internally (established pattern for `app_settings` helpers — §14)

`getAdminClient()` must NEVER appear in message table read paths or outside void IIFEs in `lib/actions/messages.ts`. Any such use is a privacy violation.

Additional DM-specific patterns (established MESSAGES.1/MESSAGES.2):
- `thread_reads` SELECT RLS policy allows BOTH participants to read each other's `last_read_at`. This is INTENTIONAL ASYMMETRY required for read receipts — each participant must see the other's read timestamp. Do NOT "fix" this to self-only scoping. The policy comment in Migration 037 explicitly documents this. See §13 for the policy text.
- Sender mark-as-read: after inserting a reply row in `createThread()` or `createReply()`, upsert `thread_reads` for the sender immediately. This prevents the sender's own message from appearing in their unread count. The upsert must happen AFTER the reply insert so `last_read_at >= last_reply_at` is guaranteed.
- `createReply()` clears the OTHER participant's `archived_at` column (not the sender's) when a new reply is sent — to resurface archived threads in their Inbox automatically.

**`createNotification()` and `sendDirectMessageEmail()` as sibling void IIFE calls (established MESSAGES.2):**
In `createThread()` and `createReply()`, both the notification and the email are called inside the same void IIFE — they are not separate IIFEs. The pattern:

```typescript
void (async () => {
  try {
    const adminSupabase = getAdminClient()
    await createNotification(
      recipientId,
      'direct_message',
      title,
      href,
      body,
      adminSupabase
    )
    await sendDirectMessageEmail({ to, senderName, subject, threadId, ... })
  } catch {}
})()
```

Both share a single `getAdminClient()` instance created inside the IIFE. `createNotification()` receives it as a parameter (companion-module pattern from NOTIFY.2); `sendDirectMessageEmail()` calls `resolveEmailSettings()` internally which creates its own admin client. The try/catch wraps both — either failure is non-fatal. Established MESSAGES.2.

**`@tailwindcss/typography` is NOT installed — use arbitrary CSS variant selectors for TipTap HTML (confirmed MESSAGES.5/MESSAGES.6):**
The `@tailwindcss/typography` plugin is not installed in this project. The `prose`, `prose-sm`, `prose-invert`, and `dark:prose-invert` classes appear in some existing files (`ThreadViewClient.tsx`) but produce **zero CSS output** — they are completely inert. Do not add `prose` classes to new production pages expecting them to style TipTap-rendered HTML.

For any page that renders TipTap-generated HTML via `dangerouslySetInnerHTML`, use Tailwind arbitrary CSS variant selectors:

```tsx
className="text-sm text-dark dark:text-dark-text leading-relaxed
  [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
  [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-0.5
  [&_strong]:font-semibold [&_em]:italic
  [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-border
  [&_blockquote]:pl-3 [&_blockquote]:text-mid-gray
  [&_a]:text-brand-primary [&_a]:underline [&_hr]:my-3"
```

Established for DM reply rendering in MESSAGES.5. The `ThreadViewClient.tsx` forum post body rendering also uses inert `prose` classes — a pre-existing gap deferred to STYLE-ROLLOUT. Do not copy that pattern. Do not add `@tailwindcss/typography` to `package.json` without explicit owner approval — it would change the styling behavior of any existing `prose` class in the codebase.

**`forwardRef + useImperativeHandle` for shared rich-text editor components (established MESSAGES.6):**
When a TipTap editor with attachment support must be reused across multiple parent components (each with different submit logic), use `forwardRef + useImperativeHandle` to expose a controlled API rather than duplicating TipTap setup or prop-drilling state.

```typescript
// Export the handle interface so TypeScript catches call-site errors
export interface DirectMessageComposerHandle {
  getBody(): string
  getAttachments(): AttachmentInput[]
  clear(): void
  isEmpty(): boolean
}

const DirectMessageComposer = forwardRef<
  DirectMessageComposerHandle,
  DirectMessageComposerProps
>(function DirectMessageComposer({ disabled = false }, ref) {
  const editor: Editor | null = useEditor({ ..., immediatelyRender: false })

  useImperativeHandle(ref, () => ({
    getBody: () => editor?.getHTML() ?? '',
    getAttachments: () => attachments,
    clear: () => { editor?.commands.clearContent(); setAttachments([]) },
    isEmpty: () => !editor || editor.getText().trim().length === 0,
  }))
  // ...
})
export default DirectMessageComposer
```

Parents use `useRef<DirectMessageComposerHandle>(null)` and call `composerRef.current?.getBody()` in their submit handlers. The exported handle type is required — without it TypeScript cannot verify call-site method names or argument types. Established `DirectMessageComposer.tsx` MESSAGES.6. This is the correct pattern for any shared editor component where multiple parents need to trigger submit independently.

**Refs are not reactive — use state for disabled conditions (established ADMIN.46):**
Reading `composerRef.current?.isEmpty()` (or any ref value) directly in a JSX
`disabled={}` expression produces a stale value that never triggers re-renders.
Refs do not participate in React's render cycle — their contents can change without
causing a re-render. The ESLint rule `react-hooks/refs` flags this correctly.

Fix pattern: add an `onEmptyChange?: (isEmpty: boolean) => void` callback prop to
the shared editor component. Wire it via TipTap's `onCreate` and `onUpdate` hooks.
In the parent component, declare `const [isComposerEmpty, setIsComposerEmpty] =
useState(true)` and pass `onEmptyChange={setIsComposerEmpty}` to the editor
component. Use `isComposerEmpty` in the `disabled={}` expression instead of the
stale ref read.

This pattern was applied in ADMIN.46 to `DirectMessageComposer.tsx` (added
`onEmptyChange` prop), `ComposeForm.tsx` and `ReplyComposer.tsx` (added
`isComposerEmpty` state, replaced ref reads). The fix is a correctness improvement:
Send buttons now correctly respond to composer content changes.

**Prop typed but not destructured — latent dead prop pattern (confirmed MESSAGES.7):**
A prop declared in a component's TypeScript type annotation but absent from the function's destructured parameter list is silently dropped — values passed by the parent are discarded, and no TypeScript error is thrown.

```typescript
// WRONG — adminId declared in type but never destructured
export default function Component({
  detail, adminRole
}: {
  detail: DetailData
  adminRole: AdminRole
  adminId: string   // ← declared in type but not received by the function
}) { ... }

// CORRECT
export default function Component({
  detail, adminRole, adminId  // ← now actually in scope
}: {
  detail: DetailData
  adminRole: AdminRole
  adminId: string
}) { ... }
```

Detection:
```bash
grep -n "\badminId\b" components/crew/auditions/AuditionDetailTabs.tsx
# If it only appears in the type annotation — it is a dead prop
```

Confirmed pre-existing in both `AuditionDetailTabs` and `ShowDetail` (MESSAGES.7 — required fixing before the self-exclusion Message button guard could reference `adminId`). Required audit in Task A for any build that passes new props to components with complex existing type signatures.

**Sub-component prop threading chain for tabbed detail views (established MESSAGES.7):**
Large tabbed detail components (`AuditionDetailTabs`, `ShowDetail`, `RehearsalDetailTabs`) contain inline-typed sub-components (e.g., `RosterTab`, `SettingsTab`). Adding a new prop to the top-level component does NOT automatically reach sub-components — each level must be explicitly threaded. The full chain is:

1. **Parent page**: add prop to `<TopLevelComponent propName={value} />` JSX
2. **Top-level component type**: add to type annotation
3. **Top-level component destructuring**: add to destructured parameter list (latent dead prop risk)
4. **Sub-component call site**: add `propName={propName}` to `<SubComponent />` render
5. **Sub-component inline type**: add to sub-component's own type annotation AND destructured params

Missing any level: the prop is silently dropped. No TypeScript error surfaces until the variable is referenced in the deepest component. Audit all five levels in Task A before any build that adds data to a sub-component inside a tabbed view. Confirmed ×3 in MESSAGES.7 (RosterTab, AuditionDetailTabs SettingsTab, ShowDetail SettingsTab).

**`void functionName()` in `useEffect` for async server action calls (established MESSAGES.5):**
When calling an async server action (or any async function) from inside a `useEffect` body, use the `void` keyword to explicitly discard the returned Promise:

```typescript
// CORRECT — void discards Promise, prevents @typescript-eslint/no-floating-promises
useEffect(() => {
  void markThreadRead(thread.id)
}, [thread.id])

// WRONG — awaiting inside useEffect requires async callback, which is a React antipattern
useEffect(async () => {
  await markThreadRead(thread.id)  // ← async useEffect has cleanup/race-condition issues
}, [thread.id])
```

The `useEffect` callback must remain synchronous — its return value is a cleanup function, not a Promise. The `void` keyword is the idiomatic solution for TypeScript's `@typescript-eslint/no-floating-promises` rule in `useEffect` contexts. Do not chain `.then()` just to avoid the lint warning. Established `ThreadView.tsx` MESSAGES.5.

**`router.push()` after createThread() — R12 clarification (established MESSAGES.5):**
R12 prohibits `router.push()` as a substitute for `router.refresh()` for in-place re-renders after mutations on the same route. This prohibition does NOT apply to navigation to a newly created entity's URL.

After `createThread()` succeeds, `router.push('/crew/messages/${result.threadId}')` is correct — the thread is a new URL the user has not yet visited. This is genuine navigation, not a mutation re-render.

The distinction:
- `router.refresh()` — re-fetch Server Component data for the **same URL** (in-place update)
- `router.push(newUrl)` — navigate to a **different URL** (genuine navigation)

R12's prohibition: `router.push('/crew/dashboard')` after updating a volunteer record on `/crew/volunteers/[id]` is wrong — use `router.refresh()` to stay on the same page. Creating a new resource and navigating to it is correct use of `router.push()`. Established MESSAGES.5.

**`getOrgTimezone(supabase)` — org timezone resolution (established TZ.1):**
Server-side timezone resolution helper in `lib/utils/org-timezone.ts` (NO
`'use server'` — this file exports `TIMEZONE_OPTIONS`, a plain array constant;
`'use server'` would cause a Vercel build failure per the FORUMS.5-FIX constraint).
Accepts any Supabase client as its first parameter (companion-module pattern).
Fetches `org_timezone` from `app_settings`. Returns the IANA string, or
`'America/Chicago'` as fallback via `||` (not `??` — R18).

Every server-side entry point that needs the org timezone calls this once:
```typescript
const tz = await getOrgTimezone(supabase)
```
Client Components do NOT call this. Instead they read:
```typescript
const tz = typeof document !== 'undefined'
  ? (document.body.dataset.timezone || 'America/Chicago')
  : 'America/Chicago'
```
The `typeof document !== 'undefined'` SSR guard is required — Client Components
render server-side during the initial pass where `document` is not available.

**`resolveLayoutSettings()` — renamed from `resolveBrandColors()` (TZ.1):**
`resolveBrandColors()` in `app/layout.tsx` was renamed to `resolveLayoutSettings()`
and extended to also fetch `org_timezone`. Its return type now includes `timezone:
string` alongside the brand color fields. Return values are bound as `brand.primary`,
`brand.accent`, and `brand.timezone` in the template literal — NOT as `brandPrimary`
/ `brandAccent` / `brandTimezone` local variables (same pattern as the pre-existing
STYLE.A F2 note). Any future extension of this function must maintain this binding
convention. Any prior reference to `resolveBrandColors()` in prompts or planning
must use `resolveLayoutSettings()` going forward.

**`formatCT()` and `formatWallClockCT()` timezone parameter (TZ.1):**
Both functions now accept an optional final `timezone?: string` parameter defaulting
to `'America/Chicago'`. This parameter is ALWAYS LAST — inserting it in any other
position would break all 165 existing call sites which pass positional arguments.
All existing call sites remain valid unchanged. New and updated call sites pass the
resolved `tz` value:
```typescript
// Old (still valid — uses CT default)
formatCT(date, 'MMM d, yyyy')
// Updated (explicitly configurable)
formatCT(date, 'MMM d, yyyy', tz)

// Old (still valid)
formatWallClockCT(dateStr, null, 'MMM d, yyyy')
// Updated
formatWallClockCT(dateStr, null, 'MMM d, yyyy', tz)
```

**Client-before-usage reordering (Phase TZ recurring pattern):**
When adding `const tz = await getOrgTimezone(supabase)` to a function, the
Supabase client construction must precede the `getOrgTimezone()` call. In
multiple files during TZ.2 and TZ.4b, the client was constructed lazily
(mid-function, after the first CT-dependent computation). Moving `getServerClient()`
or `getAdminClient()` to the top of the function body is always safe — these
constructors have no ordering dependencies. Confirmed in TZ.2: `calendar.ts`
(3 functions), `app/calendar/page.tsx`, `app/crew/(app)/calendar/page.tsx`.
Confirmed in TZ.4b: `lib/actions/checkin.ts` (2 functions).

**`data-timezone` body attribute — client timezone distribution (TZ.1):**
`resolveLayoutSettings()` in `app/layout.tsx` injects `data-timezone={brand.timezone}`
on the `<body>` tag — the first server-rendered `data-*` attribute on `<body>` in this
project. Client Components read it via `document.body.dataset.timezone`. The crew
layout sets `data-theme` on `document.body` at runtime via an inline script — this
is a separate mechanism and does not conflict. The `data-timezone` value is injected
once at root layout render time and available on all routes including public pages.

**`useNowPosition()` hook timezone parameter (TZ.5b):**
`useNowPosition(days, timezone)` in `UnifiedWeekGrid.tsx` — the only custom
hook in this codebase that accepts a `timezone: string` parameter. Pattern:
- Component reads `tz` via SSR-guarded `document.body.dataset.timezone` read
  at top of component function body
- Call site: `useNowPosition(days, tz)`
- Inside the hook: `timezone` replaces `CT` in `toZonedTime()` calls
- `timezone` MUST be in the `useEffect` dependency array — it is a genuine
  dependency (timezone changes should re-trigger the indicator calculation)
- The existing `// eslint-disable-next-line react-hooks/exhaustive-deps` is
  preserved verbatim — it covers the intentional exclusion of `days`. Do NOT
  add `timezone` to the disable exemption — it is correctly in the deps array

**Module-level helper timezone parameterization (TZ.5b):**
When a module-level pure function (outside any component function body) needs
the org timezone for formatting, pass `timezone: string` as a parameter.
Do NOT call `document.body.dataset.timezone` inside a module-level function —
module-level code may execute before the DOM exists.

```typescript
// Module-level helper — receives timezone as parameter
function eventDateLabel(startTime: string, timezone: string): string {
  return formatInTimeZone(new Date(startTime), timezone, 'MMM d')
}

// Inside the component function body:
const tz = typeof document !== 'undefined'
  ? (document.body.dataset.timezone || 'America/Chicago')
  : 'America/Chicago'
// ...
eventDateLabel(event.startTime, tz)  // pass tz into module-level call
```

Confirmed for `eventDateLabel()` in `PendingQueueClient.tsx`, helper functions
in `ManualHoursForm.tsx`, `AuditionsListClient.tsx`, `RehearsalsListClient.tsx`,
`ShowList.tsx` (TZ.5a).

**TZ.5b split-state pattern — one tz read per Client Component:**
Two calendar Client Components (`CalendarDayPanel.tsx`, `PendingQueueClient.tsx`)
were in a split state after TZ.5a: each had a TZ.5a SSR-guarded `const tz`
read for their `formatCT`/`formatWallClockCT` calls, but still had a module-
level `const CT = 'America/Chicago'` for their direct `date-fns-tz` calls.
The correct fix: remove `const CT`, reuse the existing `tz` variable.
Do NOT add a second `document.body.dataset.timezone` read. There must be
exactly one SSR-guarded `tz` read per Client Component, at the top of the
component function body.

**Sibling helper asymmetry audit (lesson from TZ.5b / PendingQueueClient.tsx):**
When parameterizing any module-level helper function for timezone, audit ALL
sibling helpers in the same file. `PendingQueueClient.tsx` had two:
`eventTimeLabel()` was parameterized with `timezone` in TZ.5a (it called
`formatCT` — TZ.5a scope); `eventDateLabel()` was not (it called
`formatInTimeZone` directly — TZ.5b scope). This inconsistency produced no
error and was only caught during TZ.5b's Task A. Rule: when one helper in a
file is updated for timezone, check all siblings before closing the prompt.

**Maintenance gate position in `proxy.ts` (MM.1):**
The maintenance mode check in `proxy.ts` must fire before
ALL other logic — before `needsFlagCheck`, before flag
fetches, before role-based route guards. Its position
immediately after `const { pathname } = request.nextUrl`
and before the `needsFlagCheck` comment/block is
non-negotiable. Any future `proxy.ts` edit that inserts
logic before the maintenance gate compromises the
kill-switch guarantee: a flagged-feature redirect could
fire before the maintenance check, allowing a non-SA user
to be routed by a feature-flag block rather than being
sent to `/crew/maintenance`. Established MM.1.

**`/crew/maintenance` page — intentional R20 exception
(MM.1):**
`app/crew/maintenance/page.tsx` lives at `app/crew/
maintenance/` directly — NOT inside `app/crew/(app)/` as
R20 requires for all crew pages. This is a documented
exception. The maintenance page must render without the
sidebar/topbar crew layout shell, because it is shown to
logged-in non-SA users who are blocked from the crew
backend. Placing it inside `(app)` would wrap the
maintenance message in the full admin UI, which is
incorrect. This is the only `/crew/*` page that
intentionally lives outside the `(app)` route group.
The `/crew/maintenance` path must not appear in
`needsFlagCheck`, the crew flag block, or the Production
allowlist in `proxy.ts` — it must always be reachable
regardless of feature flag state. Established MM.1.

**`saveMaintenanceMode()` dual-client note (MM.1):**
`saveMaintenanceMode()` in `lib/actions/setup.ts` uses
`getServerClient()` for all DB upserts — it is always
called from an authenticated Super Admin session, so the
session client is correct. However, the `proxy.ts`
maintenance gate uses `getAdminClient()` for both the
`app_settings` fetch and the `admin_users` role lookup
— because no Supabase Auth session exists in middleware
context. This is an accepted inconsistency: the three
pre-existing SA-gate blocks in `proxy.ts` (Platform
Setup, Style Sandbox, Production allowlist) use the
session-scoped `supabase` client for the same `admin_users`
lookup, while the maintenance gate uses `getAdminClient()`.
Both patterns are correct in their respective contexts;
the difference is explainable by the need to also use
`getAdminClient()` for the `app_settings` fetch in the
maintenance check, where using one client for both
operations is the simpler approach. No unification
needed. Established MM.1 Q3.

**`SaveStatus` type in `SetupPanel.tsx` — `'saved'` not
`'success'` (MM.2 Q1):**
The `SaveStatus` type in `SetupPanel.tsx` is `'idle' |
'saving' | 'saved' | 'error'`. The success state is
`'saved'`, NOT `'success'`. `SaveFeedback` only renders
"✓ Saved" when `status === 'saved'` — passing
`setStatus('success')` produces no visible feedback and
fails tsc against the `SaveStatus` union.

Every new sub-component in `SetupPanel.tsx` must:
- Declare status state as `useState<SaveStatus>('idle')`
  — using the existing `SaveStatus` type, not an inline
  union
- Call `setStatus('saved')` on success — never
  `setStatus('success')`

Confirmed failure mode (MM.2 Q1): the prompt-authored
`MaintenanceModeSection` used an inline `'idle' |
'saving' | 'success' | 'error'` union and
`setStatus('success')` — caught by Claude Code's pre-
build Task A audit before any code was written. Established
MM.2 Q1.

**`settingsMap` in `setup/page.tsx` is a `Map` instance
(MM.2 Q1):**
`settingsMap` in `app/crew/(app)/settings/setup/page.tsx`
is constructed as a `Map` instance — not a plain object.
All access must use `.get('key')`, not bracket notation
`settingsMap['key']`. Bracket access on a `Map` always
returns `undefined` silently with no TypeScript error.

Any new key added to the `initialValues` mapping block
in `setup/page.tsx` must follow the `.get()` pattern:
```typescript
maintenance_mode: settingsMap.get('maintenance_mode') || 'false',
maintenance_heading: settingsMap.get('maintenance_heading') || '',
maintenance_body: settingsMap.get('maintenance_body') || '',
```
The `|| ''` fallback is per R18 (not `??` — `app_settings`
values may be seeded as empty strings). Established MM.2 Q1.

**`ActionResult` discriminated union narrowing (MM.2 Q1):**
`ActionResult` in this codebase is a discriminated union:
the success branch (`{ success: true }`) has no `error`
field. Narrowing with `result?.error` compiles in some
TypeScript configurations but may fail tsc in stricter
contexts, and produces incorrect behavior on the success
branch because optional chaining on a union without a
shared optional field is unreliable.

The correct narrowing pattern for all `handleSave()`
functions in `SetupPanel.tsx`:
```typescript
const result = await saveMaintenanceMode(fd)
if ('error' in result) {
  setErrorMessage(result.error)
  setStatus('error')
} else {
  setStatus('saved')
}
```

This is a discriminated union check — it narrows to the
error branch, which is the only branch with an `error`
field. Do NOT use `result?.error` or `result.error`
directly without narrowing first. Established MM.2 Q1.

**`revalidatePath()` and `revalidateTag()` are prohibited
during Server Component render (FORUMS-FIX):**
These functions may only be called inside a Server Action
invocation or a Route Handler. Calling them in a Server
Component's render function body — i.e., in a `page.tsx`
or layout function executing as part of Next.js rendering
— throws a runtime error:
  "Route used revalidatePath during render which is unsupported"
This error bubbles to `app/error.tsx` and displays as a
generic "Something went wrong" with no diagnostic detail.
It does NOT surface in `npm run lint` or `npx tsc --noEmit`.
The failure is completely invisible to pre-commit checks.

Confirmed failure mode (FORUMS-FIX.A): `page.tsx` for the
forum thread view called `await markThreadRead(threadId)`
directly in the Server Component body. `markThreadRead()`
internally calls `revalidatePath()`. Every thread page
load threw this error, causing the forums to be completely
unusable. Fix: moved to `useEffect(() => { void
markThreadRead(data.thread.id) }, [data.thread.id])` in
`ThreadViewClient.tsx` — the same pattern already used in
`components/crew/messages/ThreadView.tsx`.

Rule: Any server action that calls `revalidatePath()` must
only be invoked from:
- Client-initiated Server Action calls (onClick, form action)
- Route handlers
- Other server actions (NOT from render functions)

Never call such an action from the body of a Server
Component page function. Established FORUMS-FIX.A.

**`app/error.tsx` must log the caught error (FORUMS-FIX.B):**
The error boundary component at `app/error.tsx` must:
1. Destructure `error` from the component props (not just
   `reset`) — the type annotation alone is insufficient
2. Include a `useEffect(() => { console.error('Runtime
   error caught by error boundary:', error) }, [error])`

Without this, diagnosing runtime errors that bubble to the
error boundary requires extensive static analysis with no
stack trace. The original `app/error.tsx` had `error` in
the function signature type but never destructured it —
meaning even if the useEffect had been present, `error`
would not have been in scope.

This was confirmed during FORUMS-FIX diagnosis — the
thread view error showed as a generic "Something went
wrong" with zero logging, making the root cause impossible
to identify without reading every component in the render
chain. Fixed in FORUMS-FIX.B. Established FORUMS-FIX.B.

**`ShowCard` is defined inline inside `ShowList.tsx` —
not a separate file (SHOWDELETE.A / SHOWARCHIVE.A):**
`ShowCard` is a component defined at the top of
`components/crew/shows/ShowList.tsx`. It is NOT a
separate file at `components/crew/shows/ShowCard.tsx`.
Any audit targeting "the ShowCard component" must look
inside `ShowList.tsx`.

Architectural rule: state for all ShowCard mutations lives
in `ShowList` (the parent), not inside `ShowCard`. The
existing `isToggling` / `toggleError` / `onToggleStatus`
props establish this pattern. Any new mutation button added
to `ShowCard` follows the same structure:
- New state declared in `ShowList` (e.g., `archivingId`,
  `undoState`)
- Handler declared in `ShowList` (e.g., `handleArchive()`)
- Passed to `ShowCard` as optional props
- `ShowCard` renders the button and fires the prop on click

Never move mutation state into `ShowCard` itself — it is a
presentation component only. Established SHOWDELETE.A /
SHOWARCHIVE.A.

**`ShowForm.tsx` vs `ShowDetail.tsx` — two completely
different files (SHOWARCHIVE.A / SHOWARCHIVE.1):**
These are NOT the same component, do NOT share code, and
are NOT even co-located within a shared component.

- `ShowForm.tsx` — the show CREATION and EDITING form.
  Reached via "New Show" or "Edit Show". Contains form
  fields (name, location, season, description), date rows,
  role configuration, and submission buttons. Previously
  had "Save & Publish" / "Save as Draft" buttons that
  hardcoded the status value, ignoring the Status dropdown.
  Fixed in SHOWARCHIVE.1 to a single "Save" button using
  the current dropdown value.

- `ShowDetail.tsx` — the tabbed show DETAIL view. Reached
  by clicking a show's name/card. Contains tabs: Overview,
  Dates, Volunteers, Settings. Already had a correctly
  implemented "Save Status" button calling
  `updateShowStatus(show.id, statusValue)`.

Confirmed confusion point (SHOWARCHIVE.A audit): The prompt
plan assumed the status buttons were in `ShowDetail.tsx`
(Settings tab). The Task A audit showed `ShowDetail.tsx`
already had the correct implementation. The actual bug was
in `ShowForm.tsx`. Never confuse the two — they serve
fundamentally different purposes. Established SHOWARCHIVE.A.

**`saveFeatureFlags()` requires SIX wiring points per new
flag — not four (ANNOUNCE.2 Task A4 correction):**
`saveFeatureFlags()` in `lib/actions/setup.ts` uses a
completely different internal structure than other setup
actions. It does NOT use `upsertSetting()` per key.
Instead:

1. Each flag is individually extracted:
   `const xyzEnabled = formData.get('feature_xyz') as string`
2. All flags are validated via `isValidFlagValue()` type-
   guard (accepts only `'true'` or `'false'`)
3. All flags are submitted in a single batched `.upsert([])` call
4. Each flag must appear in the `logAction()` BEFORE diff
5. Each flag must appear in the `logAction()` AFTER diff
   (two separate object literals — both require updating)
6. Add `revalidatePath('/path/to/feature-route')` for the
   new route

The Process previously documented four wiring points
(state, ToggleRow, type widening, fd.append()). Those four
are the SetupPanel UI wiring points. The server action
requires its own six wiring points. Both sets must be
complete. Missing any of the six server-side wiring points
produces a silent failure: the flag writes to the DB but
the before/after diff in the audit log is wrong, or the
new route doesn't revalidate on flag change.

Confirmed during ANNOUNCE.2 Task A audit when Claude Code
correctly identified the six-point requirement before
implementing it. Established ANNOUNCE.2 Task A4.

**`AnnouncementSection` self-loading pattern — single
`useEffect([editor])`, all-in-one body (ANNOUNCE.2):**
`AnnouncementSection.tsx` is a `'use client'` component
with no props — it loads its own initial content. This
pattern is required because `dashboard_announcement_body`
and `dashboard_announcement_roles` are NOT in `SETUP_KEYS`
and therefore not in `settingsMap` / `initialValues`.

The correct loading pattern:
```typescript
useEffect(() => {
  if (!editor) return
  void (async () => {
    const data = await getAnnouncementContent()
    editor.commands.setContent(data.body || '')
    setSelectedRoles(data.roles)
  })()
}, [editor])
```

Three rules that must all hold:
1. **Single effect.** Do NOT split into two effects (one for
   fetch, one for setContent) — a second effect keyed on
   fetched data triggers `react-hooks/set-state-in-effect`.
2. **`[editor]` as sole dependency.** The effect fires when
   the editor is ready. It must NOT include fetched data in
   the dep array — that would re-trigger on every state
   update.
3. **All state mutations in one async body.** `setContent()`
   and `setSelectedRoles()` both run inside the single void
   IIFE inside the single effect. This avoids both the lint
   violation and the stale-content problem.

This pattern generalizes: any self-loading Setup Panel
sub-component that manages data outside `SETUP_KEYS` must
follow this same structure. Established ANNOUNCE.2.

**`@resvg/resvg-js` SVG-to-PNG rasterization (QRBANNER.1):**
QR PNG generation uses `@resvg/resvg-js` to rasterize SVG to PNG — not
`QRCode.toBuffer()` (which produces PNG directly but cannot include SVG
composition elements like banners). The rasterization call:

```typescript
const resvg = new Resvg(svgString, { fitTo: { mode: 'width', value: 2000 } })
const pngData = resvg.render().asPng()
```

Critical: `@resvg/resvg-js` is a napi-rs native binary. It requires
`serverExternalPackages: ["@resvg/resvg-js"]` in `next.config.ts` to prevent
Next.js from attempting to bundle it. Without this entry, the build
fails at runtime with a native module load error. This is the same
class of constraint as other napi-rs packages. SVG and PNG output are
always identical — including any banner text — because the PNG is
generated by rasterizing the same SVG that would be served as an SVG
download. Never produce the SVG and PNG via separate code paths.

**`escapeXml()` for SVG text injection (QRBANNER.1):**
Any admin-supplied string injected into an SVG `<text>` element must be
escaped via a private `escapeXml()` helper before insertion. The helper
escapes the five XML special characters: `& < > " '`. Pattern:

```typescript
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
```

Never inject a raw user-supplied string into SVG XML markup — an
unescaped `&` or `<` in the banner text would corrupt the SVG document.
This function is defined privately in `lib/qr.ts` and is not exported.
Apply `escapeXml()` to any future SVG text content sourced from user
or DB input.

**Manual user-agent parsing in route handlers (QRANALYTICS.1):**
`app/go/[token]/route.ts` parses the `User-Agent` header with a local
`parseUserAgent()` helper — no external UA parsing library. The correct
ordering of checks matters:

- Edge before Chrome — both contain "Edg/" substring; checking
  Chrome first would mis-classify Edge as Chrome.
- Tablet before mobile — Android tablets lack "Mobile" in their UA
  string but do contain "Android". Checking mobile ("Mobile")
  first would correctly miss them, but checking tablet ("Android"
  without "Mobile") first is the reliable pattern.
- Fallback to `'desktop'` / `'Other'` for unrecognized UAs.

A 5–10 line manual regex function is correct for this use case. Do not
install a UA parsing library — it adds a dependency for a feature that
only needs device-type bucketing (mobile/tablet/desktop) and
browser-family bucketing (Chrome/Safari/Firefox/Edge/Other).

**`/go/[token]` public redirect route pattern (QRANALYTICS.1):**
`app/go/[token]/route.ts` is a public route handler for QR code
redirects. Key invariants:

- PUBLIC ROUTE header: `// PUBLIC ROUTE — getAdminClient() only, never getServerClient()`
- `getAdminClient()` only — no Supabase Auth session exists on a
  QR code scan.
- No feature flag gate — the redirect must work regardless of
  feature flag state. A QR code in the wild must always redirect.
- No `proxy.ts` matcher entry needed — Next.js route handlers at
  `app/go/[token]/route.ts` execute directly; they are not intercepted
  by middleware unless explicitly matched. The `/go/` path is not in
  the `proxy.ts` matcher and must not be added.
- Best-effort scan insert — the `qr_scan_events` insert is wrapped
  in `try { ... } catch { /* swallow */ }`. A scan logging failure
  must never block the redirect. The redirect fires regardless of
  whether the insert succeeded.
- `Response.redirect()` — returns a 302 redirect to `target_url`
  from the `qr_codes` row. Never return JSX or a Next.js page response.
- `redirect_token` is app-generated — `generateQRCode()` in
  `lib/actions/qr.ts` calls `crypto.randomUUID()` to generate the
  `redirect_token` before calling `generateQR()`. It is NOT a
  DB-defaulted value. The token is stored on the `qr_codes` row and
  encoded into the QR URL as `/go/[redirect_token]`.

Structural template for future public redirect route handlers:
`app/documents/[token]/route.ts`.

**`types/sidebar.ts` — shared types/constants for Sidebar + NavOrderSection (NAVORDER.1):**
`types/sidebar.ts` is a pure types-and-constants file containing:
`GroupKey` (union type), `SidebarNavOrder` (type), `HREF_LABELS`
(Record mapping hrefs to display labels — "Crew Directory" for
`/crew/users`), `DEFAULT_GROUP_ORDER` (`string[]`), `DEFAULT_LINK_ORDER`
(`Record<GroupKey, string[]>`), `GROUP_LABELS` (`Record<GroupKey, string>`).

Key constraints:

- No `'use server'` directive — this file exports plain constants
  and types. Adding `'use server'` would cause a Vercel build failure
  (FORUMS.5-FIX constraint: `'use server'` files may only export async
  functions).
- No imports — pure TypeScript with no runtime dependencies.
- Both `Sidebar.tsx` and `NavOrderSection.tsx` import from here.
- No circular dependency risk because `types/sidebar.ts` imports
  nothing from either consumer.

Apply this pattern whenever a shared type or constant is needed by both
a layout component and a settings sub-component in the same domain.

**Grouped sidebar rendering (SIDEBAR.2 / NAVORDER.1):**
The production sidebar uses a data-driven grouped rendering pattern:

- Five module-level href constants defined in `Sidebar.tsx`:
  `DASHBOARD_HREF`, `EVENTS_HREFS`, `PEOPLE_HREFS`,
  `UTILITIES_HREFS`, `SETTINGS_HREFS`. These are the hardcoded
  fallback link sets.
- `GROUP_HREF_DEFAULTS` — a `Record<GroupKey, string[]>` that
  maps each group key to its fallback href array.
- `resolvedGroupOrder` — derived from
  `navOrder?.groupOrder ?? DEFAULT_GROUP_ORDER`. When `navOrder` is
  undefined (most installs), the hardcoded default order is used.
- `groupItems` — built via `Object.fromEntries()` over
  `resolvedGroupOrder`, each entry resolving the link order from
  `navOrder?.linkOrder[group] ?? GROUP_HREF_DEFAULTS[group]`.
- Single `.map()` over `resolvedGroupOrder` renders all groups.
- Dashboard is always ungrouped above the groups (never inside a group).
- Three-part atomic edit for new flagged links:
  NAV_ITEMS array + FLAG_GATED_HREFS set + Production allowlist.
  This is unchanged from the FORUMS/NOTIFY era; the atomic edit rule
  still applies. `TOOLTIP_ANCHOR_MAP` no longer exists (removed
  NOTIFY.4-CLEANUP) — do not reference it in future prompts.
- `navOrder` prop on `Sidebar.tsx` is `navOrder?: SidebarNavOrder`
  with no default value. `undefined` is the correct "absent" state —
  it means use hardcoded defaults. Do not supply a default prop value.

**`bg-brand-primary-light` as active nav fill (SIDEBAR.2):**
The active sidebar nav link uses `bg-brand-primary-light` as its
background fill. This was confirmed R35-safe in SIDEBAR.A audit:
`globals.css` already contains a `dark:bg-brand-primary-light
:where([data-theme="dark"])` rule from a prior phase — no new
`globals.css` rule is needed to support dark mode. Active state
full recipe:

```
border-l-4 style={{ borderLeftColor: 'var(--brand-primary)' }}
bg-brand-primary-light text-brand-primary rounded-r
```

Never use `border-brand-primary` alongside `border-l-4` — it overrides
all four border sides. The inline style targets only the left border
color. Inactive links use no background fill and no left border.

**`border-neutral-border` as TopBar border token (SIDEBAR.3):**
The TopBar outer wrapper bottom border uses `border-neutral-border`
(Tailwind utility class auto-generated from `--color-neutral-border` in
`@theme`). This replaces the prior `border-divider dark:border-dark-border`
pattern. `border-neutral-border` is a native Tailwind v4 class (generated
via the `--color-` prefix in `@theme`), so it is R35-safe — no hand-authored
`@layer utilities` rule is involved. All TopBar outer wrapper border
declarations should use this token going forward.

**`dark:hover:bg-white/10` for inactive sidebar nav links (SIDEBAR.3):**
Inactive sidebar nav link hover in dark mode uses `dark:hover:bg-white/10`.
The prior class `dark:hover:bg-dark-surface/50` was imperceptible —
dark-surface is a very dark token and 50% opacity on it produces near-zero
visible change. `dark:hover:bg-white/10` (white at 10% opacity) provides
a subtle but visible hover state on the dark sidebar background.

Applied in 4 locations in `Sidebar.tsx`. This is a native Tailwind class
(opacity-suffix on a built-in color) — R35-safe. No `globals.css` rule
needed.

**Admin identity block stacking (SIDEBAR.6):**
The TopBar admin identity block (name + role badge) uses a flex column
layout to stack name above role badge:

```jsx
<div className="hidden sm:flex flex-col items-end gap-0.5">
  <span className="font-semibold">{admin.name}</span>
  <span className="... py-0.5">{ROLE_BADGE[admin.role]}</span>
</div>
```

Key rules:

- `hidden sm:flex` — identity block is hidden on mobile (sm breakpoint
  shows it). The flex container must not have a `max-w` constraint —
  the earlier `max-w-[120px] truncate` was removed in SIDEBAR.6 to
  prevent role badge truncation.
- `flex-col items-end gap-0.5` — stacks name on top, badge below,
  right-aligned, with 2px gap.
- `py-0.5` on the role badge — compact vertical padding for the stacked
  layout (not `py-1` which was too tall).
- Any `className` on these elements that includes a dynamic expression
  (e.g., `ROLE_BADGE_CLASSES[admin.role]`) must use a template
  literal, not a plain string: `` className={`base-class ${DYNAMIC}`} ``

**Pre-prompt governance compliance pass (established SIDEBAR.4/QRANALYTICS lessons):**
Before writing any prompt spec JSX or TypeScript, the prompt author
must verify four things. Each produced a Claude Code F-item when
violated:

1. **className template literal syntax:** Any `className` containing a
   dynamic expression (e.g., `ROLE_BADGE_CLASSES[role]`) must use a
   template literal: `` className={`fixed ${DYNAMIC}`} ``. A plain
   string like `className="fixed ROLE_BADGE_CLASSES[role]"` silently
   renders the literal text as a CSS class name. This was the root
   cause of F-items in SIDEBAR.4 and SIDEBAR.6 — both required
   template literal fixes by Claude Code before commit.
2. **Lucide icon existence:** Before specifying any icon from
   `lucide-react` in a prompt, verify it exists:
   `node -e "require('lucide-react').IconName"`. Grepping the lucide
   dist directory is unreliable — it finds partial name matches (e.g.,
   grepping "Key" finds "KeyRound", "KeySquare", "KeyboardIcon", etc.).
   A non-existent icon import fails silently in dev hot-reload but
   breaks the build.
3. **`getServerClient()` is always awaited:** In any new server action
   file, `const supabase = await getServerClient()` — the `await` is
   required. Omitting it returns a stale unauthenticated client object;
   the code compiles and lints cleanly but fails at runtime. NAVORDER.1
   F1: prompt omitted `await`; Claude Code caught it before commit.
4. **`cardClasses` and `saveButtonClasses` are not importable from
   `SetupPanel.tsx`:** These are module-private constants. Any new
   SetupPanel sub-component that needs card styling must define
   inline equivalents. NAVORDER.1 F2: prompt assumed `cardClasses` was
   importable; Claude Code read the live file and applied only the
   structural classes that were actually needed.

**`formatCT` lives in `@/lib/utils/date` — not `@/lib/utils/time` (QRANALYTICS.2):**
`formatCT()` and `formatWallClockCT()` are defined in
`@/lib/utils/date`. There is no `lib/utils/time.ts` file in this
project. Any prompt spec that references `@/lib/utils/time` for date
formatting imports is wrong. The QRANALYTICS.2 prompt spec had this
incorrect path; Claude Code corrected it from the live import before
commit. When writing future prompts that use date formatting utilities,
always specify `@/lib/utils/date` as the import source.

**Client Component timezone invariant — never prop-drill from Server Component (QRANALYTICS.2b):**
`QRScanLogToggle.tsx` was specified in the QRANALYTICS.2b prompt as
receiving a `timezone` prop from its Server Component parent. Claude Code
deviated from the prompt spec and instead read the timezone from
`document.body.dataset.timezone` with the required SSR guard — the
established Client Component timezone pattern (TZ.1/TZ.5a). This was a
correct deviation.

The invariant: never prop-drill `timezone` from a Server Component to
a Client Component. The `data-timezone` body attribute injected by
`resolveLayoutSettings()` in `app/layout.tsx` is the established
distribution mechanism for all Client Components. A Server Component
passing `timezone={tz}` to a Client Component is always wrong — the
Client Component already has access to the body attribute and the prop
adds unnecessary coupling. Any prompt spec that includes a `timezone`
prop on a Client Component should be treated as a spec error; Claude
Code is expected to apply the body attribute pattern instead.

**`resolveGroupHrefs()` — self-healing nav order merge
(ADMIN.49):**
When an SA saves a custom sidebar nav order, a
`sidebar_nav_order` row is written to `app_settings`. The
Sidebar's grouped rendering resolves each group's link array
from `navOrder?.linkOrder[groupKey] ?? GROUP_HREF_DEFAULTS[groupKey]`.
If the saved array is non-null, `??` never falls through —
meaning any href added to `GROUP_HREF_DEFAULTS` after the order
was saved is silently invisible to that SA.

`resolveGroupHrefs(saved, defaults)` in `Sidebar.tsx` fixes this
by merging: return the saved array with any hrefs present in
`defaults` but absent from `saved` appended at the end. This is
called in the group render loop in place of the raw `??` fallback.

Consequences:
- New nav links added to `GROUP_HREF_DEFAULTS` and the group's
  `*_HREFS` constant will appear automatically for all SAs,
  even those with stale saved orders.
- The stale DB row is never modified — missing hrefs are appended
  at render time only.
- The SA can re-save their order via the Nav Order panel to
  reposition the new link where they want it.

Established ADMIN.49 (Bug 1 root cause and fix).

**Hide-not-lock rule — Settings hub cards (ADMIN.49):**
Cards on `app/crew/(app)/settings/page.tsx` whose destination
page is accessible only to SA/OA (or SA only) must NOT render
a `LockedCard` fallback for non-qualifying roles. Use the
hide-only pattern:

```tsx
// WRONG — shows a LockedCard to Editors and Viewers
{canAccessAdminSettings ? (
  <LinkedCard href="/crew/settings/categories" title="..." />
) : (
  <LockedCard title="..." badgeLabel="Super Admin only" />
)}

// CORRECT — hidden entirely for non-SA/OA roles
{canAccessAdminSettings && (
  <LinkedCard href="/crew/settings/categories" title="..." />
)}
```

`LockedCard` has been removed from `settings/page.tsx` (ADMIN.49
— it became fully unused after all 14 cards were converted).
Do not re-add it. New cards added to the Settings hub must always
follow the hide-not-lock pattern.

The Settings hub page itself redirects all non-SA/OA roles before
the JSX renders (proxy guard + server-side redirect — ADMIN.50),
so Editor/Viewer/Production role-specific card conditions are
unreachable in JSX. Any card conditions on this page are only
meaningful for OA vs SA distinctions (e.g., Style Sandbox which
is SA-only, not OA). Established ADMIN.49.

**Settings hub and Audit Log — SA/OA only (ADMIN.50):**
`/crew/settings` (hub) and `/crew/settings/audit-log` are SA/OA
only. Both are hard-blocked at `proxy.ts` using the session-client
pattern:

```typescript
// Hub — exact match only (not startsWith — would block sub-pages)
if (pathname === '/crew/settings') {
  // fetch role via session client
  // if not SA/OA → redirect /crew/dashboard
}

// Audit Log — prefix match (no legitimate sub-routes for non-SA/OA)
if (pathname.startsWith('/crew/settings/audit-log')) {
  // same role check + redirect
}
```

CRITICAL: The hub guard must use exact match (`pathname ===
'/crew/settings'`), NOT `pathname.startsWith('/crew/settings')`.
The startsWith form would block `/crew/settings/inventory` for
inventory_manager Editors and `/crew/settings/beta` for all users
when the flag is on.

Both guards use the session-scoped client — same pattern as the
pre-existing Platform Setup and Style Sandbox guards.

Server-side double-guards also added:
- `settings/page.tsx`: `if (!canAccessAdminSettings) redirect('/crew/dashboard')`
- `audit-log/page.tsx`: tightened from Viewer-only-block to full
  SA/OA-only guard

Editors, Viewers, and Production are all redirected to
`/crew/dashboard`. Established ADMIN.50.

**Conditional role+column-gated sidebar link (ADMIN.50):**
Some sidebar links are not feature-flag-gated but role+column-gated
(e.g., an Editor with `inventory_manager = true` gets a direct
Inventory Management link in the Settings group). This pattern
differs from the standard three-part atomic edit for flagged links:

- NOT added to `SETTINGS_HREFS` or `GROUP_HREF_DEFAULTS` — it is
  rendered outside the orderable nav system
- NOT in `FLAG_GATED_HREFS` — it is not a feature flag gate
- NOT in `DEFAULT_LINK_ORDER` — it is not user-reorderable

Implementation:
1. New boolean prop on Sidebar: `showInventorySettings?: boolean`
   — added in TWO locations per the established prop pattern:
   (a) SidebarProps interface
   (b) destructured parameter list with `= false` default
2. Computed in `layout.tsx`:
   `const showInventorySettings = admin.role === 'editor' &&
   admin.inventory_manager === true`
   Threaded to `<Sidebar showInventorySettings={showInventorySettings}>`.
3. Rendered as a special-case conditional append INSIDE the settings
   group render block, after the normal `getGroupItems()` links:
   `{showInventorySettings && renderLink({ href: '/crew/settings/inventory',
   label: 'Inventory Management', icon: Package })}`
4. `'/crew/settings/inventory': 'Inventory Management'` added to
   `HREF_LABELS` in `types/sidebar.ts`.

SA/OA reach Inventory Settings via the Settings hub — they do NOT
get this sidebar link (it would be redundant). Established ADMIN.50.

**Beta Feedback role-branched Server Component (BETA.1):**
`app/crew/(app)/settings/beta/page.tsx` uses a role branch inside
a single Server Component — no separate pages:

```typescript
if (admin.role === 'super_admin') {
  // fetch pending queue (completed_at IS NULL, oldest-first)
  // render SA queue view with Mark Complete buttons
} else {
  // render BetaFeedbackForm (non-SA/OA submission form)
}
```

Key invariants:
- `completeBetaFeedback(id)` soft-archives by setting
  `completed_at = now()`. Uses idempotency guard
  (`.is('completed_at', null)`). Returns `{ success: true } |
  { error: string }`. Calls `revalidatePath('/crew/settings/beta')`.
- `submitBetaFeedback(type, message)` — no `revalidatePath` call
  (submitter sees no queue).
- `BetaFeedbackForm.tsx` is 'use client' with no `<form>` element
  (R13.3a). Inline success message on submit, form resets to blank.
- Mark Complete button uses `.bind()` + R40 double assertion:
  `(completeBetaFeedback.bind(null, item.id) as unknown as
  (formData: FormData) => Promise<void>)`
- No notifications triggered on submission or completion.
- Hub card on settings/page.tsx: `{canAccessAdminSettings &&
  <LinkedCard .../>}` — no LockedCard (hide-not-lock rule).
  No flag import needed — proxy handles redirect when off.
Established BETA.1.

**`??` vs `||` in `setup/page.tsx` `initialValues` — R18 scope
(ADMIN.48):**
The `initialValues` block in `setup/page.tsx` maps `settingsMap.get()`
results to initial values for the Setup Panel. All fallback expressions
in this block must use `||` (not `??`) per R18 — `app_settings` values
are seeded as empty strings, and `??` only catches `null`/`undefined`,
silently passing empty strings through.

ADMIN.44 fixed the 5 feature flag entries where this was a functional
bug (`'' ?? 'true'` → `''` instead of `'true'`). ADMIN.48 swept the
remaining 15 `??` expressions that used `|| ''` as the fallback — for
those, `??` vs `||` is behaviorally identical (both produce `''` for
an empty string), but `??` violates R18 consistency.

Two `??` expressions correctly left untouched:
- `settingsMap` construction (Map initialization — not an
  `initialValues` fallback)
- `instanceLabel` local const (not an `app_settings` fallback)

The rule: within the `initialValues` mapping block in `setup/page.tsx`,
every fallback must use `||`. Outside that block, `??` may be
appropriate depending on context. Established ADMIN.48.

**`SeasonAtAGlance.tsx` — self-contained Server Component with
timezone prop threading (ADMIN.52):**
`SeasonAtAGlance.tsx` fetches its own show data internally via
`getServerClient()` — no show data crosses the
`dashboard/page.tsx` → component boundary. The `timezone` prop
IS threaded from the page (already resolved via
`getOrgTimezone(supabase)`) to avoid a redundant `app_settings`
query inside the component. The 31-day cutoff uses:
```typescript
const cutoff = formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)
```
This string-comparison pattern (R23) is safer than raw Date
object comparison for bare `date` columns — it avoids DST
edge cases when constructing the boundary. `totalShowCount`
and `displayedShowCount` are computed as local constants
inside the component; no new props were needed for the
truncation note. Architecture: self-contained component that
fetches independently but reuses an already-resolved prop for
timezone efficiency. Apply this pattern to any future Server
Component widget that needs filtered data from a table already
queried by the page — isolate the fetch, reuse resolved
context props. Established ADMIN.52.

**`visibleNotifications` derived-state filter pattern for
NotificationPanel (ADMIN.53):**
When a notification type must be excluded from both the rendered
list AND the bell badge count, the correct architecture is a
single derived constant computed from the loaded notifications
array:
```typescript
const visibleNotifications = notifications.filter(
  n => n.type !== 'direct_message'
)
```
Both the rendered list and `unreadPersistent` must be driven
from `visibleNotifications` — never from a separate server-
computed count. The server-computed `counts.unreadPersistent`
pattern was the wrong architecture: after any optimistic
mark-read update (which filters items out of local state), the
server count immediately diverges from the client-filtered
array, producing stale badge values. The correct `unreadPersistent`
derivation:
```typescript
const unreadPersistent = visibleNotifications
  .filter(n => !n.read_at).length
```
Optimistic mark-as-read: use `.filter()` (remove the item) not
`.map()` (set `read_at`). The notification disappears from the
panel immediately; the server action fires in the background.
"Mark all read" uses `setNotifications([])` — panel goes to
empty state. "Mark all read" button conditionally rendered only
when `unreadPersistent > 0`. Established ADMIN.53.

**TipTap click-to-focus: `dm-editor-wrapper` class + CSS custom
property + wrapper `onClick` (ADMIN.54):**
When a TipTap editor must expand its clickable area so that
clicking empty space below typed content focuses the editor,
THREE things are required together:

(1) A CSS rule targeting `.ProseMirror` via a wrapper class,
placed as a plain rule outside `@layer utilities` in
`app/globals.css`:
```css
.dm-editor-wrapper .ProseMirror {
  min-height: var(--dm-min-height, 100px);
  outline: none;
}
```
Root cause why `style={{ minHeight }}` on `<EditorContent>`
or its outer `<div>` fails: TipTap renders `<EditorContent>` as
a wrapper that contains the actual `.ProseMirror` contenteditable
element as a child. `minHeight` applied to the wrapper div never
reaches `.ProseMirror`, so clicks below typed content land on
a div with no height and never focus the editor.

(2) CSS custom property injection for per-caller configurability:
```typescript
<div
  className="dm-editor-wrapper cursor-text"
  style={{ '--dm-min-height': minHeight } as React.CSSProperties}
  onClick={() => { if (!disabled) editor?.commands.focus() }}
>
  <EditorContent editor={editor} />
</div>
```
The CSS custom property preserves different heights per caller
(ReplyComposer: 100px, ComposeForm: 140px). Remove the now-
ineffective `style={{ minHeight }}` from `<EditorContent>`.

(3) `onClick` on the wrapper div to forward clicks in empty
space to the editor. The CSS establishes the minimum height
for the clickable zone; the `onClick` ensures those clicks
actually trigger focus.

The globals.css rule is a plain rule (not inside `@layer
utilities`) because it targets a TipTap-internal element
that cannot be addressed via Tailwind class composition.
Established ADMIN.54.

**Notifications row cap removal — `getUserNotifications()` (ADMIN.54):**
`getUserNotifications()` in `lib/data/notifications.ts` no
longer has a row cap. The `.limit(20)` default parameter was
removed; the pass-through `limit?: number` parameter in
`lib/actions/notifications.ts` was also removed. The
NotificationPanel now shows all persistent unread notifications.
This interacts with the `visibleNotifications` derived-state
pattern above: with no row cap, the client-filtered array is
authoritative for both the rendered list and the badge count.
Any future change to notification retention or pagination must
preserve this architecture — do not re-add a server-side cap
that would cause `unreadPersistent` to diverge from the
displayed count. Established ADMIN.54.

**`public/fonts/` convention for vendored font files
(ADMIN.56-FIX):**
When a server-only file needs to supply a font to
`@resvg/resvg-js` or any other native binary that requires
font files, bundle the font at `public/fonts/[name].ttf` in
the repo. Reference it at runtime using:
```typescript
import path from 'path'
import { existsSync } from 'node:fs'

const fontPath = path.join(
  process.cwd(), 'public', 'fonts', 'banner-font.ttf'
)
const fontFileExists = existsSync(fontPath)
```
`process.cwd()` is a runtime expression — Turbopack cannot
statically resolve it at build time and will not attempt to
import the file as a module. Files in `public/` are included
in Vercel deployments and are readable at runtime. Use TTF or
OTF format only — `@resvg/resvg-js` does not support WOFF or
WOFF2 (web-compressed formats). Only pass font options when
text rendering is actually required (e.g., only when
`trimmedBanner` is truthy — the no-banner path omits font
options entirely). First instance: `public/fonts/banner-font.ttf`
(Inter Regular v4.0, SIL Open Font License). Established
ADMIN.56-FIX.

**Turbopack `createRequire().resolve()` on literal strings causes
"Unknown module type" build failure (ADMIN.56-FIX):**
`createRequire(import.meta.url).resolve('some/path/file.ttf')`
with a literal string argument is statically analyzed by
Turbopack at build time. Turbopack follows the literal path,
finds the target file, and attempts to import it as a module.
If the file has no registered module type (e.g., `.ttf`,
`.woff2`, `.png`), the build fails:

Error: Unknown module type

This failure is completely invisible to `npm run lint` and
`npx tsc --noEmit` — it only surfaces as a Vercel deployment
failure or a local `npm run build` failure with Turbopack.
The fix: use a runtime expression (`process.cwd()`, a
variable, a template literal with a variable) rather than a
literal string in `require().resolve()` or
`import.meta.resolve()`. Any path that must be resolved at
runtime rather than build time must not be passed as a literal
to these functions. Established ADMIN.56-FIX.

**`@resvg/resvg-js` silent font failure on serverless Linux
(ADMIN.56):**
`@resvg/resvg-js` defaults to `font: { loadSystemFonts: true }`.
On a developer machine with fonts installed, this works. On
Vercel's minimal serverless Linux runtime, there are no system
fonts — `loadSystemFonts: true` silently succeeds (no error
thrown) but discovers zero fonts. SVG `<text>` elements render
as empty space in the rasterized PNG. The failure is invisible
at the SVG level (the `<text>` element is syntactically
present) and requires a pixel-count comparison to diagnose
definitively: a PNG with zero-font rendering will have
measurably fewer non-white pixels than one with a real font
supplied. Fix: always supply an explicit font when text
rendering is required:
```typescript
font: {
  loadSystemFonts: false,
  fontFiles: [fontPath],
  defaultFontFamily: 'Inter',
  sansSerifFamily: 'Inter',
}
```
See the `public/fonts/` pattern above for how to bundle and
resolve the font file. Never rely on `loadSystemFonts: true`
in a serverless context. Established ADMIN.56/ADMIN.56-FIX.

**Migration files live at repo root — NOT `supabase/migrations/`
(confirmed ADMIN.57 F1):**
All migration SQL files in this project are stored at the repo
root (e.g., `039_maintenance_mode.sql`, `043_beta_feedback.sql`,
`044_maintenance_restoration.sql`). They are NOT stored under
`supabase/migrations/` as Supabase's default CLI convention
suggests. The naming convention is `[NNN]_[description].sql`
where NNN is a zero-padded sequential number matching the
migration number in §9 of the Brief.

Any prompt that specifies a migration file path of
`supabase/migrations/[name].sql` is wrong for this project.
The §11 checklist already includes: "Migration files created
at repo root, not in supabase/migrations/ (R21)." Prompted
re-confirmation when ADMIN.57 initially specified
`supabase/migrations/` and Claude Code corrected to the actual
project convention. Treat any `supabase/migrations/` path in
a prompt spec as a spec error and override to repo root
before writing any file. Established ADMIN.57 F1 (process
re-confirmation; R21 is the standing rule).

**Beta Feedback sidebar SA exclusion — filter after `resolveGroupHrefs()`,
before `getGroupItems()` (ADMIN.55):**
When a sidebar nav link should be visible to some roles but
hidden from a specific role (not because of a feature flag,
but because SA reaches the destination via an alternate path),
apply the exclusion by filtering the resolved hrefs array
for the relevant group. The filter runs after `resolveGroupHrefs()`
(so self-healing still sees the href) and before
`getGroupItems()` converts hrefs to rendered items:
```typescript
// After resolveGroupHrefs(), before getGroupItems():
const hrefs = groupKey === 'settings' && admin.role === 'super_admin'
  ? resolvedHrefs.filter(h => h !== '/crew/settings/beta')
  : resolvedHrefs
```
This pattern is safe with respect to:
- `resolveGroupHrefs()` self-healing: the href remains in
  `GROUP_HREF_DEFAULTS` and will still be appended for SAs
  with stale saved orders — but the subsequent filter removes
  it before rendering. The DB row is not modified.
- `showInventorySettings` conditional append: rendered
  outside the items array entirely, unaffected.
- All non-SA roles: the filter branch is never taken; their
  rendered items are unchanged.

Use this pattern only for role-based exclusions that are
structurally separate from the flag-gate system. For feature-
flag-gated links, use the established `FLAG_GATED_HREFS`
mechanism. Established ADMIN.55.

### Show deletion single-guard + cascade design (ADMIN.58)
`deleteShow()` in `lib/actions/shows.ts` now has ONE guard before the DELETE:

Show must exist and have `status = 'archived'`. Returns error if not.

Guards 2 (active `slot_claims`) and 3 (attendance records) were REMOVED in
ADMIN.58. Their removal was enabled by Migration 045, which changed both
`attendance.show_id` and `attendance.show_date_id` FKs from `ON DELETE NO ACTION` to `ON DELETE CASCADE`. Attendance rows now cascade automatically
when a show is deleted.

Cascade chain on show DELETE:
- `show_dates` CASCADE from `shows` (already correct pre-ADMIN.58)
- `volunteer_roles` CASCADE from `show_dates` (already correct)
- `slot_claims` CASCADE via `volunteer_role_id` and `show_date_id` (already correct)
- `attendance` CASCADE from both `shows.id` and `show_dates.id` (fixed ADMIN.58)
- `show_editors` CASCADE (already correct)
- `calendar_events` via `source_show_date_id` CASCADE (already correct)

Volunteer hours are retained permanently: `volunteer_hours_log.source_id`
is a bare UUID with no FK — orphaned `source_id`s after attendance deletion
are acceptable; `volunteers.total_hours` is unaffected.

Best-effort notifications cleanup via `getAdminClient()` (`.delete().like(
'href', '/crew/shows/${showId}%')`) fires before the DELETE. Non-blocking —
failure never prevents the delete.

The §11 checklist item previously requiring THREE guards is stale and has
been replaced. The live rule: one guard (archived status check) + cascade.
Established ADMIN.58 (Migration 045, commit b075a66).

### updateShowStatus() archive side-effect — calendar cleanup (ADMIN.59)
When `updateShowStatus(showId, 'archived')` is called, after the status UPDATE
succeeds, a two-step calendar cleanup fires:

```typescript
// Step 1: fetch show_date IDs (Supabase .in() cannot nest subqueries)
const { data: showDates } = await supabase
  .from('show_dates').select('id').eq('show_id', showId)

// Step 2: cancel future approved calendar events
if (showDates && showDates.length > 0) {
  const showDateIds = showDates.map(d => d.id)
  await supabase
    .from('calendar_events')
    .update({ status: 'cancelled' })
    .in('source_show_date_id', showDateIds)
    .eq('status', 'approved')
    .gt('end_time', new Date().toISOString())
}
```

This fires for ALL archive paths:
- Archive quick-action button in `ShowList.tsx` (calls `updateShowStatus()`)
- Settings tab status dropdown → Save Status (also calls `updateShowStatus()`)

The hard-delete path does NOT need this cleanup — `calendar_events.source_show_date_id`
CASCADEs from `show_dates`, which CASCADE from `shows`.

`revalidatePath('/calendar')`, `revalidatePath('/crew/calendar')`, and
`revalidatePath('/crew/calendar/pending')` added to `updateShowStatus()` for
ALL status changes (not just archive). Established ADMIN.59 (commit a35f771).

### NavOrderSection.tsx parseNavOrder() must mirror resolveGroupHrefs() self-healing (ADMIN.60)
`resolveGroupHrefs(saved, defaults)` in `Sidebar.tsx` appends any hrefs
present in `GROUP_HREF_DEFAULTS` but absent from a saved array — this makes
the rendered sidebar self-healing for new nav additions. `NavOrderSection.tsx`
had no equivalent logic in `parseNavOrder()` — newly added nav links would
appear in the rendered sidebar but NOT in the Platform Setup reorder UI when
an SA had a stale saved order.

Fix (ADMIN.60): `parseNavOrder()` now applies the same merge after parsing
the saved JSON. For each group key, hrefs present in `DEFAULT_LINK_ORDER[group]`
but absent from the saved array are appended. Both the sidebar and the reorder
UI are now self-healing in sync.

Rule: whenever a new nav link is added to `DEFAULT_LINK_ORDER` in
`types/sidebar.ts`, both surfaces self-heal automatically — no additional
code change is needed. If this ever breaks (e.g., a future edit to
`parseNavOrder()` removes the merge), the symptom is new links appearing
in the sidebar but not in the NavOrder reorder UI for SAs with stale saved
orders. Established ADMIN.60 (commit 73ef219).

### TopBar primary vs. secondary icon sizing convention (ADMIN.60)
The TopBar right side uses two distinct icon sizes:

Primary action icons (visible to all users, always rendered):
- `MessagesIcon.tsx` — Mail icon → `className="w-5 h-5"` (20px)
- `NotificationPanel.tsx` — Bell icon → `className="w-5 h-5"` (20px)
- `ThemeToggle.tsx` — Sun/Moon icons → `className="w-5 h-5"` (20px)

Secondary action buttons (contextual admin controls):
- Change Password — KeyRound → `className="w-4 h-4"` (16px)
- Sign Out — icon → `className="w-4 h-4"` (16px)
- Platform Setup — SlidersHorizontal → `className="w-4 h-4"` (16px)

Never use the `size={N}` prop style for any of these icons — use
`className="w-N h-N"` for consistency. The three primary icons were
standardized from mixed sizes (`size={20}` for Mail/Bell, `w-4 h-4` for
ThemeToggle) to uniform `className="w-5 h-5"` in ADMIN.60.

When adding any new icon to the TopBar right side, determine which tier
it belongs to and apply the corresponding size class. Established ADMIN.60
(commit 73ef219).

### Orphaned component/action deletion pattern (ADMIN.59/60)
When a component and its primary server action are made dead by a feature
change (e.g., `SeasonSelector.tsx` and `setPinnedSeason()` after the Season at
a Glance overhaul), delete them via this procedure:

1. Grep for all external references before deleting:
   ```
   grep -rn "SeasonSelector" app/ components/ lib/ --include="*.tsx" --include="*.ts"
   grep -rn "setPinnedSeason" app/ components/ lib/ --include="*.tsx" --include="*.ts"
   ```
   Only proceed if zero external references exist outside the files being deleted.
2. Delete the component file:
   ```
   rm components/crew/dashboard/SeasonSelector.tsx
   ```
3. If the server action is the only export in its file, delete the file.
   If other exports exist, remove only the orphaned function — do not delete
   the file. Confirm all imports used exclusively by the deleted function
   are removed too (only if they are not used by any other function in the file).
4. Document any orphaned `app_settings` key in §9 of the Brief as orphaned
   (no code reads or writes it). Do NOT write a migration to delete it —
   an inert row in `app_settings` is harmless. Optional manual cleanup via
   Supabase dashboard if desired.

Confirmed instance (ADMIN.59/60): `SeasonSelector.tsx` deleted, `setPinnedSeason()`
removed from `lib/actions/settings.ts` (12 other exports preserved), `dashboard_season_id`
key documented as orphaned. Established ADMIN.59/ADMIN.60.

**`fromZonedTime()` required for public calendar query
boundaries (ADMIN.76):**
`lib/data/publicCalendar.ts` must use `fromZonedTime()`
from `date-fns-tz` to convert grid boundary date strings
to true UTC instants before using them as `.gte()` and
`.lte()` query values:

```typescript
const rangeStart = fromZonedTime(`${rangeStartStr} 00:00:00`, timezone)
const rangeEnd   = fromZonedTime(`${rangeEndStr} 23:59:59`, timezone)
```

Then: `.gte('start_time', rangeStart.toISOString())` and
`.lte('start_time', rangeEnd.toISOString())`.

Naive UTC string construction (`T00:00:00Z`, `T23:59:59Z`)
appended to YYYY-MM-DD strings treats those as UTC instants.
Events with org-local start times late in the day are stored
in the DB with UTC timestamps from the *next* UTC calendar day
(e.g., a 7:00 PM CT event on the last grid day is stored as
`next-day 00:00:00Z`). The naive `.lte()` cutoff excludes these
events silently. The `timezone` parameter of
`getPublicCalendarEvents()` must not be discarded — it is
required for correct boundary computation. The admin calendar
(`app/crew/(app)/calendar/page.tsx` lines 89–90) has always
used this pattern correctly; `lib/data/publicCalendar.ts` did
not until ADMIN.76. Confirmed failure mode: August 2026 CT grid
was excluding late-evening Sep 5 events because
`2026-09-05T23:59:59Z` < `2026-09-06T00:00:00Z` (UTC
timestamp of 7 PM CT on Sep 5). Established ADMIN.76.

**Callboard shows in-memory chronological sort (ADMIN.77):**
`getPublicShows()` in `lib/data/callboard.ts` (or equivalent)
orders by `created_at` — insertion order, not show date order.
`app/callboard/page.tsx` applies an in-memory sort immediately
before the `.map()` rendering call:

```typescript
const sortedShows = shows.slice().sort((a, b) => {
  const aMin = a.dates.length > 0
    ? a.dates.reduce((min, d) =>
        d.show_date < min ? d.show_date : min,
        a.dates[0].show_date)
    : ''
  const bMin = b.dates.length > 0
    ? b.dates.reduce((min, d) =>
        d.show_date < min ? d.show_date : min,
        b.dates[0].show_date)
    : ''
  return aMin < bMin ? -1 : aMin > bMin ? 1 : 0
})
```

Key field names confirmed from live `PublicShow` type:
`show.dates` (NOT `show.show_dates`) and `d.show_date`
(NOT `d.date`). String comparison on YYYY-MM-DD is safe
(lexicographic = chronological for ISO dates). `.slice()`
before `.sort()` — never mutate the source array. Established
ADMIN.77.

**`convertUnlinkedClaim()` — admin-triggered volunteer
creation from legacy unlinked claims (ADMIN.72):**
`convertUnlinkedClaim(claimId, showId)` in
`lib/actions/shows.ts` converts a legacy `volunteer_id IS
NULL` slot claim into a linked volunteer record. Key
implementation invariants:
- **Idempotency guard first:** if `claim.volunteer_id IS NOT NULL`,
  return `{ success: true }` immediately — already converted.
- **Sequential email→phone duplicate check:** exact same pattern as
  `submitClaimWithLookup()` in `lib/actions/claims.ts` (two
  separate `.maybeSingle()` queries, not `.or()`).
- If existing volunteer found: UPDATE `slot_claims.volunteer_id`
  only (no INSERT). Still send the conversion invite email.
- If no volunteer exists: INSERT with `{ full_name, email, phone }`
  (three fields only — all other columns DB-defaulted); 23505
  race-condition guard via try/catch.
- **Non-blocking email:** `sendClaimConversionEmail()` fired in a
  void IIFE try/catch — never awaited in the primary flow.
- **AuditAction:** `slot_claim.convert_to_volunteer` (in `lib/audit.ts`
  Slot Claims group — NOT `audition.convert_to_volunteer` which
  is a different action type in the Auditions group).
- **`volunteer_phone` prerequisite:** the show detail page's
  slot_claims `.select()` must include `volunteer_phone` for
  the conversion action to have a phone value to insert.
  Added as part of ADMIN.72 (was absent from the query).
Email: `sendClaimConversionEmail()` (new function — NOT a reuse
of `sendUpdateLinkEmail()`). The update-link email says "you
requested a link" — false for admin-triggered conversion. The
conversion email explains that an admin added them to the
volunteer database and invites them to complete their profile.
Trigger: `volunteer_profile_invite`. Established ADMIN.72.

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

**XHR over fetch for upload progress (established 15.2; extended 15.3, SETUP.2, Phase AUDITIONS, Phase INVENTORY, Phase FORUMS):**
The project's default HTTP pattern is `fetch()`. There are eight sanctioned deviations,
all in file upload components with progress tracking:
- `components/consent/ConsentUploadForm.tsx` — consent form upload (established 15.2)
- `components/crew/media/MediaLibrary.tsx` — media library file upload (established 15.3)
- `components/crew/settings/BrandImageUploader.tsx` — brand asset upload / logo + favicon (SETUP.2)
- `components/audition/AuditionSignupClient.tsx` — inline material upload at audition signup (Phase AUDITIONS)
- `components/audition/AuditionUploadClient.tsx` — late material upload via upload_token link (Phase AUDITIONS)
- `components/crew/inventory/InventoryPhotoUploader.tsx` — inventory item photo upload (Phase INVENTORY.3)
- `components/crew/forums/ForumPostComposer.tsx` — forum post attachment upload, including attachments on thread replies (Phase FORUMS.4 — 7th sanctioned XHR file; uses sequential upload mirroring InventoryPhotoUploader.tsx's `uploadWithProgress()` pattern)
- `components/crew/messages/DirectMessageComposer.tsx` — DM message composer with file attachment upload, including TipTap editor + P-DC file upload via XHR + forwardRef handle (Phase MESSAGES.6 — **8th sanctioned XHR file**)

Body format for all eight: FormData with `cacheControl: '3600'` and file appended under
empty field name `''` — not a raw file body with explicit Content-Type header.

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
# Active flags after Migration 043 (Phase BETA):
#   feature_calendar, feature_checkin, feature_blast,
#   feature_rehearsals, feature_auditions,
#   feature_inventory, feature_forums,
#   feature_messages (Migration 037 — Phase MESSAGES),
#   feature_beta (Migration 043 — Phase BETA)
# All nine flags active. (feature_opportunities,
#  feature_hours_milestones, feature_documents
#  deleted — core features)
grep -rn "feature_calendar\|feature_checkin\|feature_blast\|feature_rehearsals\|feature_auditions\|feature_inventory\|feature_forums\|feature_messages\|feature_beta" \
  app/ components/ lib/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "feature-flags.ts" \
  | grep -v "setup.ts" \
  | grep -v "SetupPanel.tsx" \
  | grep -v "setup/page.tsx"
# Sanctioned uses of flag key strings:
#   feature-flags.ts — type definition + getFeatureFlags()
#   setup.ts — saveFeatureFlags() upsert key strings
#   SetupPanel.tsx — toggle UI FormData keys
#   setup/page.tsx — SETUP_KEYS array + SetupPanelInitialValues
#                    type (AUDITIONS.1a F2 — 5-file flag pattern)
# All other hits = R32 violation. Must return zero results.
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
  lib/actions/consent.ts \
  lib/actions/rehearsals.ts \
  lib/actions/auditions.ts
# Must return zero results for all four files. These are
# public-route files — getAdminClient() only, per the
# public-route action file invariant (§7 + §14). Any hit
# is a security violation.
# lib/actions/rehearsals.ts added Phase 21 (21.1).
# lib/actions/auditions.ts added Phase AUDITIONS.
```

```bash
# Confirm XHR usage is intentional (established 15.2/15.3/SETUP.2)
grep -rn "XMLHttpRequest\|new XHR" components/ app/
# Sanctioned XHR locations (upload progress tracking — eight total):
#   - components/consent/ConsentUploadForm.tsx (15.2)
#   - components/crew/media/MediaLibrary.tsx (15.3)
#   - components/crew/settings/BrandImageUploader.tsx (SETUP.2)
#   - components/audition/AuditionSignupClient.tsx (Phase AUDITIONS)
#   - components/audition/AuditionUploadClient.tsx (Phase AUDITIONS)
#   - components/crew/inventory/InventoryPhotoUploader.tsx (Phase INVENTORY.3)
#   - components/crew/forums/ForumPostComposer.tsx (Phase FORUMS.4 — 7th sanctioned XHR file)
#   - components/crew/messages/DirectMessageComposer.tsx (Phase MESSAGES.6 — 8th sanctioned XHR file)
# All eight use XHR because fetch() does not support upload progress
# events. All must include the deviation comment. Body format:
# FormData with cacheControl + file under '' field name (not raw
# file body with Content-Type header).
# Any hit outside these eight files requires review.
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

```bash
# Confirm no new hand-authored/native dark: pairings were
# introduced (R35 violation — confirmed defect pattern,
# ADMIN.39-AUDIT/39a-c). Run after any new crew admin UI work.
grep -rn "bg-brand-primary-light" \
  app/crew/ components/crew/ components/ui/ \
  --include="*.tsx" \
  | grep -v "dark:bg-brand-primary-light" \
  | grep "dark:"
# Must return zero hits, with one confirmed exception:
# components/crew/shows/ShowDetail.tsx (~line 421) —
# bg-brand-primary-light is intentionally preserved on the
# Self Check-In badge; its dark:bg-dark-nav was correctly
# removed in ADMIN.39b. The base class stays. Any other hit
# is a new R35 violation — fix before committing.
```

```bash
# After any edit to components/ui/ files or any new
# brand utility class added to @layer utilities: confirm
# all opacity-suffix and stacked-variant combinations
# used in components/ui/ have matching globals.css rules
# (R36):
grep -rn "brand-" components/ui/ --include="*.tsx" \
  | grep -E "\/[0-9]|hover:|focus-visible:|dark:|aria-"
# For each hit, verify a matching rule exists in
# app/globals.css. Check by grepping for the escaped
# class name:
grep -n "brand-primary\/80\|ring-brand-primary\/50" \
  app/globals.css
# Any class with no matching globals.css rule is an
# R36 violation — author the rule before committing.
# Pattern: .selector-escaped-class-name:pseudo-class {
#   property: color-mix(in srgb, var(--brand-token) NN%,
#   transparent); }
# Note: ADMIN.42 closed all known gaps as of July 2026.
# This check is a regression guard for future edits.
```

```bash
# Confirm no non-function value exports from 'use server'
# files (FORUMS.5-FIX — Vercel build failure, not caught
# by lint or tsc)
# 'use server' files may only export async functions.
# export const of a plain object/array/primitive is a
# build error. export type is safe (erased at compile time).
grep -rl "'use server'" lib/actions/ app/ \
  --include="*.ts" --include="*.tsx" \
| xargs grep -l "^export const" 2>/dev/null
# Any file appearing in this output requires manual review:
# confirm every export const in that file is an async
# function. If any export const is a plain object or
# non-function value, extract it to a companion file
# without 'use server' (see §7 pattern).
# Sanctioned companion files (no 'use server', export only):
#   lib/actions/forum-post-sanitize.ts — FORUM_POST_
#     SANITIZE_OPTIONS (IOptions object — FORUMS.5-FIX)
```

```bash
# Confirm createNotification() is wired at all NOTIFY
# write points (NOTIFY.3 pattern)
grep -n "createNotification" \
  lib/actions/forum-posts.ts \
  lib/actions/auditions.ts \
  lib/actions/calendar.ts \
  lib/actions/messages.ts
# Must return results in all four files. Any file with zero hits means
# a write point was not wired for that domain.
# lib/actions/messages.ts added Phase MESSAGES — createThread() and
# createReply() each call createNotification() inside a void IIFE.
# lib/utils/notifications.ts defines the helper.
# lib/actions/notifications.ts exports the server actions.
```

```bash
# Confirm sendForumNotificationEmail() returns the correct
# shape (NOTIFY.3/NOTIFY.3-FIX)
grep -n "Promise<{ notifiedUserIds" lib/email.ts
# Must return exactly one result (the function signature).
# Any absence means the return type was not updated.
# All return paths (including the early-return path where
# subscribers have no email) must return { notifiedUserIds }
# — not { notifiedUserIds: [] }.
```

```bash
# Confirm no hardcoded 'America/Chicago' remains outside
# lib/utils/org-timezone.ts and setup/page.tsx (Phase TZ)
grep -rn "'America/Chicago'" \
  app/ components/ lib/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "lib/utils/org-timezone.ts" \
  | grep -v "setup/page.tsx"
# Expected: zero results. Phase TZ complete — this grep should return
# zero results. Any hit outside the two sanctioned files means a
# 'America/Chicago' literal was introduced after Phase TZ shipped.
# Acceptable remaining hits:
#   lib/utils/org-timezone.ts — TIMEZONE_OPTIONS array entry +
#     getOrgTimezone() fallback (|| 'America/Chicago')
#   setup/page.tsx — initialValues fallback (|| 'America/Chicago')
#     per R18 pattern
# Any other hit = a regression — fix before committing.
```

```bash
# Confirm no revalidatePath() or revalidateTag() calls
# appear directly in Server Component render functions
# (FORUMS-FIX — confirmed Vercel runtime error).
# These functions are only valid inside Server Action
# invocations or Route Handlers.
# Check: any file NOT marked 'use server' that imports
# revalidatePath or revalidateTag:
grep -rn "revalidatePath\|revalidateTag" \
  app/ components/ \
  --include="*.tsx" --include="*.ts" \
  | grep -v "'use server'" \
  | grep -v "route.ts"
# Review every hit. Hits in layout.tsx or page.tsx
# that are NOT inside a server action callback or
# form action are runtime errors waiting to happen.
# Exception: imports at the top of the file are fine —
# only actual call sites in render functions are errors.
```

```bash
# Confirm show deletion has only ONE guard — the old three-guard rule
# was replaced in ADMIN.58 (attendance FKs changed to CASCADE).
# deleteShow() must NOT contain active slot_claims or attendance checks.
grep -n "slot_claims\|attendance" lib/actions/shows.ts \
  | grep -A2 -B2 "deleteShow\|guard\|check\|error"
# Review hits — inside the deleteShow() function only, confirm:
# - Guard 1 (archived status check) is present — correct
# - Guard 2 (slot_claims active check) is ABSENT — correct post-ADMIN.58
# - Guard 3 (attendance records check) is ABSENT — correct post-ADMIN.58
# Any slot_claims or attendance check inside deleteShow() is stale
# and must be removed. (ADMIN.58 — Migration 045 CASCADE fix)
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
□ Any new date display: confirm formatWallClockCT() used for
  bare date columns (show_date, start_date, end_date),
  formatCT() for timestamptz columns (created_at, updated_at,
  claimed_at, etc.) (R23). CONFIRMED SIGNATURE (3 args):
  formatWallClockCT(dateStr, timeStr | null, fmt).
  Wrong: formatWallClockCT(date, 'MMMM d, yyyy') — silently
  passes format string as timeStr. Correct:
  formatWallClockCT(date, null, 'MMMM d, yyyy').
  time without timezone columns ('HH:MM:SS' strings) must
  use a local formatTime() helper — never pass to formatCT()
  or formatWallClockCT(). See §7 for the helper pattern.
  (AUDITIONS.3a F1 — recurring failure mode, confirmed ×3)
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
□ Any new NotificationType value added to
  types/notifications.ts: (1) apply a migration
  that DROPs and re-ADDs notifications_type_check
  with the new value in the ARRAY — TypeScript
  compiles without the migration but the DB insert
  throws a CHECK constraint violation at runtime;
  (2) add the new string literal to NotificationType
  union; (3) add a case to getTypeIcon() in
  NotificationPanel.tsx — the switch is exhaustive
  and a missing case causes a tsc error. All three
  steps are required. Established ADMIN.64 /
  Migration 046.
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
  audition attachments; inventory/ for inventory item
  photos (Phase INVENTORY.3). CRITICAL: All storage API
  calls (createSignedUrl, createSignedUploadUrl, remove)
  must use getAdminClient() — storage.objects has zero
  RLS policies and requires the service role key regardless
  of session context. Use the dual-client pattern: DB row
  operations use getServerClient(), storage calls use
  getAdminClient() in the same function. Confirmed failure
  mode (INVENTORY.3 F1): getServerClient() returns null
  signed URLs silently with no error. (15.2 established;
  15.3 extends; INVENTORY.3 F1 adds dual-client requirement)
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
□ Any new field added to the volunteer profile edit form
  that must also be editable via the /update public form:
  confirm it is added to BOTH updateVolunteerInfo() in
  app/update/actions.ts (public route, getAdminClient())
  AND updateVolunteer() in lib/actions/volunteers.ts
  (admin session, getServerClient()). These are separate
  files at different auth levels. Missing one causes silent
  data loss on the path that was skipped. (19.2 pattern)
□ Any new <select> field in a form that maps to a nullable
  CHECK-constrained DB column: use z.string().optional()
  in the zod schema — NOT z.enum([...]).nullable().optional().
  An unselected <select> submits an empty string '' which
  fails z.enum() validation silently, blocking saves at
  the default state. The server action normalizes '' → null
  via || null (R18) before the DB write, satisfying the
  CHECK constraint. Confirmed failure mode: volunteerProfile
  Schema authored in 19.1 with z.enum() broke every profile
  save where communication_preference was left at "No
  preference" — corrected in 19.3. (19.1/19.3 pattern)
□ Any new role guard on a volunteer mutation server action
  (or any operational server action where Production must
  be blocked): use the explicit allowlist pattern rather
  than a single-exclusion pattern:
  WRONG: if (!admin || admin.role === 'viewer') return error
  CORRECT: const allowedRoles = ['super_admin','owner_admin','editor']
           if (!allowedRoles.includes(admin.role)) return error
  The single-exclusion pattern silently permits Production
  role. Production has no access to the volunteer database
  per Brief §7 — it must be explicitly blocked by the
  allowlist. Confirmed gap fixed in ADMIN.37 (updateVolunteer)
  and ADMIN.38 (addNote, toggleStatus, addManualHours).
  (ADMIN.37/38 pattern)
□ Any new crew admin UI className that includes a brand
  utility class (bg-brand-primary-light, text-brand-
  primary, border-brand-primary, etc.): confirm it is
  NOT paired with a native Tailwind dark: utility on
  the same CSS property (R35). Use one of the correct
  pairing patterns documented in §7 and §14. Apply the
  static neutral substitution table and governing hover
  rule from §7 when replacing an affected class.
  (ADMIN.39a–c pattern)
□ When fixing any cascade defect on a hover: state:
  inspect the same element for sibling variant classes
  on the same CSS property (has-[:checked]:,
  has-[:focus]:, aria-expanded:, aria-selected:, etc.).
  If the same defect exists on a sibling variant, fix
  all in the same edit — never leave a partial fix on
  a single element. (ADMIN.39b — VolunteerProfileForm
  .tsx:359)
□ Any brand utility class added to a component with an
  opacity suffix (/NN) or a stacked pseudo-class/variant
  prefix (hover:, focus-visible:, dark:, aria-*, or any
  combination): confirm a matching hand-authored rule
  exists in app/globals.css before committing (R36).
  Native Tailwind classes auto-generate these; hand-
  authored @layer utilities classes do not. Missing rules
  produce silent visual failures — no build error, no
  lint warning. Check via: grep -n "[escaped-class-name]"
  app/globals.css. Author the rule if absent, following
  the color-mix() pattern of existing rules in that
  family's section. (ADMIN.42 pattern)
□ Any new server action or data function that returns
  attendance status for rehearsal events: confirm it computes
  the effective roster first, then LEFT JOINs rehearsal_
  attendance onto it. Never query rehearsal_attendance alone
  to build a per-person result — it only contains rows for
  people already marked, so unmarked roster members would
  silently disappear. Return status: null for roster members
  with no attendance record yet. (21.3 — getRehearsalAttendance
  ForEvent() correctness pattern; §7 pattern note)
□ Any new bulk attendance mark operation (e.g., "mark all
  present" for a rehearsal or event): use a single batch
  .upsert([...array...]) call, not a loop of individual
  markAttendance() calls. Supabase's JS client supports
  array upsert natively. A per-person loop achieves the same
  result but is needlessly slow and not atomic.
  (21.3 — markAllRehearsalAttended() pattern)
□ Any new detail page tab that depends on a not-yet-built
  shared component (e.g. the Email Templates tab depending on
  the TipTap merge tag extension from a later prompt): build
  the tab as a stub in the initial UI prompt. The stub renders
  a placeholder ("Email templates — coming soon") and nothing
  else. The full implementation is delivered in a later prompt
  once the dependency ships. Never leave a tab wired to a
  non-existent component — it will throw a build error. Never
  skip the stub — a missing tab in the UI is confusing and
  hard to retrofit cleanly. Established AUDITIONS.2b/2c.
□ Any new TipTap editor instance in a Next.js App Router
  admin component: pass `immediatelyRender: false` to
  `useEditor()`. Without this option, the editor produces
  an SSR/hydration mismatch — the server renders an empty
  shell while the client initializes the full editor DOM,
  causing a React hydration error. Required in BlastComposer
  .tsx and all three Email Templates tab editors.
  Pattern: useEditor({ extensions: [...], content: '',
  immediatelyRender: false })
  (AUDITIONS.2c F2)
□ Any TipTap editor that receives content loaded
  asynchronously (after mount): do NOT pass initial content
  via the useEditor() content option (only applies at init).
  Do NOT use a useEffect with state dependency (triggers
  react-hooks/set-state-in-effect lint rule enforced here).
  Correct: call editor.commands.setContent(html) directly
  inside the async load function when data arrives.
  (AUDITIONS.2c F7)
□ Any prompt that adds items to 30BN_DEFERRED_VERIFICATIONS_
  v2.md: confirm items are manual owner browser-verification
  steps only. DB-confirmable schema items (table existence,
  column types, index presence, RLS policy names, migration
  status, app_settings row presence) belong in build reports
  via live Supabase queries — NOT in the Deferred Verifications
  document. The document header is explicit on this boundary.
  Items already confirmed via live DB queries in a build
  report must not be duplicated into the verification doc.
  (21.3 Q2 — confirmed scope boundary)
□ Any edit to HelpContent.tsx ALL_SECTIONS array or section
  positions: read the live file to confirm current order —
  never rely solely on Brief documentation. The live section
  order has drifted from Brief documentation before
  (AUDITIONS.4b F4: Getting Help precedes Rehearsals and
  Auditions in the live file, not follows as the Brief had
  stated). Verify with:
    grep -n "id:.*'" components/crew/help/HelpContent.tsx
  before inserting any new section to confirm the correct
  position.
□ Any new public page that handles a not-found case: use
  `notFound()` from 'next/navigation' (triggers the custom
  app/not-found.tsx). Do NOT create a local <Unavailable>
  or <NotFound> component — these create inconsistency. Some
  older pages used an inline component; notFound() is the
  correct pattern for all new pages. (AUDITIONS.3a F4)
□ RESOLVED: 033_audition_schema_fixes.sql written and
  applied (DB-VERIFY.5, commit 0ed3b5d). The five inline
  schema fixes from Phase AUDITIONS are now captured in
  a committed migration file. A fresh environment seeded
  from the repo's .sql files now produces a schema
  identical to production. No pre-Phase-17 migration debt
  remains from Phase AUDITIONS. (Phase AUDITIONS Q3 from
  DOC.59 — closed DB-VERIFY.5)
□ Any inline schema fix applied via Supabase MCP during a
build (bypassing a named .sql migration file): flag it in
the build report Flags section AND add a Q-item noting
that a follow-up migration must be written before the next
phase launch. Do not apply inline fixes silently — they
create migration/DB drift. See §7 migration/DB drift
pattern. (Phase AUDITIONS — established from Q3 DOC.59)
□ Any new route handler (app/api/***/route) that embeds JSX
directly in the handler (e.g., renderToBuffer(<Component
.../>) with @react-pdf/renderer): use the .tsx extension,
not .ts. A .ts file cannot parse JSX syntax — the build
will silently fail or tsc will error. Confirmed failure
mode (INVENTORY.5 F1): app/api/inventory/tags/route.tsx
required .tsx because it embeds <InventoryTagsPDF .../>.
The pattern is established in app/crew/(app)/volunteers/
export/route.tsx (same reason). When in doubt: if a route
handler calls renderToBuffer() or any JSX factory, use
.tsx. (INVENTORY.5 F1)
□ Any prompt that writes or modifies HelpContent.tsx section
JSX: read the live file and match its actual authoring
convention before writing replacement content. The live
convention uses: show(id) predicates (not aria-labelledby
nested <section> blocks), shared h2Classes/h3Classes/
pClasses constants defined at the top of the file,
<Tip>/<Warning>/<Divider> helper components already
defined in the file, and backtick template literals for
possessives and contractions ({item's} not {"item's"}).
Prompt-suggested markup is always overridden by the live
convention when they conflict. Confirmed (INVENTORY.5 F3):
the prompt's suggested aria-labelledby section structure
did not match the live file; the build correctly rewrote
in the live convention instead. Read the most recently
built adjacent section to confirm the current pattern.
(INVENTORY.5 F3)
□ Any new `lib/data/*.ts` file that uses the parameter-passing
pattern (accepts supabase client as param, never constructs its
own): confirm it does NOT have `'use server'` at the top. A
`'use server'` directive on a data utility module turns all its
exports into public server actions — wrong for internal utility
functions. Data modules belong in `lib/data/`; action endpoints
belong in `lib/actions/`. Confirmed (FORUMS.3): `lib/data/
forums.ts` must have zero `'use server'` — verified via grep
check in quality gate.
□ Any new TipTap `useEditor()` call using `immediatelyRender:
false`: type the returned editor variable explicitly as
`Editor | null` (import `Editor` from `@tiptap/react`). Do NOT
rely on `ReturnType<typeof useEditor>` — TypeScript may resolve
the wrong overload and infer `Editor` (non-null), causing silent
null-safety failures. Also type any toolbar helper props that
accept the editor as `Editor | null`. Both `ThreadListClient.tsx`
and `ThreadViewClient.tsx` required this fix before `tsc --noEmit`
passed. (FORUMS.5 Q3)
□ Any new email notification that fires after a successful
mutation (e.g., forum subscription notifications): confirm it
uses `sendBatchEmails()` via the shared helper — NOT a
per-recipient loop calling `resend.emails.send()`. R8 prohibits
looping `resend.emails.send()` even for "per-user" notification
patterns — the batch approach handles personalization via
individual payload items in one batch call. Confirmed FORUMS.5
Q2: the initial pseudocode looped per-subscriber; corrected to
`sendBatchEmails()` before commit. (R8 / sendBatchEmails() pattern)
□ Any new storage path in the `media` bucket: confirm it follows
the established namespace pattern. Forum paths use
`forums/[post_id]/[uuid].[ext]` for final attachments and
`forums/temp/[tempKey]/[uuid].[ext]` for pre-post-creation
staging. At post creation time, temp files are moved to final
paths via `adminClient.storage.from('media').move(tempPath,
finalPath)` before inserting `forum_post_attachments` rows. This
is the temp-key pattern — avoids orphaned storage objects when
post creation fails after upload but before DB insert. (FORUMS.4
pattern)
□ Any new exported constant or non-function value needed by
multiple server action files: confirm it is NOT defined in a
'use server' file. Extract it to a companion module without
'use server' (e.g. lib/actions/my-shared-constants.ts) and
import it at each call site. 'use server' files may only export
async functions — a plain object export causes a Vercel build
failure that does not surface in npm run lint or npx tsc
--noEmit. export type is safe (erased at compile time). Run the
§10 grep check after any prompt that adds exports to 'use
server' files. (FORUMS.5-FIX — confirmed failure mode:
FORUM_POST_SANITIZE_OPTIONS plain object export from
lib/actions/forum-posts.ts)

□ Any new color token added to `app/globals.css` @theme
  block: confirm the `--color-` prefix is used (not `--`
  directly). Without the `--color-` prefix, Tailwind v4
  will NOT auto-generate utility classes from the token —
  it produces an inert CSS custom property only. No error
  is thrown. (STYLE.A F3)

□ Any new CSS custom property addition to
  `resolveBrandColors()` in `app/layout.tsx`: confirm the
  template literal uses `brand.primary` and `brand.accent`
  (the actual bound identifiers), NOT `brandPrimary` /
  `brandAccent` (which do not exist). (STYLE.A F2)

□ Any mockup component in components/crew/settings/ that
  defines badge or status helpers: confirm all helpers are
  named exports, not module-private functions. Module-private
  unused helpers trigger @typescript-eslint/no-unused-vars
  lint warnings even if all badge variants needed for the
  representative data are present. (STYLE.4 F1 — pre-empt)

□ Any component using Tailwind classes for computed-looking
  values (progress bar widths, fill colors, staffing
  indicators): confirm every class name appears as a complete
  unbroken literal string. No template literals, no array
  joins, no conditional expressions that build class names
  from parts. (STYLE.3/STYLE.6)

□ Any new persistent notification type added to the system:
  confirm the notification is created via createNotification()
  from lib/utils/notifications.ts (NO 'use server') and called
  inside a void IIFE in the relevant server action so notification
  failure never blocks the primary action's return.
  Pattern: void (async () => { try {
    await createNotification(userId, type, title, href,
    body, supabase)
  } catch { /* swallow */ } })()
  Never await createNotification() directly in the primary flow.
  (NOTIFY.2/NOTIFY.3 — companion-module + void IIFE patterns)

□ Any new ephemeral notification count (queue-driven): confirm
  it is derived as a live SELECT COUNT from an existing table —
  NOT written to the notifications table. Ephemeral items clear
  platform-wide when the underlying queue item is resolved.
  Persistent items (forum replies, audition signups, etc.) go
  to the notifications table. Never confuse the two tracks.
  (NOTIFY.1/NOTIFY.2 — ephemeral vs persistent distinction)

□ Any query that counts unread forum posts: confirm the query
  joins through forum_threads to reach forums.is_archived and
  filters is_archived = false. forum_posts does NOT have a
  direct forum_id column — the join chain is:
  forum_posts → forum_threads → forums.
  Archived forum posts must NOT contribute to unread badge
  counts. (NOTIFY.3 — getForumUnreadCount() archived fix)

□ Any new private helper function defined in a 'use server'
  file (i.e. not exported): confirm it is truly unexported.
  Unexported async functions in 'use server' files are module-
  private utilities, NOT server action endpoints — this is
  correct and safe. The 'use server' export constraint applies
  only to exported symbols. Established patterns:
  assertAuditionAccess() in lib/actions/auditions-admin.ts,
  isModeratableBy() in lib/actions/forum-moderation.ts,
  resolveCalendarRecipients() in lib/actions/calendar.ts.
  (NOTIFY.3)

□ Any new migration SQL file: confirm policy names use unquoted snake_case with
  a table prefix (e.g. `message_threads_select_participant`, not
  `"select_participant_threads"`), `TO authenticated` is present on every policy,
  and `WITH CHECK` mirrors `USING` on UPDATE policies. Always read the most recent
  migration file before writing a new one — follow its exact naming convention.
  (R39 — established MESSAGES.1)

□ Any Server Action bound via `.bind(null, id)` and passed to `<form action>`:
  if the action's return type is non-void (e.g. `Promise<{ error?: string }>`),
  cast it `as unknown as (formData: FormData) => Promise<void>`. A single direct
  cast produces TS2352 ("insufficient overlap") — route through `unknown` as
  TypeScript itself recommends when overlap is insufficient. This is not a general
  suppression; it is the only compliant path for non-void actions on `<form>`
  elements. (R40 — confirmed MESSAGES.4 F2)

□ Any expansion of `NotificationCounts` in `types/notifications.ts`: also update
  the `EMPTY_COUNTS` fallback literal in `lib/actions/notifications.ts`. The
  constant must be structurally complete for the type or TS2741 surfaces. This
  cascade is predictable and must be pre-planned in the prompt that expands the
  type. Check: `grep -n "EMPTY_COUNTS" lib/actions/notifications.ts`.
  (MESSAGES.2 F1)

□ Any new feature flag toggle added to `SetupPanel.tsx` Section 6: confirm four
  changes are present — (1) `useState` state declaration, (2) `ToggleRow` JSX,
  (3) `SetupPanelInitialValues` type widening (`feature_xyz: string`), AND
  (4) `fd.append('feature_xyz', xyzEnabled ? 'true' : 'false')` in `handleSave()`.
  There are no hidden inputs in `SetupPanel.tsx` — `fd.append()` is the only path
  to `saveFeatureFlags()`. Missing it produces a silent runtime failure; the build
  compiles cleanly. (MESSAGES.3 F1 — §7 pattern)

□ Any new prop added to `Sidebar.tsx`: confirm BOTH the TypeScript interface type
  AND the destructured parameter list (with an explicit default value) are updated.
  Adding the interface without the destructuring default causes TS2304 in JSX.
  Pattern: `forumUnreadCount = 0` / `messagesUnreadCount = 0`. Default value
  belongs in the destructuring, not in the JSX body.
  (MESSAGES.3 F3 — §7 pattern)

□ Any page that renders TipTap-generated HTML via `dangerouslySetInnerHTML`:
  confirm `@tailwindcss/typography` is NOT assumed — it is not installed in
  this project. `prose`, `prose-sm`, `dark:prose-invert` produce zero output.
  Use Tailwind arbitrary CSS variant selectors instead:
  `[&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5 [&_strong]:font-semibold`
  etc. Do not copy the `prose` usage from `ThreadViewClient.tsx` — those classes
  are inert (pre-existing gap). (MESSAGES.5/MESSAGES.6)

□ Any new prop intended for a sub-component inside a tabbed detail view
  (`AuditionDetailTabs`, `ShowDetail`, `RehearsalDetailTabs`, or similar):
  audit and confirm all five threading levels in Task A before any edit —
  (1) parent page JSX, (2) top-level component type annotation, (3) top-level
  component destructuring (latent dead prop risk), (4) sub-component call site,
  (5) sub-component inline type + destructuring. Missing any level is a silent
  drop with no TypeScript error. (MESSAGES.7)

□ When `saveFeatureFlags()` is extended with a new feature flag: confirm the
  `logAction()` call inside the same function also has the new flag in both its
  `before` and `after` diff objects. The flag extraction, validation, upsert,
  and revalidatePath additions are clearly required — the `logAction()` diff
  update is easy to miss and produces a silent audit log gap with no build error.
  Check: `grep -n "logAction" lib/actions/setup.ts`. (MESSAGES.7 — B1 fix)

□ Any server-side code that needs the org timezone: call
  `getOrgTimezone(supabase)` from `lib/utils/org-timezone.ts`.
  Accepts any Supabase client as parameter (companion-module pattern).
  Returns the IANA timezone string, or 'America/Chicago' fallback.
  Never hardcode 'America/Chicago' in server actions or route handlers.
  (Phase TZ — TZ.1)

□ Any client component that needs the org timezone: read
  `document.body.dataset.timezone || 'America/Chicago'` with
  the required SSR guard:
  `typeof document !== 'undefined'
    ? (document.body.dataset.timezone || 'America/Chicago')
    : 'America/Chicago'`
  Never call `getOrgTimezone()` from a Client Component. Never
  prop-drill timezone from a Server Component to a Client Component
  — the body attribute is the established distribution mechanism.
  (Phase TZ — TZ.1, TZ.5a)

□ Any new function that calls `getOrgTimezone()`: ensure the
  Supabase client is constructed BEFORE the call. Lazy client
  construction (creating the client mid-function after other work)
  requires reordering when `getOrgTimezone()` is added. The client
  constructors have no ordering dependencies — moving them to the
  top of the function is always safe. Recurring failure mode across
  TZ.2 and TZ.4b. (Phase TZ client-before-usage ordering pattern)

□ Any new `formatCT()` or `formatWallClockCT()` call site (or any
  existing call site updated during Phase TZ sweep): pass the resolved
  `tz` as the final optional argument. Both functions default to
  'America/Chicago' when the argument is omitted — the default
  preserves backward compatibility but is not configurable. Updated
  call sites must explicitly pass `tz`. (Phase TZ — TZ.1)

□ `resolveEmailSettings()` now returns `timezone: string` alongside
  its other fields. Any send function that calls both
  `resolveEmailSettings()` and `formatCT()`/`formatWallClockCT()`:
  confirm `timezone` is destructured from the result and passed as
  the final argument to the format calls. (Phase TZ — TZ.4b)

□ Any new sub-component added to `SetupPanel.tsx`: use
  `SaveStatus` type for the status state — NOT an inline
  union. Declare: `useState<SaveStatus>('idle')`. Call
  `setStatus('saved')` on success — never
  `setStatus('success')`. `SaveFeedback` renders "✓ Saved"
  only on `status === 'saved'`; any other success-like
  string produces no visible feedback. (MM.2 Q1)

□ Any new `app_settings` key mapping added to the
  `initialValues` block in `setup/page.tsx`: use
  `settingsMap.get('key') || 'fallback'` — NOT bracket
  notation `settingsMap['key']`. `settingsMap` is a `Map`
  instance; bracket access silently returns `undefined`.
  Use `||` not `??` per R18 (empty string fallback). (MM.2 Q1)

□ Any server action call in a `handleSave()` function in
  `SetupPanel.tsx` that returns `ActionResult`: narrow
  with `'error' in result` before accessing `result.error`.
  Do NOT use `result?.error` — `ActionResult` is a
  discriminated union; the success branch has no `error`
  field. Wrong: `if (result?.error)`. Correct:
  `if ('error' in result)`. (MM.2 Q1)

□ Any future edit to `proxy.ts` that adds logic near the
  top of the function body: confirm the maintenance mode
  check block still fires before `needsFlagCheck` and
  before all flag/role checks. The maintenance gate must
  remain the first substantive check after
  `const { pathname } = request.nextUrl`. Moving it later
  allows feature-flag redirects to fire before it,
  breaking the kill-switch guarantee. (MM.1)

□ Any server action that internally calls `revalidatePath()`
  or `revalidateTag()`: confirm it is NEVER called from a
  Server Component's render function body (page.tsx,
  layout.tsx, any async Server Component function). Only
  valid inside Server Action invocations or Route Handlers.
  Calling during render throws a silent runtime error that
  bubbles to app/error.tsx with no stack trace.
  (FORUMS-FIX — confirmed failure mode)

□ After any runtime error investigation: confirm
  `app/error.tsx` destructures `error` (not just `reset`)
  AND includes `useEffect(() => { console.error('Runtime
  error caught by error boundary:', error) }, [error])`.
  Without both, runtime error diagnosis requires extensive
  static analysis with zero logging. (FORUMS-FIX.B)

□ Any build that audits or modifies ShowCard behavior:
  `ShowCard` is defined INLINE inside `ShowList.tsx` — it
  is NOT at `components/crew/shows/ShowCard.tsx`. Mutation
  state for ShowCard actions always lives in `ShowList`
  (parent) and is passed down as props. Never move mutation
  state into ShowCard. (SHOWDELETE.A / SHOWARCHIVE.A)

□ Any show deletion server action: requires only ONE guard
  before DELETE — show must exist and `status = 'archived'`.
  Guards 2 (active slot_claims) and 3 (attendance records)
  were REMOVED in ADMIN.58. Migration 045 changed both
  `attendance.show_id` and `attendance.show_date_id` FKs
  to `ON DELETE CASCADE` — attendance rows cascade automatically
  on show deletion. The former NO ACTION FK violation risk is
  resolved at the DB level. The three-guard rule is stale —
  do not reintroduce guards 2 or 3. Confirmed: single guard +
  cascade is the correct design. (ADMIN.58 — Migration 045)

□ Any new server action added to `lib/actions/shows.ts`:
  use `ShowEditorActionResult` as the return type — NOT
  `ActionResult`. The file uses `ShowEditorActionResult`
  throughout (`{ success: true } | { error: string }`).
  Using `ActionResult` will cause a TypeScript error on
  call sites that use `ShowEditorActionResult`. Confirmed
  self-caught during SHOWDELETE.1 Task H (tsc). (SHOWDELETE.1)

□ Any call to `updateShowStatus(showId, 'archived')`: confirm
  the archive side-effect fires — cancels future approved
  `calendar_events` linked to that show's dates via two-step
  query (show_date IDs → `.update` cancelled `.in source_show_date_id`
  `.gt end_time now()`). Confirm `revalidatePath('/calendar')`,
  `revalidatePath('/crew/calendar')`, and `revalidatePath('/crew/
  calendar/pending')` are present in `updateShowStatus()` for
  ALL status changes. (ADMIN.59 archive side-effect pattern)

□ Any new nav link added to `DEFAULT_LINK_ORDER` in
  `types/sidebar.ts`: confirm both (1) `resolveGroupHrefs()`
  in `Sidebar.tsx` and (2) `parseNavOrder()` in
  `NavOrderSection.tsx` self-heal for the new link. The
  rendered sidebar and the Platform Setup reorder UI must
  both surface new links without additional code changes.
  If `parseNavOrder()` is ever edited, verify it still
  applies the merge logic. (ADMIN.60 — NavOrderSection
  self-healing mirror pattern)

□ Any new icon added to the TopBar right-side area: confirm
  it uses `className="w-5 h-5"` for primary action icons
  (Mail/Bell/ThemeToggle tier) or `className="w-4 h-4"` for
  secondary action buttons (Change Password/Sign Out/Platform
  Setup tier). Never use the `size={N}` prop for TopBar icons.
  (ADMIN.60 — TopBar icon sizing convention)

□ When adding a new feature flag to `saveFeatureFlags()` in
  `lib/actions/setup.ts`: confirm SIX wiring points — (1)
  extract from formData, (2) add to `isValidFlagValue()`
  type-guard, (3) add row to the batched `.upsert([])` call,
  (4) add to `logAction()` BEFORE diff object, (5) add to
  `logAction()` AFTER diff object, (6) add `revalidatePath()`
  for the new feature's route. The SetupPanel UI requires
  four additional wiring points — both sets must be complete.
  Missing any server-side wiring point produces a silent
  failure. (ANNOUNCE.2 Task A4 correction)

□ Any new `app_settings` keys related to dashboard
  announcements: use the `dashboard_announcement_` prefix,
  NOT `announcement_`. Pre-existing keys
  `announcement_banner_active` and `announcement_banner_text`
  serve the public-facing announcement banner feature — a
  completely separate system. The dashboard announcements
  widget uses `dashboard_announcement_body`,
  `dashboard_announcement_updated_at`,
  `dashboard_announcement_roles`. Any OA mirror route must
  be at `/crew/settings/dashboard-announcement` (not
  `/crew/settings/announcement` which already exists).
  (ANNOUNCE.A G3 — naming collision discovery)

□ Any package using a napi-rs native binary (e.g.,
  `@resvg/resvg-js`): confirm `serverExternalPackages:
  ["package-name"]` is present in `next.config.ts`. Without
  this entry, Next.js attempts to bundle the native module
  and fails at runtime. (QRBANNER.1)

□ Any SVG `<text>` element whose content comes from a user-
  supplied or DB-sourced string: confirm the string is passed
  through an `escapeXml()` helper before insertion. The five
  characters requiring escaping: `& < > " '`. Never inject
  raw user strings into SVG XML markup. (QRBANNER.1)

□ Any new route handler that parses the `User-Agent` header:
  use a local manual regex helper (~5–10 lines). Ordering
  rule: Edge check before Chrome (both contain "Edg/");
  tablet check before mobile (Android tablets lack "Mobile"
  substring). Fallback: `'desktop'` / `'Other'`. Do not
  install a UA parsing library for device-type bucketing.
  (QRANALYTICS.1)

□ Any new public redirect route handler at `app/*/route.ts`
  (no session context, no feature flag gate): (1) add
  `// PUBLIC ROUTE — getAdminClient() only, never
  getServerClient()` file header; (2) use `getAdminClient()`
  exclusively; (3) confirm no entry in `proxy.ts` matcher is
  needed — route handlers execute regardless of middleware
  matcher; (4) wrap any DB side-effect inserts in try/catch
  that swallows errors so the redirect is never blocked;
  (5) return `Response.redirect()` not a Next.js page
  response. Structural template: `app/documents/[token]/
  route.ts`. (QRANALYTICS.1)

□ `Sidebar.tsx` `navOrder` prop: declare as
  `navOrder?: SidebarNavOrder` with NO default value.
  `undefined` is the correct absent state — it means use the
  hardcoded DEFAULT_GROUP_ORDER / GROUP_HREF_DEFAULTS.
  Do not add `= undefined` or any other default. (NAVORDER.1)

□ Any new flagged link added to `Sidebar.tsx`: three-part
  atomic edit — (1) NAV_ITEMS array entry, (2)
  FLAG_GATED_HREFS set entry, (3) Production allowlist
  entry. `TOOLTIP_ANCHOR_MAP` no longer exists (removed
  NOTIFY.4-CLEANUP) — do not reference it. (NAVORDER.1 /
  SIDEBAR.2 pattern)

□ Any prompt spec `className` that contains a dynamic
  expression (e.g., `ROLE_BADGE_CLASSES[admin.role]`):
  confirm the spec uses a template literal —
  `` className={`base-class ${DYNAMIC_EXPR}`} `` — not a
  plain string. A plain string renders the expression text
  literally as a CSS class name. Recurring failure mode:
  SIDEBAR.4 F-item and SIDEBAR.6 F-item both required
  template literal fixes by Claude Code. (Pre-prompt
  compliance pass — §7)

□ Any new `lucide-react` icon import specified in a prompt:
  verify the icon exists before writing the prompt via
  `node -e "require('lucide-react').IconName"`. Grepping
  the lucide dist path is unreliable (finds partial name
  matches). A non-existent icon fails silently in dev hot-
  reload but breaks the production build. (Pre-prompt
  compliance pass — §7)

□ Any new `SetupPanel.tsx` sub-component that needs card
  styling: `cardClasses` and `saveButtonClasses` are
  module-private constants in `SetupPanel.tsx` and are NOT
  importable. Define inline equivalents in the sub-component
  file. NAVORDER.1 F2: prompt assumed importability; Claude
  Code read the live file and applied only structural classes.
  (Pre-prompt compliance pass — §7)

□ `saveSidebarNavOrder()` in `lib/actions/setup.ts`:
  revalidates `revalidatePath('/crew', 'layout')` only —
  the layout scope propagates the updated navOrder to all
  crew pages. Does NOT revalidate individual `/crew/*` paths.
  Any future SA-only settings action that affects the sidebar
  should follow this same scope. (NAVORDER.1)

□ Any new active sidebar nav link state: confirm the full
  recipe is applied — `border-l-4` (Tailwind width class) +
  `style={{ borderLeftColor: 'var(--brand-primary)' }}`
  (inline style for color) + `bg-brand-primary-light` +
  `text-brand-primary` + `rounded-r`. Never use
  `border-brand-primary` alongside `border-l-4` — it
  overrides all four border sides. Inactive links use no
  fill and no left border. (SIDEBAR.2)

□ Any new server action file or new function in an existing
  server action file that calls `getServerClient()`: confirm
  the call is `await`ed — `const supabase = await
  getServerClient()`. Omitting the `await` returns a stale
  client that compiles and lints cleanly but fails at runtime
  with auth/session errors. NAVORDER.1 F1: prompt omitted
  `await`; Claude Code caught and corrected before commit.
  (Pre-prompt compliance pass — §7)

□ `lib/data/qr.ts` `QRHistoryEntry` type and SELECT: confirm
  both `label` and `banner_text` are present as distinct
  fields. `label` is the admin-supplied display name for the
  QR code entry; `banner_text` is the optional text rendered
  as a banner strip at the bottom of the QR image. These are
  different columns on `qr_codes` with different purposes —
  never conflate them. (QRBANNER.1)

□ Any new card added to the Settings hub (`app/crew/(app)/settings/
  page.tsx`): use `{canAccessAdminSettings && <LinkedCard .../>}` —
  never `cond ? <LinkedCard/> : <LockedCard/>`. `LockedCard` has been
  removed from this file (ADMIN.49). The hide-not-lock rule applies to
  all SA/OA-only destination pages. Cards for Editor-accessible
  destinations (if any future card exists) may still use a conditional
  LinkedCard, but must never show a LockedCard to a role that is
  redirected before reaching the JSX. (ADMIN.49 hide-not-lock rule)

□ When adding a new href to `GROUP_HREF_DEFAULTS` and a group's
  `*_HREFS` constant in `Sidebar.tsx`: `resolveGroupHrefs()` will
  automatically append the new href for any SA with a stale saved nav
  order. No additional action needed for stale-order handling. The SA
  can reposition via the Nav Order panel. (ADMIN.49 resolveGroupHrefs)

□ Any sidebar link that is role+column-gated (not feature-flag-gated):
  do NOT add to `SETTINGS_HREFS`, `FLAG_GATED_HREFS`, or
  `DEFAULT_LINK_ORDER`. Render as a special-case conditional append
  inside the relevant group render block. Thread a new boolean prop
  from `layout.tsx` (computed after null-check on admin) to `<Sidebar>`
  using the two-location prop pattern (interface + destructured default).
  `/crew/settings/inventory` → 'Inventory Management' in `HREF_LABELS`
  as the established template. (ADMIN.50 conditional sidebar link)

□ Any new feature flag added to `saveFeatureFlags()` and the feature
  flag grep in §10: confirm `feature_beta` is already in the grep
  pattern after ADMIN.48/BETA.1. The grep must include all nine active
  flags. Sanctioned uses of `feature_beta` key string: `feature-flags.ts`
  (type + getFeatureFlags), `setup.ts` (saveFeatureFlags upsert),
  `SetupPanel.tsx` (toggle UI fd.append), `setup/page.tsx` (SETUP_KEYS
  + initialValues). All other hits = R32 violation. (BETA.1 / R32)

□ Any TipTap editor component that requires click-to-focus
  (clicking empty space below content focuses the editor):
  use the `dm-editor-wrapper` pattern — (1) add a wrapper
  `<div>` with class `dm-editor-wrapper cursor-text` and
  `onClick={() => { if (!disabled) editor?.commands.focus() }}`;
  (2) inject min-height via CSS custom property:
  `style={{ '--dm-min-height': minHeight } as CSSProperties}`;
  (3) add the globals.css rule:
  `.dm-editor-wrapper .ProseMirror { min-height: var(--dm-min-height, 100px); outline: none; }`
  as a plain rule outside `@layer utilities`. Do NOT apply
  `minHeight` to `<EditorContent>` or its outer `<div>` —
  it never reaches the `.ProseMirror` contenteditable child.
  (ADMIN.54)

□ Any new CSS rule targeting a TipTap-rendered element
  (e.g. `.ProseMirror`, `.ProseMirror p`, `.ProseMirror ul`):
  add as a plain CSS rule outside `@layer utilities` in
  `app/globals.css`. These elements are rendered by TipTap
  internally and cannot be addressed via Tailwind class
  composition on the component itself. (ADMIN.54)

□ Any use of `@resvg/resvg-js` that renders text in the
  SVG: always supply an explicit font file via
  `font: { loadSystemFonts: false, fontFiles: [fontPath] }`.
  Never rely on `loadSystemFonts: true` — it silently fails
  on Vercel's serverless Linux runtime (zero system fonts).
  Bundle the font at `public/fonts/[name].ttf` (TTF/OTF
  only — no WOFF/WOFF2). Resolve at runtime via
  `path.join(process.cwd(), 'public', 'fonts', '[name].ttf')`
  + `existsSync()`. Only pass font options when text
  rendering is actually needed. (ADMIN.56/ADMIN.56-FIX)

□ Any server-only file that needs to reference a project
  asset file (font, image, fixture) by path at runtime:
  use `path.join(process.cwd(), 'public', ...)` or a
  variable-based path — NEVER a literal string in
  `createRequire(import.meta.url).resolve('path/to/file.ttf')`
  or `import.meta.resolve('...')`. Turbopack statically
  analyzes literal string arguments to these functions and
  attempts to import binary assets as modules, producing
  "Unknown module type" build failures invisible to lint and
  tsc. The failure only surfaces at `npm run build` or in
  Vercel deployments. (ADMIN.56-FIX)

□ Any new migration SQL file created during a build: confirm
  the file is placed at the repo root (e.g.,
  `044_maintenance_restoration.sql`), NOT under
  `supabase/migrations/`. If a prompt spec specifies
  `supabase/migrations/[name].sql`, override to repo root
  before writing the file. The §10 grep check (`ls *.sql`)
  and R21 apply. (ADMIN.57 F1 re-confirmation)

□ Any change to `NotificationPanel.tsx` that adds a new
  notification type to exclude from the rendered list and/or
  badge: add the exclusion to the `visibleNotifications`
  derived constant — not to a separate server-computed count
  field. Any server-side count field maintained in parallel
  with client-filtered state will diverge immediately after
  the first optimistic update. The bell badge
  `unreadPersistent` must always be computed from
  `visibleNotifications.filter(n => !n.read_at).length`.
  (ADMIN.53)

□ Any new sub-component section added to `MaintenanceModeSection`
  in `SetupPanel.tsx` (or any equivalent section that upserts
  multiple `app_settings` keys via a shared loop): confirm
  that the action's upsert loop picks up the new key
  generically before writing any new field-specific handling.
  If the loop is already data-driven (iterates an array of
  key/value pairs), adding a new key/value to the array is
  the only server-side change needed. (ADMIN.57 architecture
  confirmation)

□ Any sidebar nav link that should be hidden from a specific
  role for non-flag reasons (e.g., SA already has an
  alternate path): apply the exclusion by filtering the
  resolved hrefs array after `resolveGroupHrefs()` runs and
  before `getGroupItems()` is called. Do NOT modify
  `GROUP_HREF_DEFAULTS` or `SETTINGS_HREFS` — the href must
  remain in defaults for `resolveGroupHrefs()` self-healing
  to work. Do NOT add to `FLAG_GATED_HREFS` — this is not
  a feature-flag exclusion. (ADMIN.55)

□ Any new component or page that renders `org.org_logo_url`
  from `app_settings`: use a plain `<img>` tag — never
  `next/image`. The org logo can be any external URL (Setup
  Panel URL-paste mode). `next/image` requires every possible
  external hostname in `next.config.ts remotePatterns`, which
  is not viable across OpenCall OS deployments. Add the
  required `eslint-disable-next-line @next/next/no-img-element`
  suppression comment with an explanation. See §14 for the
  exact pattern. (ADMIN.65-FIX)

□ Any extension or modification of `saveLogoUrl()` or
  `saveFaviconUrl()` in `lib/actions/setup.ts`: confirm the
  full required `revalidatePath()` call set is present:
  `saveLogoUrl()` requires four calls (/, / layout,
  /crew layout, /crew/settings/setup); `saveFaviconUrl()`
  requires three calls (/, / layout, /crew/settings/setup).
  Page-scope revalidation alone does not invalidate
  `generateMetadata()` in the root layout or the crew app
  layout's Sidebar logo fetch. (ADMIN.65-FIX)

□ Any new calendar widget embedded in a non-calendar page:
  use the `HomeCalendarWidget` pattern — `useState` month
  navigation, no URL params, no `next/link` for month changes.
  Month changes call a server action (`getAdminClient()` only
  — public route). Initial events fetched server-side and
  passed as props. The data fetch in the parent Server
  Component must be gated on `flags.calendar` (or the
  relevant feature flag). See §14 for the full constraint list.
  (UPSTYLE.6A/6B)

□ Any event pill in a calendar grid widget (public-facing):
  use `line-clamp-2` instead of `truncate`. Owner requirement:
  event titles must be fully visible, not truncated to a
  single line. `line-clamp-2` allows wrapping to two lines
  before ellipsis. The day cell must not have `overflow-hidden`
  or a constraining `max-height` — cells should grow to fit
  wrapped content. (UPSTYLE.6A/6B — `HomeCalendarWidget`)
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
PRE-PHASE-17 RESOLVED:
  033_audition_schema_fixes.sql written and applied —
  DB-VERIFY.5 (commit 0ed3b5d). All 5 inline schema
  fixes from Phase AUDITIONS now captured in committed
  migration file. Migration/DB drift cleared.
Phase INVENTORY — Inventory Management System (in progress)
  DB-VERIFY.5 / 033 ✓ Migration 033 written and applied.
    7 pre-migration + 5 post-migration verification
    queries confirmed. All 5 inline Phase AUDITIONS fixes
    now in committed migration file. 1 file. Commit 0ed3b5d.
  ADMIN.43 ✓ proxy.ts: !pathname.startsWith('/crew/
    auditions') added to Production allowlist (line 135).
    Exception was documented in Brief as applied in
    AUDITIONS.2a but the commit was never made.
    Discovered INVENTORY.A audit F1. 1 file. Commit
    b022423.
  INVENTORY.A ✓ Read-only audit (9 targets). Key findings:
    inventory_manager absent from admin_users (confirmed);
    feature-flags.ts 5 flags, 3 insertion points; proxy.ts
    matcher unchanged (/crew/:path* covers inventory),
    needsFlagCheck + flag block insertion points; Sidebar.tsx
    NAV_ITEMS / FLAG_GATED_HREFS / Production allowlist
    (no entry for inventory) + HelpTooltip hardcoded
    ternary at line 140 requires lookup map generalization;
    saveFeatureFlags() full 5-part pattern required;
    setup/page.tsx SETUP_KEYS + initialValues; HelpContent
    .tsx 15 live sections, Inventory appends after last.
    F1: proxy.ts missing /crew/auditions Production
    exception → ADMIN.43. F2: Brief HelpContent order
    claim inaccurate → DOC batch.
  ADMIN.44 ✓ Two files. setup/page.tsx: ?? → || for 5
    pre-existing feature flag initialValues entries
    (feature_rehearsals + feature_auditions seeded with
    '' — '' ?? 'true' evaluates to '' not 'true', toggles
    rendered OFF, saving would have disabled both features).
    feature_inventory already correct. lib/actions/
    auditions.ts: stale comment above getUpcomingAuditions()
    corrected (false "same pattern as syncAuditionToCalendar"
    claim + false "cannot use getFeatureFlags()" claim both
    removed). 2 files. Commit b654083.
  INVENTORY.1 ✓ Migration 034 applied (inventory_manager
    on admin_users + DB CHECK constraint + 8 inventory
    tables + feature_inventory seed). lib/feature-flags.ts:
    inventory flag (6th). proxy.ts: needsFlagCheck +
    flag block for /crew/inventory (no Production exception,
    no matcher change). Sidebar.tsx: 4-part atomic edit —
    Package icon, NAV_ITEMS, FLAG_GATED_HREFS,
    TOOLTIP_ANCHOR_MAP lookup map (replaces hardcoded ||
    ternary; covers rehearsals + auditions + inventory).
    lib/actions/setup.ts: saveFeatureFlags() full 5-part
    update. SetupPanel.tsx: type + 6th toggle. setup/
    page.tsx: SETUP_KEYS + initialValues (|| per R18).
    lib/actions/users.ts: toggleInventoryManager() (mirrors
    toggleCalendarEditor(); app-layer role = 'editor' guard).
    lib/audit.ts: user.inventory_manager_change added
    (Brief originally said types/audit.ts — corrected
    DOC.66; no types/audit.ts file exists). AdminUser
    type in types/admin.ts + getAdminUser() SELECT in
    lib/auth.ts both extended to include inventory_manager
    (unplanned — without these, all canWrite checks
    silently returned undefined).
    UsersTable.tsx: inventory_manager toggle on editor rows.
    settings/users/page.tsx: query updated to fetch
    inventory_manager (unplanned, required). app/crew/
    (app)/inventory/page.tsx: stub (session + flag + role
    guards). HelpContent.tsx: 16th ALL_SECTIONS entry
    (Inventory, no Production). 13 files. Commit c367288.
  INVENTORY.2 ✓ types/inventory.ts (new — InventoryCategory,
    InventoryLocation, InventoryItem, InventoryItemWithStatus,
    CreateItemData, UpdateItemData). lib/audit.ts: 10 types
    added (inventory_category.*/inventory_location.*/
    inventory_item.create/update). lib/actions/inventory-
    settings.ts (new — getInventoryCategories,
    getInventoryLocations, create/update/reorder/toggle for
    both). lib/actions/inventory.ts (new — generateItemNumber
    internal, getInventoryItems, getInventoryItemById,
    createInventoryItem, updateInventoryItem).
    app/crew/(app)/settings/inventory/page.tsx (new).
    components/crew/settings/InventorySettingsClient.tsx (new).
    app/crew/(app)/settings/page.tsx: Inventory card added.
    app/crew/(app)/inventory/page.tsx: stub → real list page.
    components/crew/inventory/InventoryListClient.tsx (new —
    filters, table, CreateItemModal). 9 files + 2 unplanned
    (types/admin.ts + lib/auth.ts — inventory_manager missing
    from AdminUser type and getAdminUser() SELECT). Commit 48bc27a.
  INVENTORY.3 ✓ types/inventory.ts: InventoryPhoto + InventoryNote
    added. lib/audit.ts: 7 types (inventory_item.deactivate/
    reactivate/delete, inventory_photo.*, inventory_note.add).
    lib/actions/inventory.ts: 8 new functions (photo upload URL,
    confirm upload, delete photo, reorder photo, add note,
    deactivate/reactivate/delete item); getInventoryItemById
    extended (photos with signed URLs + notes with author names).
    Key finding (F1): storage.objects has zero RLS → all storage
    calls require getAdminClient() regardless of session; dual-
    client pattern established (storage = getAdminClient(), DB
    rows = getServerClient() in same function). app/crew/(app)/
    inventory/[id]/page.tsx (new — Next.js 15 params as Promise,
    notFound(), parallel fetch). InventoryDetailTabs.tsx (new —
    5-tab shell). InventoryPhotoUploader.tsx (new — 6th sanctioned
    XHR file; sequential per-file; FormData body). tsc caught
    formatCT() missing arg before ship. 6 files. Commit bacd937.
  INVENTORY.4 ✓ types/inventory.ts: InventoryCheckout, CheckoutItem,
    CreateCheckoutData added. lib/audit.ts: inventory_checkout.create
    + return. lib/actions/inventory-checkouts.ts (new —
    getCheckoutsForItem, getActiveCheckouts, getSearchableShows,
    getSearchableAdminUsers, createCheckout with double-checkout
    guard, returnCheckout; enrichCheckouts() helper using
    two-fetch-plus-TypeScript-join pattern for dual admin_users FK).
    CheckoutModal.tsx (new — multi-item chips, three-way target
    segmented control, debounced search). InventoryDetailTabs.tsx:
    Checkouts stub replaced. [id]/page.tsx: extended parallel fetch.
    inventory/page.tsx: getActiveCheckouts added. InventoryListClient
    .tsx: ActiveCheckoutsPanel + "Check Out Items" + CheckoutModal.
    react-hooks/set-state-in-effect violation caught pre-ship. 8 files.
    Commit 35ba6cb.
  INVENTORY.5 ✓ InventoryTagsPDF.tsx (new — @react-pdf/renderer;
    createStyles() factory THEME.4 compliant; 2-column grid; PNG QR
    via data:image/png;base64). app/api/inventory/tags/route.tsx (new
    — .tsx not .ts: JSX embedded directly; auth+flag+Production guards;
    max 50 items; Array.isArray normalization; brand_primary from
    app_settings via getAdminClient(); lightenHex(); fixed filename
    "inventory-tags.pdf"). [id]/page.tsx: generateQR() server-side,
    props to tabs. InventoryDetailTabs.tsx: QR tab (white-container SVG,
    PNG/SVG downloads, Print Tag link) + 2 HelpTooltips (inventory-
    checkout, inventory-tags). InventoryListClient.tsx: Print Tags
    wired (window.open, count display). HelpContent.tsx: Inventory
    section full content (written in live file convention not prompt
    markup — F3). jsx-a11y/alt-text caught pre-ship. Phase INVENTORY
    complete. 6 files. Commit 7f57805.
Phase INVENTORY — Inventory Management System ✓ Complete (INVENTORY.A–5)
Phase FORUMS — Internal Discussion Forums ✓ Complete
  FORUMS.A ✓ Read-only audit (10 targets). Key findings: proxy.ts
    187 lines — no matcher change needed (/crew/:path* covers
    forums), needsFlagCheck after line 53, Production allowlist
    between lines 136-137, crew flag block after line 172.
    Sidebar 201 lines — MessageSquare icon not yet imported,
    4 atomic locations. HelpContent 1460 lines — 16 live
    sections, Forums 17th, roles MUST include 'production'.
    F3: Email Templates editors use StarterKit+MergeTagExtension
    only (not Link+Underline). F4: settings card must use
    canAccessAdminSettings gate.
  FORUMS.1 ✓ Migration 035 applied (12 forum tables + feature_
    forums seed). 5-file flag pattern. proxy.ts 3 edits
    (needsFlagCheck, Production allowlist, crew flag block —
    no matcher change, no public block). Sidebar 5-part atomic
    edit (MessageSquare icon + NAV_ITEMS + FLAG_GATED_HREFS +
    Production allowlist + TOOLTIP_ANCHOR_MAP). HelpContent
    17th section stub (roles include 'production'). types/
    forums.ts. lib/audit.ts 5 forum_group.* AuditAction types.
    lib/actions/forum-groups.ts (8 actions). settings/groups
    page + ForumGroupsClient.tsx. User Groups Settings hub
    card (canAccessAdminSettings gate — F4 fix). Forums stub
    page. 15 files. Commit dde841d.
  FORUMS.2 ✓ 19 new AuditAction types. types/forums.ts stubs
    → full types + 6 new = 10 total (94 lines). lib/actions/
    forum-admin.ts (21 functions: getForumManageData with
    FK-hint parallel fetch + Array.isArray norm, category
    CRUD×4, forum CRUD×7, access grants×2, moderators×2,
    search×1, thread prefixes×4). Manage page + ForumManage
    Client.tsx (3 sub-panels per forum). Q2: 'user'→'individual'
    mapping at call site. Q3: adminUsers prop unused (server-
    side search). 5 files. Commit c1c7328.
  FORUMS.3 ✓ 4 new types (133 lines, 14 total). lib/data/
    forums.ts (new — NO 'use server'; supabase as param;
    TypeScript-join access control for 3-way OR; getAccessible
    ForumIds, canAccessForum, isForumModerator, getForumIndex
    Data, getThreadListData). lib/actions/forums.ts (getForum
    Index, getThreadList, markThreadRead batch upsert,
    markAllForumRead). Real forum index. ForumIndexClient.tsx.
    /crew/forums/[forumId]/page.tsx. ThreadListClient.tsx.
    Q2: archived forums excluded from index for all roles
    (is_archived=false unconditional — correct). First-pass
    clean (no pre-commit fixes). 7 files. Commit 5c95810.
  FORUMS.4 ✓ 3 new types (185 lines, 17 total). lib/audit.ts:
    forum_post.create + forum_post_attachment.upload. lib/
    actions/forum-posts.ts (FORUM_POST_SANITIZE_OPTIONS
    exported; getThreadWithPosts — parallel fetch + single-
    batch signed URLs; getPostAttachmentUploadUrl; createForum
    Post — temp-key move; toggleThreadSubscription). Thread
    view page (forumId URL mismatch → notFound; markThreadRead
    on load). ThreadViewClient.tsx (breadcrumbs, subscribe
    toggle, sanitized HTML, attachments, locked notice, composer
    slot). ForumPostComposer.tsx (7th sanctioned XHR file;
    uploadWithProgress() pattern from InventoryPhotoUploader;
    11-button toolbar). Q1: mimeType given input validation
    job. Q2: forumId prop unused (removed FORUMS.5). 6 files.
    Commit b21b3a4.
  FORUMS.5 ✓ lib/audit.ts 8 new types (forum_thread.create/
    lock/unlock/pin/unpin/move, forum_post.edit/delete).
    lib/actions/forum-moderation.ts (new — 8 actions: create
    Thread, lock/unlock, pin/unpin, moveThread SA/OA only,
    editPost, deletePost idempotent soft delete; private
    isModeratableBy()). lib/email.ts: sendForumNotification
    Email() (sendBatchEmails() per R8 — Q2 self-correction;
    resolveEmailSettings(); escapeHtml() on user strings;
    logEmailSent() after send; sentBy: null; getAdminClient()).
    Non-blocking void IIFE call site in createForumPost().
    getForumsForMove() in forum-admin.ts. ThreadListClient.tsx:
    New Thread modal with shadcn Dialog + inline TipTap (no
    file attachments on thread creation). ThreadViewClient.tsx:
    per-post edit (shared editor, async setContent() in click
    handler) + delete + moderation bar (lock/pin/move). Forum
    PostComposer.tsx: forumId dead prop removed. HelpContent.tsx:
    full 4-subsection Forums section (forums-overview/threads
    visible all roles; forums-access/moderation SA/OA only).
    Key fixes: Q1 — buildEmailHtml() real signature read before
    writing (pseudocode assumed wrong params); Q2 — per-subscriber
    loop corrected to sendBatchEmails(); Q3 — Editor|null explicit
    typing required (useEditor overload resolves wrong). 9 files
    (1 new, 8 modified). Commit e41f66f. Phase FORUMS complete.
Phase FORUMS — Internal Discussion Forums ✓ Complete (FORUMS.A–FORUMS.5)

Phase STYLE — Style Sandbox & Design Token Extension
  ✓ Complete (STYLE.A–STYLE.8, 9 prompts)
  STYLE.A ✓ Token extension — darkenHex(), 3 new derived
           CSS custom properties, 2 new @theme neutral
           tokens, @layer utilities classes. 3 files.
           Commit 8cf6144.
  STYLE.1 ✓ Style Sandbox shell + primitive gallery —
           proxy.ts guard, hub card, style/page.tsx shell,
           StyleSandbox.tsx (8-group gallery + placeholder).
           4 files. Commit aea0090.
  STYLE.2 ✓ Dashboard mockup — 6 sections, stat tile
           top accent, activity feed NEW badge. 2 files.
           Commit 67d594e.
  STYLE.3 ✓ Calendar mockup — 35-cell Oct 2025 grid,
           location color constants + inline styles,
           static day detail panel. 2 files. Commit 5a29b48.
  STYLE.4 ✓ Rehearsals + Auditions list mockups. Named
           export badge pattern established (F1). 3 files.
           Commit 4b2bd69.
  STYLE.5 ✓ Inventory + Volunteers list mockups —
           bg-neutral-surface ID pills, 8-column dense
           table, overflow-x-auto. 3 files. Commit ae5f455.
  STYLE.6 ✓ Forums + Shows mockups — left accent pattern,
           season accordion, hardcoded progress bars.
           3 files. Commit db3c980.
  STYLE.7 ✓ Opportunities, Forms, QR Generator, Check-In
           mockups — 100-cell explicit QR grid, animate-
           pulse live indicator. 5 files. Commit 19f9714.
  STYLE.8 ✓ Communication, Media Library, Setup Panel
           mockups — two-panel layout, section card
           pattern, brand-accent Send button. 4 files.
           Commit 2eb1f1c.

Phase NOTIFY — Notification System ✓ Complete
  NOTIFY.A  ✓ Read-only audit (no code). Confirmed:
              reviewed_at already present on consent_form_
              submissions (no schema change needed); TopBar
              is 'use client'; layout.tsx is Server Component;
              Sidebar.tsx 206 lines — TOOLTIP_ANCHOR_MAP at
              lines 57–62, HelpTooltip render block at lines
              159–170; Platform Setup card in settings/page.tsx
              lines 237–248; confirmAuditionMaterialUpload()
              missing audition_id in select; approveBatch()
              not tracking approved event IDs.
  NOTIFY.1  ✓ Migration 036 (notifications table: 6 columns,
              2 self-scoped RLS policies, 3 indexes incl.
              partial unread index). types/notifications.ts
              (new — 4 types). Sidebar.tsx: Users link removed,
              HelpTooltip render block removed, TOOLTIP_ANCHOR_
              MAP render removed (const retained for cleanup),
              Platform Setup SA-only link added above ThemeToggle,
              pendingRegistrationCount prop removed. settings/
              page.tsx: Platform Setup LinkedCard/LockedCard
              removed. layout.tsx: pendingRegistrationCount
              fetch + prop removed. NOTIFY.1-FIX (commit
              c7e8000): HelpTooltip comment fix. Commits
              26b2add + c7e8000.
  NOTIFY.2  ✓ lib/utils/notifications.ts (new — no 'use server';
              createNotification() helper accepting supabase
              client as param; never throws).
              lib/data/notifications.ts (new — no 'use server';
              getForumUnreadCount, getNotificationCounts,
              getUserNotifications — all role-scoped, parallel
              Promise.all). lib/actions/notifications.ts (new —
              'use server'; 4 exported actions).
              layout.tsx extended: notification fetches in
              Promise.all; forumUnreadCount → Sidebar; notification
              Counts + initialNotifications → TopBar.
              Sidebar.tsx: forumUnreadCount prop + Forums badge.
              TopBar.tsx: props extended (no JSX yet). Commit
              6e363d3.
  NOTIFY.3  ✓ lib/data/notifications.ts: getForumUnreadCount()
              fixed to filter is_archived = false via forum_threads
              join (archived forum posts excluded from badge count).
              lib/email.ts: sendForumNotificationEmail() refactored
              → Promise<{ notifiedUserIds: string[] }> (all return
              paths updated; early-return-with-no-emails path
              initially returned [] — corrected NOTIFY.3-FIX in
              NOTIFY.4). lib/actions/forum-posts.ts: thread select
              extended with title; void IIFE extended with
              createNotification() per subscriber.
              lib/actions/auditions.ts: submitAuditionSignup() void
              IIFE added (two-path recipient: audition_assignments
              + show_editors.admin_id); confirmAuditionMaterial
              Upload() select extended with audition_id + void
              IIFE added. lib/actions/calendar.ts: resolveCalendar
              Recipients() private (unexported) helper added
              (handles batch via rehearsal_schedule_assignments,
              show-linked via show_dates → show_editors.admin_id,
              audition-linked via audition_assignments +
              auditions.show_id → show_editors); five write points
              wired (7 total call sites — cancelRecurringOccurrence
              three branches each call independently).
              lib/actions/consent.ts: revalidatePath('/crew', 'layout')
              added to confirmConsentSubmission(). Commit 80c7021.
  NOTIFY.4  ✓ NOTIFY.3-FIX bundled: lib/email.ts early-return
              path corrected (returns { notifiedUserIds } populated,
              not []). components/crew/NotificationPanel.tsx (new —
              'use client'; bell + badge; outside-click useEffect +
              useRef; two-section dropdown; optimistic mark-read
              via startTransition; mark-all-read; timeAgo() pure
              client-safe helper; getTypeIcon() helper; unread
              bg-neutral-surface dark:bg-dark-nav — R35-safe;
              React 19.2.4 native async-startTransition confirmed).
              TopBar.tsx: NotificationPanel first child of right-
              side div. Commit 7ea1f19.
  NOTIFY.4-CLEANUP ✓ Lint baseline restored (0 errors, 0 warnings).
              Sidebar.tsx: TOOLTIP_ANCHOR_MAP const + comment
              removed (6 lines). layout.tsx: unused import type
              { NotificationCounts, NotificationRow } removed.
              NotificationPanel.tsx: three dynamic pluralization
              ternaries replace "(s)" literals. Commit 5e7656f.

Phase MESSAGES — Private Messaging System ✓ Complete
  MESSAGES.A ✓ Read-only audit (13 tasks: proxy.ts, crew layout, TopBar,
    Sidebar, lib/feature-flags.ts, SetupPanel.tsx, setup/page.tsx,
    lib/actions/setup.ts, lib/email.ts, notifications CHECK constraint name
    confirmed (`notifications_type_check`, 6 types), lib/data/notifications.ts,
    lib/utils/notifications.ts, 4 context placement files (ThreadViewClient.tsx,
    RehearsalDetailTabs.tsx, AuditionDetailTabs.tsx, UsersTable.tsx)). Key
    findings: createNotification() param order = (adminUserId, type, title, href,
    body, supabase) — body before supabase, both required positional; SetupPanel
    uses fd.append() not hidden inputs (R13.3a); logEmailSent() uses volunteerId:
    null for admin recipients (no schema change needed); thread_reads SELECT policy
    intentionally asymmetric (both participants); stale openingprompt note absent
    from Brief (already removed — Edit 0 not needed). No code. No commit.
  MESSAGES.1 ✓ Migration 037: 4 new tables (message_threads, thread_replies,
    thread_reads, thread_reply_attachments) with RLS on all four; direct_message
    added to notifications_type_check (ALTER DROP/ADD CONSTRAINT, 6→7 values);
    feature_messages seeded 'false'. Policy naming adapted from prompt draft to
    live Migration 036 convention — unquoted snake_case + table prefix + TO
    authenticated + WITH CHECK mirrors USING on UPDATE policies (now R39).
    1 file. Commit 8a86d10.
  MESSAGES.2 ✓ types/messages.ts (7 types). lib/data/messages.ts (import
    'server-only', no 'use server', supabase as first param, all try/catch,
    6 exported functions + stripHtmlForPreview() internal). lib/actions/messages.ts
    ('use server', 5 exported async functions: createThread, createReply,
    markThreadRead, archiveThread, searchUsers). sendDirectMessageEmail() appended
    to lib/email.ts. Self-caught cascades: 'direct_message' added to NotificationType
    union (required for createNotification() calls to compile — MESSAGES.2 self-
    catch); messageUnread added to EMPTY_COUNTS literal in lib/actions/notifications.ts
    (NotificationCounts cascade — now documented §7/§11); 'direct_message' case
    added to exhaustive switch in NotificationPanel.tsx (Mail icon — TypeScript
    exhaustiveness enforcement). 3 new files, 7 modified. Commit 72deeae.
  MESSAGES.3 ✓ Feature flag 5-file pattern complete + proxy.ts + TopBar + Sidebar.
    MessagesIcon.tsx (new — 'use client', Mail icon, unread badge, /crew/messages
    link, conditional on flags.messages). lib/feature-flags.ts: messages: boolean
    (8th flag). SetupPanel.tsx: type widening, messagesEnabled state, Private
    Messaging ToggleRow, fd.append() call in handleSave() — NOT a hidden input
    (R13.3a; confirmed §7 pattern). setup/page.tsx: 'feature_messages' in
    SETUP_KEYS, fallback || 'false'. setup.ts: saveFeatureFlags() extended
    (+2 revalidatePaths). proxy.ts: /crew/messages + /crew/users in needsFlagCheck
    + 2 guard blocks (no matcher change — /crew/:path* already covers all
    /crew/* routes). TopBar: messagesEnabled prop, MessagesIcon before
    NotificationPanel. Sidebar: two three-part atomic edits (Messages: Inbox icon,
    NAV_ITEMS, FLAG_GATED_HREFS, allowlist, badge; Directory: UserSearch icon,
    NAV_ITEMS, FLAG_GATED_HREFS, allowlist); messagesUnreadCount?: number in
    interface AND messagesUnreadCount = 0 in destructuring (F3 — now §7 pattern).
    layout.tsx: messagesEnabled={flags.messages} on TopBar, messagesUnreadCount
    on Sidebar. 1 new file, 8 modified. Commit 924f6e5.
  MESSAGES.4 ✓ app/crew/(app)/users/page.tsx (new Server Component — auth +
    flags.messages guard; getUsersForDirectory(); self-exclusion filter; initials
    avatar; Message link per user). app/crew/(app)/messages/page.tsx (new Server
    Component — three-tab URL-driven inbox via searchParams; activeTab validation;
    three-way fetch; TABS const-asserted; unread dot always rendered bg-brand-
    primary/bg-transparent; archive form sibling to Link inside <li>; archive
    Thread.bind(null, id) per-thread; empty states all three tabs; formatCT 2 args).
    Style Sandbox text tokens (text-gray-900/text-gray-500) are sandbox-only —
    confirmed mismatch vs. live production system (text-dark/text-mid-gray); live
    convention used in new pages (F1 — now §7 pattern). archiveThread.bind()
    required as unknown as (formData: FormData) => Promise<void> double type
    assertion (F2 — now R40). 2 new files. Commit 4dea6cf.
  MESSAGES.5 ✓ sanitize-at-write-time added to lib/actions/messages.ts
    (DM_SANITIZE_OPTIONS constant; both createThread() and createReply()
    sanitize body before thread_replies insert). compose/page.tsx (new —
    Server Component; auth + flags.messages; ?to= param with self/inactive-
    exclusion; renders ComposeForm). ComposeForm.tsx (new — useRef<Direct
    MessageComposerHandle> post-MESSAGES.6 refactor; initially had inline
    TipTap; recipient search + 300ms debounce; subject input maxLength 150;
    createThread() submit; router.push() to new thread — correct per R12
    clarification). [threadId]/page.tsx (new — Server Component; notFound()
    on null). ThreadView.tsx (new — 'use client'; two separate useEffects:
    void markThreadRead on mount + setInterval 15s polling with clearInterval
    cleanup; showReadReceipt computed outside JSX map; arbitrary CSS variant
    selectors for TipTap HTML — @tailwindcss/typography not installed).
    ReplyComposer.tsx (new — useRef<DirectMessageComposerHandle> post-refactor).
    5 new files, 1 modified (lib/actions/messages.ts — sanitize).
    Commit f99d8cc.
  MESSAGES.6 ✓ File attachments pipeline. types/messages.ts extended
    (AttachmentInput 4 fields; ThreadReplyAttachmentWithUrl 6 fields;
    ThreadReplyWithDetails.attachments added). lib/data/messages.ts extended
    (getThreadData: thread_reply_attachments fetched + signed download URLs
    via getAdminClient().storage.createSignedUrl, TTL 3600, non-fatal try/catch).
    lib/actions/messages.ts extended (optional attachments?: AttachmentInput[]
    on createThread/createReply; loop: storage.list() → move() → insert per
    attachment; per-iteration try/catch + continue). app/api/messages/upload/
    route.ts (new — GET handler; auth + flags.messages guard via getServerClient();
    10MB size guard; createSignedUploadUrl via getAdminClient(); returns
    { signedUrl, path, tempKey }). DirectMessageComposer.tsx (new — 8th
    sanctioned XHR file; forwardRef + useImperativeHandle; DirectMessage
    ComposerHandle ref type exports getBody/getAttachments/clear/isEmpty;
    formData.append('', file) 2-arg pattern confirmed from live reference).
    ComposeForm.tsx + ReplyComposer.tsx: both refactored off inline TipTap onto
    composerRef — all TipTap/useEditor imports removed from both parents.
    ThreadView.tsx: attachment display (Paperclip icon, signed URL links, KB).
    Prompt authoring errors caught pre-build (malformed reduce generic, missing
    <a tag in JSX spec) — both fixed before writing code. 2 new files, 6
    modified. Commit 178698f.
  MESSAGES.7 ✓ Context placements + minor fixes. Forum: ThreadViewClient.tsx
    — Message link after author block (text-xs, size 12); guard includes
    messagesEnabled && !post.is_deleted && post.author_id !== data.adminId;
    parent thread page passes messagesEnabled={flags.messages}. Rehearsal:
    adminId threaded RehearsalDetailTabs → RosterTab (was completely absent from
    RosterTab before this build). Audition + ShowDetail: pre-existing latent dead
    prop fixed in both (adminId: string declared in type but never destructured
    — silently dropped despite parent pages passing it correctly — now fixed);
    both adminId + messagesEnabled threaded into SettingsTab at both its call
    site and inline type. ShowDetail uses editor.admin_id (standing schema rule).
    shows/[id]/page.tsx: only parent page lacking getFeatureFlags — import +
    fetch added. UsersTable: messagesEnabled added; UserRow guards with !isSelf
    (existing computed boolean — not a fresh comparison). settings/users/page.tsx:
    getFeatureFlags import + fetch added. Minor fixes: feature_messages added to
    saveFeatureFlags() logAction() before/after diff (B1); year-aware formatCT
    on thread list (B2); unused contentType variable removed from upload route
    (B3 — MESSAGES.6 Q1); myLastReadAt removed from ThreadViewProps + page prop
    pass (B4/B5 — MESSAGES.5 Q2). Phase MESSAGES ✓ Complete (MESSAGES.A–7).
    0 new files, 15 modified. Commit b0ed62b.

ADMIN.45 ✓ — Dead Prop Systematic Audit & Fix. Audited ~30 component
signatures across 10 target files. Two dead props fixed: `defaultHours` in
`ShowDetail.tsx` and `adminRole` in `InventoryDetailTabs.tsx` (both declared in
type annotation, never destructured — ESLint suppression added). All other 8 files
PASS. Discovered pre-existing lint baseline breach (F1): 6 errors + 1 warning in
`ComposeForm.tsx`, `ReplyComposer.tsx`, `DirectMessageComposer.tsx`
(react-hooks/refs violations). Commit: 671a6d4.

ADMIN.46 ✓ — Q1 Implementation + F1 Lint Baseline Restoration.
`ShowDetail.tsx` Settings tab: "Default Hours per Volunteer" read-only field added
(`show.default_hours ?? defaultHours[getLocationHoursBucket(show.location?.name)]`,
fallback "—"). F1 resolved: `DirectMessageComposer.tsx` gained `onEmptyChange?`
callback prop (TipTap `onCreate`/`onUpdate`); `ComposeForm.tsx` + `ReplyComposer.tsx`
replaced stale `composerRef.current` reads in JSX with `isComposerEmpty` state;
unused `_unused` var removed. Lesson: refs are not reactive — reading them in
`disabled={}` JSX expressions produces stale values. 4 files. Commit: 796af84.

Phase TZ — Configurable Organization Timezone ✓ Complete
  TZ.A ✓ Read-only audit. 7 grep passes + 12 targeted file reads across entire
    codebase. Complete classification table: ~2 TZ.1, ~11 TZ.2, ~30 TZ.4, ~47 TZ.5
    NEEDS_CHANGE files. Six unexpected findings (C5#1–C5#6): C5#1 inventory overdue
    UTC date bug; C5#2 resolveOrgIdentity() cannot reach Server Component pages in
    Next.js layout (each page must call getOrgTimezone() independently); C5#3 nine
    calendar Client Components with their own local `const CT` bypassing lib/utils/date.ts;
    C5#4 partial exemptions in calendar-availability.ts (getAvailableWindows) and
    calendar-layout.ts (computeEventPosition); C5#5 messages/page.tsx year-boundary bug;
    C5#6 auditions.ts inline literal inconsistency. No code. No commit.

  TZ.1 ✓ Foundation. Migration 038 (org_timezone seeded 'America/Chicago').
    `lib/utils/org-timezone.ts` (new — NO 'use server'; TIMEZONE_OPTIONS ~69 IANA
    entries worldwide + getOrgTimezone(supabase) helper). `lib/utils/date.ts`: optional
    `timezone?: string` last parameter added to `formatCT()` and `formatWallClockCT()`;
    module-level `const CT` removed. `app/layout.tsx`: `resolveBrandColors()` renamed to
    `resolveLayoutSettings()`, extended to fetch org_timezone, `data-timezone={brand.timezone}`
    added to `<body>` (first server-rendered `data-*` attribute). Setup Panel Section 1:
    org_timezone select field + fd.append() + saveOrgIdentity() extended + SETUP_KEYS
    23→24. Commit: ce19f45.

  TZ.2 ✓ Server-side business logic sweep (12 files, absorbed former TZ.3).
    All `const CT` + `fromZonedTime()`/`formatInTimeZone()` call sites in server
    actions and route handlers replaced with `getOrgTimezone(supabase)`. Key complexity:
    `calendar.ts` — `buildEventTimes()` private helper gained `timezone` parameter,
    threaded through 9 call sites in 7 exported functions, 3 callers required
    client-before-usage reordering. C5#1 inventory overdue bug fixed in `inventory.ts`
    + `inventory-checkouts.ts` (replaced `new Date().toISOString().split('T')[0]` with
    `formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')`). `lib/utils/ical.ts` confirmed
    entirely EXEMPT (UTC Z-suffix instants — no timezone coupling at all). Stale CDT
    comment in audit-log page removed. Commit: c166112.

  TZ.4a ✓ Display layer: Server Component pages (15 files + 1 companion).
    All `formatCT()`/`formatWallClockCT()` call sites pass `tz` as final argument.
    Nested components received `timezone: string` prop (SeasonAtAGlance, QRHistoryPanel
    + qr-generator/page.tsx companion, CallHistoryTable, PostShowReport with optional
    prop + default pending TZ.5a). C5#5 year-boundary bug fixed in messages/page.tsx
    (both sides of year comparison use `getYear(toZonedTime(..., tz))`). Same-file
    helpers (ShowCard/callboard, dateRangeLabel+UpcomingAuditionsCard/shows) received
    timezone threading. audit-log/page.tsx: PASS (TZ.2 was its only CT usage).
    email-activity/page.tsx: hoisted outer `let tz` due to block-scoped client.
    Commit: bfae0f6.

  TZ.4b ✓ Display layer: Server actions + lib/ (13 files).
    `resolveEmailSettings()` extended: fetches `org_timezone`, returns `timezone: string`
    (zero additional DB cost — extends existing query). All affected send functions
    destructure and pass `timezone` into format calls. `lib/data/checkin.ts`
    `getCheckInDashboardData()` gained required `timezone` parameter + companion edit to
    `tools/checkin/page.tsx`. `lib/utils/csv.ts` `buildVolunteersCsv()` + `csvExportFilename()`
    gained optional `timezone: string = 'America/Chicago'` (Client Component callers
    deferred to TZ.5a). `lib/volunteers/VolunteerListPDF.tsx`: `timezone` prop added;
    `export/route.tsx` fetches `org_timezone` and passes `timezone={tz}` prop. Cron
    routes: trivial (tz already resolved from TZ.2). `lib/actions/checkin.ts` (PUBLIC
    ROUTE): 2 of 3 functions needed client-before-usage reordering. Commit: cff97ab.

  TZ.5a-AUDIT ✓ Pre-TZ.5b verification grep (no code). Zero missed
    fixes confirmed across all prior TZ sweeps. 67 total grep hits: 55 CORRECT
    SURVIVORS (SSR-guard fallback reads, function default parameters, server-side
    fallbacks), 12 TZ.5b TARGET hits, 0 MISSED FIX. Key finding: `components/
    calendar/PublicCalendarGrid.tsx` is a 10th calendar Client Component with
    `const CT` (not in TZ.A's C5#3 count of 9 — lives in `components/calendar/`
    not `components/crew/calendar/`). Owner confirmed in scope for TZ.5b. No
    commit.

  TZ.5a ✓ Client Component display layer sweep (40 files, commit c83b5ae).
    All `formatCT()`/`formatWallClockCT()` Client Component call sites pass `tz`
    from `document.body.dataset.timezone` (SSR-guarded). Three deferred carry-
    forwards wired: `ShowDetail.tsx`→`PostShowReport` `timezone` prop; `ExportAllButton
    .tsx`/`VolunteersTable.tsx`→`buildVolunteersCsv()`/`csvExportFilename()`. Sub-
    component threading applied in 3 tabbed detail components (2-level threading
    in `RehearsalDetailTabs.tsx` and `InventoryDetailTabs.tsx`). C5#5 year-boundary
    bug fixed (both sides of year comparison use `getYear(toZonedTime(..., tz))`).
    F1: `RehearsalDetailTabs.tsx` `AttendanceSection` — live recurrence of MESSAGES.7
    latent dead prop: `timezone` in type annotation but not destructure; caught by
    `npx tsc --noEmit`. F2: `ShowList.tsx` missed in batch, caught only by
    verification grep (no TypeScript/lint error for missing optional tz arg).

  TZ.5b ✓ Calendar subsystem sweep (12 files, commit e06d1c4). All
    `const CT = 'America/Chicago'` removed from calendar Client Components +
    utility modules. Pattern A: `getAvailableWindows()` and `computeEventPosition()`
    gained `timezone: string` parameter; each has exactly one caller.
    Pattern B: 8 fresh SSR-guarded tz reads. Pattern C: 2 split-state files
    (CalendarDayPanel, PendingQueueClient) removed `const CT`, reused existing
    TZ.5a `tz`. `useNowPosition()` hook gained `timezone` param + `useEffect`
    deps entry. `eventDateLabel()` parameterized (was inconsistent with sibling
    `eventTimeLabel()` from TZ.5a). `PublicCalendarGrid.tsx` included as 10th
    file. Verification grep N4: zero `'America/Chicago'` outside sanctioned
    survivors. Phase TZ fully complete. Zero lint errors, zero tsc errors.

  TZ.6 ✓ Brief v5.9 (DOC.78) + Process v5.7 (DOC.79). This prompt.

Phase MM — Maintenance Mode ✓ Complete
  MM.A ✓ Read-only audit (7 files: proxy.ts, lib/actions/
    setup.ts, components/crew/settings/SetupPanel.tsx,
    app/crew/(app)/settings/setup/page.tsx, app/crew/(app)/
    layout.tsx, components/crew/TopBar.tsx, app/not-found.tsx).
    Key findings: SetupPanel.tsx has 8 independent sub-
    components (not one monolithic component); no literal
    section numeral text in code (planning-doc convention
    only); resolveLayoutSettings() is in root app/layout.tsx,
    not crew app layout; SaveStatus type uses 'saved' not
    'success'; settingsMap is a Map instance (.get() required);
    ActionResult needs 'error' in result narrowing. No code.
    No commit.
  MM.1 ✓ Migration 039 (maintenance_mode, maintenance_heading,
    maintenance_body seeded in app_settings). saveMaintenanceMode()
    added to lib/actions/setup.ts (SA only; revalidates
    '/crew' layout scope). proxy.ts maintenance gate inserted
    before all other checks (before needsFlagCheck): reads
    maintenance_mode via getAdminClient(); if 'true' and
    non-SA, redirects to /crew/maintenance; SA passes through;
    no session → /crew/login. app/crew/maintenance/page.tsx
    created (standalone — NOT in (app) route group; no crew
    shell; getAdminClient() + resolveOrgIdentity(); noindex;
    light mode only). app/crew/(app)/layout.tsx: maintenance_mode
    as 4th Promise.all entry; maintenanceModeActive boolean;
    amber banner sibling div between TopBar and main (SA-only
    visible). getAdminClient import added to layout.
    5 files. Commit: 4196623.
  MM.2 ✓ MaintenanceModeSection sub-component added to
    SetupPanel.tsx as first section. Contains: ToggleRow
    (conditional label "⚠ Maintenance Mode — ON" when active),
    heading input (max 100 chars), body textarea (max 300 chars),
    Save button + SaveFeedback. Uses SaveStatus type and
    setStatus('saved') per live file convention. saveMaintenanceMode
    imported and wired. SetupPanelInitialValues type extended to
    27 fields (was 24). setup/page.tsx SETUP_KEYS extended to 27
    keys; initialValues mapping extended with settingsMap.get()
    and || '' fallbacks per R18. Self-caught fixes before tsc:
    'error' in result for ActionResult narrowing; .get() for
    Map access. 2 files. Commit: 769ecdd. Phase MM complete.

Phase FORUMS-FIX — Forums Thread View Bug Fix ✓ Complete
  FORUMS-FIX.A ✓ — Combined audit-and-fix session. Root
    cause: `markThreadRead()` called directly in Server
    Component render body of the thread view page.tsx
    (line 31). `markThreadRead()` internally calls
    `revalidatePath()`, which Next.js prohibits during
    render — throws runtime error to app/error.tsx.
    Confirmed via static analysis: zero broken data in DB,
    canAccessForum() correctly handles SA, no null arrays.
    Fix: removed call from page.tsx; added
    `useEffect(() => { void markThreadRead(data.thread.id)
    }, [data.thread.id])` to ThreadViewClient.tsx (same
    pattern as messages/ThreadView.tsx). Same fix resolved
    "Create Thread" error (navigated immediately to new
    thread URL = same broken render path). 2 files.
    Commit: 29570e0.
  FORUMS-FIX.B ✓ — Q-item cleanup. (1) getThreadWithPosts()
    signed-URL loop wrapped in per-attachment try/catch —
    returns signed_url: null on failure instead of crashing
    entire thread fetch. (2) app/error.tsx: error prop was
    typed but not destructured; added to destructuring +
    added useEffect console.error. 2 files. Commit: 6b5e230.

Phase FORUMS-UX — Forum Permissions Discoverability ✓ Complete
  FORUMS-UX.1 ✓ — Single targeted fix. Added
    `<span className="text-xs text-mid-gray dark:text-dark-
    muted">Manage Access</span>` before expand chevron in
    ForumManageClient.tsx ForumRow. Inside
    {!editMode && !confirmingDelete && (...)} gate — inherits
    chevron visibility rules. 1 file, 1 line inserted.
    Commit: 1651989.

Phase ANNOUNCE — Dashboard Announcements Widget ✓ Complete
  ANNOUNCE.A ✓ — Read-only audit (9 targets). Key findings:
    layout.tsx cannot pass fetched data to {children} as
    props (Next.js hard constraint — announcement data must
    be fetched in dashboard/page.tsx); pre-existing
    announcement_banner_* keys require dashboard_announcement_*
    prefix for new keys; no toast library installed — inline
    undo banner needed; OA settings page needs new route
    (/crew/settings/dashboard-announcement); AdminUser type
    and getAdminUser() SELECT must both be updated (INVENTORY.1
    lesson). Task A4 correction: saveFeatureFlags() requires
    6 wiring points per new flag (not 4 as documented).
    No code. No commit.
  ANNOUNCE.1 ✓ — Migration 040 + server actions + type
    extensions. Migration 040: adds announcement_dismissed_at
    to admin_users; seeds 4 new app_settings keys. AdminUser
    type (types/admin.ts) + getAdminUser() SELECT (lib/auth.ts)
    both extended. saveAnnouncement() added to lib/actions/
    setup.ts (SA always + OA-when-enabled; R31 sanitization;
    server-side timestamp; roles validation; revalidates
    dashboard). New: lib/data/announcements.ts (no 'use
    server', getActiveAnnouncements()); lib/actions/
    announcements.ts ('use server', dismissAnnouncement() +
    getAnnouncementContent()). announcement.publish added to
    AuditAction. 7 files. Commit: 23d28f3.
  ANNOUNCE.2 ✓ — Full UI. AnnouncementSection.tsx standalone
    'use client' (self-loading via single useEffect([editor]),
    TipTap editor, role checkboxes, Publish button).
    AnnouncementWidget.tsx (Server Component, returns null
    when no active announcements) + AnnouncementWidgetClient.tsx
    ('use client', optimistic dismiss). dashboard/page.tsx:
    widget inserted before QuickStats. SetupPanel.tsx:
    announcements_oa_enabled 9th FeatureFlagsSection toggle
    (6-point wiring — Task A4 correction applied). OA mirror
    page: /crew/settings/dashboard-announcement. Settings hub:
    Dashboard Announcements card. getAnnouncementContent()
    added to lib/actions/announcements.ts as 2nd export.
    Key lesson: saveFeatureFlags() uses batched .upsert([])
    with isValidFlagValue() type-guard — NOT upsertSetting()
    per key — requiring 6 server-side wiring points.
    10 files. Commit: 98a275e. Phase ANNOUNCE complete.

Phase SHOWDELETE — Show Hard Delete ✓ Complete
  SHOWDELETE.A ✓ — Read-only audit (6 targets). Key findings:
    ShowCard is inline in ShowList.tsx (not a separate file);
    updateShowStatus() role guard is broader than canEdit
    (allows production-role show editors — deleteShow() must
    use strict ['super_admin','owner_admin','editor'] allowlist);
    attendance table has NO ACTION FK to shows.id (any show
    with attendance records throws Postgres FK violation on
    DELETE — attendance check is mandatory, not optional);
    slot_claims status has 3 values: claimed/waitlisted/
    cancelled (both claimed and waitlisted block deletion);
    AlertDialog already installed; lib/actions/shows.ts uses
    ShowEditorActionResult (not ActionResult). No code.
    No commit.
  SHOWDELETE.1 ✓ — show.delete added to AuditAction. deleteShow()
    added to lib/actions/shows.ts (strict SA/OA/Editor allowlist;
    3 guards: archived → active claims [two-step query, both
    claimed+waitlisted] → attendance records; logAction() before
    DELETE; returns ShowEditorActionResult). ShowDetail.tsx:
    state + handler (showDeleteConfirm, isDeleting, deleteError,
    handleDelete) defined inside SettingsTab (not root ShowDetail
    — router and show are in scope there); Delete section +
    AlertDialog (state-controlled, no AlertDialogTrigger).
    router.push('/crew/shows') on success. Self-caught: Supabase
    .in() does not support nested subqueries — two-step approach
    required. Self-caught: return type must be ShowEditorActionResult
    not ActionResult. 3 files. Commit: b4824dc.

Phase SHOWARCHIVE — Show Archive ✓ Complete (new phase)
  SHOWARCHIVE.A ✓ — Read-only audit (7 targets). Key findings:
    shows page already fetches ALL shows regardless of status
    — no new tab or separate fetch needed; Archive tab proposal
    was unnecessary; real gaps were (1) missing Archive quick-
    action button on ShowCard and (2) ShowForm.tsx having
    hardcoded "Save & Publish"/"Save as Draft" buttons that
    ignored the Status dropdown. ShowForm.tsx confirmed
    completely different from ShowDetail.tsx — the status
    button bug was in ShowForm.tsx, not ShowDetail.tsx
    (ShowDetail.tsx already had correct Save Status button).
    No toast library — inline undo banner required. No code.
    No commit.
  SHOWARCHIVE.1 ✓ — Three changes in two files:
    (1) ShowForm.tsx: "Save & Publish" + "Save as Draft"
    replaced with single "Save" button reading status
    from dropdown. Past/archived shows guidance message.
    Notification AlertDialog preserved for live status.
    (2) ShowList.tsx: updateShowStatus + Archive icon imports;
    archivingId/archiveError/undoState state + handleArchive()
    + handleUndo() + 5s auto-dismiss useEffect; ShowCard gains
    3 optional props (isArchiving, archiveError, onArchive);
    Archive button gated on canEdit && (draft || live);
    Archived Shows accordion AFTER entire groups conditional
    (not nested inside — nesting hides it when season filter
    returns no results); undo banner above list content.
    router.refresh() required on archive/undo success (self-
    caught — not in original prompt snippets).
    2 files. Commit: 6557260. Phase SHOWARCHIVE complete.

Phase QRBANNER — QR Banner Text ✓ Complete
  QRBANNER.1 ✓ Migration 041 (banner_text nullable text column on
    qr_codes). lib/qr.ts: generateQR(url, bannerText?) extended —
    SVG viewBox extension logic (BANNER_HEIGHT_UNITS = 6),
    white background rect, centered <text> element at
    BANNER_FONT_SIZE = 2.5, escapeXml() private helper (escapes
    & < > " '). PNG generation switched from QRCode.toBuffer()
    to @resvg/resvg-js: new Resvg(svg, { fitTo: { mode: 'width',
    value: 2000 } }).render().asPng(). serverExternalPackages:
    ["@resvg/resvg-js"] added to next.config.ts (napi-rs native
    binary requirement). lib/actions/qr.ts: generateQRCode()
    extended with optional third param bannerText?: string.
    lib/data/qr.ts: banner_text added to QRHistoryEntry type +
    SELECT query. QRGeneratorForm.tsx: banner toggle checkbox +
    text input field (shown when toggle on). QRHistoryPanel.tsx:
    conditional banner_text display in history entries.
    5 files modified. Commit 9f5f341.

Phase QRANALYTICS — QR Scan Analytics ✓ Complete
  QRANALYTICS.A ✓ Read-only audit. Architectural decisions locked:
    proxy.ts requires no changes for /go/[token] (route handlers
    execute regardless of matcher); redirect_token is app-generated
    via crypto.randomUUID() before generateQR() (not DB-defaulted);
    user-agent parsing is manual regex (Edge before Chrome, tablet
    before mobile, fallback 'desktop'/'Other'); scan event inserts
    are best-effort (try/catch swallow); app/documents/[token]/
    route.ts is the structural template for the new route handler.
    No code. No commit.
  QRANALYTICS.1 ✓ Migration 042: redirect_token uuid NOT NULL on
    qr_codes; target_url text NOT NULL on qr_codes; qr_scan_events
    table (id, qr_code_id FK, scanned_at timestamptz, ip_address,
    user_agent, device_type, browser, referer) + index on qr_code_id.
    app/go/[token]/route.ts (new — PUBLIC ROUTE, getAdminClient()
    only, no feature flag gate, parseUserAgent() local helper,
    best-effort qr_scan_events insert wrapped in try/catch,
    Response.redirect() to target_url). generateQRCode() in
    lib/actions/qr.ts: generates redirectToken via
    crypto.randomUUID() before generateQR(); stores redirect_token
    + target_url in qr_codes insert. 3 files modified/created.
    Commits f2c1a73, ebbf270, 9cf08a5.
  QRANALYTICS.2 ✓ lib/data/qr.ts: getQRScanStats() function +
    QRAnalyticsSummary type (total_scans, unique_days, last_scanned_at,
    device_breakdown, browser_breakdown). QRHistoryPanel.tsx: three-
    state analytics display (no redirectToken = no analytics section;
    redirectToken present + zero scans = "No scans yet"; scans present
    = full summary). Deviation: formatCT import path was specified as
    @/lib/utils/time in prompt spec — no such file exists; Claude Code
    corrected to @/lib/utils/date (the live file). 3 files. All within
    same commit batch as QRANALYTICS.1.
  QRANALYTICS.2b ✓ QRScanLogToggle.tsx (new, 'use client') — toggle
    to show/hide raw scan log table in QRHistoryPanel. Reads timezone
    from document.body.dataset.timezone with SSR guard (typeof document
    !== 'undefined'). Deviation from prompt spec: spec described
    timezone as a prop drilled from Server Component parent; Claude Code
    applied the established Client Component timezone invariant (body
    attribute read) instead of prop-drilling — correct per §7 pattern.
    1 file. Commit batch.

Phase 17 — Launch                   (pending)

Phase QRBANNER — QR Banner Text ✓ Complete
Phase QRANALYTICS — QR Scan Analytics ✓ Complete
Phase SIDEBAR — Grouped Navigation Sidebar ✓ Complete
  SIDEBAR.A ✓ Read-only audit. Key findings: bg-brand-primary-light
    confirmed R35-safe for active nav fill (globals.css already has
    dark coverage from prior phase — no new rule needed); dark mode
    hover was imperceptible with dark:hover:bg-dark-surface/50 →
    dark:hover:bg-white/10 required. 0 files. No commit.
  SIDEBAR.1 ✓ SidebarMockup.tsx (new) + TopNavMockup.tsx (new) added
    to Style Sandbox as mockups 16 and 17. StyleSandbox.tsx updated
    to include both entries. 3 files. Commit 6571a7b.
  SIDEBAR.2 ✓ Production Sidebar.tsx rewritten with four named groups:
    Events, People (contains "Crew Directory" label for /crew/users),
    Utilities, Settings. Dashboard link ungrouped above groups.
    Active state: border-l-4 + style={{ borderLeftColor:
    'var(--brand-primary)' }} + bg-brand-primary-light +
    text-brand-primary + rounded-r. Hover: dark:hover:bg-white/10
    (fixed from dark:hover:bg-dark-surface/50 which was imperceptible —
    SIDEBAR.A finding). 1 file. Commit 62e6497.
  SIDEBAR.3 ✓ dark:hover:bg-white/10 confirmed in 4 locations in
    Sidebar.tsx (F1: prompt said 3 locations — Claude Code found 4).
    ThemeToggle moved from Sidebar footer to TopBar. Change Password
    link → bordered button with KeyRound icon (className="w-4 h-4").
    TopBar outer wrapper: border-neutral-border (replaces
    border-divider dark:border-dark-border). 2 files. Commit 99c680b.
  SIDEBAR.4 ✓ Platform Setup link removed from Sidebar footer →
    TopBar as SA-only bordered Link component. Admin name:
    font-semibold + max-w-[120px] truncate. Template literal fix:
    prompt spec had invalid className syntax embedding expression
    as plain string text — Claude Code corrected to template literal
    before commit. 2 files. Commit 57ec5fe.
  SIDEBAR.5 ✓ Help link moved from standalone footer position →
    inside Settings group. Sidebar footer block (containing
    ThemeToggle, Platform Setup, Help, Change Password) fully removed.
    Logo padding: py-6 → py-3 (Claude Code read live file; prompt
    spec said py-4 which did not match live file — live value applied).
    1 file. Commit b9f4c5e.
  SIDEBAR.6 ✓ TopBar admin identity block redesigned: grouped into
    flex flex-col items-end gap-0.5 wrapper (hidden sm:flex). Admin
    name on top (font-semibold), role badge below (py-0.5 compact
    padding). max-w-[120px] truncate removed from admin name. Template
    literal fix applied again (same pattern as SIDEBAR.4).
    1 file. Commit 2566a92.

Phase NAVORDER — Sidebar Navigation Order ✓ Complete
  NAVORDER.A ✓ Read-only audit. Seven targets read. Key decisions:
    single Save button (SetupPanel convention, not per-group);
    NavOrderSection positioned before AnnouncementSection in
    SetupPanel; getGroupItems() body unchanged (href array resolved
    at call site, not inside helper); sequential sub-panels for
    link reorder (no accordion). 0 files. No commit.
  NAVORDER.1 ✓ 7 files (2 new, 5 modified). Commit d359668.
    types/sidebar.ts (NEW): GroupKey union type, SidebarNavOrder
    type, HREF_LABELS Record (display labels per href —
    "Crew Directory" for /crew/users), DEFAULT_GROUP_ORDER
    string[], DEFAULT_LINK_ORDER Record<GroupKey, string[]>,
    GROUP_LABELS Record<GroupKey, string>. Pure types/constants —
    no 'use server', no imports. Both Sidebar.tsx and
    NavOrderSection.tsx import from this file.
    NavOrderSection.tsx (NEW, 'use client'): parseNavOrder() helper
    (JSON.parse with try/catch fallback to defaults); moveItem()
    pure helper (array reorder without mutation); useState
    SidebarNavOrder> lazy init from initialValues.sidebar_nav_order;
    four group-order rows with ↑↓ buttons; four per-group link-
    reorder sub-panels (Events/People/Utilities/Settings) with ↑↓
    buttons; single Save button calling saveSidebarNavOrder();
    Reset to Defaults button (resets local state only, no auto-save);
    no <form> elements (R13.3a). F2: prompt assumed cardClasses
    importable from SetupPanel — Claude Code read live file and
    applied only structural classes (not the assumed import).
    lib/actions/setup.ts: saveSidebarNavOrder() appended (SA only;
    validates shape with typeof checks; JSON.stringify value;
    upsertSetting('sidebar_nav_order', json); logAction();
    revalidatePath('/crew', 'layout') — layout scope only).
    setup/page.tsx: 'sidebar_nav_order' added to SETUP_KEYS array
    (count: 28→29); settingsMap.get('sidebar_nav_order') || ''
    in initialValues mapping.
    SetupPanel.tsx: sidebar_nav_order: string added to
    SetupPanelInitialValues type; <NavOrderSection> imported and
    rendered before <AnnouncementSection> in the panel body.
    layout.tsx: 5th Promise.all entry fetches sidebar_nav_order
    from app_settings; JSON.parse with try/catch (malformed JSON
    falls back to undefined); navOrder={navOrder} passed to
    <Sidebar>.
    Sidebar.tsx: navOrder?: SidebarNavOrder prop added at two
    locations (interface + destructured params, no default value);
    GROUP_HREF_DEFAULTS Record<GroupKey, string[]> constant;
    resolvedGroupOrder derived from navOrder?.groupOrder ??
    DEFAULT_GROUP_ORDER; groupItems built via Object.fromEntries();
    single .map() over resolvedGroupOrder replaces hardcoded group
    blocks. F1: prompt omitted await on getServerClient() in
    saveSidebarNavOrder() — Claude Code corrected before commit.

Beta Build Complete. All Beta phases shipped. Phase 17 (Launch) is next.

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
Phase 19 — Volunteer Communication Preferences ✓ Complete
  30BN-19.1  ✓ Migration 030 + server actions
  30BN-19.2  ✓ Public forms (VolunteerForm + UpdateForm
               + mergeVolunteer fix)
  30BN-19.3  ✓ Admin + Call Board (VolunteerCard,
               VolunteerProfileForm, VolunteersTable
               badge + filter, session.ts)

Dark Mode Cascade Defect Sweep — ✓ Complete (ADMIN.39-AUDIT + ADMIN.39a–c)
  - ADMIN.39-AUDIT: 245 confirmed pairs across 54 files
    after property-group-aware filtering (raw: 346 / 87
    files). Groups A/C/D all resolved. Group B: none.
    Companion fix (Editor note permissions) dropped —
    append-only confirmed by design.
  - ADMIN.39a ✓: 15 files — calendar components + shadcn
    primitives. Governing hover rule established.
    Commit db7ebcc.
  - ADMIN.39b ✓: 25 files — volunteer/show/forms/settings.
    Zebra stripe dark targets corrected (×3). ShowDetail
    badge dark class removed. FieldRow dark target
    corrected. has-[:checked]: scope extension applied.
    Commit 5213fb4.
  - ADMIN.39c ✓: 14 files (13 scoped + audit-log recovery
    via F7 sweep) — dashboard/help/media/tools/comm/
    sidebar/email-activity/opportunities. dark:text-brand-
    primary-mid pattern confirmed for text fixes. F7 final
    sweep: cascade closed across all audited files.
    Commit 5b9aa6d.
  - Residual: OpportunityForm.tsx:99,115 → ADMIN.40

globals.css opacity-variant gap — ✓ Complete (ADMIN.41 + ADMIN.42-AUDIT + ADMIN.42):
  - ADMIN.41: initial discovery + 2 rules authored
    (dark:bg-brand-primary-light/30, dark:hover:/50)
  - ADMIN.42-AUDIT: exhaustive audit of all 3
    components/ui/ files. 29 brand references. 12 MISSING.
    0 WRONG. 3 ACCESSIBILITY gaps.
  - ADMIN.42: 12 rules added across 3 families.
    Accessibility gaps closed. R36 established.
  - components/ui/ primitive layer now fully covered.

Phase 21 — Rehearsal Management System ✓ Complete
  30BN-21.A  ✓ Read-only audit (7 read targets). Key
               findings: createRehearsalBatch() already
               allows Production (no change needed);
               calendar_events.check_in_token absent
               (Migration 031 must add); feature_rehearsals
               absent from all three locations; Sidebar
               confirmed data-driven (NAV_ITEMS +
               FLAG_GATED_HREFS + Production allowlist —
               three-part atomic edit required); proxy.ts
               matcher/Production exception/flag block
               insertion points identified.
  30BN-21.1  ✓ Migration 031 (calendar_events.check_in_
               token, rehearsal_schedule_assignments,
               rehearsal_date_assignments, rehearsal_
               attendance, feature_rehearsals seed).
               lib/feature-flags.ts: rehearsals boolean
               added. lib/actions/rehearsals.ts (NEW —
               PUBLIC ROUTE: getRehearsalCheckInData,
               checkInToRehearsal). lib/actions/rehearsals-
               admin.ts (NEW — 8 authenticated actions).
               lib/utils/rehearsal-roster.ts (NEW — shared
               effective-roster set-math). types/rehearsal.ts
               (NEW). calendar.ts: createRehearsalBatch()
               flag guard changed calendar → rehearsals.
               Setup Panel Section 6: 4th toggle.
               Critical finding (F1): admin_users.id IS the
               Supabase Auth UUID — no auth_user_id column.
               Production RLS self-scoping corrected to
               admin_user_id = auth.uid() (R37). 10 files.
  30BN-21.2  ✓ proxy.ts: needsFlagCheck + Production
               exception + crew flag block for /crew/
               rehearsals. Sidebar.tsx: 4-part atomic edit
               (NAV_ITEMS + FLAG_GATED_HREFS + Production
               allowlist + HelpTooltip). layout.tsx:
               confirmed unchanged. schedule list page
               (page.tsx + RehearsalsListClient.tsx) +
               schedule detail shell + Roster/Dates tabs
               (RehearsalDetailTabs.tsx + [id]/page.tsx).
               lib/actions/rehearsals-admin.ts extended:
               rosterCount, location_name join, per-assignee
               overrideCount, check_in_token, 4-state status
               (Q3 — UI requirements surfaced schema gaps).
               9 files.
  30BN-21.3  ✓ proxy.ts: /rehearsal-checkin/:path* added
               to matcher (before flag block — SETUP.1 F1
               discipline); needsFlagCheck extended for
               /rehearsal-checkin/ (separate condition —
               not covered by 21.2 addition); public flag
               block added. rehearsals-admin.ts: getRehearsalAttendanceForEvent() (effective-roster-first,
               status: null for unmarked) + markAllRehearsal
               Attended() (single array upsert, SA/OA/Editor
               only). Attendance tab: stub replaced (lazy-
               load via useTransition + Map, role-gated
               marking, two-step inline confirm, Self Check-
               In badge). Public check-in route (page.tsx +
               RehearsalCheckInClient.tsx — roster dropdown
               identity, not email/phone; light mode; noindex;
               branded header). HelpContent.tsx: Rehearsals
               as 14th ALL_SECTIONS entry (4 subsections,
               all roles). rehearsals/page.tsx: HelpTooltip
               on page header (missed in 21.2). Deferred
               Verifications v18: 55 Phase 21 items added.
               10 files modified + 2 created.

Phase 20 — Automated thank-you email after a show
  ✓ Built in Alpha (30BN-12.4). See Phase 12 above.
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
30BN-ADMIN.35-AUDIT ✓ Dark mode background regression
             audit (read-only). Root cause confirmed:
             bg-brand-primary-light (hand-authored
             @layer utilities, compiled after Tailwind
             auto-generated utilities) overrides
             dark:bg-dark-bg on same element due to
             PostCSS source order. ~74 lines across ~50
             files affected. Main content area gap
             identified at layout.tsx:74.
30BN-ADMIN.35 ✓ Dark mode main content area fix.
             app/crew/(app)/layout.tsx: bg-brand-
             primary-light → bg-gray-50 on <main>
             wrapper. Broader cascade defect deferred
             to ADMIN.39-AUDIT + ADMIN.39. Commit
             7ffbee9.
30BN-ADMIN.36 ✓ Google OAuth registration path for
             Request Access flow. auth/callback/route.ts:
             if (!adminUser) branch (new registrant →
             insert pending_registrations + notify SAs
             + ?registered=google; pending → ?pending=true;
             declined → ?error=declined). googleSignIn.ts
             (new — shared handler). RegisterForm.tsx:
             Google button + 3 new param states. lib/
             actions/admin-registration.ts: getUserById()
             for Google identity detection; sendGoogle
             ApprovalEmail() routing. lib/email.ts:
             sendGoogleApprovalEmail(). Discovered: Google
             path never checked is_active (fixed ADMIN.38).
             Discovered: approveRegistration() never called
             createUser() — always reused auth_user_id.
             7 files.
30BN-ADMIN.37 ✓ revalidatePath gaps + role guard fix.
             lib/actions/volunteers.ts: revalidatePath()
             added to addNote(), editNote(), deleteNote(),
             toggleStatus(). editNote()/deleteNote()
             required .select('volunteer_id').single()
             to retrieve parent ID for revalidation path.
             updateVolunteer() role guard: role==='viewer'
             → allowedRoles allowlist (blocks Production).
             1 file.
30BN-ADMIN.38 ✓ is_active Google path + email log +
             Production role guards. auth/callback/
             route.ts: SELECT widened to include is_active;
             is_active===false → signOut() + ?error=
             not_authorized. Inline email_log +
             email_log_recipients for Google registrants
             (non-blocking, getAdminClient(), trigger:
             admin_registration_request). lib/actions/
             volunteers.ts: addNote(), toggleStatus(),
             addManualHours() guards → allowedRoles
             allowlist. 2 files.
30BN-19.1    ✓ Migration 030 + server actions.
             communication_preference column on volunteers
             (nullable text CHECK). submitVolunteerForm()
             (app/actions/volunteer.ts) + updateVolunteer()
             (lib/actions/volunteers.ts): field added.
             updateCallboardPreference() (lib/actions/
             callboard.ts): getAdminClient(), session
             cookie. updateVolunteerPreference() (lib/
             actions/volunteers.ts): getServerClient(),
             allowedRoles guard. CSV export: 'Preferred
             Contact' header + COMMUNICATION_PREFERENCE_
             LABELS. Key finding: lib/actions/volunteer.ts
             (singular) does not exist — Brief spec had
             wrong path. Actual: app/actions/volunteer.ts
             (public) + lib/actions/volunteers.ts (admin).
             8 files.
30BN-19.2    ✓ Public forms. VolunteerForm.tsx + Volunteer
             UpdateForm.tsx: preference dropdown added.
             app/update/page.tsx: SELECT extended. app/
             update/actions.ts (updateVolunteerInfo()):
             field added — discovered /update submits
             here, not through lib/actions/volunteers.ts.
             mergeVolunteer(): field added (19.1 Q3). Zod:
             z.string().optional() not z.enum() — empty
             string from <select> fails enum silently.
             5 files.
30BN-19.3    ✓ Admin + Call Board UI. session.ts:
             VOLUNTEER_COLUMNS extended. types/callboard.ts:
             CallboardVolunteer extended. VolunteerCard.tsx:
             badge + inline select, optimistic state,
             router.refresh(). types/volunteer.ts:
             VolunteerProfile extended (discovered gap).
             lib/validations/volunteerProfile.ts: schema
             bug fixed (z.enum→z.string). VolunteerProfile
             Form.tsx: view Field + edit select. url.ts:
             preference filter state. list.ts: query filter.
             FilterPanel.tsx: filter control. Volunteers
             Table.tsx: row badge. PDF omitted (10-column
             A4 too tight). 10 files.
30BN-DOC.50  ✓ Brief Update v4.2 (Phase 19 complete,
             ADMIN.35–38, auth patterns, zod select
             pattern, update form action clarification)
30BN-ADMIN.39-AUDIT ✓ Full dark mode cascade inventory.
             Raw grep: 346 lines / 87 files. After
             property-group-aware filtering: 245
             confirmed pairs / 54 files. Groups A
             (122 REPLACE_BASE), B (none), C (4
             SHADCN), D (18 resolved via owner
             decisions). Companion fix (editNote/
             deleteNote guard) dropped — Editors
             confirmed append-only, RLS incompatible.
             Execution split into 3 prompts.
30BN-ADMIN.39a ✓ Calendar + shadcn. 15 files, 38
             edits. Governing hover rule established
             (dark: target determines gray-50 vs
             gray-100 replacement). RecurrenceScopePicker
             dark target corrected (dark-surface →
             dark-border). Commit db7ebcc.
30BN-ADMIN.39b ✓ Volunteer/show/forms/settings. 25
             files, 64 edits. Zebra stripe dark targets
             corrected ×3 (dark-surface → dark-bg).
             ShowDetail badge dark:bg-dark-nav removed.
             FieldRow dark target corrected (dark-nav
             → dark-border). has-[:checked]: scope
             extension confirmed (VolunteerProfileForm
             :359). Commit 5213fb4.
30BN-ADMIN.39c ✓ Dashboard/help/media/tools/comm/
             sidebar/email-activity/opportunities. 14
             files (13 scoped + audit-log/page.tsx
             recovery via F7 sweep), 43 edits.
             dark:text-brand-primary-mid confirmed as
             correct text fix pattern (not dark:text-
             dark-text — native class loses to hand-
             authored base). F7 final sweep: cascade
             defect closed across all 54 audited files.
             OpportunityForm.tsx:99,115 residual →
             ADMIN.40. Commit 5b9aa6d.
30BN-DOC.51  ✓ Process Update v4.1 (Phase 19, ADMIN.35-
             38, new patterns + checklist items)
30BN-DOC.52  ✓ Deferred Verifications v17 (ADMIN.35-38
             + Phase 19 verification items, ~830 items)
30BN-DOC.53  ✓ Brief Update v4.3 (reconstructed missing
             v4.2 content + dark mode cascade closure,
             ADMIN.37-39c, R35, ADMIN.40 carry-forward)
30BN-ADMIN.40 ✓ OpportunityForm.tsx has-[:checked]:
             cascade fix. Single-part (dark target
             correct). has-[:checked]:bg-brand-primary-
             light → bg-white. 1 file. Commit 1da6b04.
30BN-ADMIN.41 ✓ globals.css: dark:bg-brand-primary-
             light/30 + dark:hover:/50 rules authored.
             First R36 instance discovered. Commit
             b050736.
30BN-ADMIN.42-AUDIT ✓ Full components/ui/ audit.
             3 files, 29 brand refs, 12 MISSING, 0
             WRONG. 3 ACCESSIBILITY gaps (focus rings).
             Complete matrix + exact CSS. No re-
             investigation needed.
30BN-ADMIN.42 ✓ 12 globals.css rules added. 3 passes
             (primary 2, primary-mid 1, accent 9).
             Accessibility gaps closed. Zero component
             changes. R36 established. globals.css only.
30BN-DOC.54  ✓ Process v4.2 — ADMIN.39a–c patterns,
             R35 formal rule, cascade sweep complete,
             Editor append-only confirmed, prompt log
             completed.
30BN-DOC.55  ✓ Brief v4.4 + Process v4.3 (this prompt)
30BN-21.A    ✓ (see Phase 21 above)
30BN-21.1    ✓ (see Phase 21 above)
30BN-21.2    ✓ (see Phase 21 above)
30BN-21.3    ✓ (see Phase 21 above)
30BN-DOC.56  ✓ Brief Update v4.5 (Phase 21 complete:
               §1, §2, §7, §8 Rehearsal Management section,
               §9 three new table blocks + Migration 031 +
               calendar_events.check_in_token + feature_
               rehearsals seed, §11 Phase 21 completed
               summary, §13 R34 update + R37 new rule)
30BN-DOC.57  ✓ Process Update v4.4 (this prompt)
30BN-DOC.58  ✓ Brief Update v4.6 (Phase AUDITIONS fully
               specced: §1/§2/§7/§8/§9/§11/§13 all updated;
               8 new table schema blocks; Migration 032
               pending; feature_auditions (5th flag); 11-
               prompt structure; Production assignment model;
               R38 TipTap merge tag extension pattern)

Phase AUDITIONS — Audition Management System ✓ Complete
  AUDITIONS.A  ✓ Read-only audit. Seven targets confirmed
               (feature-flags.ts, proxy.ts, Sidebar.tsx,
               calendar-sync.ts, Phase 15.2 consent trigger,
               lib/actions/rehearsals.ts check-in pattern,
               show detail guard). Key findings: formatWallClockCT
               takes 3 args; checkInToAudition takes signupId
               not adminUserId; show_editors uses admin_id not
               admin_user_id.
  AUDITIONS.1a ✓ Migration 032 applied (8 tables + feature_
               auditions seeded + calendar_events_event_type_check
               + 'audition'). types/audition.ts (new). lib/
               feature-flags.ts (5th flag). SetupPanel.tsx (5th
               toggle). setup/page.tsx (companion type fix — F2:
               5-file pattern confirmed). 5 files.
  AUDITIONS.1b ✓ lib/actions/auditions.ts (new — PUBLIC ROUTE:
               7 functions + getAuditionMaterialUploadUrl +
               getUpcomingAuditions). lib/actions/auditions-admin
               .ts (new — 14 functions + assertAuditionAccess()
               private helper). calendar-sync.ts: syncAudition
               ToCalendar() added. lib/audit.ts: audition.convert
               _to_volunteer added. Inline DB fixes: source_check
               + 'audition', source_audition_id column. R32 fix:
               getFeatureFlags(supabase) not inline fetch
               (AUDITIONS.2a F2). 4 files + 2 inline DB fixes.
  AUDITIONS.2a ✓ Inline schema fixes: audition_signups.phone NOT
               NULL; email_log.recipient_type + 'audition'. proxy
               .ts: 5 changes (needsFlagCheck ×3 incl. /auditions/
               public route; Production allowlist /crew/shows/
               scoped with trailing slash; crew flag block; public
               flag block). show detail page: Production show_
               editors.admin_id membership guard. lib/actions/
               shows.ts: 9 mutating actions (5 membership-check,
               4 full-block). convertToVolunteer() phone guard
               removed. Zod phone required. AuditionSignup.phone
               type fix. calendar-sync R32 fix. 7 files + 2
               inline fixes.
  AUDITIONS.2b ✓ Sidebar.tsx: 4-part atomic edit (Mic2 import,
               NAV_ITEMS, FLAG_GATED_HREFS, Production allowlist,
               HelpTooltip generalized to dynamic anchor). setup
               .ts: saveFeatureFlags revalidatePath. auditions-
               admin.ts: signed URL + castRole param. List page
               (page.tsx + AuditionsListClient.tsx). Detail shell
               ([id]/page.tsx). AuditionDetailTabs.tsx: 6 tabs —
               4 implemented, 2 stubbed. 7 files.
  AUDITIONS.2c ✓ Settings tab full (config, roles CRUD, Production
               assignments, archive). Email Templates tab full
               (3 useEditor instances + immediatelyRender: false,
               MergeTagExtension, merge tag toolbar, save/preview
               per status, async setContent() in load handler).
               QR corrected (SVG inline + downloads). Access guard
               on signed URL. Description field on signup page.
               4 new server actions. 4 files.
  AUDITIONS.3a ✓ app/auditions/[id]/page.tsx (new — white header
               pattern; noindex; notFound() on null; params
               Promise-awaited). AuditionSignupClient.tsx (new —
               slot picker; guardian fields; role selection; P-DC
               material uploads with XHR + FormData body; full
               state machine; formatAuditionTime local helper).
               auditions.ts: getAuditionMaterialUploadUrl + extend
               ed submitAuditionSignup return (includes uploadToken).
               Key findings: formatWallClockCT 3-arg (F1);
               white header; FormData not raw body. 3 files.
  AUDITIONS.3b ✓ Upload + cancel pages (new). Check-in page (new
               — server-side invalid-token render; day-of-week
               date format). AuditionUploadClient.tsx (new).
               AuditionCheckInClient.tsx (new). getUpcomingAuditions
               () added (CT-aware date; inline flag check).
               Calendar sync wired (non-blocking updateAudition;
               delete+sync updateAuditionStatus). Auditions card
               on app/page.tsx + shows/page.tsx. 8 files.
  AUDITIONS.4a ✓ lib/utils/merge-tags.ts (new — pure utility;
               MERGE_TAGS const; substituteMergeTags() with local
               escapeHtml). MergeTagExtension.ts (new — TipTap
               Node, inline/atom, data-merge-tag round-trip,
               insertMergeTag command, module augmentation).
               globals.css: .merge-tag-pill rule. auditions-admin
               .ts: previewAuditionEmailTemplate(). Key findings:
               formatWallClockCT 3-arg (F1); FK join Array.isArray
               normalization not 'as any' (F2). 4 files.
  AUDITIONS.4b ✓ lib/email.ts: 4 new functions exported (F1:
               all send functions are exported — confirmed live).
               auditions.ts: 3 stubs replaced + formatAuditionTime
               helper. auditions-admin.ts: status notification
               stub replaced. Cancel page (new). HelpContent.tsx:
               Auditions as 15th section — live order is Getting
               Help → Rehearsals → Auditions (F4: an earlier Brief
               draft had the wrong order; corrected in Brief
               DOC.59). AuditionDetailTabs.tsx: 3 HelpTooltip
               placements. AboutSystemEmails.tsx: 4 new triggers
               (11→15). Deferred Verifications v19: 65 items.
               9 files + 1 new.
  30BN-DOC.59 (Brief) ✓ Brief Update v4.7 (35 edits — Phase AUDITIONS
               complete; all §1/§3/§6/§7/§8/§9/§11/§13 updated;
               R23 3-arg signature; 5-file flag pattern; schema
               corrections; Migration 032 applied; HelpContent
               order corrected)
30BN-DOC.60 ✓ Process Update v4.6 (this prompt)
30BN-DOC.61 ✓ Brief Update v4.8 (1 edit — §13 R32
client-agnostic signature documented; false
getServerClient() association corrected)
30BN-DOC.62 ✓ Process Update v4.7 (this prompt — §7
stale getServerClient() sentence replaced;
§13 DOC.61 + DOC.62 logged; v4.7 history)
30BN-DOC.59 (Process) ✓ Process Update v4.5 (this prompt — Phase
AUDITIONS: §7 audition assignment pattern;
§10 feature_auditions grep; §11 stub tab
checklist item; §13 phase log + DOC.58/59)
30BN-DB-VERIFY.5/033 ✓ 033_audition_schema_fixes.sql
written and applied. 7 pre + 5 post
verification queries. All 5 inline Phase
AUDITIONS fixes confirmed idempotent.
1 file. Commit 0ed3b5d.
30BN-ADMIN.43 ✓ proxy.ts Production allowlist: missing
/crew/auditions exception added (line 135).
Documented in Brief as AUDITIONS.2a but
commit was absent. Discovered INVENTORY.A
F1. 1 file. Commit b022423.
30BN-INVENTORY.A ✓ Read-only audit (9 targets). No files
modified. Key findings drove INVENTORY.1
scope. F1 → ADMIN.43. F2 → DOC batch.
30BN-ADMIN.44 ✓ setup/page.tsx: ?? → || for 5 flag
initialValues entries (feature_rehearsals +
feature_auditions seeded as '' — ?? produced
'' not 'true'). lib/actions/auditions.ts:
stale comment above getUpcomingAuditions()
corrected (both inaccuracies). 2 files.
Commit b654083.
30BN-INVENTORY.1 ✓ Migration 034 + flag infrastructure
+ TOOLTIP_ANCHOR_MAP sidebar refactor +
inventory_manager toggle on User Management.
13 files + 2 unplanned. Commit c367288.
30BN-INVENTORY.2 ✓ Settings page (categories + locations)
+ item list page + creation modal +
lib/actions/inventory-settings.ts +
lib/actions/inventory.ts. 9 files + 2 unplanned.
Commit 48bc27a.
30BN-INVENTORY.3 ✓ Item detail page (5-tab shell) + photo
gallery (6th sanctioned XHR file:
InventoryPhotoUploader.tsx) + private notes +
deactivation flow. Storage dual-client pattern
confirmed (F1). 6 files. Commit bacd937.
30BN-INVENTORY.4 ✓ Checkout system (CheckoutModal +
ActiveCheckoutsPanel + history timeline + return
action). Two-fetch-plus-TypeScript-join pattern
for dual FK to admin_users (enrichCheckouts()).
8 files. Commit 35ba6cb.
30BN-INVENTORY.5 ✓ QR display + PDF tag export
(InventoryTagsPDF.tsx + route.tsx) + Print Tags
wired + HelpContent full section. Phase INVENTORY
complete. 6 files. Commit 7f57805.
30BN-DOC.64 ✓ Brief Update v5.0 (this session — 033+034
applied, ADMIN.43 fix documented, INVENTORY.1
build summary, HelpContent 16th section,
version history ordering corrected).
30BN-DOC.65 ✓ Process Update v4.8 (this prompt)
30BN-DOC.66 ✓ Brief Update v5.1 (Phase INVENTORY complete
— INVENTORY.2–5 summaries; key files corrected;
HelpTooltip count 40→42; lib/audit.ts inaccuracy
fixed; storage dual-client note added).
30BN-DOC.67 ✓ Process Update v4.9 (this prompt)
30BN-FORUMS.A ✓ Read-only audit. See Phase FORUMS above.
30BN-FORUMS.1 ✓ 15 files. Commit dde841d. See above.
30BN-FORUMS.2 ✓ 5 files. Commit c1c7328. See above.
30BN-FORUMS.3 ✓ 7 files. Commit 5c95810. See above.
30BN-FORUMS.4 ✓ 6 files. Commit b21b3a4. See above.
30BN-FORUMS.5 ✓ 9 files. Commit e41f66f. See above.
30BN-DOC.68 ✓ Brief v5.2 Part A (§1/§2/§3/§5/§7/§8
Phase FORUMS complete).
30BN-DOC.69 ✓ Brief v5.2 Part B (§9 forum schema tables
+ §11 build log).
30BN-DOC.70 ✓ Process v5.0 (this prompt — Phase FORUMS
complete: §7/§8/§10/§11/§13/§14 updates).
30BN-FORUMS.5-FIX ✓ 'use server' non-function export fix.
FORUM_POST_SANITIZE_OPTIONS extracted to lib/actions/
forum-post-sanitize.ts (no 'use server'). 2 import
sites updated (forum-posts.ts, forum-moderation.ts).
Full 'use server' audit: zero other violations. 3 files.
Commit 02f4569.
30BN-DOC.71 ✓ Brief v5.3 + Process v5.1 (FORUMS.5-FIX
documented — §7 new pattern, §10 grep check, §11
checklist item, §13 prompt log — this prompt).
  30BN-STYLE.A    ✓ (see Phase STYLE above)
  30BN-STYLE.1    ✓ (see Phase STYLE above)
  30BN-STYLE.2    ✓ (see Phase STYLE above)
  30BN-STYLE.3    ✓ (see Phase STYLE above)
  30BN-STYLE.4    ✓ (see Phase STYLE above)
  30BN-STYLE.5    ✓ (see Phase STYLE above)
  30BN-STYLE.6    ✓ (see Phase STYLE above)
  30BN-STYLE.7    ✓ (see Phase STYLE above)
  30BN-STYLE.8    ✓ (see Phase STYLE above)
  30BN-DOC.72     ✓ Brief v5.4 (see Phase STYLE above)
  30BN-NOTIFY.A   ✓ Read-only audit (7 targets). Findings above.
  30BN-NOTIFY.1   ✓ Migration 036 + sidebar/settings cleanup +
                    types/notifications.ts. Commits 26b2add +
                    c7e8000 (NOTIFY.1-FIX).
  30BN-NOTIFY.2   ✓ Notification infrastructure (lib/utils,
                    lib/data, lib/actions) + layout prop threading
                    + Sidebar forum badge. Commit 6e363d3.
  30BN-NOTIFY.3   ✓ Write-point wiring (6 action files, 7 calendar
                    call sites, archived-forum filter fix, send
                    ForumNotificationEmail() return type). Commit
                    80c7021.
  30BN-NOTIFY.4   ✓ NotificationPanel.tsx + TopBar wiring +
                    NOTIFY.3-FIX (email early-return path).
                    Commit 7ea1f19.
  30BN-NOTIFY.4-CLEANUP ✓ Lint baseline: TOOLTIP_ANCHOR_MAP
                    removed, unused type imports removed, dynamic
                    pluralization. Commit 5e7656f.
  30BN-DOC.73     ✓ Process v5.3 (this prompt)
  30BN-MESSAGES.A ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.1 ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.2 ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.3 ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.4 ✓ (see Phase MESSAGES above)
  30BN-DOC.74     ✓ Brief v5.6 + Process v5.4 (Phase MESSAGES.A–4
                    documented — this prompt pair)
  30BN-MESSAGES.5 ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.6 ✓ (see Phase MESSAGES above)
  30BN-MESSAGES.7 ✓ (see Phase MESSAGES above)
  30BN-DOC.75     ✓ Brief v5.7 + Process v5.5 (Phase MESSAGES complete
                    — this prompt pair)
  30BN-ADMIN.45   ✓ Dead prop audit (10 files, 2 fixes,
                    F1 discovered). Commit 671a6d4.
  30BN-ADMIN.46   ✓ Q1 (defaultHours display) + F1 restored
                    (onEmptyChange, isComposerEmpty state).
                    Commit 796af84.
  30BN-TZ.A       ✓ Read-only timezone audit (no code).
  30BN-TZ.1       ✓ Foundation: Migration 038, org-timezone.ts,
                    date.ts params, body attr, Setup Panel.
                    Commit ce19f45.
  30BN-TZ.2       ✓ Server-side sweep (12 files, absorbed TZ.3).
                    C5#1 bug fixed. Commit c166112.
  30BN-TZ.4a      ✓ Server Component pages (15 + 1 companion).
                    C5#5 bug fixed. Commit bfae0f6.
  30BN-TZ.4b      ✓ Server actions + lib/ (13 files).
                    resolveEmailSettings() +timezone. Commit cff97ab.
  30BN-DOC.76     ✓ Brief Update v5.8 (this phase).
  30BN-DOC.77     ✓ Process Update v5.6 (this prompt).
  30BN-TZ.5a-AUDIT ✓ Pre-TZ.5b grep (no code). Zero missed
                    fixes. PublicCalendarGrid 10th calendar
                    Client Component confirmed.
  30BN-TZ.5a      ✓ Client Component sweep (40 files).
                    Carry-forwards wired, threading, C5#5.
                    Commit c83b5ae.
  30BN-TZ.5b      ✓ Calendar subsystem (12 files). All const
                    CT removed. Utility module timezone params.
                    Phase TZ complete. Commit e06d1c4.
  30BN-DOC.78     ✓ Brief v5.9 (Phase TZ complete).
  30BN-DOC.79     ✓ Process v5.7 (this prompt).
  30BN-MM.A       ✓ Read-only audit (7 files). Key findings:
                    SetupPanel 8 independent sub-components;
                    SaveStatus 'saved'; settingsMap Map instance;
                    ActionResult discriminated union narrowing.
                    No code. No commit.
  30BN-MM.1       ✓ Migration 039 + saveMaintenanceMode() +
                    proxy.ts gate + /crew/maintenance page +
                    layout banner. 5 files. Commit 4196623.
  30BN-MM.2       ✓ MaintenanceModeSection sub-component +
                    SetupPanelInitialValues +3 fields +
                    SETUP_KEYS 24→27. 2 files. Commit 769ecdd.
  30BN-DOC.80     ✓ Brief v5.9→v6.0 Part A (§1/§7/§8/§9).
  30BN-DOC.81     ✓ Brief v6.0 Part B (§11/§13).
  30BN-DOC.82     ✓ Process v5.7→v5.8 (this prompt).
  30BN-FORUMS-FIX.A  ✓ Audit + inline fix: markThreadRead
                       moved from render to useEffect.
                       2 files. Commit 29570e0.
  30BN-FORUMS-FIX.B  ✓ signed-URL try/catch + error.tsx
                       console.error. 2 files.
                       Commit 6b5e230.
  30BN-FORUMS-UX.1   ✓ "Manage Access" label.
                       1 file, 1 line. Commit 1651989.
  30BN-ANNOUNCE.A    ✓ Audit (9 targets). Key: layout
                       cannot pass data to children;
                       dashboard_announcement_* prefix;
                       saveFeatureFlags() 6-point wiring.
                       No code. No commit.
  30BN-ANNOUNCE.1    ✓ Migration 040 + saveAnnouncement()
                       + dismissAnnouncement() +
                       getActiveAnnouncements() + types.
                       7 files. Commit 23d28f3.
  30BN-ANNOUNCE.2    ✓ AnnouncementSection + widget +
                       dashboard integration + OA toggle
                       + mirror page + hub card.
                       10 files. Commit 98a275e.
  30BN-SHOWDELETE.A  ✓ Audit. Key: attendance NO ACTION
                       FK; ShowCard inline in ShowList;
                       ShowEditorActionResult not
                       ActionResult. No code. No commit.
  30BN-SHOWDELETE.1  ✓ deleteShow() + AuditAction +
                       AlertDialog in SettingsTab.
                       3 files. Commit b4824dc.
  30BN-SHOWARCHIVE.A ✓ Audit. Key: ShowForm.tsx has
                       hardcoded buttons; ShowDetail.tsx
                       already correct; no Archive tab
                       needed. No code. No commit.
  30BN-SHOWARCHIVE.1 ✓ ShowForm.tsx Save fix + Archive
                       button + Archived Shows accordion.
                       2 files. Commit 6557260.
  30BN-DOC.83        ✓ Brief v6.0→v6.1 Part A (§1/§7/§8/§9).
  30BN-DOC.84        ✓ Brief v6.1 Part B (§11/§13).
  30BN-DOC.85        ✓ Process v5.8→v5.9 (this prompt).
  30BN-DOC.86        ✓ Brief v6.1→v6.2 Parts A+B (§1/§3/§7/§8/§9/
                        §11/§13 updated for QRBANNER/QRANALYTICS/
                        SIDEBAR/NAVORDER — Migrations 041+042,
                        qr_scan_events schema, sidebar_nav_order key,
                        SETUP_KEYS 28→29, types/sidebar.ts, grouped
                        sidebar spec, QR analytics spec, Phase 17
                        "Beta Build Complete" status).
  30BN-QRBANNER.1    ✓ Migration 041 + @resvg/resvg-js + escapeXml()
                        + banner text UI. Commit 9f5f341.
  30BN-QRANALYTICS.A ✓ Read-only audit. Architectural decisions
                        locked. No code. No commit.
  30BN-QRANALYTICS.1 ✓ Migration 042 + app/go/[token]/route.ts +
                        generateQRCode() redirect_token. Commits
                        f2c1a73, ebbf270, 9cf08a5.
  30BN-QRANALYTICS.2 ✓ getQRScanStats() + QRAnalyticsSummary type
                        + three-state analytics in QRHistoryPanel.
  30BN-QRANALYTICS.2b ✓ QRScanLogToggle.tsx — body attribute timezone
                         invariant (not prop-drilled).
  30BN-SIDEBAR.A     ✓ Read-only audit. bg-brand-primary-light R35-
                        safe confirmed; hover fix identified.
                        No code. No commit.
  30BN-SIDEBAR.1     ✓ SidebarMockup + TopNavMockup (mockups 16+17).
                        3 files. Commit 6571a7b.
  30BN-SIDEBAR.2     ✓ Production grouped sidebar with four groups.
                        1 file. Commit 62e6497.
  30BN-SIDEBAR.3     ✓ dark:hover:bg-white/10 (4 locations) +
                        ThemeToggle → TopBar + border-neutral-border.
                        2 files. Commit 99c680b.
  30BN-SIDEBAR.4     ✓ Platform Setup → TopBar + admin name style.
                        Template literal fix. 2 files. Commit 57ec5fe.
  30BN-SIDEBAR.5     ✓ Help → Settings group + footer removed.
                        1 file. Commit b9f4c5e.
  30BN-SIDEBAR.6     ✓ Identity block flex-col stacking + max-w
                        removed. Template literal fix. 1 file.
                        Commit 2566a92.
  30BN-NAVORDER.A    ✓ Read-only audit. Seven targets. Key decisions
                        locked. No code. No commit.
  30BN-NAVORDER.1    ✓ types/sidebar.ts + NavOrderSection.tsx +
                        saveSidebarNavOrder() + setup/page.tsx +
                        SetupPanel.tsx + layout.tsx + Sidebar.tsx.
                        7 files. Commit d359668.
  30BN-DOC.87        ✓ Process v5.9→v6.0 (this prompt).

ADMIN.47 ✓ — Carry-forward cleanup. Task A audit: three
carry-forward items; two non-applicable in live code.
Task C (stale QRCode.toBuffer() comment in QRGeneratorForm.tsx)
— comment does not exist in live file; already resolved in
QRBANNER.1. Task D (default_reply_to missing from SETUP_KEYS)
— already present in SETUP_KEYS (confirmed ADMIN.46 Task A4).
Task B executed: removed dead `adminRole` prop from
`InventoryDetailTabs.tsx` (type annotation + destructure + ESLint
suppression + unused `AdminRole` import). Also removed
`adminRole={admin.role}` from call site in
`inventory/[id]/page.tsx` (required to avoid tsc excess-property
error after prop type change). 2 files. Commit 678d774.

ADMIN.48 ✓ — `setup/page.tsx` `??` → `||` R18 sweep.
Task A: 15 `??` expressions in `initialValues` block (prompt
estimated ~11; live count was 15). 2 `??` expressions outside
`initialValues` correctly left untouched (settingsMap construction
+ instanceLabel local const). Task B: all 15 replaced. 0 errors,
0 warnings. 1 file. Commit 9f614a0.

Phase BETA — Beta Feedback System ✓ Complete
  BETA.A ✓ Read-only audit (9 targets). Key findings:
    F1: dual-highlight risk — /crew/settings/beta prefix-matches
    /crew/settings in isActivePath(); fix: special-case in
    renderLink() with !pathname.startsWith('/crew/settings/beta')
    exclusion, not in isActivePath() itself.
    F2: label "Beta Feedback" everywhere.
    F3: feature_beta defaults OFF — seeds 'false', || 'false'
    pattern (matches feature_messages).
    F4: proxy must use pathname.startsWith('/crew/settings/beta')
    only — never broader /crew/settings.
    F5: feature_beta in feature_* cluster in SETUP_KEYS, not
    appended at end.
    F6: saveFeatureFlags() has separate keys array AND .upsert()
    array — both need 'feature_beta' (two distinct edits).
    F7: settings/page.tsx has zero flag-gated cards; Beta Feedback
    hub card uses canAccessAdminSettings role gate only (no flag
    import — proxy handles redirect).
    Icon: MessageSquarePlus confirmed to exist.
    NAV_ITEMS shape: { label, href, icon } only — no roles array.
    No code. No commit.
  BETA.1 ✓ Full implementation. Migration 043 applied
    (beta_feedback table + 3 RLS policies + feature_beta = 'false'
    seed). lib/actions/beta.ts (new): submitBetaFeedback() +
    completeBetaFeedback() (SA only; soft-archive via completed_at;
    idempotency guard; revalidatePath). app/crew/(app)/settings/
    beta/page.tsx (new): Server Component role-branch (SA queue /
    non-SA form); SA queue oldest-first; Mark Complete via .bind() +
    R40 double assertion. components/crew/settings/BetaFeedbackForm
    .tsx (new): 'use client'; no <form> element (R13.3a); type
    segmented control; textarea + char count; inline success/error.
    Feature flag 5-file pattern: lib/feature-flags.ts (9th flag
    beta: boolean); SetupPanel.tsx (10th toggle "Beta Feedback",
    fd.append() in handleSave()); setup/page.tsx (SETUP_KEYS
    29→30, || 'false' fallback, inside feature_* cluster);
    lib/actions/setup.ts (saveFeatureFlags() all 6 wiring points
    — both keys array AND .upsert() array); proxy.ts
    (/crew/settings/beta in needsFlagCheck + crew flag block,
    pathname.startsWith('/crew/settings/beta') only).
    Sidebar.tsx: MessageSquarePlus icon; FLAG_GATED_HREFS
    entry; prepended to SETTINGS_HREFS; dual-highlight fix in
    renderLink() (&& !pathname.startsWith('/crew/settings/beta')
    on /crew/settings active check). types/sidebar.ts:
    '/crew/settings/beta': 'Beta Feedback' in HREF_LABELS;
    /crew/settings/beta prepended to DEFAULT_LINK_ORDER
    ['settings']. settings/page.tsx: Beta Feedback hub card
    ({canAccessAdminSettings && <LinkedCard.../>} — first card
    built after hide-not-lock rule). 4 new files, 8 modified.
    Commit a9b1026.

ADMIN.49 ✓ — Sidebar Beta link fix + Settings hub hide-not-lock.
Bug 1: `feature_beta = 'true'` confirmed in DB. Root cause: saved
`sidebar_nav_order` row with `linkOrder.settings = ["/crew/settings",
"/crew/help"]` (pre-BETA.1). `??` never fell through to updated
`GROUP_HREF_DEFAULTS`. Fix: `resolveGroupHrefs()` added to
`Sidebar.tsx` — merges saved order with current defaults, appending
missing hrefs. Self-healing for all groups, all future additions.
Bug 2: 14 cards on `settings/page.tsx` converted from
`cond ? <LinkedCard/> : <LockedCard/>` to `cond && <LinkedCard/>`.
`LockedCard` function definition removed (fully unused — would
have failed lint). New standing rule: hide-not-lock (§7 + §11).
F1: `canAccessInventorySettings` used over prompt's literal pattern
— safer, defense-in-depth, same visible behavior.
Q2: stale `sidebar_nav_order` DB row not modified — code fix
makes it harmless. 2 files. Commit pushed.

ADMIN.50 ✓ — Settings access tightening + Inventory Manager
sidebar link. Settings sidebar link hidden from Editor/Viewer/
Production via FLAG_GATED_HREFS role check (admin prop already
in scope — no new prop needed). Editors lose Audit Log access
entirely (SA/OA only). New `showInventorySettings` prop on Sidebar
(interface + destructured default `false`); computed in `layout.tsx`
as `admin.role === 'editor' && admin.inventory_manager === true`;
threaded to `<Sidebar>`. Inventory Management link rendered as
special-case append in settings group render block (Package icon).
NOT in `SETTINGS_HREFS`, `FLAG_GATED_HREFS`, or `DEFAULT_LINK_ORDER`.
`'/crew/settings/inventory': 'Inventory Management'` added to
`HREF_LABELS` in `types/sidebar.ts`. `proxy.ts`: two new guards
— `/crew/settings` exact match (SA/OA) + `/crew/settings/audit-log`
prefix (SA/OA) — both session-client pattern. `settings/page.tsx`:
`if (!canAccessAdminSettings) redirect('/crew/dashboard')` added.
`audit-log/page.tsx`: tightened from Viewer-only-block to SA/OA-only.
`layout.tsx`: `showInventorySettings` computed + threaded.
F1: Individual sub-pages (Announcement Banner etc.) not independently
proxy-blocked — no UI path but direct URL still works. Intentional.
6 files. Commit pushed.

ADMIN.51 ✓ — `settings/page.tsx` dead variable cleanup.
Post-ADMIN.50 simplification: `isEditorOrAbove` (always true for
SA/OA, the only roles reaching JSX) and `canAccessInventorySettings`
(Editor branch unreachable) both removed. 6 card conditions
simplified to `canAccessAdminSettings`. `canAccessAdminSettings`,
`canAccessDashboardAnnouncements`, and `admin.role === 'super_admin'`
(Style Sandbox) remain meaningful and unchanged.
1 file. Commit f628541.

ADMIN.52 ✓ — SeasonAtAGlance 31-day cap + chronological sort
+ Announcement Widget redesign.

`SeasonAtAGlance.tsx`: 31-day preview cap (only shows whose
earliest `show_date` falls within 31 days displayed); shows
sorted chronologically by earliest show date ascending (replaces
alphabetical DB sort); "View all shows →" link in section header
(always visible); empty state and truncation note ("Showing N
of M shows — View all →"). Fallback section header when no
season is pinned: "Upcoming Shows (Next 31 Days)" (not "All Live
Shows" — corrected in ADMIN.53 to reflect the cap).
Architecture: self-contained Server Component — no show data
crosses the page boundary. `timezone` prop threaded from page
to avoid redundant `getOrgTimezone()` call. Cutoff uses
`formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)`
string-comparison pattern (R23).

`AnnouncementWidgetClient.tsx`: visual redesign — orange card
with accent `border-l-4` + `Megaphone` icon + "Announcement"
label + `X` dismiss. R35-safe: `bg-orange-50 dark:bg-orange-900/10`
both native Tailwind — cascade-correct pair.

2 files. Commit 97655be.

ADMIN.53 ✓ — Notification panel cleanup + Season label fix.

`SeasonAtAGlance.tsx`: fallback header "All Live Shows" →
"Upcoming Shows (Next 31 Days)". 1 line.

`NotificationPanel.tsx`: (1) mark-as-read uses `.filter()`
(item removed) not `.map()` (read_at set); (2) mark-all →
`setNotifications([])` → empty state; (3) "Mark all read"
button conditionally rendered only when `unreadPersistent > 0`;
(4) `direct_message` type filtered via `visibleNotifications`
derived constant — both rendered list and bell badge driven from
this constant. Architecture fix: removed `counts` state and
`setCounts()` calls; `unreadPersistent` now purely client-derived
from `visibleNotifications.filter(n => !n.read_at).length`.

2 files. Commit a4dc731.

ADMIN.54 ✓ — Notifications row cap removed + TipTap click-to-focus.

`lib/data/notifications.ts`: `.limit(20)` default parameter
removed from `getUserNotifications()`. `lib/actions/notifications.ts`:
pass-through `limit?: number` parameter removed.

`DirectMessageComposer.tsx`: click-to-focus fix — added
`dm-editor-wrapper` class + `cursor-text` + `onClick` on wrapper
div; CSS custom property `--dm-min-height` via inline style;
ineffective `style={{ minHeight }}` on `<EditorContent>` removed.
Root cause: `minHeight` on `<EditorContent>` outer div never
reaches `.ProseMirror` contenteditable child.

`app/globals.css`: plain CSS rule added outside `@layer utilities`:
`.dm-editor-wrapper .ProseMirror { min-height: var(--dm-min-height, 100px); outline: none; }`

4 files. Commit 32eeebd.

ADMIN.55 ✓ — Beta Feedback sidebar link hidden from Super Admin.

`Sidebar.tsx`: when `groupKey === 'settings' && admin.role === 'super_admin'`,
`/crew/settings/beta` filtered from resolved hrefs array after
`resolveGroupHrefs()` and before `getGroupItems()`. SA reaches
Beta Feedback via the Settings hub card. `resolveGroupHrefs()`
self-healing unaffected (filter runs after merge). `showInventorySettings`
append unaffected (rendered outside the items array).

1 file. Commit 52a4ae1.

ADMIN.56 ✓ — QR banner font fix (initial attempt) + ribbon redesign.

Root cause: `Resvg` constructor called with no font option;
`loadSystemFonts: true` silently fails on Vercel serverless
Linux (no system fonts) → zero glyph rendering. Verified via
pixel-count comparison.

Initial font fix: `createRequire(import.meta.url).resolve(
'next/dist/compiled/@vercel/og/Geist-Regular.ttf')`. Failed
Turbopack build: literal string in `.resolve()` triggers static
analysis → `.ttf` treated as module → "Unknown module type".
See ADMIN.56-FIX for the working fix.

Ribbon redesign (ships in this commit, font corrected in
ADMIN.56-FIX): 7-element curled-edge ribbon — white backing,
`#EEF2FF` body, `#B8C4E8` shadow triangles, `#D4DCF5` face
triangles, `#293994` text (brand navy). `BANNER_HEIGHT_UNITS → 10`,
`BANNER_FONT_SIZE → 2.8`. All geometry derives from parsed
viewBox width N. `escapeXml()` preserved. No CSS in SVG —
SVG presentation attributes only (required for `@resvg/resvg-js`).

1 file. Commit superseded by ADMIN.56-FIX.

ADMIN.56-FIX ✓ — Turbopack font resolution fix.

`createRequire` approach removed entirely. Inter Regular v4.0
(SIL Open Font License, 398KB, TTF) bundled at
`public/fonts/banner-font.ttf`. Font resolution: `path.join(
process.cwd(), 'public', 'fonts', 'banner-font.ttf')` +
`existsSync()`. `process.cwd()` is a runtime expression —
Turbopack cannot statically follow it. `font: { loadSystemFonts:
false, fontFiles: [...], defaultFontFamily: 'Inter',
sansSerifFamily: 'Inter' }` passed to `Resvg` only when
`trimmedBanner` is truthy. `npm run build` clean locally
(Turbopack, 12.9s, 61 routes). Empirical verification:
125,144-byte PNG with font vs 111,068-byte without — glyphs
confirmed present.

New patterns: `public/fonts/` for vendored font files;
`process.cwd()` for asset path resolution in server-only
files.

2 files (public/fonts/banner-font.ttf new + lib/qr.ts updated).
Commit f8a66b4.

ADMIN.57 ✓ — Maintenance Mode estimated restoration time.

`044_maintenance_restoration.sql` (repo root): seeds
`maintenance_estimated_restoration → ''` via `INSERT ... ON
CONFLICT DO NOTHING`. F1: Claude Code initially wrote
`supabase/migrations/044_...sql` — corrected to repo root
(R21 re-confirmation; all migration files in this project
live at repo root, not `supabase/migrations/`).

`lib/actions/setup.ts`: `saveMaintenanceMode()` extended with
4th field. Upsert loop is already data-driven — adding the
4th key to the array was the only change.

`SetupPanel.tsx` `MaintenanceModeSection`: new "Estimated
Restoration Time" input (`maxLength={150}`), new `useState<string>`,
`fd.append()` in `handleSave()`. `SetupPanelInitialValues`
extended.

`setup/page.tsx`: SETUP_KEYS 30→31; new key in `initialValues`
via `settingsMap.get('maintenance_estimated_restoration') || ''`.

`app/crew/maintenance/page.tsx`: fetches new key; conditional
amber box (`border-amber-300 bg-amber-50`) with "Estimated
restoration:" label when non-empty. Zero `dark:` classes added
(light mode only — confirmed via grep).

5 files. Commit pushed.

ADMIN.58 ✓ — Show deletion overhaul.

Migration 045 applied: attendance.show_id FK changed from
ON DELETE NO ACTION to ON DELETE CASCADE; attendance.show_date_id
FK changed from ON DELETE NO ACTION to ON DELETE CASCADE. Verified
via live query: both FKs confirmed confdeltype = 'c' after apply.

deleteShow() in lib/actions/shows.ts rewritten: removed active-
slot-claims guard and attendance-records guard; kept archived-status
guard; added best-effort notifications cleanup via getAdminClient()
(.delete().like('href', '/crew/shows/${showId}%')) before the DELETE
— non-blocking, failure swallowed.

ShowDetail.tsx SettingsTab AlertDialog confirmation text updated:
accurately describes cascade deletion (dates, slot claims including
active commitments, attendance records, calendar events) and states
that credited volunteer hours are unaffected.

3 files + 1 migration. Commit b075a66.

ADMIN.59 ✓ — Dashboard 31-day overhaul + shows cleanup +
archive calendar side-effect.

SeasonAtAGlance.tsx: season selector removed entirely; component
now receives only { timezone: string }; query rewritten to pure
31-day rolling across ALL live shows regardless of season (includes
unseasoned shows); auditions added as combined chronological list
(flag-gated on feature_auditions): published auditions with
date_start within 31 days, merged via discriminated union
{ kind: 'show' | 'audition' }, sorted by earliest date; auditions
render with "Audition" badge + link to /crew/auditions/[id] (no
staffing dots); header permanently "Upcoming (Next 31 Days)"; empty
state "Nothing scheduled in the next 31 days."

QuickStats.tsx: "Upcoming Shows This Month" → "Upcoming Shows (31 Days)"
(calendar-month → 31-day rolling); "Volunteers Needed" → "Volunteers
Needed (31 Days)" (all live shows → shows with at least one date in
next 31 days, two-step: qualifying show IDs → sum open slots).
getVolunteersNeeded() now self-fetches timezone via getOrgTimezone
(supabase) internally.

ShowList.tsx: season groups and Unseasoned group filter out archived/
past shows (only live/draft rendered in main groups); Archived Shows
accordion unchanged; Standing Opportunities link removed from Shows
page header.

lib/actions/shows.ts — updateShowStatus(): archive side-effect
added (cancel future approved calendar events via two-step query);
revalidatePath('/calendar'), /crew/calendar, /crew/calendar/pending
added for all status changes.

dashboard/page.tsx: seasons fetch and all season-derived variables
removed; SeasonSelector import removed; Promise.all 5→3 queries.

Task A finding: SeasonAtAGlance.tsx was not truly self-contained
before ADMIN.59 — it received seasonId, seasonName, selectorSlot
as props from dashboard/page.tsx. The Brief's ADMIN.52 "self-contained"
description was aspirationally correct but factually wrong about the
live implementation. ADMIN.59 makes it accurate.

5 files. Commit a35f771.

ADMIN.60 ✓ — Beta Testing rename + NavOrderSection self-heal +
TopBar icon sizing + orphan cleanup.

"Beta Feedback" → "Beta Testing" across all 5 label locations
(6 sub-edits): types/sidebar.ts HREF_LABELS, Sidebar.tsx NAV_ITEMS
label, SetupPanel.tsx toggle label, settings/page.tsx hub card title,
and both role-branched headings in settings/beta/page.tsx ("Beta Testing"
/ "Beta Testing Queue").

NavOrderSection.tsx: parseNavOrder() extended with self-healing merge
logic identical to resolveGroupHrefs() in Sidebar.tsx — hrefs in
DEFAULT_LINK_ORDER[group] missing from a saved array are appended after
parsing. Closes the gap where the rendered sidebar self-healed but the
Platform Setup reorder UI did not (root cause: stale saved sidebar_nav_order
row missing /crew/settings/beta).

MessagesIcon.tsx, NotificationPanel.tsx, ThemeToggle.tsx: all three
primary action icons standardized to className="w-5 h-5". Mail and Bell
switched from size={20} prop style to className; ThemeToggle bumped
from className="w-4 h-4" (16px) to className="w-5 h-5" (20px).

SeasonSelector.tsx: deleted (zero external references confirmed by grep).
lib/actions/settings.ts: setPinnedSeason() removed (only caller was
SeasonSelector.tsx); 12 other exports preserved.

11 files modified/deleted. Commit 73ef219.

  30BN-ADMIN.47      ✓ Carry-forward cleanup — dead adminRole
                        prop removed from InventoryDetailTabs.tsx.
                        2 files. Commit 678d774.
  30BN-ADMIN.48      ✓ setup/page.tsx ?? → || R18 sweep
                        (15 expressions). 1 file. Commit 9f614a0.
  30BN-BETA.A        ✓ Read-only audit (9 targets). Key
                        findings above. No code. No commit.
  30BN-BETA.1        ✓ Migration 043 + lib/actions/beta.ts +
                        settings/beta page + BetaFeedbackForm.tsx
                        + 5-file flag pattern + sidebar entry.
                        4 new files, 8 modified. Commit a9b1026.
  30BN-ADMIN.49      ✓ resolveGroupHrefs() self-healing sidebar
                        fix + Settings hub hide-not-lock
                        (14 cards, LockedCard removed). 2 files.
                        Commit pushed.
  30BN-ADMIN.50      ✓ Settings access tightening (SA/OA only
                        for hub + audit log) + Inventory Manager
                        conditional sidebar link. 6 files.
                        Commit pushed.
  30BN-ADMIN.51      ✓ settings/page.tsx dead variable cleanup
                        post-ADMIN.50. 1 file. Commit f628541.
  30BN-DOC.88 (Process) ✓ Process v6.0→v6.1 (ADMIN.47–51 + Phase
                        BETA complete — this prompt).
  30BN-ADMIN.52      ✓ SeasonAtAGlance 31-day cap + chrono sort
                        + AnnouncementWidget orange redesign.
                        2 files. Commit 97655be.
  30BN-ADMIN.53      ✓ Notification panel cleanup (visibleNotifications
                        filter, mark-read removes, direct_message
                        excluded) + Season label fix. 2 files.
                        Commit a4dc731.
  30BN-ADMIN.54      ✓ Notifications row cap removed + TipTap
                        click-to-focus fix (dm-editor-wrapper,
                        CSS custom property, onClick).
                        4 files. Commit 32eeebd.
  30BN-ADMIN.55      ✓ Beta Feedback sidebar link hidden from
                        Super Admin (filter after resolveGroupHrefs,
                        before getGroupItems). 1 file.
                        Commit 52a4ae1.
  30BN-ADMIN.56      ✓ QR ribbon redesign + initial font fix
                        (Turbopack build failure — see 56-FIX).
  30BN-ADMIN.56-FIX  ✓ Bundled Inter font at public/fonts/;
                        process.cwd() resolution. Clean build.
                        2 files. Commit f8a66b4.
  30BN-ADMIN.57      ✓ Maintenance estimated restoration time
                        (Migration 044, 5 files). F1: migration
                        path corrected repo root vs supabase/
                        migrations/. Commit pushed.
  30BN-DOC.88 (Brief) ✓ Brief v6.3→v6.4 Part A (§1/§8/§9).
  30BN-DOC.89        ✓ Brief v6.4 Part B (§11/§13).
  30BN-DOC.90 (Process) ✓ Process v6.1→v6.2 (ADMIN.52–57 —
                        this prompt).
  30BN-ADMIN.58      ✓ Migration 045 + deleteShow() single-guard +
                        cascade + AlertDialog text. 3 files + 1 migration.
                        Commit b075a66.
  30BN-ADMIN.59      ✓ SeasonAtAGlance overhaul (31-day, auditions,
                        season removed) + QuickStats 31-day + ShowList
                        filter + updateShowStatus() archive side-effect +
                        dashboard cleanup. 5 files. Commit a35f771.
  30BN-ADMIN.60      ✓ Beta Testing rename + NavOrderSection self-heal
                        + TopBar icons + SeasonSelector deleted +
                        setPinnedSeason() removed. 11 files. Commit 73ef219.
  30BN-DOC.90 (Brief) ✓ Brief v6.4→v6.5 Part A (§1/§8/§9).
  30BN-DOC.91        ✓ Brief v6.5 Part B (§11/§13 — ADMIN.58/59/60).
  30BN-DOC.92        ✓ Process v6.2→v6.3 (this prompt).
  30BN-DOC.96        ✓ Process reduction pass: header
                       condensed to version table (~118
                       lines → ~15 lines); §14 version
                       history tail compressed (~308 lines
                       → ~25 lines); R27 cross-ref claim
                       corrected (Brief R27 is now pointer
                       stub); R32 false label and Brief
                       cross-ref removed; R33 contradiction
                       resolved; DOC.59/88/90 collisions
                       disambiguated in §13; duplicate §10
                       window.location grep check removed.
                       Brief commit: f4403e8.
                       Process commit: 1e4d637.
  30BN-UPSTYLE.1    ✓ Platform Setup four-tab layout
                       (Identity / Communication /
                       Platform / Announcements).
                       CSS-hide pattern (not conditional
                       mount) for NavOrderSection lazy
                       state + AnnouncementSection TipTap
                       useEffect. MaintenanceModeSection
                       relocated in source order (DOM-only,
                       no visual change). StyleSandbox.tsx:
                       SidebarMockup + TopNavMockup imports,
                       JSX, dividers removed. SidebarMockup
                       .tsx + TopNavMockup.tsx deleted.
                       2 files modified, 2 deleted.
                       Commit: 8f7d66d.
  30BN-UPSTYLE.2    ✓ Option A three-zone section card
                       (shaded header / white body / shaded
                       footer + right-aligned Save) applied
                       to all 7 SetupPanel sub-components,
                       Logo + Favicon inline blocks,
                       NavOrderSection (header zone only),
                       AnnouncementSection. cardClasses
                       outer wrapper: overflow-hidden, no
                       bg/padding. Self-caught missing
                       </div> on 5 body zones via interim
                       tsc check. SetupPanelMockup.tsx
                       removed + deleted. 4 files modified,
                       1 deleted. Commit: 7643e57.
  30BN-UPSTYLE.2-FIX ✓ Footer justify-between →
                       justify-end gap-3 across 7 footers
                       in SetupPanel.tsx + 1 in
                       AnnouncementSection.tsx. 2
                       pre-existing justify-between uses
                       (ToggleRow internal + role-selector
                       row) correctly left untouched.
                       2 files. Commit: 714b2c7.
  30BN-UPSTYLE.3    ✓ Media Library rebuilt from
                       pills+table to two-panel
                       sidebar+div-list. w-52 folder
                       sidebar; active folder bg-brand-
                       primary-light (R35-safe, no dark:bg-*
                       pairing). Div-based document list
                       (zero table/tr/td). getBadge(
                       entryType, mimeType) helper: PDF/
                       Video/Image/Link + File fallback.
                       TIER_BADGE_CLASSES updated (Public
                       green, Link Only yellow, Backend
                       gray). Upload File + Add Link moved
                       to document panel toolbar; New Folder
                       kept in page header. MediaLibrary
                       Mockup.tsx removed + deleted.
                       page.tsx: max-w-4xl added.
                       3 files modified, 1 deleted.
                       Commit: 21ec778.
  30BN-UPSTYLE.4    ✓ Communication page (BlastComposer
                       .tsx) both steps restyled. Compose:
                       pill-group recipient tabs (bg-neutral-
                       surface container, sm:w-auto
                       preserved), w-8 h-8 toolbar buttons,
                       flex justify-end footer. Confirm:
                       grid grid-cols-2 summary, orange
                       warning banner (bg-orange-50 border
                       border-orange-200 dark:bg-orange-900/
                       20), Send button fixed to bg-brand-
                       accent hover:bg-brand-accent-dark
                       (pre-existing bug: was hovering to
                       bg-brand-primary-mid). page.tsx and
                       globals.css confirmed no-op (already
                       satisfied). CommunicationMockup.tsx
                       removed + deleted. 2 files modified,
                       1 deleted. Commit: 963ba1d.
  30BN-UPSTYLE.5    ✓ Check-In Dashboard rebuilt. page.tsx:
                       max-w-4xl added. CheckInDashboard
                       .tsx: StatusBadge all branches updated
                       to rounded-full pill badges. Roster
                       table rebuilt from table/tr/td to
                       div-based: role-group headers are
                       bg-neutral-surface bars with role name
                       + derived checked-in count (display-
                       only, no new state). Role column
                       dropped (redundant with group header).
                       Live indicator relocated under show
                       name; gained green animate-pulse dot
                       + 'Auto-refreshing' text; existing
                       RefreshCw, isRefreshing spin state,
                       onClick unchanged; 'Refresh' text
                       label dropped (icon-only, aria-label
                       added). CheckInMockup.tsx removed +
                       deleted. 3 files modified, 1 deleted.
                       Commit: af44b3d.
  30BN-UPSTYLE.5-FIX ✓ Check-In Dashboard card wrapper +
                       accordion token fixes. New inner card
                       wrapper (bg-white border border-
                       neutral-border rounded-lg overflow-
                       hidden p-6 space-y-4) around show
                       name/location + date selector +
                       RosterTable only — outer div (which
                       wraps full component) unchanged.
                       mb-4 removed from show-name and date-
                       selector wrappers. Accordion row:
                       border-divider → border-neutral-border.
                       Accordion header button: bg-gray-50
                       → bg-neutral-surface. 1 file modified.
                       Commit: 1f35e57.
  30BN-UPSTYLE.5-FIX2 ✓ Check-In centered layout + heading
                       zone. page.tsx: max-w-4xl →
                       max-w-4xl mx-auto px-4 py-8
                       (mx-auto was missing — content not
                       centered). Option A heading zone
                       (pb-4 border-b border-neutral-border
                       dark:border-dark-border mb-6) wrapped
                       around h1 + subtitle in page.tsx
                       (heading lives in Server Component
                       shell, not CheckInDashboard.tsx).
                       CheckInDashboard.tsx not modified.
                       1 file modified. Commit: c60758d.
  30BN-DOC.98       ✓ Brief Part A: v6.6 version table row;
                       §8 Platform Setup (tabbed layout +
                       three-zone card); §8 Style Sandbox
                       (count 17→11, inventory updated);
                       §8 Media Library (two-panel, getBadge,
                       TIER_BADGE_CLASSES); §8 Communication
                       (UPSTYLE.4); §8 Check-In (UPSTYLE.5).
  30BN-DOC.99       ✓ Brief Part B: §11 Phase UPSTYLE
                       section added; §11 overview updated;
                       §13 UPSTYLE series + CSS-hide rule +
                       three-zone card + Media Library
                       two-panel documented. Header → DOC.99.
  30BN-DOC.100      ✓ UPSTYLE.5-FIX and UPSTYLE.5-FIX2
                       added to §11 Phase UPSTYLE log.
                       Commits 1f35e57 and c60758d recorded.
  30BN-DOC.101      ✓ Process v6.3→v6.4: UPSTYLE.1–5
                       + fixes in §13; UPSTYLE patterns
                       + CSS-hide + three-zone card +
                       heading zone in §14; header
                       updated. Commit: b85c334.
  30BN-ADMIN.61-AUDIT ✓ Diagnosed 8-day email outage:
                       Resend domain 30byninetyvolunteers
                       .com removed from account; all
                       /emails POSTs returning 403.
                       Found: resend.emails.send() /
                       resend.batch.send() return
                       {data, error} but error was never
                       checked — silent failures logged
                       as success. No code. No commit.
  30BN-ADMIN.61     ✓ Resend error detection. Private
                       sendEmail() + sendBatch() wrappers
                       added to lib/email.ts after Resend
                       client init. Each throws on
                       non-null error field. All 24 raw
                       Resend SDK call sites (21 emails
                       + 3 batch) replaced with wrappers
                       — arguments unchanged. Blast path
                       confirmed: thrown error propagates
                       through sendBlastEmail() existing
                       try/catch → visible UI error.
                       1 file. Commit: e7b34ca.
  30BN-ADMIN.62-AUDIT ✓ Read-only audit of slot claim
                       flow + volunteer signup. Key
                       findings: ClaimForm.tsx used
                       react-hook-form <form> (rebuilt
                       to plain useState + onClick in
                       ADMIN.62); submitClaim() allowed
                       volunteer_id = null (unlinked
                       claims); sendUpdateLinkEmail()
                       takes {to, name, updateToken,
                       volunteerId} destructured object
                       (not positional args); no .or()
                       for identity lookups per explicit
                       codebase convention; notifications
                       .type is text + CHECK constraint
                       (not pg_enum — migration required
                       for new type). No code. No commit.
  30BN-ADMIN.62     ✓ Lookup-first slot claim gate.
                       lib/actions/claims.ts: added
                       lookupVolunteerForClaim(email,
                       phone) — sequential email-then-
                       phone, returns {found,
                       volunteerId, volunteerName};
                       submitClaimWithLookup(input) —
                       creates volunteer then calls
                       submitClaim(knownVolunteerId);
                       race-condition 23505 guard;
                       non-blocking sendUpdateLinkEmail
                       for new volunteers; honeypot
                       fake-success (not visible error).
                       cancelClaimFromCallboard(token,
                       email) wrapper added.
                       submitClaim() extended with
                       optional knownVolunteerId.
                       ClaimForm.tsx rebuilt: dropped
                       react-hook-form → plain useState
                       + onClick (R13.3a); three-state
                       flowState ('lookup'|'found'|
                       'new'); all existing result
                       states preserved. 2 files.
                       Commit: 3927c71.
  30BN-ADMIN.63     ✓ Call Board Upcoming Slots +
                       carry-forward fixes. Q3: honeypot
                       in submitClaimWithLookup() →
                       fake-success. Q2: showDate/
                       showTime threaded from ShowDate
                       Picker.tsx into ClaimForm State
                       2a. Main: lib/data/callboard.ts
                       (new — no 'use server') +
                       getUpcomingClaimsForVolunteer
                       (supabase, volunteerId, email,
                       timezone). UpcomingSlots.tsx
                       (new — Client Component, per-row
                       cancel state). VolunteerCard.tsx:
                       upcomingClaims prop + UpcomingSlots
                       between prefs and Call History.
                       page.tsx: fetches upcoming claims.
                       Dark: variants stripped from
                       public-route JSX (ADMIN.6 rule).
                       4 modified, 3 new. Commit: 77c301c.
  30BN-ADMIN.64     ✓ Editor cancellation notification
                       + volunteer cancellation email.
                       Migration 046 applied (slot_
                       cancellation added to notifications
                       _type_check CHECK constraint —
                       DROP/ADD technique, same as
                       Migration 037). types/notifications
                       .ts: 'slot_cancellation' added.
                       lib/email.ts: sendSlotCancellation
                       Email() added (reuses showDetails
                       BlockHtml()). lib/actions/claims
                       .ts: cancelClaim() — admin_users
                       select email → id; editor email
                       replaced with void IIFE calling
                       createNotification() per editor;
                       sendSlotCancellationEmail() added
                       non-blocking (fires for claimed
                       AND waitlisted cancellations;
                       email_log insert follows).
                       NotificationPanel.tsx: XCircle
                       case for slot_cancellation
                       (exhaustive switch — required).
                       Q1: sendCancellationEditorNotification
                       Email() now dead code (zero call
                       sites) — candidate for cleanup.
                       1 migration, 5 files. Commit: 5b24df6.
  30BN-DOC.102      ✓ Brief Part A: §1 ADMIN.61–64
                       summary; §3 Resend wrappers;
                       §8 lookup-first claim gate +
                       Call Board Upcoming Slots +
                       cancellation email; §9 Migration
                       046.
  30BN-DOC.103      ✓ Brief Part B: §11 ADMIN.61–64
                       prompt log; §13 Resend wrapper +
                       claim gate + notification type +
                       cancellation email patterns;
                       v6.7 version table; header →
                       DOC.103.

  30BN-ADMIN.65    ✓ Public-facing frontend polish.
                     components/public/PublicHeader.tsx (new
                     — Server Component, org logo as plain
                     <img> linked to /, calls resolveOrg
                     Identity(), no orange border). 11 public
                     pages updated: replace per-page header
                     with <PublicHeader />, remove individual
                     resolveOrgIdentity() calls where logo was
                     sole use. 10 pages gain ← Back to Main
                     Page link (all except landing page).
                     VolunteerCard.tsx: call history default
                     open (useState(true)); Edit My Info filled
                     primary Link; Sign Out bordered secondary.
                     UpcomingSlots.tsx: Cancel/Yes cancel/Keep
                     it restyled (red destructive / neutral
                     secondary). app/calendar/page.tsx: header
                     migrated to <PublicHeader />. 14 files.
                     Commit pushed.

  30BN-ADMIN.65-FIX ✓ Logo and favicon revalidation fix.
                     Root cause 1: org logo (external
                     WordPress URL) blocked by next/image
                     remotePatterns (*.supabase.co only).
                     Fix: PublicHeader.tsx + Sidebar.tsx
                     switch from <Image> to plain <img>
                     with eslint-disable suppression (R:
                     any external URL must work across
                     OpenCall OS deployments). Root cause 2:
                     saveLogoUrl() + saveFaviconUrl() missing
                     revalidatePath('/', 'layout') — page-
                     scope call alone does not invalidate
                     generateMetadata() or crew layout
                     Sidebar. Fix: 3–4 revalidatePath calls
                     added to each action per §14 pattern.
                     3 files. Commit pushed.

  30BN-ADMIN.66    ✓ Volunteer home page redesign mockup.
                     components/crew/settings/VolunteerHome
                     Mockup.tsx (new — static mockup: heading
                     zone, intro paragraph, two filled CTA
                     buttons, two-column widget area with
                     Oct 2025 calendar card + signup form
                     card, Upcoming Auditions card, footer).
                     StyleSandbox.tsx: 12th mockup added.
                     Zero dark: classes, named exports,
                     zero live data calls. 2 files.
                     Commit pushed.

  30BN-ADMIN.67    ✓ Restored introductory paragraph.
                     app/page.tsx: "Our volunteers are the
                     heart of every production — from back-
                     stage to the box office. Whatever your
                     talents or time, there's a place for
                     you here." recovered from git history
                     (commit 3602fe6) and restored between
                     heading zone and CTA buttons row.
                     1 file. Commit pushed.

  30BN-ADMIN.68    ✓ Home page h3 + column width fix.
                     app/page.tsx: "Join the {org.org_name}
                     Volunteer Community" h3 restored (text-dark
                     adapted from original text-brand-primary
                     — all-neutral redesign context). Container:
                     max-w-5xl → max-w-6xl. Column split:
                     55/45 → 50/50 (both calendar column and
                     form column ternary value updated).
                     1 file. Commit pushed.

  30BN-ADMIN.69    ✓ Form card header text update.
                     app/page.tsx: "Join Our Volunteer Family"
                     → "Sign Up to Volunteer" — eliminates
                     redundancy with adjacent h3 heading.
                     1 file, 1 line. Commit pushed.

  30BN-ADMIN.70    ✓ CTA buttons centered + filled style.
                     app/page.tsx: justify-center added to
                     buttons row container. Both Links restyled
                     from outlined border to filled brand
                     primary (text-white hover:opacity-90 +
                     style={{ backgroundColor: 'var(--brand-
                     primary)' }} per R33). 1 file.
                     Commit pushed.

  30BN-ADMIN.71    ✓ Show times on per-show claiming page.
                     Date picker buttons and "Roles for [date]"
                     heading now display formatted show time
                     ("Sat, Oct 10, 2026 · 8:00 PM – 10:30 PM"
                     or with no end time). Uses formatWallClock
                     CT() with SSR-guarded body timezone.
                     show_time and end_time were already in
                     the page query — display-only addition.
                     app/shows/[id]/ShowDatePicker.tsx.
                     Commit pushed.

  30BN-UPSTYLE.6-AUDIT ✓ Read-only audit of app/page.tsx,
                     PublicCalendarGrid.tsx, PublicHeader.tsx.
                     Key findings: (1) PublicCalendarGrid
                     cannot be reused directly — all month
                     nav is prop-driven via next/link URLs;
                     clicking prev/next causes full page
                     reload. HomeCalendarWidget approach
                     confirmed. (2) PublicCalendarEvent was
                     a local unexported type in PublicCalendar
                     Grid.tsx — resolved in UPSTYLE.6A by
                     declaring in lib/data/publicCalendar.ts.
                     (3) event pills use truncate — must
                     become line-clamp-2. (4) resolveOrgIdentity()
                     takes zero arguments. (5) timezone variable
                     in app/page.tsx is named tz, not timezone.
                     No code. No commit.

  30BN-UPSTYLE.6A  ✓ Calendar widget infrastructure.
                     lib/data/publicCalendar.ts (new — no
                     'use server'; exports PublicCalendar
                     Event type as canonical home; exports
                     getPublicCalendarEvents(supabase, year,
                     month, timezone) — 3-query event logic
                     extracted verbatim from app/calendar/
                     page.tsx). lib/actions/home-calendar.ts
                     (new — 'use server'; PUBLIC ROUTE; single
                     export getHomeCalendarEvents(year, month)
                     — constructs admin client, calls getOrg
                     Timezone(), delegates to getPublicCalendar
                     Events()). components/calendar/HomeCalendar
                     Widget.tsx (new — 'use client'; useState
                     month nav, no URL params, no next/link for
                     nav; getHomeCalendarEvents() on month
                     change; Option A two-zone card; line-clamp-2
                     on pills replacing truncate; zero dark:
                     classes). app/calendar/page.tsx: 3 inline
                     event queries + transform replaced with
                     single getPublicCalendarEvents() call.
                     F1: PublicCalendarEvent had no importable
                     source — declared in lib/data as new
                     canonical type; structural typing confirms
                     compatibility (tsc clean). 3 new files,
                     1 modified. Commit pushed.

  30BN-UPSTYLE.6B  ✓ Home page two-column layout + /calendar
                     header migration. app/page.tsx: imports
                     HomeCalendarWidget, getPublicCalendar
                     Events, PublicCalendarEvent. Current month
                     computed via formatInTimeZone(new Date(),
                     tz, 'yyyy'/'M'). Calendar fetch gated on
                     flags.calendar. Two-column widget area
                     (flex flex-col xl:flex-row gap-6, max-w-
                     6xl): left xl:w-[50%] HomeCalendarWidget
                     (calendar-gated), right xl:w-[50%] Volun
                     teerForm Option A card ("Sign Up to
                     Volunteer" header). Upcoming Auditions
                     rebuilt as Option A card list below widget
                     area. "View Calendar" button removed
                     (calendar now inline). "View Opportunities"
                     → "Upcoming Volunteer Opportunities".
                     formatWallClockCT import removed (unused
                     after audition date absent from card — Q3
                     carry-forward). components/VolunteerForm
                     .tsx: max-w-xl mx-auto removed from all 3
                     root states (form, success, duplicate).
                     app/calendar/page.tsx: header migrated to
                     <PublicHeader /> (UPSTYLE.6A changes
                     preserved). 3 files modified. Commit pushed.
  30BN-ADMIN.72-AUDIT ✓ Read-only audit for convert-unlinked-
                         claim feature (7 files). Key findings:
                         sendUpdateLinkEmail() copy not reusable
                         (says "you requested" — false for admin-
                         triggered creation); volunteer_phone NOT
                         in slot_claims query (page query extension
                         required); claim field is id not claim_id;
                         canEdit confirmed in scope; sequential
                         duplicate-check pattern reusable from
                         submitClaimWithLookup(). No code. No commit.
  30BN-ADMIN.72       ✓ Convert unlinked slot claims to volunteer
                         records. types/show.ts: volunteer_phone
                         added to SlotClaim. show/[id]/page.tsx:
                         volunteer_phone added to query. lib/audit.ts:
                         slot_claim.convert_to_volunteer added.
                         lib/email.ts: sendClaimConversionEmail()
                         added (branded invite; trigger: volunteer_
                         profile_invite). lib/actions/shows.ts:
                         convertUnlinkedClaim() — idempotency guard,
                         sequential duplicate check, 23505 handling,
                         UPDATE slot_claims.volunteer_id, void IIFE
                         email, logAction, revalidatePath. ShowDetail
                         .tsx: ConvertState per-row Record; canEdit-
                         gated button + confirm/done/error UI;
                         warning still visible to Viewers. About
                         SystemEmails.tsx: volunteer_profile_invite
                         trigger row. 7 files. Commit: d8526c1.
  30BN-ADMIN.73       ✓ VolunteerForm input background tint.
                         components/VolunteerForm.tsx: bg-neutral-
                         surface added to shared inputClasses constant
                         — single edit covers all input + select
                         elements in all form states. No dark: variant
                         (public page — ADMIN.6). 1 file. Commit:
                         934da96.
  30BN-ADMIN.74       ✓ Audition date restored to home page Upcoming
                         Auditions card (formatWallClockCT(audition.
                         date_start, null, 'MMM d, yyyy', tz) — Q1
                         resolved). VolunteerHomeMockup.tsx deleted —
                         Q4 resolved. 2 files modified, 1 deleted.
                         Commit: 7775959.
  30BN-ADMIN.75       ✓ Q-item cleanup batch (Q2/Q3/Q5/Q6). Q2:
                         sendCancellationEditorNotificationEmail() +
                         CancellationEditorNotificationEmailParams type
                         + emailShell() helper all deleted (zero call
                         sites confirmed). Q3: app/cancel/page.tsx
                         migrated to PublicHeader; local Image-based
                         header deleted; OrgIdentity removed; back link
                         added. Q5: feature_beta toggle description
                         corrected in SetupPanel.tsx. Q6: HomeCalendar
                         Widget day-cell min-h increased (trial —
                         may revert after browser verification).
                         4 files. Commit: d8526c1.
  30BN-ADMIN.76-AUDIT ✓ Public calendar UTC boundary bug root cause
                         confirmed (read-only). lib/data/publicCalendar
                         .ts used naive UTC strings (T00:00:00Z,
                         T23:59:59Z) on grid edge dates; timezone param
                         was discarded (void timezone). Admin calendar
                         already solved this with fromZonedTime().
                         No code. No commit.
  30BN-ADMIN.76       ✓ Public calendar UTC boundary fix. lib/data/
                         publicCalendar.ts: import fromZonedTime from
                         date-fns-tz; void timezone removed; rangeStart
                         + rangeEnd computed via fromZonedTime('${dateStr}
                         00:00:00' / '23:59:59', timezone); .gte()/.lte()
                         use .toISOString(). Stale "UTC-anchored" comment
                         removed. Affects HomeCalendarWidget and public
                         /calendar page (both call getPublicCalendarEvents).
                         1 file. Commit: 5bce12b.
  30BN-ADMIN.77       ✓ Callboard shows chronological sort. app/callboard/
                         page.tsx: sortedShows via .slice().sort() by
                         minimum show.dates[].show_date string (ascending).
                         Field names confirmed: show.dates (not show.show_
                         dates), d.show_date (not d.date). sortedShows.map()
                         replaces shows.map(). lib/data/publicCalendar.ts:
                         stale comment remnant removed. 2 files. Commit:
                         ebbc6bf.
  30BN-UPSTYLE.7      ✓ QR Generator page Option A. page.tsx: max-w-4xl
                         container + heading zone. QRGeneratorForm.tsx:
                         three-zone generator card; accent Generate button
                         (R33); white-bg QR preview card below (no dark:
                         override — scanability rule); text download links.
                         QRHistoryPanel.tsx: heading zone; left-accent rows
                         (border-l-4 + inline borderLeftColor); vertical
                         download links. Structural inferences: divide-y
                         removed + overflow-hidden on parent; flex-1 on
                         left content blocks. QRGeneratorMockup.tsx
                         deleted. 4 files modified, 1 deleted.
                         Commit: 27beaff.
  30BN-UPSTYLE.8      ✓ Forums pages Option A. forums/page.tsx: heading
                         zone. ForumIndexClient.tsx: shaded category headers;
                         left-accent forum rows; inline unread pill (replaced
                         right-side pill); description text-xs, no line-clamp.
                         forums/[forumId]/page.tsx: NOW OWNS container +
                         breadcrumb + heading zone (relocated from
                         ThreadListClient.tsx — Server Component shell
                         ownership). ThreadListClient.tsx: container/heading
                         removed; action row justify-end; left-accent thread
                         rows; neutral Pin/Lock icons w-3 h-3; flex-1 on
                         left content blocks. ForumsMockup.tsx deleted.
                         5 files modified, 1 deleted. Committed + pushed.
  30BN-DOC.107        ✓ Brief v6.8→v6.9 (ADMIN.72–77 + UPSTYLE.7–8 —
                         Build Pt 29 complete).
  30BN-DOC.108        ✓ Process v6.6→v6.7 (this prompt).
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
Documented in Brief §13 R23. Referenced here for R-number continuity. Core rule: use `formatWallClockCT()` for bare date column values and constructed date+time strings; use `formatCT()` only for full timestamptz values. See grep check in §10.

**Confirmed 3-argument signature (AUDITIONS.3a/3b/4a — recurring failure mode, caught ×3):**
`formatWallClockCT(dateStr: string, timeStr: string | null, fmt: string): string`
The second arg is `timeStr` (nullable), NOT the format string. Wrong: `formatWallClockCT(date, 'MMMM d, yyyy')`. Correct: `formatWallClockCT(date, null, 'MMMM d, yyyy')`. Confirmed in live `lib/utils/date.ts`.

`time without time zone` columns (e.g. `auditions.time_start` — stored as `'HH:MM:SS'` strings) are NOT ISO date strings — never pass to `formatCT()` or `formatWallClockCT()`. Use a local `formatTime()` helper instead. See §7 for the helper definition and §11 checklist.

### R24 — Nested useFieldArray Requires Its Own Sub-Component (cross-reference)
Documented in Brief §13 R24. Referenced here for R-number continuity. Core rule: nested field arrays in react-hook-form must live in their own named component — not inline in a render loop over a parent field array.

### R25 — Public Submissions Use null admin_id in audit_log (cross-reference)
Documented in Brief §13 R25. Referenced here for R-number continuity. Core rule: logAction() accepts string | null as admin_id; pass null for public-facing actions with no admin session.

### R26 — Roles Belong to show_dates, Not shows (cross-reference)
Documented in Brief §13 R26. Referenced here for R-number continuity. Core rule: volunteer_roles.show_date_id is the FK parent as of Migration 006. Any query for "all roles for a show" must join through show_dates. See grep check in §10.

### R27 — Live Task Tracking Is a Single Persistent Element
The task tracker enabled at the start of a build session is a single element updated in place as work proceeds. It must not be re-emitted or repeated after individual tasks. Claude Code manages the live-update behavior natively. Prompts must not include the instruction to "re-emit the tracker after each step."

Current convention (Phase 12 onward): prompts use "Enable live task tracking for this build:" followed by lettered tasks (Task A, Task B...). Earlier prompts used "Step tracker: ☐ Step 1..." format. Both work; the lettered task format is standard going forward. The core rule is unchanged: one tracker, updated in place, never re-emitted. Established Phase 4 build session.

Note on placement: R27 governs session conduct, not a product or schema decision. It lives here in §14 for the same reason as R16 and R22. Brief §13 R27 is now a pointer stub that defers to this section as the canonical source (condensed DOC.96), matching the R16/R17 pattern.

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

This applies to: `lib/actions/checkin.ts` (Phase 14), `lib/actions/consent.ts` (Phase 15.2),
`lib/actions/rehearsals.ts` (Phase 21), `lib/actions/auditions.ts` (Phase AUDITIONS), and any
future file serving a public route with no session. The comment is not decorative — it is
an architectural invariant that prevents future contributors from adding
`getServerClient()` calls without recognizing the context.

When a domain needs both public-route actions and authenticated admin-session actions,
split them into separate files:
- `lib/actions/[domain].ts` — public route, `getAdminClient()` only
- `lib/actions/[domain]-admin.ts` — authenticated session, `getServerClient()`

Phase 21 confirmed this pattern for the rehearsal domain: `lib/actions/rehearsals.ts`
(public, `getAdminClient()` only) and `lib/actions/rehearsals-admin.ts` (authenticated,
`getServerClient()`). The Brief's original single-file spec for rehearsals was corrected
before build — the Process §7 invariant requires the split regardless of spec wording.

Never merge the two patterns into one file. This is the same principle as the
iCalendar routes (CAL.7) — token-authenticated public routes use `getAdminClient()`
regardless of how the token was issued.

### Owner Admin Role Guard Pattern

See §7 Owner Admin role guard pattern note for full detail. Core rule: after SETUP.0,
operational role guards should pass owner_admin through alongside super_admin. Only the Setup
Panel (/crew/settings/setup), owner_admin / super_admin account creation, and calendar_editor
on Super Admin accounts remain Super Admin exclusive. See §10 grep check and §11 checklist item.

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

`resolveEmailSettings()` (internal to `lib/email.ts`, never exported): Fetches `email_from_address`, `email_from_name`, `org_logo_url`, `org_name`, `org_contact_email`, `brand_primary`, `brand_accent`, and `org_timezone` from `app_settings` in a single query. Returns `{ from: string, logoUrl: string, orgName: string, orgContactEmail: string, brandPrimary: string, brandAccent: string, brandPrimaryLight: string, timezone: string }` with 30BN defaults when keys are absent. `brandPrimaryLight` is derived server-side via `lightenHex(brandPrimary, 0.08)` from `lib/utils/color.ts` — an 8% tint of `brand_primary` (see lightenHex pattern below). `timezone` is the org timezone IANA string fetched from `app_settings.org_timezone`, with `'America/Chicago'` fallback — extended TZ.4b; all send functions that call `formatCT()` or `formatWallClockCT()` now destructure `timezone` and pass it as the final argument. Uses `getAdminClient()` because it is called from multiple contexts: cron routes (no session), `lib/email.ts` send functions (may be called from either context), and server actions. Extended ADMIN.33 (orgName), ADMIN.34 (orgContactEmail), THEME.3 (brandPrimary, brandAccent), THEME.3b (brandPrimaryLight), TZ.4b (timezone). The `FROM_ADDRESS` and `REPLY_TO` module-level constants in `lib/email.ts` were deleted in ADMIN.34 — the 4 payload builders (`buildReminderEmailPayload`, `buildThankYouEmailPayload`, `buildShowBulkEmailPayload`, `buildCategoryMatchNotificationPayload`) now accept explicit `from?: string`, `replyTo?: string`, `brandPrimary?: string`, and `brandAccent?: string` params with inline 30BN string defaults as fallback. All call sites in `lib/actions/shows.ts` and both cron routes pass the dynamic values from their inline `app_settings` fetches. Email client constraint: Email clients do not support CSS custom properties (`var()`) or `color-mix()`. Brand hex values must be string-interpolated at send time — this is distinct from the CSS custom property approach used in the web UI. Never hardcode `#293994` or `#F26522` in email body copy or template helpers; always use the values destructured from `resolveEmailSettings()`.

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
THEME ships, brand-driven colors are backed by CSS custom properties (var(--brand-primary),
var(--brand-accent)) injected in app/layout.tsx. In application code these are consumed via
the @layer utilities classes (bg-brand-primary, text-brand-primary, etc. — see the R33
Enforcement note above), not written as raw var() inline styles; the utility classes resolve
to the custom properties under the hood. The prohibition is on the OLD static Tailwind brand
tokens (bg-navy, text-orange, etc.), which resolve to hardcoded hex values in @theme and never
respond to app_settings color changes — not on the bg-brand-primary utility class family,
which is the correct current pattern and is consistent with the Enforcement note above. The
@theme block in globals.css is NOT modified (R7 still applies). Phase THEME.A audited all
current usages before any replacements were made. Enforced from THEME.1 onward.

### R34 — All Non-Core Features Must Be Built Flag-Ready (cross-reference)

Documented in Brief §13 R34. Referenced here for R-number continuity. Core rule: any new
non-core feature must be built flag-ready at initial build time — not retrofitted. Flag-ready
requires: (1) feature_X seeded in migration; (2) getFeatureFlags() updated; (3) proxy.ts
route block; (4) sidebar conditional; (5) public route 404 when off; (6) action-level early
return. Core features (volunteer management, show/slot management, user management, forms,
media library, hours, opportunities, Call Board) are never flagged. Current flagged features:
`feature_calendar`, `feature_checkin`, `feature_blast`, `feature_rehearsals` (Phase 21), `feature_auditions` (Phase AUDITIONS). Enforced from SETUP.4 onward.
See §11 checklist for the required verification item.

### R37 — admin_users.id = auth.uid() for RLS Policies (cross-reference)

Documented in Brief §13 R37 (added v4.5). Referenced here for R-number continuity. Core rule: `admin_users.id` is the Supabase Auth UUID — there is no separate `auth_user_id` column. RLS policies that self-scope to the calling admin must use `admin_user_id = auth.uid()` directly for FK columns referencing `admin_users.id`, or `id = auth.uid()` for the `admin_users` table itself. Never reference a non-existent `auth_user_id` column.

Confirmed failure mode (21.1 F1): Migration 031 draft used `auth_user_id = auth.uid()` in Production self-scoping RLS policies. Schema verification (R2) confirmed the column does not exist. Corrected to `admin_user_id = auth.uid()` before applying. See §7 for the full pattern note and code examples.

### R38 — TipTap Merge Tag Extension Pattern (cross-reference)
Documented in Brief §13 R38. Referenced here for R-number continuity. Core rule: merge tag tokens (`{{tag_name}}`) in TipTap email template editors use a custom `Node` extension (`MergeTagExtension.ts`) with `inline: true`, `atom: true`, `data-merge-tag` attribute round-trip, and an `insertMergeTag(tag)` command registered via TypeScript module augmentation (`declare module '@tiptap/core'`). Substitution at send time via `substituteMergeTags()` from `lib/utils/merge-tags.ts`. Preview via `previewAuditionEmailTemplate()` server action. `escapeHtml()` applied inside `substituteMergeTags()` to all substituted values — TipTap HTML body itself is NOT escaped (same exception as blast body, R31). All TipTap editor instances in App Router require `immediatelyRender: false` (see §7 and §11). Established AUDITIONS.4a.

### Migration / Live DB Drift — Follow-Up Migration Required
When inline schema fixes are applied via Supabase MCP during a build (bypassing a named .sql migration file), they create drift between committed migration files and the live database. This is documented as a confirmed failure mode from Phase AUDITIONS (5 inline fixes applied without a follow-up file). Full pattern in §7. Quick rule: every inline fix must be flagged in the build report, Q-itemmed for follow-up, and captured in a named migration file before the next phase launch. The Brief §9 migration status block must be updated to reflect inline fixes. Established Phase AUDITIONS.

**Dark mode cascade defect — architectural note (ADMIN.35-AUDIT):**
In Tailwind v4 with `@tailwindcss/postcss`, hand-authored `@layer utilities` rules compile AFTER Tailwind's auto-generated utilities in the PostCSS output. This means: if a hand-authored class (e.g. `bg-brand-primary-light`) and a Tailwind dark-variant class (e.g. `dark:bg-dark-bg`) appear on the same element, the hand-authored class wins in dark mode due to source order — even though the dark variant is active. Both have equal specificity (0,0,1,0); last-in-cascade wins.

Confirmed diagnosis (ADMIN.35-AUDIT): the `app/crew/(app)/layout.tsx` main content wrapper had `bg-brand-primary-light dark:bg-dark-bg` — `bg-brand-primary-light` (8% brand/92% white blend) compiled at line ~2880 of the PostCSS output; `dark:bg-dark-bg` compiled at line ~2362. The hand-authored class won, rendering an off-white background in both light and dark mode.

**Fix pattern for layout wrappers:** Replace `bg-brand-primary-light` with a native Tailwind static neutral (`bg-gray-50`) on elements where true dark mode background switching is required. Native Tailwind pairs (`bg-gray-50 dark:bg-dark-bg`) are both auto-generated and Tailwind handles their ordering correctly.

**Broader defect:** ~74 lines across ~50 files share this pattern (table headers, cards, badges, button hover states). Full cascade sweep scheduled as ADMIN.39. Do not introduce new `bg-brand-primary-light dark:bg-dark-*` pairings on layout-level elements until the sweep is complete and a structural resolution is in place.

**`editNote()`/`deleteNote()` role guard — confirmed correct (ADMIN.39-AUDIT F4, July 2026):**
`editNote()` and `deleteNote()` in `lib/actions/volunteers.ts` correctly use `!['super_admin','owner_admin'].includes(admin.role)` — Editors are explicitly excluded. This is intentional and was re-confirmed as the correct design in ADMIN.39-AUDIT F4. Two reasons:
1. **RLS layer:** `volunteer_notes` UPDATE/DELETE policies (Migration 028) only cover `is_super_admin_or_owner_admin()`. Adding Editor to the app-layer guard without a matching migration would produce a confusing silent failure — Editor passes the server action guard but Supabase RLS filters the operation to 0 rows, causing a misleading error state.
2. **Design intent:** Brief §8/§9 confirm notes as "append-only for Editors." `addNote()` is Editor-accessible; `editNote()`/`deleteNote()` are not.
Do NOT change these guards to include Editor. If this permission model is ever revisited, a migration granting `is_editor()` UPDATE/DELETE on `volunteer_notes` is required alongside any app-layer guard change.

**R35 — Never pair hand-authored `@layer utilities` classes with native Tailwind dark: utilities on the same CSS property (established ADMIN.39-AUDIT / ADMIN.39a–c):**

This is the formal rule derived from the architectural note above. The note explains the problem; R35 defines what to do instead.

WRONG — will silently break dark mode:
```
className="bg-brand-primary-light dark:bg-dark-bg"
```
`bg-brand-primary-light` (hand-authored, @layer utilities, ~line 2880 in compiled output) beats `dark:bg-dark-bg` (native, ~line 2362) because last-in-cascade wins at equal specificity.

CORRECT option A — both native Tailwind (preferred for layout wrappers and structural backgrounds):
```
className="bg-gray-50 dark:bg-dark-bg"
```
Both auto-generated; Tailwind handles their ordering.

CORRECT option B — both hand-authored in correct order in globals.css @layer utilities block (preferred for brand-colored interactive elements):
Define the base class first, then define the override using the `&:where([data-theme="dark"], ...)` selector after it. See globals.css lines ~73–97 for correct examples.

CORRECT option C — hand-authored dark: text variant:
```
className="text-brand-primary dark:text-brand-primary-mid"
```
`dark:text-brand-primary-mid` is hand-authored after its base class in globals.css — correctly ordered. Do NOT use `dark:text-dark-text` (native — loses to hand-authored `text-brand-primary` via cascade).

Known exception: `components/crew/shows/ShowDetail.tsx` ~line 421 — `bg-brand-primary-light` intentionally preserved with no dark: override (brand-colored badge in all modes; its incorrect `dark:bg-dark-nav` was removed in ADMIN.39b).
Known residual: `OpportunityForm.tsx:99,115` → ADMIN.40.

Use the §7 substitution table and governing hover rule when replacing any affected class.

### `lib/data/*.ts` Data Module Convention — No 'use server' (confirmed FORUMS.3)

Data utility modules in `lib/data/` accept a supabase client as a parameter and never
construct their own. They must NOT have a `'use server'` directive at the top.

**Why the constraint matters:** `'use server'` designates a file as a React Server
Action module — all exported functions become callable as server action endpoints.
Adding `'use server'` to a `lib/data/` file makes its internal helper functions
publicly invocable as server actions, which is wrong. Data helpers are not actions;
they are internal utilities called by action files.

**Correct split:**
- `lib/data/forums.ts` (no `'use server'`) — pure data logic; `getForumIndexData(admin, supabase)`, `canAccessForum(forumId, admin, supabase)`, etc.
- `lib/actions/forums.ts` ('use server') — constructs client, calls data helpers, revalidates paths

The `lib/data/*.ts` parameter-passing pattern was established in Phase 15.1
(lib/data/checkin.ts, lib/data/showReport.ts) and extended in Phase FORUMS. Both
files from Phase 15.1 are also 'use server'-free. This constraint was never
explicitly documented before FORUMS.3 surfaced it as a quality gate check. It is
now a standing rule for all future `lib/data/` files.

Quality gate: include this grep in any prompt that creates a new `lib/data/*.ts` file:
```bash
grep -n "use server" lib/data/[newfile].ts
# Must return zero results
```

### Forum Access Control — TypeScript-Join Pattern Applied to Access Control Logic (FORUMS.3)

The forum access model uses a TypeScript-join approach rather than Supabase PostgREST
filters because the three-way OR access check (role grant OR group membership OR
individual grant) cannot be expressed in a single `.select()` filter call. Group
membership requires a JOIN on `forum_user_group_members` that cannot be combined
with OR conditions on other grant types in PostgREST syntax.

**The pattern:**
```typescript
// Step 1: Fetch all grants for the target forum
const { data: grants } = await supabase
  .from('forum_access_grants')
  .select('grant_type, role, group_id, admin_user_id')
  .eq('forum_id', forumId)

// Step 2: Fetch the user's group memberships
const { data: memberships } = await supabase
  .from('forum_user_group_members')
  .select('group_id')
  .eq('admin_user_id', admin.id)

// Step 3: Resolve the OR in TypeScript
const userGroupIds = new Set(
  (memberships || []).map(m => m.group_id))
return (grants || []).some(grant => {
  if (grant.grant_type === 'role')
    return grant.role === admin.role
  if (grant.grant_type === 'group')
    return grant.group_id && userGroupIds.has(grant.group_id)
  if (grant.grant_type === 'individual')
    return grant.admin_user_id === admin.id
  return false
})
```

SA/OA bypass: return `true` immediately without querying grants. The RLS on `forums`
is `authenticated SELECT` (all admins can read forum rows) — the access filtering
is entirely at the application layer.

This is a confirmed extension of the two-fetch-plus-TypeScript-join pattern from §7
(established INVENTORY.4) applied to access control rather than data enrichment.

### `buildEmailHtml()` and `logEmailSent()` Signatures Must Be Read From Live File (FORUMS.5 Q1)

When writing any new function in `lib/email.ts`, the prompt pseudocode or planning
description may assume parameter names or shapes that do not match the live function
signatures. Confirmed failure in FORUMS.5: the planned pseudocode incorrectly assumed
`buildEmailHtml()` accepted `brandAccent` and `brandPrimaryLight` as top-level
distinct params, and that `logEmailSent()` accepted `{ trigger, recipientEmail,
recipientType, sentBy }`. The actual signatures differ.

**Required pre-write step:** Before writing any new `lib/email.ts` function, run:
```bash
grep -n "function buildEmailHtml\|function logEmailSent\|function buildCtaButton\|function escapeHtml" lib/email.ts
```
Then view those function definitions to read the exact parameter shapes. Never infer
signatures from the pattern description alone — the live file is authoritative.

This applies to all internal helpers in `lib/email.ts` (`buildEmailHtml()`,
`logEmailSent()`, `buildCtaButton()`, `escapeHtml()`). A signature mismatch produces
a tsc error but — more dangerously — may only surface at the TypeScript compile
step, not during planning or code review.

**Phase STYLE — token naming, left accent, and class
literal discipline (STYLE.A/STYLE.6/STYLE.3):**

Three key pattern confirmations from Phase STYLE that apply
to all future prompts:

1. `@theme` token naming: always use `--color-` prefix for
   color tokens in `globals.css @theme`. Without it,
   Tailwind v4 generates no utility classes. (STYLE.A F3)

2. Left border accent: use `border-l-4` (Tailwind width) +
   `style={{ borderLeftColor: 'var(--token)' }}` (inline
   color). Never combine with `border-{color}` class as it
   overrides all four sides. (STYLE.6)

3. Hardcoded class literals: every Tailwind class must
   appear as a complete unbroken string in source. Computed
   parts — even from string literals — make classes
   invisible to the content scanner. (STYLE.3/STYLE.6)

**`createNotification()` supabase-client-as-parameter
pattern (NOTIFY.2):**
Extends the client-as-parameter pattern established in CAL.3
(`syncShowDateToCalendar(showDateId, supabase)`). The
`createNotification()` helper in `lib/utils/notifications.ts`
accepts the supabase client as a parameter from the calling
server action. The caller constructs the client once
(`getServerClient()` or `getAdminClient()` as appropriate for
the action file) and passes it in. The helper never constructs
its own client. This is correct for any utility function
called from both authenticated-session and public-route
action files.

**Ephemeral vs. persistent notification track distinction
(NOTIFY.1/NOTIFY.2):**
Two tracks compose the notification system. Track A (ephemeral):
derived via live SELECT COUNT queries from existing tables at
render time; clears when the underlying queue item is resolved
by admin action; no `notifications` table row; no
`createNotification()` call. Track B (persistent): written to
`notifications` table at event time via `createNotification()`;
per-user `read_at`; individually dismissible; cleared per-user
when dismissed. A third hybrid track (forum unread sidebar badge)
is derived from `forum_post_reads` and is separate from both.
The TopBar bell badge total = ephemeral + persistent unread
(forum unread is excluded — it has its own sidebar badge).

**`resolveCalendarRecipients()` and other private unexported
helpers in 'use server' files (NOTIFY.3):**
An unexported `async function` in a `'use server'` file is a
module-private utility — NOT a server action endpoint. The
Next.js/Turbopack `'use server'` export constraint applies only
to exported symbols. Unexported async functions in `'use server'`
files are correct and safe. Standing examples in this codebase:
`assertAuditionAccess()` in `lib/actions/auditions-admin.ts`,
`isModeratableBy()` in `lib/actions/forum-moderation.ts`,
`resolveCalendarRecipients()` in `lib/actions/calendar.ts`.
Do NOT export these functions — exporting a non-async-function
value would violate the `'use server'` constraint; exporting
an async function would promote it to a public server action
endpoint, which these helpers are not.

### SetupPanel.tsx Feature Flag Toggle Pattern (confirmed MESSAGES.3 F1)

`SetupPanel.tsx` has no `<form>` element (R13.3a — no form elements in Client
Components). Feature flag values are submitted by calling
`fd.append('feature_[key]', enabled ? 'true' : 'false')` in `handleSave()`.
There are no hidden inputs.

When adding a new feature flag toggle to Section 6, four changes are required:
1. State declaration: `const [xyzEnabled, setXyzEnabled] = useState(initialValues.feature_xyz === 'true')`
2. `ToggleRow` JSX in Section 6 (`label`, `description`, `enabled={xyzEnabled}`, `onToggle`)
3. `SetupPanelInitialValues` type widening: add `feature_xyz: string` (type declared in `SetupPanel.tsx`, not in `setup/page.tsx`)
4. `fd.append('feature_xyz', xyzEnabled ? 'true' : 'false')` in `handleSave()`

The `fd.append()` call is the only path for the value to reach `saveFeatureFlags()`. Its absence produces a silent runtime failure — the value is never sent, the build compiles cleanly, TypeScript raises no error. Missing it is indistinguishable from success until the feature flag actually needs to be toggled in production.

Note: `setup/page.tsx` also needs `'feature_xyz'` added to `SETUP_KEYS` and `feature_xyz: settingsMap.get('feature_xyz') || 'false'` to the `initialValues` object — but the `SetupPanelInitialValues` type itself lives inside `SetupPanel.tsx` and is imported by `setup/page.tsx`. The type widening happens in `SetupPanel.tsx`.

### Sidebar.tsx Prop Addition — Both Interface and Destructuring (confirmed MESSAGES.3 F3)

Adding a prop to `Sidebar.tsx` requires changes in two locations, not one:

1. **TypeScript interface** (prop type declaration):
```typescript
interface SidebarProps {
  // existing props
  messagesUnreadCount?: number  ← ADD HERE
}
```

2. **Destructured parameter list** (function signature):
```typescript
export default function Sidebar({
  admin,
  flags,
  org,
  forumUnreadCount = 0,
  messagesUnreadCount = 0,  ← AND HERE with default
}: SidebarProps) {
```

The default value in the destructuring brings the prop into scope as a variable. Without it, the prop is declared in the interface but never destructured — any JSX reference like `{messagesUnreadCount}` raises TS2304 ("Cannot find name 'messagesUnreadCount'"). The error surfaces in JSX, not at the interface definition.

Pattern established: `forumUnreadCount = 0` (NOTIFY.2). Confirmed: `messagesUnreadCount = 0` (MESSAGES.3 F3). Apply this pattern to any future count or optional prop added to Sidebar.

### `NotificationCounts` Expansion — `EMPTY_COUNTS` Cascade (confirmed MESSAGES.2 F1)

`lib/actions/notifications.ts` contains an `EMPTY_COUNTS` constant — a fallback
zero-value literal for the `NotificationCounts` type. Its structure must remain
complete for the type at all times. When a new field is added to `NotificationCounts`
in `types/notifications.ts`, TypeScript raises TS2741 (missing required property)
on `EMPTY_COUNTS` because the constant no longer satisfies the type.

This cascade is **predictable and pre-plannable**. Any prompt that expands
`NotificationCounts` must include `EMPTY_COUNTS` as a required modification.
Check current state: `grep -n "EMPTY_COUNTS" lib/actions/notifications.ts`.

Confirmed fields added and their cascades:
- `messageUnread: number` (MESSAGES.2) → `EMPTY_COUNTS` updated same prompt

When writing the prompt plan for any `NotificationCounts` expansion, include
the `EMPTY_COUNTS` update explicitly in the edit list — do not leave it for
self-catching at TypeScript verification time (it will be caught, but it delays
the build unnecessarily).

### Style Sandbox Text Color Tokens vs. Live Production System (confirmed MESSAGES.4 F1)

The Style Sandbox mockup files use Tailwind static tokens for text color:
- Headings: `text-gray-900 dark:text-white`
- Subtitles: `text-gray-500 dark:text-gray-400`

These are **not** part of the live production token system. The live convention
for crew admin pages (confirmed from Forums, Audit Log, Volunteers, Settings, and
all active production crew pages):
- Headings: `text-dark dark:text-dark-text`
- Subtitles/descriptions: `text-mid-gray dark:text-dark-muted`

When building production pages using the Style Sandbox as a design reference:
- **Use from sandbox:** container classes, hover classes, border classes, layout patterns (these reference live tokens: `border-neutral-border`, `hover:bg-neutral-surface dark:hover:bg-dark-nav`, `bg-white dark:bg-dark-surface`, etc.)
- **Do NOT use from sandbox:** `text-gray-*` classes for any heading or subtitle

Replace sandbox text classes with live production convention before committing.

**STYLE-ROLLOUT implication:** Phase STYLE-ROLLOUT cannot apply sandbox classes verbatim to production files. The rollout prompt must explicitly map sandbox text tokens → production text tokens as a reconciliation step before any global class replacement. Applying `text-gray-900` to production headings would break dark mode text on every admin page that is swept.

### Private Messaging — DM Privacy Model and `getServerClient()` Exclusivity (established MESSAGES.2/MESSAGES.3)

All read and write operations on the four Phase MESSAGES tables (`message_threads`,
`thread_replies`, `thread_reads`, `thread_reply_attachments`) must use
`getServerClient()`. The privacy model depends entirely on RLS enforcement —
`getAdminClient()` bypasses RLS and would expose any user's DM threads to any
authenticated caller regardless of role.

**`getAdminClient()` is permitted only in these two confined uses within `lib/actions/messages.ts`:**

1. Inside void IIFEs for `createNotification()` — notification inserts require
   the service role because the notification is written for another user (not
   `auth.uid()`):
```typescript
   void (async () => {
     try {
       const adminSupabase = getAdminClient()
       await createNotification(recipientId, 'direct_message', ..., adminSupabase)
       await sendDirectMessageEmail({ ... })
     } catch {}
   })()
```

2. `sendDirectMessageEmail()` → `resolveEmailSettings()` uses `getAdminClient()`
   internally (established pattern for `app_settings` helpers — no change needed
   at the call site).

Any `getAdminClient()` call outside void IIFEs in message action files is a
privacy violation. This constraint must be reviewed when adding any new message
action or extending existing ones.

**`thread_reads` SELECT policy intentional asymmetry (confirmed MESSAGES.1 — R2 verification):**
The `thread_reads` table's SELECT RLS policy allows BOTH participants in a thread
to read all read records for their shared thread:
```sql
CREATE POLICY message_threads_reads_select ON thread_reads
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
        AND (creator_id = auth.uid() OR recipient_id = auth.uid())
    )
  );
```
This is NOT a mistake. It is required for read receipts: each participant must be
able to read the other's `last_read_at` to compute and display "Read [time]" in
the thread view. The policy comment in Migration 037 explicitly marks this as
INTENTIONAL ASYMMETRY. Do not "fix" it to self-only scoping in any future sweep.

**Additional DM behavioral patterns:**

Sender mark-as-read (both `createThread()` and `createReply()`): after inserting
the reply row, immediately upsert `thread_reads` for the sender with
`last_read_at = new Date().toISOString()`. This prevents the sender's own message
from appearing in their unread count. The upsert must happen AFTER the reply insert
so `last_read_at >= last_reply_at` is guaranteed at the time of upsert.

`createReply()` archive resurfacing: when a new reply is sent, clear the OTHER
participant's `archived_at` column — not the sender's. This resurfaces archived
threads in the other person's Inbox automatically. The correct field is
`creator_id === admin.id ? 'recipient_archived_at' : 'creator_archived_at'`.
Setting the wrong column silently archives the sender's own thread.

### `@tailwindcss/typography` Is Not Installed — Arbitrary CSS Variant Selectors for TipTap HTML (confirmed MESSAGES.5/MESSAGES.6)

`@tailwindcss/typography` is not installed in this project. The `prose`, `prose-sm`, `prose-invert`, and `dark:prose-invert` classes appear in existing files (`ThreadViewClient.tsx`) but produce zero CSS output — they are completely inert without the plugin.

For any new production page that renders TipTap-generated HTML via `dangerouslySetInnerHTML`:
Use Tailwind arbitrary CSS variant selectors. The confirmed pattern for DM reply bodies (MESSAGES.5):

```tsx
className="text-sm text-dark dark:text-dark-text leading-relaxed
  [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
  [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-0.5
  [&_strong]:font-semibold [&_em]:italic
  [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-border
  [&_blockquote]:pl-3 [&_blockquote]:text-mid-gray
  [&_a]:text-brand-primary [&_a]:underline [&_hr]:my-3"
```

Do not copy `prose` class usage from `ThreadViewClient.tsx` (forum post bodies) — those are the same inert classes. This is a pre-existing gap that STYLE-ROLLOUT or a future ADMIN prompt should address holistically. Until then, use arbitrary selectors for all new TipTap HTML rendering.

### `forwardRef` + `useImperativeHandle` for Reusable Editor Components (established MESSAGES.6)

When a TipTap editor with attachment support must be shared across multiple parent components, use `forwardRef` + `useImperativeHandle` instead of prop drilling or duplicating editor setup.

The pattern:
- Define and export the handle interface (`DirectMessageComposerHandle`) so TypeScript catches call-site errors
- The component wraps with `forwardRef<Handle, Props>(function Name(props, ref) { ... })`
- `useImperativeHandle(ref, () => ({ ... }))` exposes the controlled API
- Parents use `useRef<DirectMessageComposerHandle>(null)` and call `composerRef.current?.getBody()` etc. in submit handlers

Key details:
- The handle interface must be a named export (not inline) for TypeScript safety at every call site
- `editor?.commands.clearContent()` in `clear()` — optional chain needed (editor may be null)
- `editor.getText().trim().length === 0` in `isEmpty()` — more robust than `body === '<p></p>'`
- The component is still `'use client'` and still follows `immediatelyRender: false` + explicit `Editor | null` typing

Established `DirectMessageComposer.tsx` MESSAGES.6. Apply to any future shared rich-text component where multiple parents need independent submit control.

### Prop Typed But Not Destructured — Latent Dead Prop Pattern (confirmed MESSAGES.7)

When a prop is declared in a component's TypeScript type annotation but not included in the destructured parameter list, it is silently dropped — the parent's value never reaches the component body. No TypeScript error is thrown anywhere in the chain.

Confirmed pre-existing instances (fixed MESSAGES.7):
- `AuditionDetailTabs.tsx`: `adminId: string` in type, absent from destructured params
- `ShowDetail.tsx`: same issue

Detection during Task A audit:
```bash
grep -n "\badminId\b" components/crew/auditions/AuditionDetailTabs.tsx
# If it only appears on the type annotation line and nowhere else — dead prop
```

Fix: Add the prop name to the function's destructured parameter list. This is the prerequisite for threading the prop into sub-components.

Prevention: In any Task A audit step that reads a component's prop interface, immediately check whether each prop in the type also appears in the destructured parameter list. This gap is common when a prop is added to a type during planning but the destructuring is forgotten, or when a refactor removes the body usage without cleaning up the type.

### Sub-Component Prop Threading Chain for Tabbed Detail Views (established MESSAGES.7)

Tabbed detail components with inline sub-components require explicit prop threading through all levels. The full chain for adding `adminId` + `messagesEnabled` to a deeply nested sub-component:

1. Parent page (`/auditions/[id]/page.tsx`): add `adminId={admin.id}` + `messagesEnabled={flags.messages}` to `<AuditionDetailTabs />`
2. Top-level component type (`AuditionDetailTabs`): add to type annotation
3. Top-level component destructuring: add to destructured params (see latent dead prop pattern above)
4. Sub-component call site: add `adminId={adminId}` + `messagesEnabled={messagesEnabled}` to `<SettingsTab />`
5. Sub-component inline type + destructuring: add to both

Missing any level = silent prop drop with no TypeScript error at the missed level. TypeScript only catches the gap when the variable is referenced in the deepest component.

Task A requirement for any build touching deeply nested components:
Read BOTH the top-level component AND the sub-component's prop types and destructuring before planning any edits. Confirm all five levels are covered in the edit plan. Established ×3 MESSAGES.7 (RosterTab/AuditionDetailTabs SettingsTab/ShowDetail SettingsTab).

### Complex Build Execution — Direct Terminal Required, No Sub-Agent Delegation

Claude Code's automatic sub-agent delegation mode — where it creates an autonomous background process for a task — bypasses the per-task read-before-write discipline this project depends on. In sub-agent mode, Task A audit findings may be skipped or not carried forward correctly to subsequent edit steps. The build may succeed but with planning assumptions rather than live-file-confirmed values in every str_replace.

For any build involving: multiple new files, TipTap editor instances, inter-component prop threading, attachment pipelines, or significant TypeScript typing complexity — include this instruction explicitly at the top of the prompt before the fenced code block:

Execute this prompt directly in the terminal. Do not delegate to a subagent.
Complete Task A fully and stop — report findings before proceeding to Task B.

The mid-prompt "wait for confirmation" instruction after Task A is equally important — it forces the Task A findings to be surfaced before any code is written, enabling the planning session to review them and catch discrepancies before they become build defects. Established MESSAGES.5 (MESSAGES.5 was initially sub-delegated before this instruction was added; all subsequent MESSAGES prompts included it explicitly).

**`getOrgTimezone()` / `document.body.dataset.timezone` pair — Phase TZ:**

The established org timezone distribution pattern after TZ.1:

Server-side (Server Components, Server Actions, route handlers, cron routes):
```typescript
import { getOrgTimezone } from '@/lib/utils/org-timezone'
const tz = await getOrgTimezone(supabase) // any client
```

Client-side (Client Components):
```typescript
const tz = typeof document !== 'undefined'
  ? (document.body.dataset.timezone || 'America/Chicago')
  : 'America/Chicago'
```

The SSR guard is required because Next.js renders Client Components on the server
during the initial pass — `document` does not exist in that context.

`lib/utils/org-timezone.ts` must NOT have `'use server'` — it exports
`TIMEZONE_OPTIONS` (a plain array constant). Exporting a non-function value from
a `'use server'` file causes a Vercel build failure (FORUMS.5-FIX constraint).
The file is a pure utility module in the same class as `lib/utils/color.ts` and
`lib/utils/phone.ts`.

**`resolveLayoutSettings()` renamed from `resolveBrandColors()` — TZ.1:**
The function `resolveBrandColors()` in `app/layout.tsx` was renamed to
`resolveLayoutSettings()` in TZ.1 and extended to also fetch and return
`org_timezone`. Its values are bound as `brand.primary`, `brand.accent`, and
`brand.timezone` in the template literal — never as flat local variables. Any
future extension of this function must maintain this binding convention. Do not
reference `resolveBrandColors()` in new prompts — use `resolveLayoutSettings()`.

**`formatCT()` / `formatWallClockCT()` optional timezone parameter — TZ.1:**
Both functions' signatures now end with an optional `timezone?: string` parameter
defaulting to `'America/Chicago'`. The parameter is ALWAYS LAST — changing its
position would break all existing call sites. The default preserves backward
compatibility for all 165 pre-TZ call sites. New call sites and Phase TZ sweep
updates must pass the resolved `tz` explicitly. Never insert timezone in any
position other than the last argument. Cross-reference: §7 pattern note.

**Client-before-usage reordering — Phase TZ recurring pattern:**
Adding `getOrgTimezone()` to a function that constructs its Supabase client
lazily (after the first operation) requires reordering so the client comes first.
Confirmed across TZ.2 (`calendar.ts` 3 functions, `app/calendar/page.tsx`,
`app/crew/(app)/calendar/page.tsx`) and TZ.4b (`lib/actions/checkin.ts` 2
functions). The client constructors (`getServerClient()`, `getAdminClient()`) have
no ordering dependency — they may be moved to the top of any function body safely.
Always audit the function's current client construction position before inserting
a `getOrgTimezone()` call.

**Refs are not reactive in JSX — `onEmptyChange` callback pattern (ADMIN.46):**
Reading a ref value (e.g. `composerRef.current?.isEmpty()`) directly in a JSX
attribute expression (e.g. `disabled={composerRef.current?.isEmpty()}`) produces
a stale value. Refs are mutable containers that do not trigger re-renders when
their content changes. The `react-hooks/refs` ESLint rule correctly flags this.

Correct pattern: add an `onEmptyChange?: (isEmpty: boolean) => void` callback prop
to the shared editor component. Fire it via TipTap's `onCreate` and `onUpdate` hooks
whenever the editor's empty state changes. In the parent component, declare a
`const [isComposerEmpty, setIsComposerEmpty] = useState(true)` state variable and
pass `onEmptyChange={setIsComposerEmpty}`. Use `isComposerEmpty` in `disabled={}`.

This pattern applies to any shared editor component that multiple parents need to
query for content state. Confirmed failure mode: the `ComposeForm.tsx` and
`ReplyComposer.tsx` Send buttons were using stale ref reads — could have been
wrong in either direction (stuck disabled or stuck enabled). Fixed ADMIN.46.

**`lib/utils/ical.ts` is fully EXEMPT from Phase TZ (confirmed TZ.A/TZ.2):**
Despite initial planning assumptions, `lib/utils/ical.ts` has zero timezone
coupling. It formats every DTSTART/DTEND as `yyyyMMdd'T'HHmmss'Z'` (UTC instant
with Z suffix). No TZID parameter. No VTIMEZONE block. No `'America/Chicago'`
reference. All its functions (`generateVEvent()`, `wrapInCalendar()`,
`buildClaimICalEvent()`, `buildAdminCalendarEvents()`) operate on already-resolved
UTC Date objects. The only Phase TZ change in the iCal pipeline was in
`app/api/calendar/claim.ics/route.ts` — upstream of `lib/utils/ical.ts` — where
wall-clock show times are converted to UTC via `fromZonedTime(date, tz)` before
being passed to the iCal builder. Do not attempt to add timezone parameters to
`lib/utils/ical.ts` — it is correctly and intentionally timezone-agnostic.

**`useNowPosition()` hook — timezone as a genuine dep, not an exemption
(TZ.5b):**
The `useNowPosition(days, timezone)` hook in `UnifiedWeekGrid.tsx` wraps the
current-time red-line position computation. `timezone` is added to the
`useEffect` dependency array — this is intentional and correct. The existing
`// eslint-disable-next-line react-hooks/exhaustive-deps` comment is for
the `days` exclusion only (days changes at every render due to object identity;
adding it would cause an infinite loop). `timezone` is a stable string value
that genuinely should trigger a re-run when changed. Never add `timezone` to
the disable exemption alongside `days`.

**Module-level helper functions may not read `document` (TZ.5b):**
Module-level code (functions defined outside any component or hook) may
execute at module initialization time, before the DOM is available. Never call
`document.body.dataset.timezone` inside a module-level function — it may throw
a `ReferenceError: document is not defined` during SSR. The correct pattern:
pass `timezone: string` as a parameter. The component function body reads the
SSR-guarded body attribute and passes `tz` into module-level calls. Confirmed
for multiple helper functions across TZ.5a and TZ.5b builds.

**Split-state Client Component: exactly one tz read (TZ.5b):**
If a Client Component received a `const tz = typeof document !== 'undefined' ...`
SSR-guarded read in TZ.5a (for `formatCT`/`formatWallClockCT` calls) and also
has a TZ.5b `const CT` for direct `date-fns-tz` calls: remove `const CT` and
reuse the existing `tz`. Do not add a second SSR-guarded read. There must be
exactly one `document.body.dataset.timezone` read per Client Component.
Two reads would produce identical values (same body attribute), are redundant,
and make the code harder to read. Confirmed in `CalendarDayPanel.tsx` and
`PendingQueueClient.tsx` (TZ.5b).

**Audit all sibling helpers when parameterizing for timezone (TZ.5b lesson):**
When updating one module-level helper function to accept `timezone: string`,
always check whether sibling helpers in the same file also call `date-fns-tz`
or `formatCT`/`formatWallClockCT` with a hardcoded timezone. Leaving one
updated and one using `CT` creates a silent inconsistency that produces no
TypeScript or lint error. Confirmed failure in `PendingQueueClient.tsx`:
`eventTimeLabel()` parameterized in TZ.5a; `eventDateLabel()` (right next
to it) was not — caught only during TZ.5b Task A targeted read.

**`proxy.ts` maintenance gate — always-first position
(MM.1):**
The maintenance mode check block in `proxy.ts` must be the
first substantive check after `const { pathname } =
request.nextUrl`. It precedes `needsFlagCheck`, all flag
fetches, and all role-based route guards. This ordering is
a correctness requirement for the kill-switch guarantee: if
a feature-flag redirect fires before the maintenance check,
a non-SA user could be routed by the flag block rather than
sent to `/crew/maintenance`. Future `proxy.ts` edits must
preserve this ordering. The correct guard position was
established in MM.1 and must be treated as a structural
invariant, not as an incidental ordering.

**`/crew/maintenance` — R20 exception, standalone outside
`(app)` (MM.1):**
`app/crew/maintenance/page.tsx` is the sole documented
exception to R20 (all `/crew/*` pages under `app/crew/(app)/`).
It lives at `app/crew/maintenance/` directly so it renders
without the sidebar/topbar shell — blocked non-SA users must
not see the full admin UI around the maintenance message.
Three additional rules flow from this:
1. The path must never appear in `needsFlagCheck` (should
   always be reachable regardless of flag state)
2. The path must never appear in the crew flag block
3. The path must never appear in the Production role
   allowlist (it is not a crew feature route)
If a future build moves or restructures this page, R20 must
be re-evaluated — the exception is tied specifically to the
maintenance use-case, not a general precedent. Established MM.1.

**`SaveStatus` — `'saved'` not `'success'` in SetupPanel
sub-components (MM.2 Q1):**
The `SaveStatus` type (`'idle' | 'saving' | 'saved' | 'error'`)
is defined in `SetupPanel.tsx` and used by all 9 of its
sub-components. The success terminal state is `'saved'` —
`SaveFeedback` renders "✓ Saved" only when `status === 'saved'`.
Passing `'success'` compiles in some contexts but fails tsc
against the union and produces no visible feedback.

Pattern:
```typescript
// State declaration — always use SaveStatus, not an inline union
const [status, setStatus] = useState<SaveStatus>('idle')

// On success — always 'saved', never 'success'
setStatus('saved')
```

This was the first self-caught bug in MM.2 Task A, before
any code was written. The original prompt draft used an
inline `'idle' | 'saving' | 'success' | 'error'` union and
called `setStatus('success')`. Established MM.2 Q1.

**`settingsMap` is a `Map` instance, not a plain object
(MM.2 Q1):**
In `app/crew/(app)/settings/setup/page.tsx`, `settingsMap`
is a `Map<string, string>` — built via:
```typescript
const settingsMap = new Map(
  (rows ?? []).map((r) => [r.key, r.value])
)
```
Bracket access `settingsMap['key']` always returns
`undefined` on a `Map`. The correct access pattern is
`settingsMap.get('key')`. This is easy to miss because
TypeScript does not error on bracket access to a `Map` —
it returns `string | undefined` silently, which passes
the `|| 'fallback'` chain but means the actual value is
never read.

Every key in the `initialValues` mapping block must use
`.get()`:
```typescript
// WRONG — silent undefined
maintenance_mode: settingsMap['maintenance_mode'] || 'false',
// CORRECT
maintenance_mode: settingsMap.get('maintenance_mode') || 'false',
```
Established MM.2 Q1.

**`ActionResult` narrowing — `'error' in result` not
`result?.error` (MM.2 Q1):**
`ActionResult` is a discriminated union:
```typescript
type ActionResult =
  | { success: true }
  | { error: string }
```
The success branch has no `error` field. Optional chaining
`result?.error` produces a TypeScript error in strict mode
because the success branch does not have an optional `error`
property — it has no `error` property at all. `'error' in
result` is the correct narrowing:
```typescript
if ('error' in result) {
  setErrorMessage(result.error) // TypeScript now knows this is the error branch
  setStatus('error')
} else {
  setStatus('saved') // TypeScript knows this is { success: true }
}
```
This pattern applies to every `handleSave()` function in
`SetupPanel.tsx` that calls a server action returning
`ActionResult`. All existing sub-components already use
this pattern; any new sub-component must follow it.
Established MM.2 Q1.

**`revalidatePath()` in Server Component render — confirmed
runtime error (FORUMS-FIX.A):**
The exact runtime error thrown when `revalidatePath()` or
`revalidateTag()` is called during a Server Component render:
  "Route used revalidatePath during render which is
  unsupported."
This is a Next.js framework constraint, not a Supabase
or application-layer constraint. The error does not surface
in lint or tsc. It only appears at runtime — and it appears
as a generic "Something went wrong" because it bubbles to
`app/error.tsx` without a stack trace (per the next pattern).

The fix pattern: if a server action that calls
`revalidatePath()` needs to fire on page load, move it to
a client-side `useEffect` with the `void` keyword:
```typescript
// In a Client Component that wraps the page content:
useEffect(() => {
  void serverActionThatCallsRevalidate(id)
}, [id])
```
Do NOT make the useEffect callback async — use `void` to
discard the Promise. See the `void functionName()` in
`useEffect` pattern documented earlier in §14. The
dependency array should contain the value that, when it
changes, should re-trigger the action (e.g., `[thread.id]`
for markThreadRead). Established FORUMS-FIX.A.

**`app/error.tsx` error logging — both conditions required
(FORUMS-FIX.B):**
For `app/error.tsx` to log errors:
1. `error` must appear in the destructured parameter list
   (not just in the type annotation)
2. A `useEffect` must reference `error` in both its body
   and dependency array

```typescript
// WRONG — error in type but not destructured; or useEffect
// references error but it's not in scope
export default function ErrorPage({ reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) { ... }

// CORRECT — error destructured AND used in useEffect
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Runtime error caught by error boundary:', error)
  }, [error])
  // ...
}
```

Without both conditions, the error boundary is a black box
that makes debugging runtime errors vastly harder than it
needs to be. The FORUMS-FIX investigation would have been
significantly faster with a logged stack trace. Established
FORUMS-FIX.B.

**`ShowCard` is inline in `ShowList.tsx`, state in parent
(SHOWDELETE.A / SHOWARCHIVE.A):**
`ShowCard` is defined as a component function INSIDE
`components/crew/shows/ShowList.tsx` — not as a separate
file. When auditing or modifying ShowCard behavior, open
`ShowList.tsx`.

All mutation state for ShowCard buttons lives in `ShowList`
(the parent component) and is passed down as optional props:
```typescript
// State declared in ShowList:
const [archivingId, setArchivingId] = useState<string | null>(null)
const [undoState, setUndoState] = useState<{...} | null>(null)

// Handler declared in ShowList:
async function handleArchive(show: ShowWithStaffing) { ... }

// Passed to ShowCard as props:
<ShowCard
  show={show}
  isArchiving={archivingId === show.id}
  onArchive={() => handleArchive(show)}
  // ...
/>
```

`ShowCard` is a presentation component. It receives handlers
as props and fires them on click — it does not manage its
own mutation state. This is the same pattern as the existing
`isToggling` / `onToggleStatus` props. Established
SHOWDELETE.A / SHOWARCHIVE.A.

**`ShowForm.tsx` and `ShowDetail.tsx` serve different
purposes — never confuse them (SHOWARCHIVE.A):**
```
ShowForm.tsx     → Create/Edit form (reached via New Show
                   or Edit Show button). Contains form
                   fields, date rows, submission buttons.
ShowDetail.tsx   → Tabbed detail view (reached by clicking
                   a show). Contains Overview/Dates/
                   Volunteers/Settings tabs.
```
The status submission bug was in `ShowForm.tsx` (hardcoded
"Save & Publish" / "Save as Draft" buttons ignoring the
dropdown). `ShowDetail.tsx` already had a correct "Save
Status" button calling `updateShowStatus(show.id, statusValue)`.

Auditing the wrong file wastes a Task A slot and delays
the fix. When a bug concerns show status submission from
an edit form, check `ShowForm.tsx`. When a bug concerns
the tabbed detail view or Settings tab actions, check
`ShowDetail.tsx`. Established SHOWARCHIVE.A.

**`saveFeatureFlags()` internal structure — 6-point wiring
(ANNOUNCE.2 Task A4):**
`saveFeatureFlags()` in `lib/actions/setup.ts` is NOT
equivalent to calling `upsertSetting()` per flag. Its
internal structure:

```typescript
// Pattern (simplified):
const xyzEnabled = formData.get('announcements_oa_enabled') as string
// (1) Extraction

if (!isValidFlagValue(xyzEnabled)) return { error: '...' }
// (2) isValidFlagValue() validation

const rows = [
  { key: 'feature_calendar', value: calendarEnabled },
  // ... existing flags ...
  { key: 'announcements_oa_enabled', value: xyzEnabled },
  // (3) Upsert row
]

await supabase.from('app_settings').upsert(rows)

await logAction(admin.id, 'settings.update', ...,
  { feature_calendar: prev.calendar, ..., announcements_oa_enabled: prev.xyz },
  // (4) BEFORE diff
  { feature_calendar: calendarEnabled, ..., announcements_oa_enabled: xyzEnabled }
  // (5) AFTER diff
)

revalidatePath('/crew/settings/dashboard-announcement')
// (6) Route revalidation
```

The SetupPanel UI requires FOUR separate wiring points
(state, ToggleRow, type widening, fd.append()). The server
action requires SIX. Both sets must be complete. Established
ANNOUNCE.2 (Task A4 live-file audit correction).

**Self-loading Setup Panel sub-component pattern
(ANNOUNCE.2):**
When a `SetupPanel.tsx` sub-component manages data NOT in
`SETUP_KEYS` / `settingsMap` / `initialValues`, it must
self-load via a single `useEffect`:

```typescript
// CORRECT — single effect, [editor] dependency, all state
// mutations in one async body:
useEffect(() => {
  if (!editor) return
  void (async () => {
    const data = await getDataAction()
    editor.commands.setContent(data.body || '')
    setStateA(data.roles)
    setStateB(data.other)
  })()
}, [editor])

// WRONG — two effects (triggers react-hooks/set-state-in-effect):
useEffect(() => {
  void loadData()
}, [editor])
useEffect(() => {
  if (fetchedData) {
    setStateA(fetchedData.roles)  // ← lint violation
  }
}, [fetchedData])
```

Why `[editor]` as the dependency: the effect fires when
the TipTap editor is initialized (ready to receive content).
Before the editor is ready, `setContent()` would be a no-op.
After it's ready, one load is all that's needed. Including
fetched data in the dependency array causes the effect to
re-trigger on every state update.

The `void (async () => { ... })()` IIFE inside the effect
is required because the effect callback must remain
synchronous — `useEffect` does not accept async callbacks.
Established ANNOUNCE.2.

### Pre-Prompt Governance Compliance Pass (established SIDEBAR.4 / QRANALYTICS.1 / NAVORDER.1)

Before writing any prompt spec JSX or TypeScript, the prompt author must
run through these four checks. Each check corresponds to a recurring
F-item that required Claude Code correction before commit. The prompt
author is responsible — not Claude Code.

**Check 1 — className template literal syntax:**
Any `className` attribute in a prompt spec that includes a dynamic
expression (e.g., `ROLE_BADGE_CLASSES[admin.role]`, a ternary, or any
JS expression) must use a template literal in the spec:

```
className={`base-class ${DYNAMIC_EXPR}`}
```

A plain string like `className="base-class ROLE_BADGE_CLASSES[admin.role]"`
renders the literal characters `R`, `O`, `L`, `E`, etc. as CSS class
names — the expression is never evaluated. This was the root cause of
F-items in both SIDEBAR.4 and SIDEBAR.6. Both required template literal
corrections by Claude Code before commit.

**Check 2 — Lucide icon existence:**
Before specifying any `lucide-react` icon in a prompt, verify the icon
name is valid: `node -e "require('lucide-react').IconName"`. If the
require returns a function, the icon exists. Grepping the lucide dist
directory is unreliable because it finds partial name matches —
searching "Key" returns results for `KeyRound`, `KeySquare`,
`KeyboardIcon`, and others. A non-existent icon import silently fails
to render in dev hot-reload but breaks the Vercel production build.

**Check 3 — `getServerClient()` is always awaited:**
In any new server action file, `getServerClient()` is an async function
that must be awaited: `const supabase = await getServerClient()`.
Omitting `await` returns a Promise (not the client object); the code
compiles and lints cleanly but fails at runtime when any supabase
method is called on the Promise. NAVORDER.1 F1: the prompt spec omitted
`await` on `saveSidebarNavOrder()`; Claude Code caught it during live
file cross-reference before commit.

**Check 4 — `cardClasses` and `saveButtonClasses` are not importable:**
`cardClasses` and `saveButtonClasses` are module-private constants
defined inside `SetupPanel.tsx`. They are not exported and cannot be
imported by sub-component files. Any new SetupPanel sub-component
(e.g., `NavOrderSection.tsx`) that needs card container or save button
styling must define its own inline class string. NAVORDER.1 F2: the
prompt spec assumed these were importable; Claude Code read the live
`SetupPanel.tsx` and applied only the structural class strings actually
needed by `NavOrderSection.tsx`.

### UPSTYLE prompt series — style upgrade pattern (established Build Pt 27)

UPSTYLE prompts apply the Option A design from a Style Sandbox mockup
to the corresponding live page, then remove the mockup from the
Sandbox. The audit is embedded as Task A of the implementation prompt
(not a separate prompt), with a mandatory stop after Task A before
implementation proceeds.

**CSS-hide rule (established UPSTYLE.1):**
When grouping page content into tabs or panels that contain components
with lazy-initialized useState or TipTap useEffect([editor]) loading
patterns, always use CSS-hide (`className={activeTab === 'x' ?
'space-y-6' : 'hidden'}`) — never conditional rendering (`&&` or
ternary mount). Conditional mounting resets all state on every tab
switch. CSS-hide keeps all components mounted while hiding inactive
ones visually. Established in UPSTYLE.1 for the Platform Setup
four-tab layout (NavOrderSection lazy useState + AnnouncementSection
TipTap useEffect both survive tab switches).

**Option A three-zone section card pattern (implemented UPSTYLE.2):**
All Platform Setup section cards use a three-zone layout. Full
className specification is in Brief §8 Platform Setup — section card
pattern block. Key rules:
- `justify-end` (not `justify-between`) on the footer zone so the
  Save button stays right-aligned when SaveFeedback renders null at
  idle state (UPSTYLE.2-FIX)
- `overflow-hidden` on the outer wrapper so the shaded header does
  not escape the rounded corners
- Each sub-component defines its own local `cardClasses` — not
  importable from SetupPanel.tsx
- Logo/Favicon inline blocks use header + body zones only (no
  footer — BrandImageUploader owns saving)

**Platform Setup tabbed layout (UPSTYLE.1):**
SetupPanel.tsx uses `activeTab` state with four values: `'identity' |
'communication' | 'platform' | 'announcements'`. All eleven section
items are always mounted; inactive groups use `className={activeTab
=== 'X' ? 'space-y-6' : 'hidden'}`. Tab groupings: Identity
(OrgIdentity, BrandColors, Logo, Favicon); Communication (EmailConfig,
FeatureFlags); Platform (MaintenanceMode, InstanceLabel, NotFoundPage,
NavOrder); Announcements (AnnouncementSection).

**Page-level Option A heading zone + centering (established
UPSTYLE.5-FIX2):**
Page heading zones use `<div className="pb-4 border-b
border-neutral-border dark:border-dark-border mb-6">` wrapping h1 +
subtitle. The heading may live in the Server Component page.tsx shell
rather than the Client Component — always grep before assuming the
location. Page content width: `max-w-Nxl mx-auto px-4 py-8` on the
page.tsx outer wrapper. `mx-auto` is required for centering —
`max-w-*` alone does not center the content.

**Media Library two-panel layout (UPSTYLE.3):**
MediaLibrary.tsx is a two-panel flex layout. Active folder:
`bg-brand-primary-light text-brand-primary font-medium` — no
`dark:bg-*` pairing (R35-safe). Document list is div-based (zero
table/tr/td in the file). When referencing the live file for the
detectLinkType/isPlayable/getPlayLabel helpers: these remain defined
inside MediaLibrary.tsx (not imported) per the recognized DRY
exception in §14.

### Resend sendEmail/sendBatch wrapper pattern
(established ADMIN.61)

All email sends in `lib/email.ts` route through two
private (unexported) wrapper functions defined
immediately after the Resend client initialization:

```typescript
async function sendEmail(
  params: Parameters<typeof resend.emails.send>[0]
): Promise<void> {
  const { error } = await resend.emails.send(params)
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}

async function sendBatch(
  params: Parameters<typeof resend.batch.send>[0]
): Promise<void> {
  const { error } = await resend.batch.send(params)
  if (error) throw new Error(`Resend batch failed: ${error.message}`)
}
```

**Why this matters:** `resend.emails.send()` and
`resend.batch.send()` return `{ data, error }` and
do NOT throw on API-level failures (unverified domain,
403, rate limit). Only network-level failures throw.
Without the wrapper, a Resend domain removal silently
logs every rejected send as a success in `email_log`
for days. Confirmed failure mode: 8-day email outage
(ADMIN.61-AUDIT) — 403s on every `/emails` POST,
fully invisible in the platform.

**Rule:** Never call `resend.emails.send()` or
`resend.batch.send()` directly in `lib/email.ts`
outside these two wrappers. Any new email function
must use `sendEmail()` or `sendBatch()`. The wrappers
use `Parameters<typeof ...>[0]` type inference —
confirmed to resolve correctly with the installed
Resend SDK version (ADMIN.61 tsc: 0 errors).

### Lookup-first public form gate pattern
(established ADMIN.62)

When a public form action requires the submitter to
be identified in the database before proceeding,
implement a lookup-first gate with three UI states:

**State 1 — Lookup:** User enters an identifier
(email and/or phone). Fires a sequential lookup
(email first, then phone — never `.or()` in a
PostgREST filter for identity matching on public
routes; sequential parameterized queries are the
established pattern per explicit comments in
`claims.ts` and `callboard.ts`).

**State 2a — Found:** Show confirmation, proceed
with the primary action using the resolved ID.

**State 2b — Not found:** Collect minimal required
fields inline; create the record atomically with
the primary action. Race-condition guard for unique
constraint violations (code `23505`): catch, re-fetch
the existing record, proceed.

**Key implementation rules:**
- Use plain `useState` + `onClick` handlers (R13.3a
  — no `<form>` elements in Client Components).
  Drop react-hook-form for simple flows.
- `knownVolunteerId` (or equivalent resolved ID)
  is passed to the primary action to skip the
  internal lookup round-trip.
- Honeypot fake-success must be implemented in
  BOTH the primary action (e.g., `submitClaim()`)
  AND the combined lookup-and-create action (e.g.,
  `submitClaimWithLookup()`). Both are entry points
  for bot traffic.
- Minimal field scope for State 2b: collect only
  the minimum required to create the record. Defer
  full profile completion via a non-blocking follow-
  up email (e.g., `sendUpdateLinkEmail()`).

Established ADMIN.62 for the slot claim flow.
`lookupVolunteerForClaim()` + `submitClaimWithLookup()`
in `lib/actions/claims.ts` are the canonical
reference implementations.

### NotificationType CHECK constraint — migration
always required (established ADMIN.64)

`notifications.type` is a `text` column governed by
a `CHECK` constraint (`notifications_type_check`),
NOT a Postgres ENUM. This distinction matters:

- Adding a new type value to the TypeScript
  `NotificationType` union compiles and lints cleanly.
- Without a matching migration, the DB insert throws
  a constraint violation at runtime — the error only
  surfaces when the notification is actually created.

**Required steps for every new NotificationType:**
1. Write and apply a migration that DROPs the
   existing `notifications_type_check` constraint
   and re-ADDs it with the new value appended to
   the `ARRAY[...]`. Same technique as Migration 037
   (`direct_message`) and Migration 046
   (`slot_cancellation`).
2. Add the new string literal to the
   `NotificationType` union in
   `types/notifications.ts`.
3. Add a `case` to `getTypeIcon()` in
   `NotificationPanel.tsx`. The switch is exhaustive
   — a missing case causes a tsc error (caught in
   ADMIN.64 mid-build).

Apply the migration BEFORE shipping TypeScript code
that uses the new type. See §11 checklist item.

### Side-effects in the canonical action, not wrappers
(established ADMIN.64)

When a server action has multiple call paths (e.g.,
`cancelClaim()` is called from both the email-link
cancel page and the new `cancelClaimFromCallboard()`
wrapper), side-effects that should fire on EVERY
invocation belong in the canonical action itself —
not in individual wrappers.

`cancelClaim()` is the established example:
- `sendSlotCancellationEmail()` fires inside
  `cancelClaim()` in a non-blocking try/catch.
- `createNotification()` (per editor) fires inside
  `cancelClaim()` in a void IIFE.
- Both fire regardless of whether the caller is
  `cancelClaimFromCallboard()`, the `/cancel/[token]`
  route, or any future path.

**Rule:** Before deciding where to place a side-effect
(email, notification, audit log), ask: "Should this
fire for every invocation of this action, regardless
of entry point?" If yes → place it in the canonical
action. If it's path-specific → place it in the
wrapper. Never duplicate side-effect logic across
multiple callers.

### lib/data/callboard.ts — Call Board data module
(established ADMIN.63)

`lib/data/callboard.ts` is the data module for
Call Board server-side queries. Follows all
`lib/data/` conventions:
- No `'use server'` directive (data modules are
  not server action files — `'use server'` would
  expose all exports as callable server action
  endpoints)
- Accepts `supabase` client as a parameter from
  the calling page
- Accepts `timezone: string` as an explicit
  parameter — never reads `document.body.dataset
  .timezone` (Client Component pattern only) and
  never calls `getOrgTimezone()` internally (the
  caller resolves timezone once and passes it in)

`getUpcomingClaimsForVolunteer(supabase, volunteerId,
volunteerEmail, timezone)` is the first function.
It uses a dual-lookup pattern (query by `volunteer_id`
when not null, then by `volunteer_email`, dedupe
in-memory) to cover both linked claims (have
`volunteer_id`) and legacy unlinked claims
(`volunteer_email` only). Date filter:
`formatCT(new Date(), 'yyyy-MM-dd', timezone)` +
`.gte('show_date', todayCT)` — same pattern as
`lib/data/checkin.ts` and `QuickStats.tsx`.

### Org logo rendering: plain `<img>`, not `next/image`
(ADMIN.65-FIX)

The org logo (`org_logo_url` from `app_settings`) must be
rendered using a plain `<img>` tag — never `next/image`.
The Setup Panel's logo URL input accepts any publicly hosted
URL (WordPress, CDN, any external domain). `next/image`
requires all external hostnames in `next.config.ts`
`remotePatterns`. Adding every possible hostname is not
viable for OpenCall OS multi-client deployments.

Required pattern for any surface rendering `org.org_logo_url`:
```typescript
{/* eslint-disable-next-line @next/next/no-img-element --
    org_logo_url can be any external URL (Setup Panel URL-paste
    mode); next/image would require every possible hostname in
    next.config.ts remotePatterns, which is not viable across
    OpenCall OS client deployments (ADMIN.65-FIX). */}
<img
  src={org.org_logo_url || '/logo.png'}
  alt={org.org_name}
  width={W}
  height={H}
/>
```

The `eslint-disable-next-line` comment with explanation is
required — plain `<img>` in Next.js triggers the
`@next/next/no-img-element` lint rule, which breaks the
zero-warnings baseline without the suppression. Applied in
`components/public/PublicHeader.tsx` and
`components/crew/Sidebar.tsx`. Any future surface rendering
`org.org_logo_url` must follow this pattern. Confirmed
failure mode: using `next/image` with an external WordPress
URL produced a broken image on all public pages and the
admin sidebar simultaneously for 8+ days (ADMIN.65-FIX).

### `saveLogoUrl()` and `saveFaviconUrl()` revalidation scope
(ADMIN.65-FIX)

Both save actions in `lib/actions/setup.ts` must call
`revalidatePath('/', 'layout')` in addition to
`revalidatePath('/')`. The favicon lives in
`generateMetadata()` in the root layout; the org logo is
fetched by the crew app layout for the Sidebar. Page-scope
revalidation alone does not invalidate layout-level metadata
or Server Components fetching data in the layout.

Full required `revalidatePath()` call set for `saveLogoUrl()`:
```typescript
revalidatePath('/')
revalidatePath('/', 'layout')       // root layout metadata + public pages
revalidatePath('/crew', 'layout')   // crew layout + admin Sidebar logo
revalidatePath('/crew/settings/setup')
```

Full required call set for `saveFaviconUrl()`:
```typescript
revalidatePath('/')
revalidatePath('/', 'layout')       // root layout generateMetadata()
revalidatePath('/crew/settings/setup')
```

Confirmed failure mode: both actions had only `revalidatePath('/')`
(page scope) — logo and favicon remained stale after saves with no
error thrown. `saveOrgIdentity()` in the same file already had the
correct pattern; `saveLogoUrl()`/`saveFaviconUrl()` were built without
it (ADMIN.65-FIX).

### `PublicCalendarEvent` canonical type location
(UPSTYLE.6A F1)

`PublicCalendarEvent` is defined and exported from
`lib/data/publicCalendar.ts`. It was originally a local,
unexported type inside `components/calendar/PublicCalendarGrid
.tsx` — impossible to import without modifying that file.
TypeScript's structural typing makes both implementations
interchangeable at call sites. Any future code needing this
type imports from `@/lib/data/publicCalendar`.

`lib/data/publicCalendar.ts` follows all `lib/data/`
conventions: no `'use server'` directive; accepts a
`SupabaseClient` as a parameter; never constructs its own
client. It exports `getPublicCalendarEvents(supabase, year,
month, timezone): Promise<PublicCalendarEvent[]>`. This
function contains the three-query event-resolution logic
extracted verbatim from `app/calendar/page.tsx` in
UPSTYLE.6A. `app/calendar/page.tsx` now calls this shared
function instead of running inline queries.

### `HomeCalendarWidget` — client-side calendar widget pattern
(UPSTYLE.6A/6B)

The home page public calendar widget (`components/calendar/
HomeCalendarWidget.tsx`) manages month navigation via local
`useState` — no URL params, no `next/link`, no router.
Month changes call `getHomeCalendarEvents(year, month)` from
`lib/actions/home-calendar.ts` (a `'use server'` file with
`// PUBLIC ROUTE` header and a single exported async function
using `getAdminClient()` only).

Key constraints that must be preserved in any future
similar widget:

1. **No URL param navigation.** Using `<Link
   href={`/?month=...`}>` for month navigation would
   trigger a full page reload, destroying VolunteerForm
   state and littering the home page URL. Only `<button
   onClick={handlePrev/Next}>` is correct.

2. **Initial events from Server Component.** `app/page.tsx`
   fetches the current month's events server-side and passes
   them as `initialEvents` prop. The widget has no loading
   state on first paint. Calendar events fetch in `app/page.tsx`
   is gated on `flags.calendar`: if the flag is off, no query
   runs and the widget is not rendered.

3. **`line-clamp-2` on event pills, never `truncate`.**
   Owner requirement: event titles must be fully visible.
   `truncate` produces ellipsis on a single line; `line-clamp-2`
   allows wrapping to two lines before ellipsis. The day cell
   container has no `overflow-hidden` or `max-height` constraint,
   so cells grow to fit wrapped content. CSS Grid week rows size
   to the tallest cell — all cells in a row grow uniformly,
   preserving alignment.

4. **SSR-guarded timezone read.** Widget reads
   `document.body.dataset.timezone || 'America/Chicago'`
   with the required SSR guard at the top of the component
   function body — same established Client Component pattern.
   Never prop-drilled from the Server Component parent.

5. **Renders its own Option A card.** The widget is self-
   contained: header zone (month label + prev/next buttons)
   + body zone (7-column calendar grid). The parent page
   (`app/page.tsx`) wraps the form in a separate Option A
   card; the widget provides its own card wrapper.

### `fromZonedTime()` required for public calendar query
boundaries — no naive UTC string construction (ADMIN.76)

`lib/data/publicCalendar.ts` must use `fromZonedTime()` from
`date-fns-tz` to convert boundary date strings to UTC instants
before querying. This is a process rule because the failure
mode is silent and hard to diagnose — the query runs without
error, returns a result, but silently excludes events from the
grid edges.

Failure mode: a 7:00 PM CT performance event on the last visible
grid day is stored in the database as `next-day 00:00:00Z` (UTC
+5). Naive `.lte('start_time', '${date}T23:59:59Z')` excludes it
because `next-day 00:00:00Z > ${date}T23:59:59Z`. The event
appears to have been omitted from the database when it was simply
missed by the UTC boundary. The bug is grid-edge-specific:
events in the middle of the grid are unaffected.

The admin calendar already solves this correctly. Any new public
calendar data module that accepts a `timezone` parameter must
use it — never discard it with `void timezone`. Established
ADMIN.76.

### Server Component shell ownership for page-level heading
zones (UPSTYLE.8)

When a Client Component owns a page's outer container,
breadcrumb navigation, and heading zone, and those elements
do not require any client-side state or interactivity, relocate
them to the Server Component page shell (`page.tsx`) instead.

Pattern before UPSTYLE.8 (wrong):

```tsx
// forums/[forumId]/page.tsx (Server Component)
return <ThreadListClient result={result} adminId={admin.id} />

// ThreadListClient.tsx (Client Component)
<div className="max-w-4xl mx-auto px-4 py-8">
  <Link href="/crew/forums">← Forums</Link>
  <div className="pb-4 border-b ..."><h1>{result.forum.name}</h1></div>
  {/* ... */}
</div>
```

Pattern after UPSTYLE.8 (correct):

```tsx
// forums/[forumId]/page.tsx (Server Component)
return (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Link href="/crew/forums">← Forums</Link>
    <div className="pb-4 border-b ..."><h1>{result.forum.name}</h1></div>
    <ThreadListClient result={result} adminId={admin.id} />
  </div>
)

// ThreadListClient.tsx (Client Component)
// starts directly with interactive content — no outer container
```

Benefits: the Server Component fetches the data needed for the
heading and renders it without sending JavaScript to the client;
the Client Component is narrower and only handles the interactive
thread list. Any page where a large Client Component owns
container/heading elements that come from server-fetched props
should apply this pattern. Established UPSTYLE.8.

### `flex-1` on left content block when right block is
`flex-shrink-0` (UPSTYLE.7/8)

In any flex row structured as:

```tsx
<div className="flex items-start gap-N">
  <div>  {/* left: main content */}
    ...
  </div>
  <div className="flex-shrink-0">  {/* right: action buttons / badges */}
    ...
  </div>
</div>
```

the left content block requires `flex-1` to push the right block
to the far edge. Without `flex-1`, both blocks size to their
natural content width and the layout collapses; with it, the left
block fills all available space and the right block sits flush
right. This is a structural inference that must be pre-planned —
it is invisible in static mockups where both blocks have explicit
content, but breaks at runtime when content is dynamic.

Established as a recurring pattern in UPSTYLE.7 (QRHistoryPanel
left content blocks) and UPSTYLE.8 (ForumIndexClient forum rows,
ThreadListClient thread rows). Apply to any new flex row that
has a shrink-locked right element (download links, action buttons,
count badges). The right block uses `flex-shrink-0`; the left
block uses `flex-1`. Established UPSTYLE.7/8.

---

*This document must be updated whenever a new standing rule is agreed upon.*
*Version history:*

*Documentation history notes (doc-maintenance record
— ordering corrections, sync failures, draft
corrections; not build history; for full build
history by phase and prompt see §13):*

*- v4.2: An earlier draft of the editNote/deleteNote
role-guard pattern said "needs correction to include
Editor"; this was corrected here to "Editors
confirmed append-only, the guard is correct as-is."*
*- v4.5: The version history jumped from v4.4 to
v4.6; v4.5 was missing and was reconstructed
retroactively during the DOC.60 session. Direct
counterpart to Brief v4.2's doc-sync incident.*
*- v4.8: The §13 version history had an ordering
error (v4.7 was listed before v4.6); corrected to
chronological order here.*
*- v5.3: When documenting the TOOLTIP_ANCHOR_MAP
removal and sidebar three-part edit change, no
pre-existing §11 checklist item for the four-part
pattern was found in the live file to update —
flagged in the build report rather than fabricated.*

*Full build history by phase and prompt: see §13.*
