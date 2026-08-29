# EPIC-10 — Admin Dashboard

Source: Requirements Section 11 (Admin Dashboard). See root `README.md`
"Important decisions" for why this is treated as in-scope for the MVP
despite not being numbered in Section 13's feature list.

---

## TICKET-040: Admin role & route gating

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-007

### Description
The brief implies an "administrator" distinct from regular users but
doesn't specify how that role is granted. Add a role flag and protect
admin routes with it.

### Acceptance Criteria
- [ ] `User` model gains a role field (e.g. `isAdmin` boolean or
      `role` enum) — decide and document which, here
- [ ] Admin routes/pages reject non-admin users (redirect or 403)
- [ ] No self-service "become admin" path — role is set directly in the
      database or via a seed script for MVP (no admin-invite flow, that's
      beyond what the brief asks for)
- [ ] A seed script (or a documented one-off manual step, e.g. a SQL
      command run against the dev/staging database) creates at least one
      admin user so EPIC-10 is testable without hand-editing the database
      from scratch every time — pick one approach and document it here
      once implemented

---

## TICKET-041: Admin — food management list + add food

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-040, TICKET-015, TICKET-017

### Description
Section 11: "The administrator should be able to: Add foods." This
ticket also owns the admin food-management list page itself (every food
in the database, active and archived) since add/edit/delete
(TICKET-041/042/043) all need a place to launch from and act on — rather
than three separate tickets each assuming a list that no ticket builds.

### Acceptance Criteria
- [ ] Admin food-management page lists all foods (including archived
      ones — TICKET-015's `Food.isArchived`), unlike the public-facing
      list (TICKET-017), which excludes archived by default
- [ ] Each row shows enough to identify the food (name, category,
      calories) and an "Archived" indicator when applicable
- [ ] "Add food" action opens a form to create a new `Food` row with all
      fields from TICKET-015
- [ ] Validation matches the same rules used elsewhere for food data
- [ ] New food is immediately searchable via TICKET-018 and appears in
      this list

---

## TICKET-042: Admin — edit food

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-040, TICKET-015, TICKET-041

### Description
Section 11: "Edit foods." Launched from the food-management list built
in TICKET-041.

### Acceptance Criteria
- [ ] Form pre-filled with existing food data, editable, saves changes
- [ ] Editing a food's calorie/macro values does **not** retroactively
      change historical `MealEntry` totals already logged (those store
      their own computed values per TICKET-021/022) — confirmed and
      documented here since it's an easy place to introduce a bug

---

## TICKET-043: Admin — delete food

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-040, TICKET-015, TICKET-041

### Description
Section 11: "Delete foods." Implemented as a soft delete against the
`isArchived` flag defined in TICKET-015, decided there specifically so
this ticket wouldn't need to choose between breaking history and blocking
deletion.

### Acceptance Criteria
- [ ] Admin "delete" sets `Food.isArchived = true` — no hard delete of a
      `Food` row in the MVP admin UI, since a hard delete would either
      violate the `MealEntry.foodId` foreign key or force cascading
      deletes that destroy a user's logged history
- [ ] Archived foods disappear from search (TICKET-018), the Food page
      (TICKET-046), and the Add Food flow (TICKET-019) per TICKET-017's
      filtering, but remain resolvable by id so existing `MealEntry` rows
      still render the food's name/details in History (TICKET-031) and
      the Dashboard (TICKET-025)
- [ ] Admin food-management list (TICKET-041) shows archived foods with
      their "Archived" indicator and offers an "unarchive" action there,
      rather than hiding them with no way back

---

## TICKET-044: Admin — view registered users

**Priority:** P2 · **Status:** Not Started · **Depends on:** TICKET-040

### Description
Section 11: "View registered users."

### Acceptance Criteria
- [ ] List of users (name/email, sign-up date) visible to admin
- [ ] No password or sensitive auth data exposed in the list
- [ ] Read-only for MVP — no user editing/deletion by admin (not
      requested in the brief)

---

## TICKET-045: Admin — basic app statistics

**Priority:** P2 · **Status:** Not Started · **Depends on:** TICKET-040

### Description
Section 11: "View basic application statistics."

### Acceptance Criteria
- [ ] Dashboard shows: total registered users, total foods in database,
      total logged meal entries (minimum viable stat set — expand only
      if trivial)
- [ ] Numbers reflect live data, not cached/stale values beyond a normal
      page load
