# EPIC-03 — Food Database

Source: Requirements Section 10 (Food Database) and Section 15 (Unique MVP
Idea — Nigerian foods).

---

## TICKET-015: Food data model

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-003

### Description
Define the `Food` schema exactly matching the fields Section 10 lists.

### Acceptance Criteria
- [ ] `Food` model fields: name, category, calories, protein,
      carbohydrates, fat, servingSize — matching Section 10's example
      (Jollof Rice: Category Rice, 350 kcal, 8g protein, 55g carbs, 12g
      fat, 1 cup)
- [ ] `category` values cover at least: Rice, Soup, Protein, Snack,
      Fruit, Swallow (Eba/Amala/Pounded Yam), Beverage — extendable, not
      a hardcoded enum that blocks admin from adding new categories
- [ ] `servingSize` is a descriptive display string (e.g. "1 cup", "1
      plate", "1 piece"), matching Section 10's example — it is never
      parsed or used in arithmetic; the calorie/macro fields already
      represent "per one serving," and quantity (TICKET-019) multiplies
      that whole-serving value, not the serving-size text
- [ ] `Food` includes an `isArchived` boolean (default `false`), decided
      here so TICKET-043 (admin delete) has a field to soft-delete
      against instead of hard-deleting rows referenced by historical
      `MealEntry` records
- [ ] Migration applied cleanly

---

## TICKET-016: Seed data — Nigerian + common foods

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-015

### Description
Populate the food database with the foods explicitly named in the brief
so the MVP is usable on day one without relying on admin data entry.

### Acceptance Criteria
- [ ] All foods from Section 4's examples seeded: Rice, Beans, Chicken,
      Egg, Bread, Yam, Banana, Apple, Jollof Rice
- [ ] All foods from Section 15 seeded, grouped as listed —
      Breakfast: Akara, Pap, Bread, Eggs, Moi Moi;
      Lunch/Dinner: Jollof Rice, Fried Rice, White Rice, Beans, Eba,
      Amala, Pounded Yam, Egusi Soup, Okra Soup, Afang Soup, Chicken, Fish
- [ ] Each seeded food has plausible, documented calorie/macro/serving
      values (sourced from a stated reference, not left blank)
- [ ] Seed script is re-runnable without creating duplicates

---

## TICKET-017: Food read API (list, get by id)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-015

### Description
Basic read endpoints the search feature (EPIC-04) and admin views
(EPIC-10) both build on.

### Acceptance Criteria
- [ ] `GET` list endpoint returns foods, supports pagination or a
      reasonable page size for MVP
- [ ] `GET` list endpoint excludes `isArchived: true` foods by default
      (search and Add Food should never surface a soft-deleted food);
      `GET` by id still returns an archived food so a historical
      `MealEntry` referencing it can render its name/details correctly
- [ ] `GET` by id endpoint returns a single food's full detail
- [ ] Both endpoints are read-only here — write endpoints belong to
      EPIC-10 (Admin)
