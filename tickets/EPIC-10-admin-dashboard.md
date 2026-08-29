# EPIC-10 — Admin Dashboard

Source: Requirements Section 11 (Admin Dashboard). See root `README.md`
"Important decisions" for why this is treated as in-scope for the MVP
despite not being numbered in Section 13's feature list.

---

## TICKET-040: Admin role & route gating

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-007

### Description
The brief implies an "administrator" distinct from regular users but
doesn't specify how that role is granted. Add a role flag and protect
admin routes with it.

`User.role` (`Role` enum: `USER`/`ADMIN`, default `USER`) was already
migrated as part of EPIC-00's schema skeleton — no new migration needed.
Gating is `src/lib/require-admin.ts`'s `requireAdmin()`, used by
`src/app/(app)/admin/layout.tsx` so it covers every `/admin/*` route in
one place. It re-reads the role from the database on every call rather
than trusting a JWT claim — the JWT strategy (EPIC-01) never put `role`
in the token, and reading fresh means a demoted admin loses access
immediately, not only after their session expires.

Bootstrap: `scripts/make-admin.ts`, run via `npm run make-admin -- 
<email>` — looks up the user by email and sets `role: "ADMIN"`. Errors
clearly if the email doesn't exist yet (the user has to sign up through
the normal flow first; this only ever promotes an existing account).

### Acceptance Criteria
- [x] `User` model gains a role field — `role` enum (`USER`/`ADMIN`),
      decided during EPIC-00
- [x] Admin routes/pages reject non-admin users (redirect to
      `/dashboard`)
- [x] No self-service "become admin" path — `npm run make-admin` is a
      local/server-side script, not anything reachable from the app's UI
- [x] `npm run make-admin -- <email>` creates an admin from an existing
      user — documented in this ticket and in `README.md`'s Development
      section
- [x] **Verified against a real database:** a freshly signed-up user
      was blocked from `/admin` (redirected to `/dashboard`, no "Admin"
      nav link shown); after running `make-admin` for that same user
      **without logging out**, the very next request showed the "Admin"
      nav link and allowed `/admin` — confirming the fresh-DB-read design
      actually behaves as intended, not just in theory; a second,
      never-promoted user was independently confirmed still blocked

---

## TICKET-041: Admin — food management list + add food

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-040, TICKET-015, TICKET-017

### Description
Section 11: "The administrator should be able to: Add foods." This
ticket also owns the admin food-management list page itself (every food
in the database, active and archived) since add/edit/delete
(TICKET-041/042/043) all need a place to launch from and act on — rather
than three separate tickets each assuming a list that no ticket builds.

`src/app/(app)/admin/foods/page.tsx` (list) +
`src/app/(app)/admin/foods/new/page.tsx` (create), sharing
`src/components/admin/food-form.tsx` with `TICKET-042`'s edit page.
`createFoodAction` in `src/lib/actions/admin-food.ts`, validated by the
same `foodSchema` (`src/lib/validation/food.ts`) both create and edit
use.

### Acceptance Criteria
- [x] Admin food-management page lists all foods (including archived
      ones — TICKET-015's `Food.isArchived`), unlike the public-facing
      list (TICKET-017), which excludes archived by default
- [x] Each row shows enough to identify the food (name, category,
      calories) and an "Archived" indicator when applicable
- [x] "Add food" action opens a form to create a new `Food` row with all
      fields from TICKET-015
- [x] Validation matches the same rules used elsewhere for food data —
      one shared Zod schema, not duplicated
- [x] New food is immediately searchable via TICKET-018 and appears in
      this list
- [x] **Verified against a real database:** added "Test Snack XYZ"
      through the form, confirmed it appeared in the admin list, and
      confirmed via `GET /api/foods?q=...` that it was returned by the
      public search endpoint immediately — no propagation delay, no
      separate "publish" step

---

## TICKET-042: Admin — edit food

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-040, TICKET-015, TICKET-041

### Description
Section 11: "Edit foods." Launched from the food-management list built
in TICKET-041.

`src/app/(app)/admin/foods/[id]/edit/page.tsx`, `updateFoodAction` in
`src/lib/actions/admin-food.ts`. `updateFoodAction` only ever writes to
the `Food` row — it has no code path that touches `MealEntry` at all,
which is what actually guarantees the "no retroactive change" criterion
rather than something that has to be remembered not to break.

### Acceptance Criteria
- [x] Form pre-filled with existing food data, editable, saves changes
- [x] Editing a food's calorie/macro values does **not** retroactively
      change historical `MealEntry` totals already logged (those store
      their own computed values per TICKET-021/022)
- [x] **Verified against a real database, not just by code review:**
      logged a Jollof Rice entry (350 kcal, stored on the `MealEntry`
      row), then edited Jollof Rice's admin record to 999 kcal, then
      re-read the *original* `MealEntry` row directly via `psql` —
      still exactly `350`, unchanged. Confirmed the `Food` row itself
      did update to 999. Restored to 350 afterward.

---

## TICKET-043: Admin — delete food

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-040, TICKET-015, TICKET-041

### Description
Section 11: "Delete foods." Implemented as a soft delete against the
`isArchived` flag defined in TICKET-015, decided there specifically so
this ticket wouldn't need to choose between breaking history and blocking
deletion.

`setFoodArchivedAction` in `src/lib/actions/admin-food.ts` — takes an
explicit target state (`archived: "true"` / `"false"`) rather than
"toggle," so the same action safely serves both "Delete" and
"Unarchive" without any ambiguity about which direction it's flipping.

### Acceptance Criteria
- [x] Admin "delete" sets `Food.isArchived = true` — no hard delete of a
      `Food` row in the MVP admin UI, since a hard delete would either
      violate the `MealEntry.foodId` foreign key or force cascading
      deletes that destroy a user's logged history
- [x] Archived foods disappear from search (TICKET-018), the Food page
      (TICKET-046), and the Add Food flow (TICKET-019) per TICKET-017's
      filtering, but remain resolvable by id so existing `MealEntry` rows
      still render the food's name/details in History (TICKET-031) and
      the Dashboard (TICKET-025)
- [x] Admin food-management list (TICKET-041) shows archived foods with
      their "Archived" indicator and offers an "Unarchive" action there,
      rather than hiding them with no way back
- [x] **Verified against a real database:** archived a test food,
      confirmed it disappeared from `GET /api/foods?q=...` (0 results)
      while `GET /api/foods/:id` still returned it with
      `isArchived: true`; unarchived it and confirmed the "Archived"
      badge disappeared from the admin list

---

## TICKET-044: Admin — view registered users

**Priority:** P2 · **Status:** Done · **Depends on:** TICKET-040

### Description
Section 11: "View registered users."

`src/app/(app)/admin/users/page.tsx`. The Prisma `select` explicitly
lists only `id`, `email`, `role`, `createdAt`, and `profile.name` —
`passwordHash` is never fetched, not just hidden in the UI, so there's
no risk of it leaking into a server log, a future JSON-ified version of
this page, or anywhere else the query result might end up.

### Acceptance Criteria
- [x] List of users (name/email, sign-up date) visible to admin —
      also shows role, since that's directly relevant on an admin page
- [x] No password or sensitive auth data exposed in the list — excluded
      at the query level (`select`), not filtered out afterward
- [x] Read-only for MVP — no user editing/deletion by admin
- [x] **Verified against a real database:** the promoted admin user
      appeared in the list with role `ADMIN` and the correct sign-up
      date

---

## TICKET-045: Admin — basic app statistics

**Priority:** P2 · **Status:** Done · **Depends on:** TICKET-040

### Description
Section 11: "View basic application statistics."

`src/app/(app)/admin/page.tsx` — the `/admin` landing page itself. "Total
foods in database" counts every `Food` row including archived ones
(literally "in database," as opposed to the public-facing counts which
exclude archived) — a deliberate, documented reading of the criterion.

### Acceptance Criteria
- [x] Dashboard shows: total registered users, total foods in database,
      total logged meal entries
- [x] Numbers reflect live data, not cached/stale values — three
      `prisma.count()` calls on every page load, no caching layer
- [x] **Verified against a real database:** counts matched direct
      `psql` `COUNT(*)` queries on `User` and `Food` exactly (1 and 20
      respectively at the time of the check)
