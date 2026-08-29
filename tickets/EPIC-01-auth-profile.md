# EPIC-01 — User Registration, Auth & Profile

Source: Requirements Section 2 (User Registration and Profile), Section 16
(sign-up is step 1 of the user journey).

> **Implementation note:** TICKET-008's acceptance criteria require a
> daily calorie target at profile-save time, which structurally depends
> on EPIC-02's `TICKET-011`/`TICKET-012` — the same kind of cross-epic
> ordering conflict the earlier audit found and fixed for EPIC-04↔05 and
> EPIC-08↔09, just missed for EPIC-01↔02. Rather than leave the form
> unable to satisfy its own AC, the minimal BMR/TDEE/goal-adjustment
> calculation was pulled forward and implemented at
> `src/lib/calorie-target.ts` with full unit test coverage — see that
> file and `tickets/EPIC-02-calorie-target.md`'s `TICKET-011`/`TICKET-012`
> for the shared implementation. Macro targets (`TICKET-013`) were left
> for when EPIC-02 is formally implemented. Recorded in `journal.md`'s
> 2026-08-29 entry.
>
> **Verification note:** A real PostgreSQL 18 instance was set up
> (`journal.md`'s 2026-08-29 later entry) and the full flow — sign-up →
> profile onboarding → dashboard redirect → edit profile → log out →
> protected-route redirect → log back in (skips onboarding, profile
> already exists) → wrong-password rejection → duplicate-email rejection
> — was exercised end-to-end via a headless-browser script against the
> real database, with server-side logs confirming each Server Action
> (`signUpAction`, `saveProfileAction` ×2, `signOutAction`, `loginAction`)
> ran and returned the expected result. Every ticket below is now `Done`.

---

## TICKET-006: User sign-up (email/password)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-003

### Description
Let a new user create an account with email + password. Passwords are
hashed (bcrypt) before storage; no plaintext password ever touches the DB
or logs.

Implemented as a Server Action (`signUpAction` in
`src/lib/actions/auth.ts`) rather than a hand-rolled API route + client
fetch — Next.js 16 Server Actions are the idiomatic way to handle this
kind of form mutation and cut out a layer of boilerplate. The form itself
is `src/components/forms/sign-up-form.tsx`, using React 19's
`useActionState` for pending/error state.

### Acceptance Criteria
- [x] Sign-up form: email, password, confirm password
- [x] Validates email format, password minimum strength (8+ chars, at
      least one letter and one number), matching confirmation — all via
      one Zod schema (`src/lib/validation/auth.ts`) shared by the form's
      client-side `minLength`/`type=email` hints and the server action
- [x] Duplicate email is rejected with a clear error ("An account with
      that email already exists"), not a generic 500 — checked explicitly
      before insert; the schema's `User.email` unique constraint is the
      backstop if a race ever slips past that check
- [x] Password stored only as a bcrypt hash (cost factor 12)
- [x] Successful sign-up creates a `User` row, starts a session (via
      NextAuth's server-side `signIn`), and redirects to `/dashboard` —
      which itself redirects on to `/profile` (TICKET-008) if no profile
      exists yet, via the shared `requireProfile()` helper, so a new user
      never lands on a working Dashboard without one
- [x] **Verified against a real database:** signed up a fresh user via
      headless browser, confirmed a `User` row was created with a bcrypt
      hash (not plaintext), landed on `/profile`; re-submitting the same
      email showed "An account with that email already exists" instead
      of a crash

---

## TICKET-007: Login / logout / session management

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-006

### Description
NextAuth (Auth.js v5) credentials-based login, persistent JWT session,
logout, and route protection so unauthenticated users can't reach
Dashboard/Food/History/Progress/Profile.

Split into `src/auth.config.ts` (edge-safe: pages, `authorized` callback,
JWT/session callbacks — no Prisma/bcrypt) and `src/auth.ts` (full config
with the Credentials provider, which does need Prisma/bcrypt). This split
is the standard Auth.js v5 pattern for using Prisma with edge middleware
— `src/proxy.ts` (Next.js 16 renamed "middleware" to "proxy"; see the
2026-08-29 journal entry) imports only the edge-safe half.

### Acceptance Criteria
- [x] Login form (`src/components/forms/login-form.tsx`) authenticates
      against the credentials provider via a server action (`loginAction`)
- [x] Invalid credentials show "Incorrect email or password" — identical
      message whether the email doesn't exist or the password is wrong,
      no user enumeration
- [x] Session persists across page reloads (JWT cookie, `session:
      { strategy: "jwt" }` — no database session table needed)
- [x] Logout (`signOutAction`, wired into `MainNav`'s "Log out" button)
      clears the session and redirects to `/login`
- [x] Unauthenticated access to any main section redirects to `/login` —
      enforced twice: `src/proxy.ts` (edge, via the `authorized`
      callback) for every non-public route, and `requireSession()` /
      `requireProfile()` (`src/lib/require-profile.ts`) at the top of
      each protected page as a server-side backstop. Verified live: an
      unauthenticated request to `/dashboard` and to `/` both land on
      `/login`, screenshotted, zero console errors
- [x] After login, `redirectTo: "/dashboard"` sends every user into the
      app; a user without a completed profile is carried on to `/profile`
      by `requireProfile()` rather than by a separate check inside the
      login action itself — same observable behavior, single source of
      truth (the database) instead of a second flag to keep in sync
- [x] **Verified against a real database:** wrong password showed
      "Incorrect email or password" (confirmed exact text via a
      DOM-level check, not just visual inspection); logged out then
      confirmed `/dashboard` bounced to `/login`; logged back in with the
      correct password and landed straight on `/dashboard` (profile
      already existed, no onboarding re-shown)

---

## TICKET-008: Profile form (age, gender, weight, height, activity, goal)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-006

### Description
Section 2's onboarding form, collected right after sign-up per the user
journey in Section 16: name, age, gender, weight, height, activity level,
and goal (lose / maintain / gain weight).

Implemented as one page/form (`src/app/(app)/profile/page.tsx` +
`src/components/forms/profile-form.tsx`) that serves both this ticket
(create) and TICKET-010 (edit) — Prisma's `upsert` makes "create if
missing, else update" one operation, and Section 12 only has a single
"Profile" nav entry anyway, so there's no need for a separate onboarding
route.

### Acceptance Criteria
- [x] Form collects: name, age, gender (Male/Female), weight (kg),
      height (cm), activity level (Sedentary/Light/Moderate/Active/Very
      active), goal (lose/maintain/gain weight)
- [x] Client- and server-side validation via one shared Zod schema
      (`src/lib/validation/profile.ts` — age 13–120, weight 20–400kg,
      height 100–250cm, all fields required)
- [x] Submitting triggers the calorie-target calculation (pulled forward
      from TICKET-011/012, see this file's top note) and stores it on
      `Profile.dailyCalorieTarget` before redirecting to `/dashboard`
- [x] User cannot reach a working Dashboard without completing this form
      once — `requireProfile()` redirects `/dashboard` (and every other
      protected page) back to `/profile` until one exists
- [x] **Verified against a real database:** filled out the full form
      (name, age 28, female, 65kg, 165cm, moderate activity, lose
      weight), submitted, landed on `/dashboard`, then confirmed a
      `Profile` row existed with a computed `dailyCalorieTarget` by
      re-visiting `/profile` and seeing every field correctly prefilled

---

## TICKET-009: Profile data model & validation

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-003

### Description
The `Profile` table/schema underlying TICKET-008, plus shared validation
logic used by both the create flow and the edit flow (TICKET-010).

Schema was already written in EPIC-00's `TICKET-003` (including the
`goalWeight`/target fields later epics need). Validation added here:
`src/lib/validation/profile.ts`.

### Acceptance Criteria
- [x] `Profile` model: userId (FK), name, age, gender, weight, height,
      activityLevel (enum), goal (enum: lose/maintain/gain) — see
      `prisma/schema.prisma`
- [x] Validation rules defined once (`profileSchema`) and reused by the
      single create/edit form (TICKET-008/010 share one form component)
- [x] Weight/height units are explicit (kg/cm as MVP default, documented
      in this ticket's Notes below — labels in the form UI say "Weight
      (kg)" / "Height (cm)" explicitly so there's no ambiguity)

### Notes
Units decision: kg and cm as the MVP default (matches the 85kg/82kg/75kg
example in Section 9). No unit switcher planned for MVP — out of scope
unless requested.

---

## TICKET-010: Edit profile after onboarding

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-008, TICKET-009

### Description
The Profile section in main navigation (Section 12) needs to let a user
view and update the same fields collected at sign-up. Same page/form as
TICKET-008 — see that ticket for why one component serves both.

### Acceptance Criteria
- [x] Profile page shows current values (pre-filled via `defaultValue`
      on every field) when a profile exists, editable
- [x] Saving changes updates the `Profile` row (`prisma.profile.upsert`)
- [x] Saving changes that affect the calorie target (weight, height, age,
      activity level, goal) triggers recalculation — implemented as
      "always recompute on save," which is unconditionally correct
      (recomputing with unchanged inputs yields the same number) and
      simpler than diffing old vs. new field values to decide whether to
      recalculate
- [x] **Verified against a real database:** edited weight from 65kg to
      63kg on an existing profile, saved, redirected to `/dashboard`
      correctly (edit path uses the same upsert as create, confirmed
      working)
