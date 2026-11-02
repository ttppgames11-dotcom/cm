# CRM Roll-ups (Step 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read-only dashboards that show how each CRM unit, and everything under it, is doing against the yearly 12-activity plan: a summary per unit and a table per level, all inside the viewer's own area.

**Architecture:** No new table. A pure `UnitProgress` calculator (own numbers of one unit from its activity rows) is used by a new `CrmRollupService` that loads the visible active units (`CrmUnitRepository.list` with the member's `Scope`) and all their activity rows of the year in one query, then sums them up the tree. Two new GET routes; the website adds a Summary section on the unit card and a roll-up table at the top of the page.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-02-crm-rollup-design.md`

## Global Constraints

- Backend work continues on `Abhay_app` in `E:\community_mobile` (Steps 1-3 are there and on `main`); the website on a new branch `feat/crm-rollup-website` cut from `feat/crm-activities-website` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only. Nothing is merged or deployed without the user. Website-only feature.
- Reuse Steps 1-3: `CrmScope.of`, `Scope.contains(path)`, `CrmUnitRepository.find(id)` and `list(level, parentId, search, scope)` (unit rows with `id, name, level, status, path, parent_id`; capped at 500 rows, ladder order), `CrmActivityService.yearOf(String)`, `derivedStatus`, `INDIA`, `ActivityTypes.ALL`, the unit JSON helpers. Errors: `UNIT_NOT_FOUND` 404, `INVALID_ACTIVITY` 400 (bad year).
- Only active units count; a unit with an archived ancestor (its path starts with an archived unit's path) is left out too. Coverage = types with at least one done activity (`typesDone`).
- Test members `M93xx` as in Step 1 (`CrmUnitTestBase`: `M9301`–`M9308`, admin `M9390`, ceo `M9391`). Roll-up tests use dates in 2020 (all in the past) so statuses never depend on today. Backend tests: from `E:\community_mobile\backend-java`, `mvn -q -B test -Dtest=<Class>` and the full `mvn -q -B test` (no `clean`). Known flakes: `NodeParityTest`, `MeetingStreamTest`, and once an Enquiry test (rerun alone). Website: `node --test <files>` (files, not a directory) and `npm run build` from `E:\community_mobile_main\frontend`.

## Rulings made while planning

- **R1:** the shared test helper `activity(unitId, type, date, target, status, attendees)` moves from `CrmActivityReadTest` into `CrmUnitTestBase` so the roll-up tests use it too. Cost if wrong: none.
- **R2:** the roll-up reads at most the 500 units `CrmUnitRepository.list` returns (the cap already in Step 1). Cost if wrong: a very large tree would be cut off; acceptable for now.
- **R3:** an archived unit asked for directly through `/units/{id}/summary` answers with its own numbers and a roll-up of itself only (children are not listed); it does not appear in `/rollup` at all.
- **R4:** the shared figure in the Step 3 list stays `typesCovered` (types with any activity); `typesDone` is added next to it.

## Test tree and expected numbers (used by Task 1 and Task 2)

S (state) → B1 (branch, owner M9301) → D1 (district, owner M9302, staff M9304) → T1 (taluka); S → B2 (branch, owner M9303) → D2 (district). Activities, year 2020 (all past): D1: `blood_donation` done 40 target 100; `job_fair` stored in_progress target 300; `health_checkup` stored planned target 200. T1: `blood_donation` done 10 target 50; `spiritual` done 5 target 20. D2: `food_expo` done 30 target 200. S, B1, B2 have none.
- D1 own: total 3, done 1, overdue 2, planned 0, in_progress 0, targetTotal 600, achievedTotal 40, typesDone 1, typesPlanned 3, coveragePct 8, completionPct 33.
- T1 own: total 2, done 2, targetTotal 70, achievedTotal 15, typesDone 2, typesPlanned 2, coveragePct 17, completionPct 100.
- B1 rollup (B1, D1, T1): total 5, done 3, overdue 2, targetTotal 670, achievedTotal 55, unitsCount 3, avgCoveragePct 8, unitsFullyCovered 0, completionPct 60. D1 rollup (D1, T1): total 5, done 3, unitsCount 2.
- Level `district`: units D1 and D2, `totals`: unitsCount 2, total 4, done 2, overdue 2, targetTotal 800, achievedTotal 70, completionPct 50, avgCoveragePct 8 (mean of 8 and 8).

## Review Focus

- **Scope:** an owner never sees a sibling's numbers or units; staff see only their own unit (no children, rollup = own); a member with no access gets an empty roll-up and 404 on a summary. Tests in Task 1 and Task 2.
- **Archived units** and everything below them are in no total of any viewer. Test in Task 2.
- **Maths:** the sums equal the sum of the parts; empty years give zeros with no division by zero; rounding as listed above. Tests in Task 1.
- **Cost:** one activities query per request, not one per unit. Checked in the code review.
- **No leaks:** owner phones and activity notes are not in the roll-up answers.

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../crmunit/UnitProgress.java` (create) | pure maths: own numbers from activity rows, summing, percentages |
| `backend-java/.../crmunit/repository/CrmActivityRepository.java` (modify) | `rowsForUnits(List<String> unitIds, int year)` |
| `backend-java/.../crmunit/service/CrmActivityService.java` (modify) | `progress` also returns `typesDone` |
| `backend-java/.../crmunit/service/CrmRollupService.java`, `controller/CrmRollupController.java` (create) | summary and roll-up |
| `backend-java/src/test/.../crmunit/CrmUnitTestBase.java` (modify), `CrmActivityReadTest.java` (modify), `CrmRollupSummaryTest.java`, `CrmRollupLevelTest.java` (create) | tests |
| `backend-java/README.md` (modify) | route rows |
| `frontend/src/pages/crm/crmUnitsHelp.js` + `.test.js`, `SummarySection.jsx`, `RollupPanel.jsx`, `UnitHierarchyPanel.jsx`, `CrmUnitsPage.jsx`, `frontend/src/services/apiClient.js` (modify / create) | website |

---

### Task 1: Backend — `UnitProgress` and the unit summary

**Interfaces:**
- Consumes: Steps 1-3 as listed.
- Produces:
  - `UnitProgress`: `static Map<String,Object> own(List<Map<String,Object>> rows, LocalDate today)` (rows are `crm_activities` rows with `type`, `status`, `scheduled_date`, `target_count`, `attendee_count`; returns `total, planned, in_progress, done, overdue, targetTotal, achievedTotal, typesDone, typesPlanned, typesRequired (12), coveragePct, completionPct, byType` where `byType` has all 12 keys, each `{total, done, overdue, target, achieved}`), `static Map<String,Object> sum(List<Map<String,Object>> owns)` (adds the counts, `unitsCount`, `avgCoveragePct`, `unitsFullyCovered`, `completionPct`, `targetTotal`, `achievedTotal`, per-status counts). Percentages are `Math.round(x * 100f / y)`, 0 when the divisor is 0.
  - `CrmActivityRepository.rowsForUnits(List<String> unitIds, int year) -> List<Map<String,Object>>` (all activity rows of those units in the year; empty list for no ids).
  - `CrmActivityService.progress(...)` adds `typesDone` (types with a done activity).
  - `CrmRollupService.summary(CurrentUser, String unitId, String yearText) -> Map` and `GET /api/crm-hierarchy/units/{id}/summary?year=` → `{success, year, unit: {id, name, level, status}, own, rollup, children: [{unit, own, rollup}], types: [12 types as in /activity-types]}`; `children` are the active direct children the viewer can see. "Visible active units" = `units.list(null, null, null, scope)` minus archived units and units below an archived one.

- [ ] **Step 1: Write the failing tests.** Move the `activity(...)` helper (and its `serial` counter) from `CrmActivityReadTest` to `CrmUnitTestBase` (R1). Add `typesDone` assertions to `CrmActivityReadTest.statusesAndProgressAreWorkedOut` (2020 data: `typesDone` 1; 2090 data: 0). New `CrmRollupSummaryTest` (same annotations as the other crmunit tests; `tree()` and the activities of the test tree above):
  - `ownNumbersOfOneUnit` (`GET /units/D1/summary?year=2020` as the owner M9302: `own` equals the D1 numbers above; `byType.blood_donation` is `{total 1, done 1, overdue 0, target 100, achieved 40}`, `byType.job_fair` overdue 1, `byType.food_expo` all zeros; `types` has 12).
  - `rollupSumsTheUnitAndEverythingBelow` (B1 as owner M9301: `own` zeros, `rollup` equals the B1 numbers above; `children` is `[D1]` with its own and rollup (rollup total 5, done 3); as M9302 for D1: children `[T1]`).
  - `coverageCountsOnlyDoneTypes` (a unit with a full plan of 12 planned activities and nothing done: `typesPlanned` 12, `typesDone` 0, `coveragePct` 0).
  - `emptyYearIsZeros` (year 2091: every number 0, `completionPct` 0, `byType` still 12 keys).
  - `whoSeesWhat` (staff M9304 of D1: summary of D1 works, `children` is empty and `rollup` equals `own`; summary of T1 or B1 → 404; sibling owner M9303 → 404 on B1 and on D1; owner of B1 sees D1; admin and CEO see S with `children` `[B1, B2]`; a member without a unit and a visitor → 404; unknown unit → 404 `UNIT_NOT_FOUND`).
  - `archivedUnitsAreLeftOut` (archive D1: the B1 rollup no longer counts D1 and T1 (total 0, unitsCount 1), `children` of B1 is empty; `GET /units/D1/summary` as admin answers with D1's own numbers and a rollup of itself only (R3)).
  - `badYear` (`?year=1999`, `abc`, `2101` → 400 `INVALID_ACTIVITY`; no year → this year).
  - `noDataLeaks` (the answer contains no `phone`, no `notes`).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmRollupSummaryTest`. Expected: failures (404), not compile errors in the test base.
- [ ] **Step 3: Implement** `UnitProgress`, `rowsForUnits`, the `typesDone` addition, `CrmRollupService.summary`, `CrmRollupController` (summary route), README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='CrmUnit*Test,CrmStaff*Test,CrmActivity*Test,CrmRollup*Test'`, then the full suite. Expected: all pass (flakes → rerun alone).
- [ ] **Step 5: Commit** `feat(backend-java): CRM unit summary with roll-up and per-type numbers (tests)`.

---

### Task 2: Backend — the roll-up by level

**Interfaces:**
- Consumes: Task 1 (`UnitProgress`, `rowsForUnits`, the visible-active-units helper).
- Produces: `CrmRollupService.rollup(CurrentUser, String yearText, String levelText) -> Map` and `GET /api/crm-hierarchy/rollup?year=&level=` → `{success, year, levels: [{level, levelLabel, unitsCount, totals, units: [{unit: {id, name, level}, own, rollup}]}]}`: one entry for each level (top first) that has visible active units; `levelLabel` is राज्य, शाखा, विभाग, जिल्हा, तालुका; `totals` = `UnitProgress.sum` of the `own` numbers of that level's units (counts, targets, `unitsCount`, `avgCoveragePct`, `unitsFullyCovered`, `completionPct`); `?level=` (a level code; `all` or empty = no filter; an unknown code → 400 `INVALID_ACTIVITY`) keeps only that level. A visitor or a member with no access gets `levels: []`.

- [ ] **Step 1: Write the failing tests** in `CrmRollupLevelTest`:
  - `oneTablePerLevelWithTotals` (admin, 2020: levels in order state, branch, district, taluka (no division); `district` has units D1, D2 and the district totals listed above; each row has `own` and `rollup`; `state` row S has the whole-tree rollup (total 6, done 4, achievedTotal 85, unitsCount 6); `levelLabel` of `district` is `जिल्हा`).
  - `levelFilter` (`?level=district` → only that level; `?level=all` → all; `?level=village` → 400).
  - `ownersSeeOnlyTheirOwnArea` (owner M9301: levels branch (B1), district (D1), taluka (T1) only, no state, no B2, no D2; owner M9302: district D1 and taluka T1; the numbers of D1 for M9301 equal the numbers for the admin; staff M9304: one level, district, only D1, with `rollup` equal to `own`).
  - `ceoSeesEverythingAndStrangersNothing` (CEO = admin's answer; a member without a unit and a visitor → `levels: []`, 200).
  - `archivedUnitsAreNotListed` (archive B1: no B1, D1, T1 in any level, and S's rollup counts only S, B2, D2).
  - `emptyYearAndBadYear` (year 2091 → rows with zeros; `?year=1999` → 400).
  - `oneActivitiesQueryPerRequest` (the repository method `rowsForUnits` is called once per roll-up request: assert with a Mockito spy or by counting through a `@SpyBean`, or, if that is not practical in this test setup, assert that the service builds its answer from a single call by reading the code in review and ledger it).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmRollupLevelTest`. Expected: failures (404 / 405), not compile errors.
- [ ] **Step 3: Implement** `CrmRollupService.rollup` and the controller route; README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='CrmUnit*Test,CrmStaff*Test,CrmActivity*Test,CrmRollup*Test'`, then the full suite. Expected: all pass.
- [ ] **Step 5: Commit** `feat(backend-java): CRM roll-up by level (tests)`.

---

### Task 3: Website — Summary section and roll-up table

**Branch:** in `E:\community_mobile_main`: `git checkout feat/crm-activities-website`, `git pull`, `git checkout -b feat/crm-rollup-website`.

**Interfaces:**
- Produces: `apiClient.crmUnitSummary(unitId, year)` and `crmRollup(params)`; `crmUnitsHelp.js`: `pctBar(pct) -> number` (rounded, clamped 0–100, anything not a number → 0), `coverageLabel(own) -> string` (`"{typesDone}/12 प्रकार पूर्ण"`; no own → `"—"`), `rollupRow(entry) -> {id, name, levelLabel, done, total, coveragePct, completionPct, overdue, achieved, target}` (zeros for missing numbers), and `progressLabel` extended: `"{done}/{total} पूर्ण · {typesCovered}/12 प्रकार नियोजित · {typesDone} प्रकार पूर्ण"` (the empty-plan text stays `आराखडा नाही`); `SummarySection.jsx` after `ActivitiesSection` on the unit card; `RollupPanel.jsx` at the top of `/crm/units` (in `UnitHierarchyPanel`) when the viewer sees more than one unit.

- [ ] **Step 1: Write the failing tests** in `crmUnitsHelp.test.js`: `pctBar(33.4)` → 33, `pctBar(120)` → 100, `pctBar(-5)` → 0, `pctBar('x')` → 0, `pctBar(undefined)` → 0; `coverageLabel({typesDone: 2})` → `2/12 प्रकार पूर्ण`, `coverageLabel(null)` → `—`; `rollupRow({unit: {id:'U1', name:'Pune', level:'district'}, own: {done: 1, total: 3, coveragePct: 8, completionPct: 33, overdue: 2, achievedTotal: 40, targetTotal: 600}})` → the fields above with `levelLabel` `जिल्हा`, and a missing `own` → zeros; the updated `progressLabel` (the Step 3 test is updated to the new text, and a case with `typesDone` missing treats it as 0).
- [ ] **Step 2: Run** `node --test src/pages/crm/crmUnitsHelp.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, the two calls, `SummarySection` (year picker, own and total progress bars from `pctBar`, the child table from `rollupRow`, the 12-type table using the type names from `crmActivityTypes()`; loading and error states in Marathi; a request counter ignores late answers; remounts per unit) and `RollupPanel` (year picker, a table per level with a row per unit and a total row; hidden when there is one unit or none; clicking a unit name selects it in the panel through a callback prop).
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (`built in`).
- [ ] **Step 5: Commit** `feat(website): CRM summary section and roll-up table (tests)`.

---

## Release (after the final review, with the user's yes at each step)

Backend: clean branch from the new `origin/main` with the Step 4 backend commits cherry-picked → PR → merge → `deploy-java.ps1` → check `GET /api/crm-hierarchy/rollup` answers 200 with an empty list for a visitor and `GET /api/crm-hierarchy/units/x/summary` answers 404. The website PR goes last, after the earlier CRM website PRs, with the user's yes.
