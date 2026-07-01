# 30 By Ninety Theatre — Build Governance
## 30BN_PROCESS_v1.md — v1.1
### Created: July 2026 | Last Updated: July 2026 — v1.1 (Phase 1 complete)

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
Examples: `001_core_schema.sql`, `002_callboard_tokens.sql`

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
- Use for: Super Admin account creation, sending admin welcome emails, any operation that must bypass RLS (e.g., looking up a volunteer by token without a user session)
- **Never expose to client side.** If you find yourself importing `admin.ts` in a `'use client'` file, stop — this is a security failure.

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

If a build is incomplete or something didn't work as expected, that goes in Flags. Never mark something as Verified if it wasn't actually tested.

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
grep -r "Ushers\|Band Members\|Concessions\|Backstage" src/

# Check for service role key in client files (R10)
grep -r "SERVICE_ROLE_KEY" src/components/ src/app/

# Check for tailwind.config.ts (R7)
ls tailwind.config.ts 2>/dev/null && echo "EXISTS - REMOVE IT"

# Check for router.push after mutations (R12)
grep -r "router.push" src/app/crew/
```

```bash
# Check for shadcn default semantic color classes left in components (R15)
grep -r "bg-primary\|text-foreground\|border-input\|text-muted-foreground\|ring-ring\|bg-secondary\|bg-destructive\|bg-muted\|bg-accent\|bg-card" app/ components/
```

Add project-specific checks as new standing rules emerge.

---

## 11. Post-Build Checklist

Run before every Vercel deployment:

```
□ All five env vars set in Vercel → Settings → Environment Variables
□ NEXT_PUBLIC_SITE_URL set to correct URL for this environment
□ No SUPABASE_SERVICE_ROLE_KEY referenced in any client component
□ Vercel framework preset confirmed as Next.js — Settings → General (not "Other")
□ After any shadcn init or add: confirm no tailwind.config.ts or tailwind.config.js was created — delete immediately if found
□ All Quality Gates for this prompt passed
□ Build report written
□ Q-items noted
□ Brief updated if schema or decisions changed (batch with owner approval)
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
  30BN-ADMIN.0a  ✓ Brief Update v1.1 (Phase 1 complete)
  30BN-ADMIN.0b  ✓ Process Update v1.1 (Phase 1 complete)
  30BN-ADMIN.1   ⏳ Pending — write admin_users.last_login on sign-in (gap identified in 30BN-1.3 build report, address before Phase 3 ships)

Phase 2 — Public Volunteer Signup
  30BN-2.1    Landing Page Design & Layout
  30BN-2.2    Volunteer Registration Form
  30BN-2.3    Form Submission Logic
  30BN-2.4    Volunteer Info Update Flow

Phase 3 — Production Crew Core
  30BN-3.1    Admin Layout & Navigation
  30BN-3.2    Volunteers List View
  30BN-3.3    Volunteer Profile Page
  30BN-3.4    Category Management
  30BN-3.5    Super Admin User Management

Phase 4 — Shows & Season Management
  30BN-4.1    Show Creation & Edit
  30BN-4.2    Season Management & Show List
  30BN-4.3    Admin Show Detail

Phase 5 — Public Show Claiming
  30BN-5.1    Public Show Listing & Per-Show Claiming Page
  30BN-5.2    Slot Claiming Logic & Self-Cancel

Phase 6 — Custom Forms & Surveys
  30BN-6.1    Form Builder
  30BN-6.2    Public Form Page & Response Capture
  30BN-6.3    Form Response Viewer & Embed

Phase 7 — QR Code Generator
  30BN-7.1    QR Code Utility & Generator Tool

Phase 8 — Volunteer Call Board
  30BN-8.1    Call Board Login & Session
  30BN-8.2    Call Board Portal Pages

Phase 9 — Volunteer Hours & Milestones
  30BN-9.1    Hours Tracking
  30BN-9.2    Milestone System

Phase 10 — Audit Log
  30BN-10.1   Audit Log

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
```

---

## 14. Process-Specific Standing Rules

Rules governing this build process itself, kept here rather than in Brief §13 because they concern session conduct and CLI tooling behavior rather than product/schema decisions. This is a deliberate deviation from the general §12 protocol ("new standing rule goes in Brief §13 AND is noted here") for these two rules specifically.

### R16 — No Browser Verification in Claude Code Sessions
Claude Code does not use browser automation tools (Claude in Chrome or any equivalent) for UI, flow, or auth verification. All such verification is performed manually by the owner, who reports results to Claude Code as pass/fail. Build prompts must express all verification steps as manual owner tasks — never as browser tool calls. Established during 30BN-1.3.

### R17 — shadcn Init: Revert var() Injection Into globals.css
The shadcn CLI (v4.12+) injects a var()-driven CSS custom property theme block into `globals.css` by default during `init`, and may repeat this on `npx shadcn@latest add` commands. This overwrites the R7-compliant `@theme` block and is incompatible with Tailwind v4. After any shadcn init or add, immediately inspect `globals.css` and revert any injected `var()` block. The canonical `@theme` block with static hex values must be restored exactly as specified in 30BN_BRIEF_v1.md §3 Critical Constraint. Known shadcn CLI behavior to guard against.

---

*This document must be updated whenever a new standing rule is agreed upon.*
*Version history:*
*v1.0 (July 2026 — initial)*
*v1.1 (July 2026 — Phase 1 complete: R16 (no browser verification in Claude Code) and R17 (shadcn var() injection revert) added in new §14 — deviation from §12 protocol, kept here rather than Brief §13 per owner decision; shadcn color class grep check added to §10; Vercel preset and shadcn tailwind.config checks added to §11; ADMIN/DOC numbering convention clarified in §3; Phase 1 marked complete and Document & Admin Prompts log added in §13)*
*Cross-reference: 30BN_BRIEF_v1.md v1.1*
