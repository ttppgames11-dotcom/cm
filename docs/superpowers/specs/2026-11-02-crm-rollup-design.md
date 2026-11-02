# Community Centers CRM — Step 4: roll-up dashboards

Date: 2026-11-02. Website-only feature. Part 4 of 4 (Steps 1-3: units and owners, staff, yearly activities; all three backends are on `main` and deployed, their websites are not merged yet). The upgrade of the old front desk (check-ins, receipts) is NOT part of this step; it would be its own later design.

## Goal
Show how each unit, and everything under it, is doing against the yearly 12-activity plan: one summary per unit and one table per level. Read-only, calculated from Steps 1 and 3; every number stays inside the viewer's own area.

## Decisions already made
- Scope A: roll-ups only. The front desk stays as it is.
- Coverage means types with at least one finished (done, with proof) activity in the year. A unit with a full plan and nothing done shows 0 of 12. The Step 3 list keeps its "planned types" figure (`typesCovered`) and gains `typesDone`.
- Only active units count; an archived unit and everything below it are left out of every total.

## Database
Nothing new. Reads `community_centers` (ladder rows) and `crm_activities`.

## Backend (package `crmunit`, base `/api/crm-hierarchy`)
New `CrmRollupService` and `CrmRollupController`; `CrmScope` is used as in Steps 1-3 (visibility = `Scope.contains(path)`; staff see only their own unit; a member with no access sees nothing).

**Per-unit numbers ("own")**, for one unit and one year, from its activities with derived status (done / overdue = not done and date before today in Asia/Kolkata / in_progress / planned): `total`, `planned`, `in_progress`, `done`, `overdue`, `targetTotal`, `achievedTotal` (head counts of done ones), `typesDone` (types with at least one done activity), `typesPlanned` (types with any activity), `typesRequired` 12, `coveragePct` = round(typesDone / 12), `completionPct` = round(done / total) (0 when total is 0), and `byType`: for each of the 12 keys `{ total, done, overdue, target, achieved }` (zeros when none).

**Roll-up numbers** for a unit = sums of the "own" numbers of the unit and every active unit below it that the viewer can see, plus `unitsCount`, `avgCoveragePct` (mean of the units' `coveragePct`, rounded) and `unitsFullyCovered` (units with `coveragePct` 100), and `completionPct` of the sums.

| Endpoint | Who | Result |
|---|---|---|
| `GET /units/{id}/summary?year=` | anyone whose scope contains the unit | `{ year, unit: {id, name, level, status}, own, rollup, children: [{unit, own, rollup}], types: [12 types] }`; `children` are the active direct children the viewer can see (none for staff); an archived unit still answers (own numbers) but its rollup has only itself |
| `GET /rollup?year=&level=` | any member with access (`none` gets an empty list) | `{ year, levels: [{ level, levelLabel, unitsCount, totals, units: [{unit, own, rollup}] }] }` for each level that has visible active units, top level first; `?level=` limits to one; `totals` = sums of the `own` numbers of that level's units plus `avgCoveragePct` and `completionPct` |

Year defaults to this year in India and must be 2000-2100 (400 `INVALID_ACTIVITY` otherwise, as in Step 3). A unit outside the scope or unknown: 404 `UNIT_NOT_FOUND`. Visitors: `/rollup` answers an empty list, `/units/{id}/summary` 404, as the other reads. All numbers come from one query for the activities of all visible units of the year (grouped by unit), never one query per unit.
Step 3 change: `GET /units/{id}/activities` `progress` gains `typesDone`; nothing else in Step 3 changes.

## Website (branch `feat/crm-rollup-website`, on top of `feat/crm-activities-website`)
- `apiClient.js`: `crmUnitSummary(unitId, year)`, `crmRollup(params)`.
- `crmUnitsHelp.js` (+ tests): `pctBar(pct)` (clamped 0-100), `rollupRow(entry)` (name, level label, own done/total, coverage text "x/12", completion %), `coverageLabel(own)`, and the Step 3 `progressLabel` also shows the done types ("… · 2 प्रकार पूर्ण").
- `SummarySection.jsx` on the unit card (after Activities): year picker, own and total progress bars, a table of child units, and the 12-type breakdown (done / overdue / target / achieved).
- `RollupPanel.jsx` at the top of `/crm/units` for members who see more than one unit: a table per level with a row per unit and a total row; hidden when the viewer sees one unit only.
- Read-only, so no buttons that change data; Marathi texts; late answers for another unit or year are ignored.

## Tests (written first)
Backend: a small tree (state, two branches, districts and a taluka) with known activities: own numbers per unit; the rollup of a branch equals the sum of its units; `typesDone` counts only done types and a planned-only unit has coverage 0; archived units and their subtree are excluded from every total; staff see only their own unit (no children, rollup = own); an owner never sees a sibling's numbers; admin and CEO see all; `/rollup` per level, with `?level=`, the totals, and an empty year giving zeros without division by zero; invalid year; unknown unit 404; a visitor; the Step 3 `progress.typesDone`. Website: helper tests and a passing build.

## Release
Backend branch from `main`, merged and deployed first (check `GET /api/crm-hierarchy/rollup` answers 200 with an empty list for a visitor and `/units/x/summary` 404); the website PR later, with the user's yes. Nothing merges or deploys without the user.

## Out of scope
The front-desk upgrade (check-ins, receipts, centre actions), exports and reports, charts beyond simple bars, notifications and reminders.
