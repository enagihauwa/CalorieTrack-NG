# EPIC-01 — User Registration, Auth & Profile

Source: Requirements Section 2 (User Registration and Profile), Section 16
(sign-up is step 1 of the user journey).

---

## TICKET-006: User sign-up (email/password)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-003

### Description
Let a new user create an account with email + password. Passwords are
hashed (bcrypt) before storage; no plaintext password ever touches the DB
or logs.

### Acceptance Criteria
- [ ] Sign-up form: email, password, confirm password
- [ ] Validates email format, password minimum strength, matching
      confirmation
- [ ] Duplicate email is rejected with a clear error, not a generic 500
- [ ] Password stored only as a bcrypt hash
- [ ] Successful sign-up creates a `User` row, starts a session, and
      redirects to the profile onboarding form (TICKET-008) — a new user
      never lands on Dashboard without one

---

## TICKET-007: Login / logout / session management

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-006

### Description
NextAuth credentials-based login, persistent session, logout, and
route protection so unauthenticated users can't reach Dashboard/Food/
History/Progress/Profile.

### Acceptance Criteria
- [ ] Login form authenticates against the credentials provider
- [ ] Invalid credentials show a clear error, no user enumeration (same
      message for "no such user" and "wrong password")
- [ ] Session persists across page reloads
- [ ] Logout clears the session and redirects to login
- [ ] Unauthenticated access to any main section redirects to login
- [ ] After login, a user with a completed profile lands on Dashboard; a
      user without one (e.g. abandoned onboarding before finishing
      TICKET-008) is redirected to the onboarding form instead — this
      check runs on every login, not just immediately after sign-up

---

## TICKET-008: Profile form (age, gender, weight, height, activity, goal)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-006

### Description
Section 2's onboarding form, collected right after sign-up per the user
journey in Section 16: name, age, gender, weight, height, activity level,
and goal (lose / maintain / gain weight).

### Acceptance Criteria
- [ ] Form collects: name, age, gender, weight, height, activity level
      (fixed set, e.g. sedentary/light/moderate/active/very active),
      goal (lose weight / maintain weight / gain weight)
- [ ] Client- and server-side validation (realistic ranges for age/
      weight/height; all required fields present)
- [ ] Submitting triggers TICKET-011/012 to compute the daily calorie
      target before the user lands on the Dashboard
- [ ] User cannot reach the Dashboard without completing this form once

---

## TICKET-009: Profile data model & validation

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-003

### Description
The `Profile` table/schema underlying TICKET-008, plus shared validation
logic used by both the create flow and the edit flow (TICKET-010).

### Acceptance Criteria
- [ ] `Profile` model: userId (FK), name, age, gender, weight, height,
      activityLevel (enum), goal (enum: lose/maintain/gain)
- [ ] Validation rules defined once and reused by create + edit forms
      (not duplicated client vs. server)
- [ ] Weight/height units are explicit (decide kg/cm as MVP default,
      documented here so UI copy matches)

### Notes
Units decision: kg and cm as the MVP default (matches the 85kg/82kg/75kg
example in Section 9). No unit switcher planned for MVP — out of scope
unless requested.

---

## TICKET-010: Edit profile after onboarding

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-008, TICKET-009

### Description
The Profile section in main navigation (Section 12) needs to let a user
view and update the same fields collected at sign-up.

### Acceptance Criteria
- [ ] Profile page shows current values, editable
- [ ] Saving changes updates the `Profile` row
- [ ] Saving changes that affect the calorie target (weight, height, age,
      activity level, goal) triggers TICKET-014 recalculation
