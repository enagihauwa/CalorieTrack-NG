# EPIC-03 — Food Database

Source: Requirements Section 10 (Food Database) and Section 15 (Unique MVP
Idea — Nigerian foods).

---

## TICKET-015: Food data model

**Priority:** P0 · **Status:** Done (built during EPIC-00) · **Depends on:** TICKET-003

### Description
Define the `Food` schema exactly matching the fields Section 10 lists.

Already written and migrated as part of EPIC-00's `TICKET-003`, since the
schema skeleton needed the full `Food` model up front — see that ticket.
Nothing left to do here; kept for traceability.

### Acceptance Criteria
- [x] `Food` model fields: name, category, calories, protein,
      carbohydrates, fat, servingSize — matching Section 10's example
      (Jollof Rice: Category Rice, 350 kcal, 8g protein, 55g carbs, 12g
      fat, 1 cup)
- [x] `category` values cover at least: Rice, Soup, Protein, Snack,
      Fruit, Swallow (Eba/Amala/Pounded Yam), Beverage — extendable, not
      a hardcoded enum that blocks admin from adding new categories.
      Confirmed by TICKET-016's seed data, which actually uses all seven
      required categories plus a few extras (Legume, Grain, Tuber)
- [x] `servingSize` is a descriptive display string (e.g. "1 cup", "1
      plate", "1 piece"), matching Section 10's example — it is never
      parsed or used in arithmetic; the calorie/macro fields already
      represent "per one serving," and quantity (TICKET-019) multiplies
      that whole-serving value, not the serving-size text
- [x] `Food` includes an `isArchived` boolean (default `false`), decided
      here so TICKET-043 (admin delete) has a field to soft-delete
      against instead of hard-deleting rows referenced by historical
      `MealEntry` records
- [x] Migration applied cleanly — `prisma/migrations/20260829011450_init`,
      confirmed against a real PostgreSQL database

---

## TICKET-016: Seed data — Nigerian + common foods

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-015

### Description
Populate the food database with the foods explicitly named in the brief
so the MVP is usable on day one without relying on admin data entry.

Implemented at `prisma/seed.ts`, wired to `npx prisma db seed` /
`npm run seed` via `package.json`'s `prisma.seed` field. 20 foods total —
Section 4's and Section 15's lists overlap on a few names (Section 4's
generic "Rice"/"Egg" are the same food as Section 15's "White Rice"/
"Eggs"), so each is seeded once under the more descriptive name rather
than as two near-duplicate rows; this is called out in a comment at the
top of the seed file.

### Acceptance Criteria
- [x] All foods from Section 4's examples seeded: Rice (as "White Rice"),
      Beans, Chicken, Egg, Bread, Yam, Banana, Apple, Jollof Rice
- [x] All foods from Section 15 seeded, grouped as listed —
      Breakfast: Akara, Pap, Bread, Eggs (as "Egg"), Moi Moi;
      Lunch/Dinner: Jollof Rice, Fried Rice, White Rice, Beans, Eba,
      Amala, Pounded Yam, Egusi Soup, Okra Soup, Afang Soup, Chicken, Fish
- [x] Each seeded food has plausible, documented calorie/macro/serving
      values — sourced from standard nutrition references (USDA
      FoodData Central for generic staples; commonly published estimates
      for Nigerian dishes) per the seed file's header comment. Jollof
      Rice specifically uses Section 10's own worked-example values
      (350 kcal, 8g protein, 55g carbs, 12g fat, 1 cup) rather than an
      estimate, since the brief already gives an authoritative figure
- [x] Seed script is re-runnable without creating duplicates — matches
      on `name`, skips (doesn't overwrite) an existing row, so an admin
      edit survives a re-seed. Verified: ran twice against the real
      database, first run created 20, second run created 0/skipped 20
- [x] **Verified against a real database:** all 20 rows confirmed via
      `psql`, with correct categories covering every category
      TICKET-015 required (Rice, Soup, Protein, Snack, Fruit, Swallow,
      Beverage) plus a few natural extras (Legume, Grain, Tuber)

---

## TICKET-017: Food read API (list, get by id)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-015

### Description
Basic read endpoints the search feature (EPIC-04) and admin views
(EPIC-10) both build on.

Implemented as Next.js Route Handlers: `GET /api/foods` (list, paginated)
at `src/app/api/foods/route.ts`, `GET /api/foods/:id` at
`src/app/api/foods/[id]/route.ts`. Both require an authenticated session
(`401` otherwise), consistent with the rest of the app sitting behind
login — no route in this MVP is meant to be reachable signed out.
Deliberately does **not** add search/filter query params — that's
TICKET-018's job (EPIC-04); adding it here would be building ahead of
the ticket that owns it.

### Acceptance Criteria
- [x] `GET` list endpoint returns foods, supports pagination
      (`?page=&pageSize=`, default 20/page, capped at 100/page)
- [x] `GET` list endpoint excludes `isArchived: true` foods by default
      (search and Add Food should never surface a soft-deleted food);
      `GET` by id still returns an archived food so a historical
      `MealEntry` referencing it can render its name/details correctly
- [x] `GET` by id endpoint returns a single food's full detail, `404`
      with a JSON error body if the id doesn't exist
- [x] Both endpoints are read-only here — write endpoints belong to
      EPIC-10 (Admin)
- [x] **Verified against a real database**, authenticated via a real
      signed-up/logged-in session (not mocked): unauthenticated requests
      to both endpoints return `401`; the list endpoint returns all 20
      seeded foods sorted alphabetically; pagination tested at
      `pageSize=5` — 4 pages, no overlap between page 1 and page 2;
      fetching Jollof Rice by id returned exactly Section 10's values;
      fetching a nonexistent id returned `404`; archiving a food directly
      in the database made it disappear from the list (20 → 19 results)
      while `GET /api/foods/:id` for that same food still returned it
      with `isArchived: true`
