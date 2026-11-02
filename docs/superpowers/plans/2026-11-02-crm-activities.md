# CRM Activities (Step 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each CRM unit plans and records its yearly activities (12 types, one click creates the plan, "done" needs proof); the unit's own team writes, the levels above only read.

**Architecture:** A new table `crm_activities` and a new service `CrmActivityService` (own repository, schemas and controller) beside Step 1 and 2's `CrmUnitService`, reusing `CrmScope`. The website adds an "Activities" section to the unit card.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-02-crm-activities-design.md`

## Global Constraints

- Backend work continues on `Abhay_app` in `E:\community_mobile` (Steps 1 and 2 are there and on `main`); the website on a new branch `feat/crm-activities-website` cut from `feat/crm-staff-website` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only. Nothing is merged or deployed without the user. Website-only feature.
- Reuse Steps 1 and 2: `CrmScope.of`, `Scope` (`kind` `global | unit | staff | none`, `unitId`, `write`, `contains`), `CrmUnitRepository.find(id)` (unit row with `path`, `status`, `level`), `CrmUnitService`'s patterns (`requireWrite`, `noAccess`, `unitArchived`, `audit`, `tx` TransactionTemplate), `JsonBody`, `SchemaValidator.check`.
- Codes exactly as in the spec: `UNIT_NOT_FOUND` 404, `NO_ACCESS` 403, `UNIT_ARCHIVED` 409, `ACTIVITY_NOT_FOUND` 404, `INVALID_ACTIVITY` 400, `PROOF_REQUIRED` 400, `USE_COMPLETE` 400, `ALREADY_DONE` 409. Activity ids `ACT-` + 8 hex characters. "Today" is `LocalDate.now(ZoneId.of("Asia/Kolkata"))`.
- Test members `M93xx` as in Step 1 (`CrmUnitTestBase`: `M9301`–`M9308`, admin `M9390`, ceo `M9391`). Activity tests use dates far in the past (`2020-…`) and far in the future (`2090-…`) so "overdue" never depends on today's date. Backend tests: from `E:\community_mobile\backend-java`, `mvn -q -B test -Dtest=<Class>` and the full `mvn -q -B test` (no `clean`). Known flakes: `NodeParityTest`, `MeetingStreamTest` (rerun alone). Website: `node --test <files>` (files, not a directory) and `npm run build` from `E:\community_mobile_main\frontend`.

## Rulings made while planning

- **R1:** the activity code lives in its own classes (`ActivityTypes`, `CrmActivitySchemas`, `CrmActivityRepository`, `CrmActivityService`, `CrmActivityController`) in package `crmunit`, not in `CrmUnitService`, which is already large. Cost if wrong: none.
- **R2:** `GET /units/{id}/activities` calls `ensureCrmActivityTables()` before anything else, so a 404 request also creates the table; the shared test base uses this to prepare the table before cleaning.
- **R3:** the plan check "types already there this year" counts any activity of that type whose `year` equals the plan year, including extra ones; the new activity gets the title of its type.
- **R4:** `PUT` may set `status` only to `planned` or `in_progress`; it may not move a done one (`ALREADY_DONE`) and `done` is refused with `USE_COMPLETE`.

## Review Focus

- **Writers only:** staff and owner of exactly that unit and admins write; an owner of a unit above, the CEO, a sibling's owner and a visitor never do. Tests in Task 2.
- **Done is final:** proof required, one conditional update, no edit and no re-complete (including two simultaneous completes). Test in Task 2.
- **Plan twice or at once:** a second click and two simultaneous clicks create exactly one set of 12. Test in Task 2.
- **Dates and years:** impossible dates (`2026-02-30`), year 1999 / 2101, and a date whose year differs from the requested year. Tests in Task 2.
- **Archived units:** reads work, every write is refused. Test in Task 2.

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/018_crm_activities.sql` (create) | table and index |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `CRM_ACTIVITY_TABLES`, `ensureCrmActivityTables()` |
| `backend-java/.../crmunit/ActivityTypes.java` (create) | the 12 types |
| `backend-java/.../crmunit/CrmScope.java` (modify) | `Scope.writesActivitiesOf(unitId)` |
| `backend-java/.../crmunit/service/CrmUnitService.java` (modify) | `/me` `canWriteActivities` |
| `backend-java/.../crmunit/dto/CrmActivitySchemas.java`, `repository/CrmActivityRepository.java`, `service/CrmActivityService.java`, `controller/CrmActivityController.java` (create) | the feature |
| `backend-java/src/test/.../crmunit/CrmUnitTestBase.java` (modify), `CrmActivityReadTest.java`, `CrmActivityWriteTest.java` (create) | tests |
| `backend-java/README.md` (modify) | route rows |
| `frontend/src/pages/crm/crmUnitsHelp.js` + `.test.js`, `ActivitiesSection.jsx`, `UnitHierarchyPanel.jsx`, `frontend/src/services/apiClient.js` (modify / create) | website |

---

### Task 1: Backend — table, the 12 types, who may write, and the reads

**Interfaces:**
- Consumes: Steps 1 and 2 as listed in Global Constraints.
- Produces:
  - Table `crm_activities` as in the spec; `LazyTables.ensureCrmActivityTables()`.
  - `ActivityTypes`: `record Type(String key, String mr, String en, String icon, int defaultTarget)`, `static final List<Type> ALL` (the 12, in the spec's order), `static Optional<Type> byKey(String key)`.
  - `Scope.writesActivitiesOf(String unitId) -> boolean`: global and write; or kind `unit` (owner) or `staff` with `unitId.equals(this.unitId)`.
  - `/me` `permissions.canWriteActivities`: true for global writers, owners and staff (own unit), else false.
  - `CrmActivityRepository`: `list(unitId, year, type, status) -> List<Map>` (ordered by `scheduled_date`, `created_at`), `find(unitId, activityId) -> Optional<Map>`; `CrmActivityService.types()`, `list(CurrentUser, unitId, Map<String,String> query)`.
  - Routes `GET /api/crm-hierarchy/activity-types` → `{success, types: [{key, mr, en, icon, defaultTarget}]}` and `GET /api/crm-hierarchy/units/{id}/activities?year=&type=&status=` → `{success, year, count, activities: [{id, unitId, year, type, title, scheduledDate, targetCount, attendeeCount, notes, photoUrl, status, completedAt}], progress, canWrite, canDelete}`. `status` is `overdue` when stored status is not `done` and `scheduledDate` is before today (IST). `progress` as in the spec. The `status` / `type` query filters compare the derived status and the stored type; `all` or empty means no filter. Year defaults to this year (IST); a year outside 2000–2100 → 400 `INVALID_ACTIVITY`. `canWrite = scope.writesActivitiesOf(id)`, `canDelete = scope.managesStaffOf(id)` (owner of the unit or admin).

- [ ] **Step 1: Write the failing tests.** In `CrmUnitTestBase.fresh()`, after the first `GET /units` call, add `send(get(API + "/units/UNIT-ZQ-NONE/activities"), null, null);` (creates the table) and `jdbc.update("DELETE FROM crm_activities WHERE unit_id LIKE 'UNIT-ZQ%'")`. New `CrmActivityReadTest` (`@SpringBootTest @AutoConfigureMockMvc`, extends the base; helper `activity(unitId, type, date, target, status, attendees)` inserting a row; tree: S → B1 (owner M9301) → D1 (owner M9302, staff M9304) → T1; S → B2 (owner M9303) → D2):
  - `typesListHasTwelveInOrder` (visitor allowed: 12 entries, first `health_checkup` / `आरोग्य तपासणी` / default 200, last `food_expo` / 200, `blood_donation` default 100, `mahila_bachat_gat` 60).
  - `everyoneWhoSeesTheUnitCanReadItsActivities` (owner M9302, staff M9304, owner above M9301, CEO, admin → 200; `canWrite` true for M9302, M9304, admin and false for M9301 and CEO; `canDelete` true for M9302 and admin, false for M9304, M9301, CEO).
  - `outsidersGetNotFound` (owner of a sibling M9303, staff of another unit, a visitor, an unknown unit → 404 `UNIT_NOT_FOUND`).
  - `statusesAndProgressAreWorkedOut` (D1, year 2090: three planned in the future; year 2020: one done with 40 attendees target 100, one in_progress in the past, one planned in the past; check statuses `planned`, `done`, `overdue`, `overdue`, the progress numbers `total`, `done`, `overdue`, `targetTotal`, `achievedTotal`, `typesCovered`, `typesRequired` 12, `coveragePct` (typesCovered / 12 rounded) and `completionPct` (done / total rounded), and 0 for an empty year with no division by zero).
  - `filtersAndYears` (`?type=blood_donation`, `?status=overdue`, `?status=done`, `?year=2020` only that year; `?year=1999` and `?year=abc` → 400; no year → this year).
  - `meFlagsForActivities` (`canWriteActivities` true for admin, owner M9302, staff M9304; false for CEO and for a member without a unit).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmActivityReadTest`. Expected: failures (404 or missing table), not compile errors in the test base.
- [ ] **Step 3: Implement** migration 018, `LazyTables`, `ActivityTypes`, `Scope.writesActivitiesOf`, the `/me` flag, the repository reads, `CrmActivityService.types` and `list`, `CrmActivityController`, README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='CrmUnit*Test,CrmStaff*Test,CrmActivity*Test'`, then the full suite. Expected: all pass (flakes → rerun alone).
- [ ] **Step 5: Commit** `feat(backend-java): CRM activity table, the 12 types and the activity list (tests)`.

---

### Task 2: Backend — plan, add, edit, complete and delete

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `CrmActivitySchemas`: `ADD` (`type` required `oneOf` the 12 keys, `scheduled_date` required `YYYY-MM-DD` pattern, `target_count` integer 0–1,000,000, `title` ≤ 200, `notes` ≤ 2000), `UPDATE` (same fields all optional, plus `status` `oneOf planned, in_progress, done` so `done` can be refused with `USE_COMPLETE`, plus `photo_url` ≤ 500), `COMPLETE` (`attendee_count` integer 0–1,000,000 required, `notes` required min 3 max 2000, `photo_url` ≤ 500), `PLAN` (`year` integer 2000–2100, `targets` object); `normalize` maps camelCase (`scheduledDate`, `targetCount`, `attendeeCount`, `photoUrl`) to snake_case and trims texts. A date must really exist (`LocalDate.parse` inside 2000–2100), a photo link must start with `http://`, `https://` or `/`.
  - `CrmActivityRepository`: `insert(Map) -> int`, `update(id, Map) -> int` (only while `status <> 'done'`), `complete(id, attendees, notes, photo, memberId) -> int` (`UPDATE … WHERE id = ? AND unit_id = ? AND status <> 'done'`), `delete(id) -> int`, `typesOfYear(unitId, year) -> Set<String>`, `lockUnit(unitId)`.
  - `CrmActivityService`: `plan(user, unitId, body)`, `add(user, unitId, body)`, `update(user, unitId, activityId, body)`, `complete(user, unitId, activityId, body)`, `delete(user, unitId, activityId)`. Routes `POST /units/{id}/plan` (201), `POST /units/{id}/activities` (201), `PUT /units/{id}/activities/{aid}`, `POST /units/{id}/activities/{aid}/complete`, `DELETE /units/{id}/activities/{aid}`, all `@RequireAuth`. Audit actions `CRM_PLAN_CREATE`, `CRM_ACTIVITY_ADD`, `CRM_ACTIVITY_UPDATE`, `CRM_ACTIVITY_COMPLETE`, `CRM_ACTIVITY_DELETE`.

- [ ] **Step 1: Write the failing tests** in `CrmActivityWriteTest`:
  - `ownerStaffAndAdminWriteOthersDoNot` (add an activity: owner M9302, staff M9304, admin → 201; owner above M9301 → 403 `NO_ACCESS`; CEO → 403; a member without a unit → 403; sibling owner M9303 → 404; visitor → 401; nothing saved for the refused ones; the same for plan, update, complete and delete).
  - `planCreatesTheTwelveOncePerMonth` (year 2090: 201 `created` 12, `skipped` 0; activities have the 12 types, dates `2090-01-15` … `2090-12-15` in order, default targets, title = Marathi name, status `planned`; one audit row; custom `targets` for two types; a second plan → `created` 0, `skipped` 12; a unit that already has `blood_donation` that year gets 11; no `year` → this year; year 1999 or `abc` → 400).
  - `twoSimultaneousPlansMakeOneSet` (two threads → 12 rows in total, one answer with `created` 12 and one with 0).
  - `addValidation` (bad type, missing date, `2026-02-30`, `2026-13-01`, year 1999 and 2101, negative or fractional or huge target, title 201 characters, unknown fields dropped, photo link with `javascript:` refused; a good one is saved with the Marathi title when none is given).
  - `editChangesOnlyAllowedFieldsWhileNotDone` (date and target and notes change; `unit_id`, `year`, `status done`, `id` in the body do not; changing the date to another year updates `year`; `status in_progress` works; `done` → 400 `USE_COMPLETE`; an activity of another unit → 404 `ACTIVITY_NOT_FOUND`).
  - `completeNeedsProofAndIsFinal` (no head count → 400 `PROOF_REQUIRED`; note shorter than 3 characters → 400; negative head count → 400; good proof → 200 with `status done`, `completedAt`, `attendeeCount`, photo link kept; audit `CRM_ACTIVITY_COMPLETE`; a second complete → 409 `ALREADY_DONE`; an edit of the done one → 409 `ALREADY_DONE`; the stored values did not change).
  - `twoSimultaneousCompletesOneWins` (two threads, different head counts → one 200, one 409; the stored count is the winner's).
  - `deleteRules` (staff → 403; owner deletes a planned one → 200; owner deletes a done one → 403; admin deletes a done one → 200; unknown → 404; audit rows).
  - `anArchivedUnitIsReadOnly` (archive D1: list 200 still; plan, add, edit, complete, delete → 409 `UNIT_ARCHIVED`).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmActivityWriteTest`. Expected: failures (404 / 405), not compile errors.
- [ ] **Step 3: Implement** schemas, repository writes, service methods and routes. Check order: unit in scope (404) → `requireWrite`-style 403 via `writesActivitiesOf` (delete: `managesStaffOf`, done record: admin only) → unit not archived (409) → activity of this unit (404) → body → state rules. `plan` runs in one transaction with `lockUnit`, reads `typesOfYear`, inserts the missing types; the response is `{success, message, year, created: [...], skipped}`. README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='CrmUnit*Test,CrmStaff*Test,CrmActivity*Test'`, then the full suite. Expected: all pass.
- [ ] **Step 5: Commit** `feat(backend-java): CRM yearly plan, activities, proof of completion and delete (tests)`.

---

### Task 3: Website — the Activities section

**Branch:** in `E:\community_mobile_main`: `git checkout feat/crm-staff-website`, `git pull`, `git checkout -b feat/crm-activities-website`.

**Interfaces:**
- Produces:
  - `apiClient`: `crmActivityTypes()`, `crmListActivities(unitId, params)`, `crmCreatePlan(unitId, data)`, `crmAddActivity(unitId, data)`, `crmUpdateActivity(unitId, id, data)`, `crmCompleteActivity(unitId, id, data)`, `crmDeleteActivity(unitId, id)`.
  - `crmUnitsHelp.js`: `ACTIVITY_STATUSES` (`planned` नियोजित, `in_progress` सुरू आहे, `done` पूर्ण, `overdue` मुदत संपली, each with colours), `activityStatus(status)` (unknown → planned), `completionPayload(form) -> {attendee_count, notes, photo_url?}` (head count as a number, texts trimmed, empty photo dropped), `planPayload(year, targets) -> {year, targets}` (only numbers ≥ 0, numeric strings converted), `canWriteActivities(unit, me)` (`me.permissions.canWriteActivities` and the unit is the member's own unit or `scopeKind` is `global`), `progressLabel(progress) -> string` (`"{done}/{total} पूर्ण · {typesCovered}/12 प्रकार"`, an empty year → `"आराखडा नाही"`).
  - `ActivitiesSection.jsx` inserted after `StaffSection` in `UnitHierarchyPanel.jsx`.

- [ ] **Step 1: Write the failing tests** in `crmUnitsHelp.test.js`: `activityStatus('overdue').label`, an unknown status falls back to `planned`; `completionPayload({attendeeCount:' 40 ', notes:' ok done ', photoUrl:''})` → `{attendee_count: 40, notes: 'ok done'}`; with a photo link it is kept; `planPayload(2090, {blood_donation: '120', job_fair: '', x: -5})` → `{year: 2090, targets: {blood_donation: 120}}`; `canWriteActivities` true for a global writer, for the owner and staff on their own unit, false for the CEO, for an owner on a child unit and for `null`; `progressLabel` for a normal and an empty progress.
- [ ] **Step 2: Run** `node --test src/pages/crm/crmUnitsHelp.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, the calls and the section: year picker (this year ± 2), progress bar and `progressLabel`, the list with status badges, "आराखडा तयार करा" with a number box per type (default targets from `crmActivityTypes()`), add and edit forms, the "पूर्ण करा" window (head count, note, optional photo link), delete with a confirm; controls only when `list.canWrite` (delete only when `canDelete`); loading and error states in Marathi; late answers for another unit or year are ignored; the section remounts per unit (`key={unit.id}`).
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (`built in`).
- [ ] **Step 5: Commit** `feat(website): CRM unit activities section (tests)`.

---

## Release (after the final review, with the user's yes at each step)

Backend: clean branch from the new `origin/main` with the Step 3 backend commits cherry-picked → PR → merge → `deploy-java.ps1` → check `GET /api/crm-hierarchy/activity-types` returns 200 and `GET /api/crm-hierarchy/units/x/activities` returns 404. The website PR goes last, after the earlier CRM website PRs, with the user's yes.
