# Community Centers CRM — Step 3: yearly 12-activity plan

Date: 2026-11-02. Website-only feature. Part 3 of 4 (Step 1 units and owners, Step 2 staff, Step 4 roll-ups and front desk). Builds on Steps 1 and 2 (both are on `main` and deployed to the server; their websites are not merged yet).

## Goal
Each unit plans and records its yearly activities: 12 types (health checkup, blood donation, job fair …), one planned per month, each marked done only with proof (head count and a note). The unit's own team writes; the levels above can watch.

## Decisions already made
- Writers: the unit's own owner, its staff, admin and superadmin. Owners of units above and the CEO only read. Delete: only the unit's owner or an admin; a done record only an admin.
- Proof to mark done: a head count (whole number) and a note of at least 3 characters; a photo link is optional (a web address, no upload). Done is final: it cannot be edited, re-opened or have its proof changed.
- One click creates the 12 for a year (one per month on the 15th, default targets, editable before saving); types the unit already has that year are skipped; extra activities of any type can be added afterwards.
- "Overdue" is worked out, not stored.
- An archived unit is read-only.

## Database (migration 018 + `LazyTables.ensureCrmActivityTables()`)
Table `crm_activities`: `id` TEXT PK (`ACT-` + 8 hex), `unit_id` TEXT NOT NULL, `year` INTEGER NOT NULL, `type` TEXT NOT NULL, `title` TEXT NOT NULL, `scheduled_date` DATE NOT NULL, `target_count` INTEGER NOT NULL DEFAULT 0, `attendee_count` INTEGER NOT NULL DEFAULT 0, `notes` TEXT, `photo_url` TEXT, `status` TEXT NOT NULL DEFAULT 'planned' (`planned` / `in_progress` / `done`), `completed_at` TIMESTAMPTZ, `completed_by` TEXT, `created_by` TEXT, `created_at`, `updated_at` TIMESTAMPTZ. Index `(unit_id, year)`.
The 12 types live in one server-side list (key, Marathi name, English name, icon, default target): health_checkup 200, blood_donation 100, job_fair 300, business_expo 150, job_business_consultancy 100, matrimony 250, education_consultancy 150, childrens_games 120, spiritual 200, mahila_bachat_gat 60, krushi_sabha 150, food_expo 200; titles are the Marathi names (आरोग्य तपासणी, रक्तदान, रोजगार मेळावा, व्यवसाय प्रदर्शन, रोजगार/व्यवसाय मार्गदर्शन, वधू-वर मेळावा, शिक्षण मार्गदर्शन, बालकल्याण क्रीडा, अध्यात्मिक उपक्रम, महिला बचत गट, कृषी सभा, अन्न प्रदर्शन).
Audit: `CRM_PLAN_CREATE`, `CRM_ACTIVITY_ADD`, `CRM_ACTIVITY_UPDATE`, `CRM_ACTIVITY_COMPLETE`, `CRM_ACTIVITY_DELETE`. No notifications.

## Backend (package `crmunit`, base `/api/crm-hierarchy`)
`CrmScope.Scope` gets `writesActivitiesOf(unitId)`: admin/superadmin (global write), the owner of exactly that unit, or the staff of exactly that unit. `/me` `permissions.canWriteActivities` is true for those three kinds (for the staff's and owner's own unit).

| Endpoint | Who | Result |
|---|---|---|
| `GET /activity-types` | anyone | the 12 types |
| `GET /units/{id}/activities?year=&type=&status=` | anyone whose scope contains the unit | `{ year, activities: [...], progress, canWrite, canDelete }`; `status` of each is `planned` / `in_progress` / `done` / `overdue` (overdue = not done and date before today in Asia/Kolkata) |
| `POST /units/{id}/plan` | writers | `{ year, targets: {type: n} }` → 201 `{ created, skipped, year }` |
| `POST /units/{id}/activities` | writers | `{ type, scheduledDate, targetCount, title?, notes? }` → 201 |
| `PUT /units/{id}/activities/{aid}` | writers | `{ scheduledDate, targetCount, title, notes, status: planned \| in_progress }` while not done; `ALREADY_DONE` 409 once done |
| `POST /units/{id}/activities/{aid}/complete` | writers | `{ attendeeCount, notes, photoUrl? }`; proof missing → 400 `PROOF_REQUIRED`; already done → 409 `ALREADY_DONE` |
| `DELETE /units/{id}/activities/{aid}` | owner of the unit, admin (a done record: admin only) | 200 |

`progress` = `{ total, planned, in_progress, done, overdue, targetTotal, achievedTotal, typesCovered, typesRequired: 12, coveragePct, completionPct }`; `typesCovered` counts types with at least one activity that year, `achievedTotal` sums `attendee_count` of done ones, `completionPct` = done / total.
Validation: year 2000–2100 (default: this year in Asia/Kolkata); `scheduledDate` a real `YYYY-MM-DD` date inside 2000–2100 (the year of an activity is the year of its date); `targetCount` and `attendeeCount` whole numbers 0–1,000,000; `title` ≤ 200 and `notes` ≤ 2000 characters; `photoUrl` ≤ 500 characters starting with `http://`, `https://` or `/`; unknown `type` → 400 `INVALID_ACTIVITY`; unknown fields are dropped (`retainAll`); `status` through PUT may not be `done` (`USE_COMPLETE` 400).
Order of checks: unit in scope (404 `UNIT_NOT_FOUND`) → may write (403 `NO_ACCESS`) → unit not archived (409 `UNIT_ARCHIVED`) → activity of this unit (404 `ACTIVITY_NOT_FOUND`) → body → state rules. A visitor gets 404 on reads and 401 on writes. The plan runs inside one transaction holding `SELECT … FOR UPDATE` on the unit row, so two clicks at once create one set.
Completing is one conditional `UPDATE … WHERE status <> 'done'`; 0 rows → `ALREADY_DONE`.

## Website (branch `feat/crm-activities-website`, on top of `feat/crm-staff-website`)
- `apiClient.js`: `crmActivityTypes()`, `crmListActivities(unitId, params)`, `crmCreatePlan(unitId, data)`, `crmAddActivity`, `crmUpdateActivity`, `crmCompleteActivity`, `crmDeleteActivity`.
- `crmUnitsHelp.js` (+ tests): `activityStatus(a)` (label, colours), `completionPayload(form)` (head count, note, photo link; trimmed), `planTargets(types, form)`, `canWriteActivities(unit, me)`, `progressLabel(progress)`.
- `ActivitiesSection.jsx` on the unit card (after the Staff section): year picker, progress bar and "x/12 types", the list with status badges, "create yearly plan" (a target box per type), add / edit, a "mark done" window asking head count, note and an optional photo link, delete with a confirm. Controls only show to writers; everyone who sees the unit sees the list. Marathi texts; a late answer for another unit or year is ignored.

## Tests (written first)
Backend: reads by staff, owner, owner above, CEO, admin; sibling 404; visitor; writes allowed for owner, staff, admin and refused (403) for an owner above and the CEO; plan creates 12 (months 01–12 on the 15th, default and custom targets), a second click creates 0 and skips 12, a partial year fills the gaps, two simultaneous clicks make one set; add and edit validation (bad type, dates, counts, photo link, unknown fields dropped); complete needs proof, is final, and a second complete or an edit gives `ALREADY_DONE`; overdue and progress numbers; delete rules (staff cannot, owner can a planned one, a done one only admin); an archived unit refuses writes and still lists. Website: helper tests and a passing build.

## Release
Backend branch from `main`; after it is merged, deploy and check `GET /api/crm-hierarchy/activity-types` answers 200 and `GET /units/x/activities` answers 404; the website PR last, as before. Nothing merges or deploys without the user.

## Out of scope
Roll-up dashboards across units, reports, photo upload, reminders and notifications (Step 4 and later).
