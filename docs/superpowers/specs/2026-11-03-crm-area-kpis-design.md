# Community Centers CRM — Step 6: unit areas and area KPIs

Date: 2026-11-03. Second piece of "port the rest of the other developer's CRM branch" (their `unified-dashboard`, rebuilt on our unit ladder instead of place-name scoping). Builds on Steps 1-5 (backends deployed; websites not merged). Step 7 (territory officers and the member referrals registry) gets its own design.

## Goal
A district or taluka unit knows which real place it covers (picked from the master location list). Anyone who can see a unit sees counts of members, businesses, jobs, events and tickets in its area; higher units show the sum of the places below them.

## Decisions already made
- The overlapping old routes (branches, branch activities, staff, organization units) are NOT ported: the unit ladder, team and activities already cover them (answer "A").
- Only district and taluka units get a place (answer "A"); State, Branch and Division units get none and their area is the sum of the units below. Picking is optional: a unit with no place shows zeros.
- Members are counted exactly by id; businesses, jobs, events and tickets are counted by matching the typed district against either half of the master name (answer "A"); those numbers are marked `byName: true` and the website says "जिल्ह्याच्या नावानुसार".

## What the data really holds (checked)
Master tables `districts(id, state_id, name, code)` and `talukas(id, district_id, name, code)`; names are bilingual, e.g. `Pune / पुणे`, `Pune City / पुणे शहर`. `members` has `district_id` and `taluka_id`. `businesses`, `jobs`, `events` and `support_tickets` have only a typed `district` (tickets also a typed `taluka`); none has ids.

## Database (migration 019 + `LazyTables.ensureCrmAreaColumns()`)
`community_centers` gets `area_district_id TEXT` and `area_taluka_id TEXT` (no foreign keys: community_centers is shared with older code). Indexes not needed (read per unit, small).

## Backend (package `crmunit`)
**Unit create and edit** (`POST /units`, `PUT /units/{id}`) accept `districtId` (alias `district_id`) and `talukaId` (alias `taluka_id`):
- allowed only for level `district` and `taluka`; any other level → 400 `AREA_NOT_ALLOWED`;
- ids must exist in the master tables (400 `AREA_NOT_FOUND`); a taluka must belong to the given district (400 `AREA_MISMATCH`); a taluka unit with a taluka needs the district too (district derived from the taluka when only the taluka is sent); a district unit may not carry a taluka (400 `AREA_MISMATCH`);
- creating and editing follow the existing write rules of Steps 1 and 2 (owner of the parent or the unit, admin); an archived unit refuses (409 `UNIT_ARCHIVED`), and the area is saved with the rest of the edit in the same transaction; audit `CRM_UNIT_UPDATE` / `CRM_UNIT_CREATE` as before;
- empty strings clear the area (`districtId: ""`).
Unit JSON gains `area: { districtId, districtName, talukaId, talukaName }` (nulls when none).

**`GET /api/crm-hierarchy/units/{id}/area-kpis`** — anyone whose scope contains the unit (404 `UNIT_NOT_FOUND` otherwise; visitors 404).
1. Places = the area of the unit itself plus the areas of all **active** units below it (an archived unit and its subtree are left out; the unit's own archived status does not hide its own numbers, as in the summary).
2. Dedupe: when a district id is in the set, taluka ids of that district are dropped (the district already covers them).
3. Counts (all numbers only, no names or personal data):
   - `members`: members whose `district_id` is in the district set, or whose `taluka_id` is in the remaining taluka set (exact, by id).
   - `businesses`, `eventsCount`, `jobsOpen`, `ticketsTotal`, `ticketsOpen` for the district set: rows whose typed `district` matches either half of the master name of a district in the set (split the master name on `" / "`, trim, compare case-insensitively with `lower()`; Marathi has no case). `jobsOpen` = status `open` and not hidden; `ticketsOpen` = status not `Resolved` or `Closed`. Lazy columns (`jobs.status/hidden`, business status if used) are ensured first.
   - For talukas that are not covered by a district in the set: `ticketsTotal` / `ticketsOpen` also count tickets whose typed `taluka` matches either half of the master taluka name **and** whose typed district matches that taluka's district; businesses, jobs and events add nothing for such talukas (no taluka on those records) and the answer says so (`talukaOnly: true`).
4. Answer: `{ success, unit: {id, name, level}, places: { districts: [{id, name}], talukas: [{id, name}] }, kpis: { members: {value}, businesses: {value, byName: true}, jobsOpen: {...}, eventsCount: {...}, ticketsTotal: {...}, ticketsOpen: {...} }, talukaOnly: boolean, unitsCounted: n }`. A unit with no place at all returns zeros and empty `places`. `value` is `null` (shown as "—") for businesses, jobs and events when the unit is `talukaOnly`.
All the matching is done in SQL with parameters (no string building from names).

## Website (branch `feat/crm-area-website`, on top of `feat/crm-dashboards-website`)
- `apiClient.js`: `crmUnitAreaKpis(unitId)`; `getDistricts(stateId)` / `getTalukas(districtId)` if not present (use the existing `/api/locations` calls and the Maharashtra state id the site already uses).
- Unit form (`UnitHierarchyPanel`): for a district or taluka unit, a district picker (and a taluka picker for taluka units), filled from the location lists; sent as `districtId` / `talukaId`; the unit card shows the place.
- `AreaKpisSection.jsx` on the unit card and the dashboards (after Summary): the six counts, the places counted, and the note "जिल्ह्याच्या नावानुसार" next to the by-name numbers; "—" where `value` is null; loading and error states in Marathi; late answers for another unit are ignored.
- Helpers in `crmUnitsHelp.js` (+ tests): `kpiValue(kpi)` ("—" for null / missing), `areaLabel(area)`, `areaPayload(form)` (only ids, empty values dropped, empty string to clear).

## Local testing
`local/seed-crm.sql` also inserts a few master rows (Maharashtra, Pune / पुणे with its talukas, Satara / सातारा) and sample members, businesses, jobs, events and tickets in them, and sets the area of the local district and taluka units, so the picker and the counts can be tried on the PC.

## Tests (written first)
Backend: area rules (levels, unknown ids, mismatch, derived district, clearing, archived unit, who may edit); counts from a small data set in two districts (members by id, the others by name matching on the English half, the Marathi half and mixed case; open vs closed tickets; open vs closed jobs); branch roll-up equals the sum of its districts and a district that already covers a taluka does not count it twice; taluka-only unit (members and tickets counted, the rest null); archived subtrees excluded; scope (sibling 404, staff own unit only, visitor 404); a unit with no place shows zeros. Website: helper tests and a passing build.

## Release
Backend branch from `main` with migration 019, merged and deployed first (check `GET /api/crm-hierarchy/units/x/area-kpis` answers 404); website PR later on the user's day. Nothing merges or deploys without the user.

## Out of scope
Territory officers and the referrals registry (Step 7); exact counting of businesses, jobs, events and tickets by place id (needs those forms to save ids); the front desk; the Maha events manager.
