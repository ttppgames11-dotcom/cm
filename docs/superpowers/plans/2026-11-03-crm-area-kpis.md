# CRM Unit Areas and Area KPIs (Step 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** District and taluka units carry a real place from the master location list; any viewer of a unit sees counts of members (by id) and businesses, jobs, events and tickets (by matching the typed district name) in its area, with higher units summing the places below them.

**Architecture:** Two new columns on `community_centers` (migration 019). The unit create/edit code of Steps 1-2 learns `districtId` / `talukaId` and the unit JSON returns the place. A new `CrmAreaKpiService` collects the places of a unit and its active descendants and runs a few parameterised COUNT queries. The website adds a place picker to the unit form, an Area section, and extra local test data.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`; PowerShell + SQL for the local kit.

**Spec:** `docs/superpowers/specs/2026-11-03-crm-area-kpis-design.md`

## Global Constraints

- Backend work continues on `Abhay_app` in `E:\community_mobile`; the website on a new branch `feat/crm-area-website` cut from `feat/crm-dashboards-website` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only. Nothing is merged or deployed without the user.
- Reuse Steps 1-5: `CrmScope.of`, `Scope.contains`, `CrmUnitRepository` (`find`, `list`, `insert`, `update`, `SELECT` with owner join), `CrmUnitService.unitJson` / `create` / `update` / `inScope`, `CrmUnitSchemas.normalize` / `CREATE` / `UPDATE`, `CrmRollupService.visibleActive(scope)` (units in scope minus archived and anything below them), `LazyTables.createOnce` pattern, `CrmUnitTestBase` (members `M9301`–`M9308`, admin `M9390`, ceo `M9391`, `unit(...)` helper, cleanup of `UNIT-ZQ%`).
- Codes exactly as in the spec: `AREA_NOT_ALLOWED`, `AREA_NOT_FOUND`, `AREA_MISMATCH` (all 400), `UNIT_NOT_FOUND` 404, `UNIT_ARCHIVED` 409.
- Master tables: `countries(id, name, code)`, `states(id, country_id, name, code)`, `districts(id, state_id, name, code)`, `talukas(id, district_id, name, code)`. Master names look like `Pune / पुणे`: split on `/`, trim, compare with `lower()`.
- Test places (ids start with `ZQ` so cleanup is easy): country `ZQC`, state `ZQS`; districts `ZQD1` = `Zqpune / झक्यूपुणे`, `ZQD2` = `Zqsatara / झक्यूसातारा`; talukas `ZQT1` and `ZQT2` in `ZQD1` (`Zqhaveli / झक्यूहवेली`, `Zqmulshi / झक्यूमुळशी`), `ZQT3` in `ZQD2` (`Zqkarad / झक्यूकराड`). Test data rows use ids starting `ZQ` too. Backend tests: from `E:\community_mobile\backend-java`, `mvn -q -B test -Dtest=<Class>` and the full `mvn -q -B test` (no `clean`). Known flakes: `NodeParityTest`, `MeetingStreamTest`, `ChapterEndpointsTest`/`EnquiryEndpointsTest` once (rerun alone). Website: `node --test <files>` (files, not a directory) and `npm run build` from `E:\community_mobile_main\frontend`.

## Rulings made while planning

- **R1:** the empty-string "clear" marker: `normalize` maps `districtId` / `district_id` to `area_district_id` and `talukaId` / `taluka_id` to `area_taluka_id`, and keeps an empty string as `""` for these two keys (all other empty strings are still dropped). The service treats `""` as "clear". Cost if wrong: none.
- **R2:** the unit `SELECT` gains `LEFT JOIN districts` and `LEFT JOIN talukas` to return the master names; a place whose master row is missing returns a null name. Cost if wrong: none.
- **R3:** the KPI counting uses `visibleActive(scope)` like the roll-up, plus the unit itself even when archived (as `summary` does). Cost if wrong: none.
- **R4:** `businesses` counts every row matching the district name (no visibility filter), as Node's dashboard did. Cost if wrong: a hidden business is counted.

## Review Focus

- **Place rules:** only district and taluka units; a taluka must belong to the district; unknown ids refused; clearing works; an archived unit refuses; wrong levels refused. Tests in Task 1.
- **No double counting:** a district that already covers a taluka does not count it again; a member with both ids counts once. Tests in Task 2.
- **Name matching:** English half, Marathi half, mixed case and spaces all match; a near miss does not. Test in Task 2.
- **Scope:** a sibling's unit is 404; staff see only their own unit; archived subtrees are left out. Tests in Task 2.
- **SQL safety:** names go in as parameters only. Reviewed in the final code review.

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/019_crm_unit_area.sql` (create) | two columns |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `CRM_AREA_COLUMNS`, `ensureCrmAreaColumns()` (also called from `ensureCrmUnitTables`) |
| `backend-java/.../crmunit/dto/CrmUnitSchemas.java` (modify) | area keys in `normalize`, `CREATE`, `UPDATE` |
| `backend-java/.../crmunit/repository/CrmUnitRepository.java` (modify) | joins, `insert`, `update`, `placeOf` checks |
| `backend-java/.../crmunit/service/CrmUnitService.java` (modify) | area validation in `create` / `update`, `unitJson` area |
| `backend-java/.../crmunit/repository/CrmAreaKpiRepository.java`, `service/CrmAreaKpiService.java`, `controller/CrmAreaKpiController.java` (create) | the KPI route |
| `backend-java/src/test/.../crmunit/CrmUnitTestBase.java` (modify), `CrmAreaUnitTest.java`, `CrmAreaKpiTest.java` (create) | tests |
| `backend-java/README.md` (modify) | rows |
| `frontend/src/pages/crm/crmUnitsHelp.js` + `.test.js`, `AreaKpisSection.jsx`, `UnitHierarchyPanel.jsx`, `CrmDashboardPage.jsx`, `frontend/src/services/apiClient.js` (modify / create) | website |
| `local/seed-crm.sql`, `local/README.md` (modify) | local test data |

---

### Task 1: Backend — unit places (migration 019, create and edit)

**Interfaces:**
- Consumes: Steps 1-5 as listed.
- Produces:
  - Migration 019: `ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS area_district_id TEXT` and `… area_taluka_id TEXT`; the same two statements as `LazyTables.CRM_AREA_COLUMNS`, run by `ensureCrmAreaColumns()` and by `ensureCrmUnitTables()`.
  - `CrmUnitSchemas.normalize` (R1) and the rules `area_district_id` / `area_taluka_id` (strings, max 60) in `CREATE` and `UPDATE`.
  - `CrmUnitRepository`: `SELECT` adds `d.name AS area_district_name, t.name AS area_taluka_name` (R2); `insert` stores the two ids; `updateArea(String id, String districtId, String talukaId)` (sets both columns, `""`/null clears); `districtExists(id)`, `talukaDistrict(talukaId) -> Optional<String>` (the taluka's district id).
  - `CrmUnitService`: `create` and `update` validate the place (rules below) and save it in the same transaction; `unitJson` gets `area: {districtId, districtName, talukaId, talukaName}`.
  - Place rules (spec): only levels `district` and `taluka`, otherwise 400 `AREA_NOT_ALLOWED`; ids must exist (400 `AREA_NOT_FOUND`); a taluka must belong to the district (400 `AREA_MISMATCH`); only a taluka is sent → the district is derived from it; a district unit with a taluka → 400 `AREA_MISMATCH`; `""` clears; a taluka unit may have only a district (no taluka) set.

- [ ] **Step 1: Write the failing tests.** In `CrmUnitTestBase` add `places()` (inserts `ZQC`, `ZQS`, the two districts and three talukas above with `ON CONFLICT DO NOTHING`) and cleanup in `fresh()` (`DELETE FROM talukas WHERE id LIKE 'ZQ%'`, then districts, states, countries, after the unit cleanup). New `CrmAreaUnitTest`:
  - `districtUnitGetsADistrictPlace` (admin creates a state, branch, division, then a district unit with `districtId ZQD1` → 201, `area.districtId ZQD1`, `area.districtName` `Zqpune / झक्यूपुणे`, taluka null).
  - `talukaUnitGetsATalukaPlace` (a taluka unit with `talukaId ZQT1` only → derived district `ZQD1`; with both → ok; unit JSON shows both names).
  - `placeRulesAreEnforced` (a state, branch or division unit with a `districtId` → 400 `AREA_NOT_ALLOWED`; unknown district → 400 `AREA_NOT_FOUND`; unknown taluka → `AREA_NOT_FOUND`; `ZQT3` with `ZQD1` → `AREA_MISMATCH`; a district unit with a `talukaId` → `AREA_MISMATCH`; nothing saved on a refusal).
  - `placeIsOptional` (a district unit without a place → 201, `area` all null).
  - `editSetsChangesAndClearsThePlace` (owner of the parent edits: set `districtId ZQD2` → area changes; change to another; `districtId: ""` → cleared; the unit's own owner edits too; a sibling → 404; CEO → 403; staff → 403; an archived unit → 409 `UNIT_ARCHIVED`; editing the place alone counts as an edit and writes an audit row `CRM_UNIT_UPDATE`; a body with only place keys is not "nothing to change").
  - `editRulesForTheLevel` (a branch unit with a place in an edit → 400 `AREA_NOT_ALLOWED`; a district unit with a taluka of another district → `AREA_MISMATCH`).
  - `camelAndSnakeNamesBothWork` (`district_id` / `taluka_id` accepted like `districtId` / `talukaId`).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmAreaUnitTest`. Expected: failures, not compile errors in the test base.
- [ ] **Step 3: Implement** the migration, `LazyTables`, schemas, repository, service and README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='CrmUnit*Test,CrmStaff*Test,CrmActivity*Test,CrmRollup*Test,CrmArea*Test'`, then the full suite. Expected: all pass (flakes → rerun alone).
- [ ] **Step 5: Commit** `feat(backend-java): CRM unit places for district and taluka units (tests)`.

---

### Task 2: Backend — the area KPIs

**Interfaces:**
- Consumes: Task 1 (area columns, joins); `CrmRollupService.visibleActive(Scope)`; `LazyTables.ensureJobColumns()` / `ensureWebsiteTables()` for `jobs.status/hidden` and `support_tickets`.
- Produces: `GET /api/crm-hierarchy/units/{id}/area-kpis` → `{success, unit: {id, name, level}, places: {districts: [{id, name}], talukas: [{id, name}]}, kpis: {members: {value}, businesses: {value, byName}, jobsOpen: {value, byName}, eventsCount: {value, byName}, ticketsTotal: {value, byName}, ticketsOpen: {value, byName}}, talukaOnly, unitsCounted}`. `CrmAreaKpiRepository` methods taking id / name lists and returning counts: `countMembers(districtIds, talukaIds)`, `countByDistrictNames(table, names, extraWhere)`, `countTicketsByTaluka(talukaNames with district names)`, `masterNames(table, ids)`. Name halves are built by `static List<String> halves(String masterName)` (split on `/`, trim, lower-case, drop empties).

- [ ] **Step 1: Write the failing tests** in `CrmAreaKpiTest` (helpers insert members `M9311`–`M9315`, businesses, jobs, events and tickets with ids starting `ZQ`; cleanup of those rows in the test's own `@BeforeEach` after `fresh()`; unit tree: S → B → V → `UD1` (district, place `ZQD1`) → `UT1` (taluka, place `ZQT1`), V → `UD2` (district, `ZQD2`) → `UT3` (taluka, `ZQT3`); owners as in other tests). Data: members `M9311` (district `ZQD1`), `M9312` (`ZQD1`, taluka `ZQT1`), `M9313` (district `ZQD2`, taluka `ZQT3`), `M9314` (`ZQD2`), `M9315` (none); businesses with district `zqpune`, `झक्यूपुणे`, `  ZQPUNE `, `Zqsatara`, `Nowhere`; jobs in `Zqpune`: one open, one status `closed`, one hidden; one open in `Zqsatara`; events: two in `Zqpune`, one in `Zqsatara`; tickets: `Zqpune` New, `Zqpune` Resolved, `Zqsatara` New with taluka `Zqkarad`, `Zqsatara` New with taluka `zqkarad` (lower), `Zqsatara` New with taluka `other`.
  - `districtUnitCounts` (`UD1` as its owner: members 2, businesses 3, jobsOpen 1, eventsCount 2, ticketsTotal 2, ticketsOpen 1; `byName` true for all but members; `places.districts` has `ZQD1`; the taluka `ZQT1` of the child is not listed again; `talukaOnly` false).
  - `divisionAddsItsDistricts` (`V` as admin: members 4, businesses 4, jobsOpen 2, eventsCount 3, ticketsTotal 5, ticketsOpen 4, `unitsCounted` 4 (UD1, UT1, UD2, UT3 are the units that have a place) — a member with both a district and a taluka id counts once).
  - `talukaOnlyUnit` (`UT3` as its owner: `talukaOnly` true, members 1 (`M9313`), ticketsTotal 2 (the two tickets with taluka `karad` in `Zqsatara`, either case), ticketsOpen 2, businesses / jobsOpen / eventsCount `value` null).
  - `nameMatchingHalvesAndCase` (the Marathi-half business and the padded upper-case business are counted for `ZQD1`; `Nowhere` is counted nowhere; a business named `Zqpunex` is not counted).
  - `unitWithoutAPlaceIsZeros` (a district unit with no place and no children: every `value` 0 (not null), `places` empty).
  - `scopeRules` (a sibling's owner → 404; staff of `UD1` can read `UD1` but not `UT1` or `V`; owner of `V` reads `UD1`; admin and CEO read all; a visitor and a member without a unit → 404; unknown unit → 404 `UNIT_NOT_FOUND`).
  - `archivedSubtreesAreLeftOut` (archive `UD2`: `V` no longer counts `UD2` or `UT3`: members 2, tickets total 2; asking for `UD2` itself as admin still answers with its own place).
  - `noPersonalData` (the answer contains no phone, name of a member or business title).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=CrmAreaKpiTest`. Expected: failures (404), not compile errors.
- [ ] **Step 3: Implement** the repository, service (places from `visibleActive` plus the unit, dedupe of talukas under covered districts, counts, `talukaOnly`, nulls for taluka-only), controller route and README rows. All name matching in SQL with bind parameters (`lower(trim(col)) IN (?,?…)`); ensure lazy tables and columns before the queries.
- [ ] **Step 4: Run** the CRM tests together and the full suite. Expected: all pass.
- [ ] **Step 5: Commit** `feat(backend-java): CRM area KPIs by place (tests)`.

---

### Task 3: Website — place picker and Area section

**Branch:** in `E:\community_mobile_main`: `git checkout feat/crm-dashboards-website`, `git pull`, `git checkout -b feat/crm-area-website`.

**Interfaces:**
- Produces: `apiClient.crmUnitAreaKpis(unitId)`; district and taluka list calls (`getDistricts(stateId)`, `getTalukas(districtId)` over `/api/locations/districts?stateId=` and `/api/locations/talukas?districtId=`, reusing existing ones if the site already has them); `crmUnitsHelp.js`: `kpiValue(kpi) -> string` (`"—"` for null / missing, else the number), `areaLabel(area) -> string` (district and taluka names joined by ` › `, the Marathi half of a bilingual name when there is one; `"—"` without a place), `areaPayload(form) -> {districtId?, talukaId?}` (empty values dropped except an explicit clear `""` when `form.clear` is true), `needsArea(level) -> boolean` (district and taluka only); `AreaKpisSection.jsx`; place pickers in `UnitHierarchyPanel`; the section shown on the unit card and on the dashboards.

- [ ] **Step 1: Write the failing tests** in `crmUnitsHelp.test.js`: `kpiValue(null)` → `—`, `kpiValue({value: null})` → `—`, `kpiValue({value: 0})` → `0`, `kpiValue({value: 12})` → `12`; `areaLabel({districtName: 'Pune / पुणे', talukaName: 'Pune City / पुणे शहर'})` → `पुणे › पुणे शहर`; only a district → `पुणे`; `null` and an empty area → `—`; `areaPayload({districtId: ' ZQD1 ', talukaId: ''})` → `{districtId: 'ZQD1'}`, `areaPayload({districtId: '', clear: true})` → `{districtId: ''}`, an empty form → `{}`; `needsArea('district')` true, `needsArea('taluka')` true, `needsArea('branch')` false.
- [ ] **Step 2: Run** `node --test src/pages/crm/crmUnitsHelp.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, the calls, `AreaKpisSection` (the six counts, the places, the note `जिल्ह्याच्या नावानुसार` beside by-name numbers, a note for taluka-only units, loading / error states, a request counter against late answers) and the pickers in the unit forms (district list for district and taluka units, taluka list for taluka units; the unit card shows `areaLabel`). Add the section to `UnitSections` in `CrmDashboardPage` and to the unit card in `UnitHierarchyPanel`.
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (`built in`).
- [ ] **Step 5: Commit** `feat(website): CRM unit place picker and area section (tests)`.

---

### Task 4: Local test data

**Interfaces:**
- Produces: `local/seed-crm.sql` also inserts a country, Maharashtra, `Pune / पुणे` and `Satara / सातारा` with a few talukas (`Pune City / पुणे शहर`, `Haveli / हवेली`, `Karad / कराड`), sets `area_district_id` / `area_taluka_id` on the local district and taluka units, and adds sample members (with `district_id` / `taluka_id`), businesses, jobs, events and tickets in those places; `local/README.md` explains what to try.

- [ ] **Step 1: Extend the seed** (idempotent: delete the rows it owns by id prefix `LOC-` first; master rows use ids `LOCC`, `LOCS`, `LOCD1`, `LOCD2`, `LOCT1`–`LOCT3` with `ON CONFLICT DO NOTHING`; the unit areas set by `UPDATE`); add the migration `019_crm_unit_area.sql` to `$Migrations` in `local/local-dev.ps1`.
- [ ] **Step 2: Check the SQL** by reading it against the column lists of the migrations (the Docker engine may not be running; say so in the ledger if it was not run).
- [ ] **Step 3: Commit** `feat(local): area test data for the CRM kit`.

---

## Release (after the final review, with the user's yes at each step)

Backend: clean branch from the new `origin/main` with the Step 6 backend commits cherry-picked → PR → merge → `deploy-java.ps1` → check `GET /api/crm-hierarchy/units/x/area-kpis` answers 404 and the CRM routes still answer as before. The website PR goes later, in the PR chain order, with the user's yes.
