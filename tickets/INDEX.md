# Ticket Index

All tickets derived from `CalorieTrack_NG_MVP_Requirements(1) (1).txt`.
Each epic file has full ticket detail (description, acceptance criteria,
dependencies). This index is the at-a-glance list and suggested build order.

Status values: `Not Started` / `In Progress` / `Blocked` / `Done`.
Priority: `P0` (blocks core workflow) / `P1` (core MVP feature) / `P2`
(nice-to-have within MVP scope).

## Build order (epics)

1. `EPIC-00` Project Setup & Foundation
2. `EPIC-01` Auth & Profile
3. `EPIC-02` Daily Calorie Target Calculation
4. `EPIC-03` Food Database
5. `EPIC-04` Food Search & Add Food
6. `EPIC-05` Meal Categories & Daily Log
7. `EPIC-06` Dashboard & Daily Progress
8. `EPIC-07` Food History
9. `EPIC-08` Progress & Statistics
10. `EPIC-09` Weight Tracking
11. `EPIC-10` Admin Dashboard

Rationale: each epic depends on the data/logic the previous one establishes
(e.g. you can't build the dashboard's progress bar before food logging
exists; you can't log food before there's a food database to search).
`EPIC-10` (Admin) is last because the app can launch with a seeded database
and doesn't strictly need admin CRUD until real content maintenance starts.

### Cross-epic build-order exceptions

Epic order above is a grouping by feature area, not a strict "finish epic N
entirely before touching epic N+1" rule — two pairs of epics have tickets
that depend on each other out of that order. Both are called out on the
tickets themselves, but are listed here too so the exception isn't missed:

- **EPIC-04 ↔ EPIC-05.** `TICKET-019` (Add Food flow, EPIC-04) writes a
  `MealEntry`, so it depends on `TICKET-021` (meal entry data model,
  EPIC-05) — build `TICKET-021` first even though it's numbered in the
  "next" epic. Then `TICKET-022` (EPIC-05) depends back on `TICKET-019`
  (EPIC-04) to actually produce entries to log. Correct order for this
  slice: `015 → 021 → 017 → 018 → 019 → 020/046 → 022 → 023 → 024`.
- **EPIC-08 ↔ EPIC-09.** `TICKET-036` (Progress page layout, EPIC-08)
  depends on `TICKET-039` (weight progress chart, EPIC-09). Pull
  `TICKET-037` and `TICKET-039` forward and build them before closing out
  `TICKET-036`, even though EPIC-09 is numbered after EPIC-08.

## Full ticket list

### EPIC-00 — Project Setup & Foundation
| ID | Title | Priority |
|---|---|---|
| TICKET-001 | Initialize repository & tooling | P0 |
| TICKET-002 | Architecture decision record for the stack | P0 |
| TICKET-003 | Database schema & ORM setup | P0 |
| TICKET-004 | Dev scripts: lint, format, typecheck, test runner | P1 |
| TICKET-005 | App shell: main navigation + Add Food button | P0 |

### EPIC-01 — Auth & Profile
| ID | Title | Priority |
|---|---|---|
| TICKET-006 | User sign-up (email/password) | P0 |
| TICKET-007 | Login / logout / session management | P0 |
| TICKET-008 | Profile form (age, gender, weight, height, activity, goal) | P0 |
| TICKET-009 | Profile data model & validation | P0 |
| TICKET-010 | Edit profile after onboarding | P1 |

### EPIC-02 — Daily Calorie Target Calculation
| ID | Title | Priority |
|---|---|---|
| TICKET-011 | BMR/TDEE calculation service | P0 |
| TICKET-012 | Goal-based target adjustment (lose/maintain/gain) | P0 |
| TICKET-013 | Macronutrient targets (protein/carbs/fat) | P1 |
| TICKET-014 | Recalculate target on profile update | P1 |

### EPIC-03 — Food Database
| ID | Title | Priority |
|---|---|---|
| TICKET-015 | Food data model | P0 |
| TICKET-016 | Seed data: Nigerian + common foods | P0 |
| TICKET-017 | Food read API (list, get by id) | P0 |

### EPIC-04 — Food Search & Add Food
| ID | Title | Priority |
|---|---|---|
| TICKET-018 | Food search (UI + API) | P0 |
| TICKET-019 | Add Food flow: quantity/serving → total calories | P0 |
| TICKET-020 | Global "+ Add Food" entry point | P0 |
| TICKET-046 | Food page — browsable/searchable database view | P1 |

### EPIC-05 — Meal Categories & Daily Log
| ID | Title | Priority |
|---|---|---|
| TICKET-021 | Meal category model & food-entry association | P0 |
| TICKET-022 | Log a food entry against a meal + date | P0 |
| TICKET-023 | Meal breakdown UI (grouped by category, subtotals) | P0 |
| TICKET-024 | Edit / delete a logged food entry | P1 |

### EPIC-06 — Dashboard & Daily Progress
| ID | Title | Priority |
|---|---|---|
| TICKET-025 | Dashboard layout: Today's Summary | P0 |
| TICKET-026 | Calorie progress indicator (bar/circular) | P0 |
| TICKET-027 | Macronutrient progress display | P1 |
| TICKET-028 | Over-target warning message | P1 |
| TICKET-029 | Daily consumption aggregation API | P0 |

### EPIC-07 — Food History
| ID | Title | Priority |
|---|---|---|
| TICKET-030 | History page with date navigation | P0 |
| TICKET-031 | Fetch & display meals/totals for selected date | P0 |
| TICKET-032 | Empty state for days with no logs | P2 |

### EPIC-08 — Progress & Statistics
| ID | Title | Priority |
|---|---|---|
| TICKET-033 | Weekly calorie aggregation API | P1 |
| TICKET-034 | Weekly trend chart | P1 |
| TICKET-035 | Average daily calories stat | P2 |
| TICKET-036 | Progress page layout | P1 |

### EPIC-09 — Weight Tracking
| ID | Title | Priority |
|---|---|---|
| TICKET-037 | Weight entry model + log-weight UI | P1 |
| TICKET-038 | Weight history list | P2 |
| TICKET-039 | Weight progress chart | P1 |

### EPIC-10 — Admin Dashboard
| ID | Title | Priority |
|---|---|---|
| TICKET-040 | Admin role & route gating | P1 |
| TICKET-041 | Admin: food management list + add food | P1 |
| TICKET-042 | Admin: edit food | P1 |
| TICKET-043 | Admin: delete food | P1 |
| TICKET-044 | Admin: view registered users | P2 |
| TICKET-045 | Admin: basic app statistics | P2 |

**Total: 46 tickets across 11 epics.**
