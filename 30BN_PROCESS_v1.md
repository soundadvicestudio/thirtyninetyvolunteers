# 30 By Ninety Theatre — Build Governance
## 30BN_PROCESS_v1.md — v5.2
### Created: July 2026 | Last Updated: August 2026 — v5.2 (DOC.72: Phase STYLE complete — 6 new §7 patterns, 4 new §11 checklist items, §13 Phase STYLE tracker block, §14 pattern notes)

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

Active feature flags (seven — core features are not flagged): `feature_calendar`, `feature_checkin`, `feature_blast`, `feature_rehearsals`, `feature_auditions`, `feature_inventory`, `feature_forums`. `feature_calendar` through `feature_blast` were present since SETUP.1. `feature_rehearsals` was added in Migration 031 (Phase 21). `feature_auditions` was added in Migration 032 (Phase AUDITIONS). `feature_inventory` was added in Migration 034 (Phase INVENTORY — INVENTORY.1). `feature_forums` was added in Migration 035 (Phase FORUMS — FORUMS.1, commit dde841d, applied). `feature_opportunities`, `feature_hours_milestones`, and `feature_documents` were deleted in Migration 026 — those are core features.

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

**Sidebar data-driven four-part atomic edit (established 21.A Audit E / 21.2; extended INVENTORY.1):**
The crew sidebar is data-driven via four locations in `components/crew/Sidebar.tsx`:
1. `NAV_ITEMS` — the nav item object (icon, label, href)
2. `FLAG_GATED_HREFS` — the set of hrefs gated by feature flags
3. Production role allowlist — the set of hrefs accessible to the Production role (not just SA/OA/Editor/Viewer)
4. `TOOLTIP_ANCHOR_MAP` — a `Record<string, string>` lookup map for flagged routes that display a HelpTooltip on their sidebar nav link. Maps href → anchor string. Added INVENTORY.1 (replacing a hardcoded `||` ternary). Current entries: `/crew/rehearsals` → `'rehearsals'`, `/crew/auditions` → `'auditions'`, `/crew/inventory` → `'inventory'`, `/crew/forums` → `'forums'` (added FORUMS.1). Any new flagged route with a sidebar HelpTooltip must add an entry here — extending the old ternary no longer applies, the map is the authoritative lookup.

All four must be edited atomically when adding a new flagged nav link. Missing any single location produces a silent failure:
- Missing NAV_ITEMS: the link does not appear at all for any role
- Missing FLAG_GATED_HREFS: the link appears even when the flag is off, bypassing the feature gate entirely
- Missing the Production allowlist: the link appears for all roles EXCEPT Production, even when the spec requires Production access — no error, no warning, just invisibility for that role
- Missing TOOLTIP_ANCHOR_MAP: the HelpTooltip is silently omitted from the nav link for routes that require one

Confirmed in 21.2: NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist + HelpTooltip were performed atomically. Confirmed in INVENTORY.1: TOOLTIP_ANCHOR_MAP formalized as the 4th location (replacing the prior hardcoded ternary that required conditional extension). The Production allowlist addition is the most commonly missed of the four because it is not part of the visual link definition — it is a separate allow-set in a different part of the component.

This is the same class of silent failure mode as SETUP.1 F1 (proxy.ts matcher must cover all guarded paths before guards are written). The pattern: audit all four locations before making any edit, confirm all four are updated in the same commit.

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
The project's default HTTP pattern is `fetch()`. There are seven sanctioned deviations,
all in file upload components with progress tracking:
- `components/consent/ConsentUploadForm.tsx` — consent form upload (established 15.2)
- `components/crew/media/MediaLibrary.tsx` — media library file upload (established 15.3)
- `components/crew/settings/BrandImageUploader.tsx` — brand asset upload / logo + favicon (SETUP.2)
- `components/audition/AuditionSignupClient.tsx` — inline material upload at audition signup (Phase AUDITIONS)
- `components/audition/AuditionUploadClient.tsx` — late material upload via upload_token link (Phase AUDITIONS)
- `components/crew/inventory/InventoryPhotoUploader.tsx` — inventory item photo upload (Phase INVENTORY.3)
- `components/crew/forums/ForumPostComposer.tsx` — forum post attachment upload, including attachments on thread replies (Phase FORUMS.4 — 7th sanctioned XHR file; uses sequential upload mirroring InventoryPhotoUploader.tsx's `uploadWithProgress()` pattern)

Body format for all seven: FormData with `cacheControl: '3600'` and file appended under
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
# Active flags after Migration 035 (Phase FORUMS):
#   feature_calendar, feature_checkin, feature_blast,
#   feature_rehearsals, feature_auditions,
#   feature_inventory, feature_forums
# All seven flags active. (feature_opportunities,
#  feature_hours_milestones, feature_documents
#  deleted — core features)
grep -rn "feature_calendar\|feature_checkin\|feature_blast\|feature_rehearsals\|feature_auditions\|feature_inventory\|feature_forums" \
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
# Sanctioned XHR locations (upload progress tracking — seven total):
#   - components/consent/ConsentUploadForm.tsx (15.2)
#   - components/crew/media/MediaLibrary.tsx (15.3)
#   - components/crew/settings/BrandImageUploader.tsx (SETUP.2)
#   - components/audition/AuditionSignupClient.tsx (Phase AUDITIONS)
#   - components/audition/AuditionUploadClient.tsx (Phase AUDITIONS)
#   - components/crew/inventory/InventoryPhotoUploader.tsx (Phase INVENTORY.3)
#   - components/crew/forums/ForumPostComposer.tsx (Phase FORUMS.4 — 7th sanctioned XHR file)
# All seven use XHR because fetch() does not support upload progress
# events. All must include the deviation comment. Body format:
# FormData with cacheControl + file under '' field name (not raw
# file body with Content-Type header).
# Any hit outside these seven files requires review.
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
  30BN-DOC.59  ✓ Brief Update v4.7 (35 edits — Phase AUDITIONS
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
30BN-DOC.59 ✓ Process Update v4.5 (this prompt — Phase
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
*v4.1 (July 2026 — Phase 19 complete + ADMIN.35–38: §1 header updated (v4.1, Phase 19 + ADMIN.35–38 summary); §7 three new patterns added: Google OAuth callback dual-client pattern (getAdminClient() for pending_registrations ops — newly-OAuth'd user fails session-client RLS; ADMIN.36/38), is_active sign-out pattern (signOut() before redirect on inactive Google auth — ADMIN.38), updateVolunteerInfo() public-route identity (app/update/actions.ts is the /update submit action, distinct from updateVolunteer() in lib/actions/volunteers.ts — any new profile field must update both — 19.2); §7 revalidatePath via .select() pattern added (deleteNote/editNote — retrieve parent ID in single operation to avoid pre-delete SELECT — ADMIN.37); §11 three new checklist items: /update two-file field update pattern (19.2), z.string().optional() for <select> fields (enum rejects '' silently — 19.1/19.3), role guard allowlist pattern for volunteer mutations (Production must be explicitly blocked — ADMIN.37/38); §13 Phase 19 marked complete (19.1–19.3 ✓); §13 prompt log ADMIN.35-AUDIT + ADMIN.35–38 + 19.1–19.3 + DOC.50–51 added; §14 dark mode cascade defect note added (hand-authored @layer utilities compile after Tailwind auto-generated — bg-brand-primary-light overrides dark:bg-dark-bg; ADMIN.35-AUDIT root cause; ADMIN.39 sweep pending); §14 editNote()/deleteNote() role guard gap noted (should allow Editor — deferred to ADMIN.39); DOC.51 logged)*
*v4.2 (July 2026 — ADMIN.39-AUDIT + ADMIN.39a–c dark mode cascade closure: §1 header updated (v4.2); §14 editNote/deleteNote contradiction corrected — "needs correction to include Editor" replaced with "Editors confirmed append-only, guard correct as-is, migration required if ever revisited"; §7 ADMIN.39a–c pattern set added (governing hover rule, static neutral substitution table, dark:text-brand-primary-mid text fix pattern, two-part dark target correction pattern, has-[:checked]: variant scope rule, read-before-edit discipline note); §10 R35 grep check added; §11 R35 pairing checklist item added; §11 has-[:checked]: scope checklist item added; §13 stale Phase 14/15 pending stubs removed; §13 dark mode cascade sweep marked complete (ADMIN.39-AUDIT + 39a/39b/39c ✓); §13 ADMIN.40 carry-forward added; §13 prompt log completed (ADMIN.39-AUDIT, ADMIN.39a–c, DOC.51–53 all added); §14 R35 formal rule added (three correct options: native+native, hand-authored+hand-authored in correct order, hand-authored dark: text variant); DOC.54 logged)*
*v4.3 (July 2026 — ADMIN.40–42 + Phase 21 lock: §1 header updated (v4.3); §7 R36 opacity-variant gap pattern added (hand-authored @layer utilities do not auto-generate /NN or stacked-variant rules; each combination requires explicit authoring; silent failure mode; 3 accessibility gaps confirmed in ADMIN.42-AUDIT; all closed ADMIN.42); §10 R36 grep check added; §11 R36 checklist item added; §13 phase tracker: globals.css opacity-variant gap marked complete (ADMIN.41/42), Phase 21 architecture noted as locked and build-ready; §13 prompt log ADMIN.40 + ADMIN.41 + ADMIN.42-AUDIT + ADMIN.42 + DOC.54 + DOC.55 added; DOC.55 logged)*
*v4.4 (August 2026 — Phase 21 complete: §1 header updated (v4.4); §7 feature flag list updated (three → four active flags; feature_rehearsals added — Phase 21 / Migration 031); §7 public-route invariant updated (lib/actions/rehearsals.ts added as third canonical example; split pattern confirmed for rehearsal domain); §7 three new patterns added: admin_users.id = auth.uid() for RLS policies (no auth_user_id column — confirmed failure mode 21.1 F1; cross-references R37), Sidebar data-driven three-part atomic edit (NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist — silent failure mode confirmed 21.2), getRehearsalAttendanceForEvent() effective-roster-first pattern (must return ALL roster members with status: null for unmarked — not just rehearsal_attendance rows); §10 two grep updates: feature flags grep updated (four flags), getServerClient public-route check updated (add rehearsals.ts); §11 three new checklist items: effective-roster-first attendance queries, batch attendance single upsert, Deferred Verifications scope boundary (manual browser-only, not DB-confirmable items); §13 Phase 21 marked complete (21.A/21.1/21.2/21.3 all ✓ with summaries); §13 prompt log: 21.A + 21.1 + 21.2 + 21.3 + DOC.56 + DOC.57 added; §14 R34 updated (feature_rehearsals added to flagged features list); §14 public-route invariant updated (rehearsals.ts added, Brief single-file spec correction noted); §14 R37 cross-reference added (admin_users.id = auth.uid() — no auth_user_id column); DOC.57 logged)*
*v4.5 (August 2026 — Phase AUDITIONS specced as pre-launch build, companion to Brief DOC.58: reconstructed retroactively during the DOC.60 session — the header was bumped to v4.5 by the real DOC.59 prompt, but no corresponding version-history entry was ever appended to this file; the history section jumped straight from v4.4 to what is now v4.6 below. §7 audition Production assignment pattern added (two independent paths — show assignment vs. direct audition assignment); §10 feature flags grep updated (feature_auditions, 5th active flag); §11 new checklist item (stub tabs for not-yet-built dependencies — Email Templates tab pattern); §13 Phase AUDITIONS 11-prompt pending block added; DOC.58 + DOC.59 logged)*
*v4.6 (August 2026 — Phase AUDITIONS complete: §1 header updated (v4.6, Phase AUDITIONS complete); §7 public-route invariant: lib/actions/auditions.ts added as 4th canonical file; §7 split pattern extended (Phase AUDITIONS domain); §7 P-DC storage: audition-materials/ path namespace added; §7 feature flags: 4→5 active flags; getFeatureFlags() client-agnostic behavior clarified (does not require getServerClient() — corrects a misconception an earlier draft of this prompt would have introduced); inline single-key app_settings read documented as a lightweight alternative for public routes (not a necessity); 5-file flag addition pattern (setup/page.tsx type companion); §7 formatWallClockCT 3-arg signature + formatTime() helper pattern added (recurring failure mode ×3); §7 TipTap immediatelyRender: false + async setContent() patterns; §7 show_editors.admin_id naming note; §7 Supabase FK join Array.isArray normalization pattern; §7 XHR P-DC body format (FormData, not raw); §7 migration/DB drift pattern (inline fix tracking + follow-up migration requirement); §8 XHR: 3→5 sanctioned files (2 audition components added); §8 FormData body format note; §10 getServerClient grep: 4th public-route file (auditions.ts); §10 XHR grep: 5 files + FormData note; §10 feature flags grep: setup/page.tsx added to exclusions; §11 R23 checklist item: 3-arg signature + formatTime() helper; §11 two new TipTap items (immediatelyRender, async setContent); §11 HelpContent live-file discipline item; §11 notFound() consistency item; §11 PRE-PHASE-17 migration debt item (033 required); §11 inline schema fix flag item; §13 Phase AUDITIONS: pending → ✓ Complete (10 prompts, full build summaries — including a correction to the AUDITIONS.4b entry's HelpContent section-order claim); Phase 17 tracker: PRE-PHASE-17 note added (033 migration); DOC.59 ✓ + DOC.60 ✓ logged; §14 R23: 3-arg signature + formatTime() pattern; §14 R34: feature_auditions (5th flag); §14 public-route canonical files: auditions.ts (4th); §14 R38 cross-reference added (TipTap merge tag extension, immediatelyRender, escapeHtml in substituteMergeTags); §14 migration/DB drift rule added; missing v4.5 version-history entry reconstructed (see above); DOC.60 logged)*

*v4.7 (August 2026 — DOC.62 correction: §7 feature flag pattern stale sentence corrected — paragraph beginning "getFeatureFlags() uses getServerClient()" replaced with accurate client-agnostic framing; the earlier text directly contradicted the corrective block two paragraphs below it in the same section; both paragraphs now agree; §13 prompt log: DOC.61 + DOC.62 added; document header bumped to v4.7; DOC.62 logged)*

*v4.8 (August 2026 — DOC.65: §2 header updated (v4.8); §7 feature flag active flag list updated (five → seven: feature_inventory added Migration 034 / INVENTORY.1, feature_forums pending Migration 035 / Phase FORUMS); §7 inline single-key note updated — getUpcomingAuditions() stale comment Q-item closed (fixed in ADMIN.44); §7 migration/DB drift updated — 033 applied (DB-VERIFY.5), drift cleared; §7 Sidebar atomic edit extended (three-part → four-part: TOOLTIP_ANCHOR_MAP lookup map added as 4th required location — replaces hardcoded || ternary, established INVENTORY.1); §7 inventory_manager toggle pattern added (DB CHECK constraint, app-layer role guard, Editor-row-only toggle, SA/OA caller guard, types/audit.ts location); §10 R32 grep updated (feature_inventory + feature_forums added to grep pattern; comment updated to Migration 034); §11 PRE-PHASE-17 item updated — 033 applied, debt cleared; §13 PRE-PHASE-17 action note updated (applied); §13 Phase INVENTORY in-progress block + DB-VERIFY.5/033 + ADMIN.43 + INVENTORY.A + ADMIN.44 + INVENTORY.1 + DOC.64 + DOC.65 logged; §13 version history ordering corrected (v4.7 was before v4.6); DOC.65 logged)*

*v4.9 (August 2026 — DOC.67: Phase INVENTORY complete — §2 header updated (v4.9); §7 inventory_manager pattern: types/audit.ts corrected to lib/audit.ts (no types/audit.ts exists — inaccuracy from DOC.65 now fixed); §7 P-DC storage: inventory/ path namespace added (Phase INVENTORY.3); §7 two new patterns added: (1) storage dual-client pattern — storage API calls require getAdminClient() regardless of session (storage.objects has zero RLS; confirmed failure mode: getServerClient() returns null signed URLs silently); (2) Supabase aliased dual self-join workaround — two-fetch-plus-TypeScript-join pattern for queries needing two FKs to the same table (Supabase JS cannot alias self-joins; confirmed across INVENTORY.2/3/4); §8 XHR: 5 → 6 sanctioned files (InventoryPhotoUploader.tsx added — Phase INVENTORY.3); §10 XHR grep: 5 → 6 files; §11 three new checklist items: (1) storage dual-client (getAdminClient() for storage.objects), (2) route handler .tsx extension when JSX embedded (confirmed failure INVENTORY.5 F1), (3) HelpContent live convention discipline (read live file — show() predicates, shared class constants, backtick possessives — INVENTORY.5 F3); §13 Phase INVENTORY ✓ Complete — INVENTORY.1 summary corrected (lib/audit.ts not types/audit.ts; types/admin.ts + lib/auth.ts unplanned additions noted); INVENTORY.2–5 phase tracker entries added; prompt log: INVENTORY.2–5 + DOC.66 + DOC.67 added; DOC.67 logged)*

*v5.0 (August 2026 — DOC.70: Phase FORUMS complete — §2 header bumped to v5.0; §7 feature flag list: feature_forums confirmed active (Migration 035 applied, FORUMS.1); §7 P-DC media bucket: forums/ and forums/temp/ path namespaces added; §7 XHR: 6 → 7 sanctioned files (ForumPostComposer.tsx — 7th, FORUMS.4); §7 TOOLTIP_ANCHOR_MAP: /crew/forums → 'forums' entry added (FORUMS.1 — now 4 entries); §7 three new patterns added: (1) lib/data/*.ts must NOT have 'use server' — data modules are internal utilities, not action endpoints (FORUMS.3); (2) TipTap useEditor() → always type as Editor|null explicitly — ReturnType<typeof useEditor> resolves wrong overload when immediatelyRender:false (FORUMS.5 Q3); (3) non-blocking void IIFE pattern for fire-and-forget async side-effects in server actions (FORUMS.5 — sendForumNotificationEmail call site); §8 XHR count 6 → 7 (same as §7 update — confirmed single occurrence, not a separate duplicate); §10 R32 grep comment updated (all 7 flags active, Migration 035 applied); §10 XHR grep updated (seven total, ForumPostComposer.tsx added); §11 four new checklist items: lib/data/ no 'use server', TipTap Editor|null typing, R8 compliance for notification emails, forums/ storage path namespace; §13 Phase FORUMS: no prior block existed in this document — new ✓ Complete block added (FORUMS.A–5 with commits and key findings), inserted after Phase INVENTORY and before Phase 17; §13 prompt log: FORUMS.A–5 + DOC.68–70 added; §14 three new pattern notes: lib/data/ no 'use server' (FORUMS.3), forum access TypeScript-join pattern (FORUMS.3), buildEmailHtml/logEmailSent signature discipline (FORUMS.5 Q1); DOC.70 logged)*

*v5.1 (August 2026 — DOC.71: FORUMS.5-FIX documented — §2 header bumped to v5.1; §7 new pattern added ('use server' files may only export async functions — plain object/constant exports cause Vercel build failure not caught by lint or tsc; correct pattern: companion file without 'use server'; export type is safe; confirmed FORUMS.5-FIX, commit 02f4569); §10 new grep check added (grep 'use server' files for export const non-function values); §11 new checklist item (any new shared constant needed by multiple 'use server' files must go in a companion non-server module); §13 prompt log: FORUMS.5-FIX + DOC.71 added; DOC.71 logged)*

*v5.2 (August 2026 — DOC.72: Phase STYLE complete — §2
header bumped to v5.2; §7 six new patterns added:
(1) darkenHex() for server-side hex darkening (STYLE.A);
(2) resolveBrandColors() return shape — brand.primary/
brand.accent not brandPrimary/brandAccent (STYLE.A F2);
(3) @theme token naming — --color- prefix required for
Tailwind utility generation (STYLE.A F3); (4) @layer
utilities dark variant selector -- :where() form confirmed
(STYLE.A F4); (5) left border accent pattern — border-l-4
+ style={{ borderLeftColor }} (STYLE.6); (6) hardcoded
class literal discipline — no computed class construction
(STYLE.3/STYLE.6); §11 four new checklist items (@theme
--color- prefix, resolveBrandColors() identifiers, named
badge exports, hardcoded class literals); §13 Phase STYLE
✓ Complete block added (STYLE.A–STYLE.8, all 9 prompts
with commits); §14 three new pattern notes (STYLE.A/STYLE.3/
STYLE.6 confirmed patterns); document header bumped to v5.2;
DOC.72 logged)*
