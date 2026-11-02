# Community Centers CRM — Step 2: staff for each unit

Date: 2026-11-02. Website-only feature. Part 2 of 4 (Step 1 unit ladder and owners, Step 3 yearly 12-activity plan, Step 4 roll-ups and front desk). Builds on Step 1 (`docs/superpowers/specs/2026-11-02-crm-units-design.md`, branches `feat/crm-units-backend` / `feat/crm-units-website`, not merged yet).

## Goal
A unit owner (or an admin) adds helpers ("staff") to a unit. Staff are existing Connect Maratha members who use their normal login; they see only their own unit and cannot change anything. (In Step 3 they will record the unit's yearly activities.)

## Decisions already made
- Staff are existing members found by phone or member id (same as owners); no new accounts and no passwords.
- Staff see their own unit only, not the units below it; read-only; they cannot create, edit, archive, change owners or manage staff.
- Only the unit's own owner, admin and superadmin add or remove staff. Owners of units above can see the team but not change it. The CEO is read-only.
- At most 10 staff per unit.
- A member belongs to at most one unit, as owner or as staff.

## Database
No new table or column. A staff member is a row of `crm_unit_members` (member_id PRIMARY KEY, unit_id, unit_role) with `unit_role = 'staff'`. The existing partial unique index `crm_unit_members_one_owner` only covers `unit_role = 'owner'`, so a unit may have many staff rows. The limit of 10 is checked in the service while the unit row is locked (`SELECT … FOR UPDATE`) so two simultaneous adds cannot both pass.
Audit: `CRM_STAFF_ADD`, `CRM_STAFF_REMOVE`. Notifications use type `crm_unit`: added "🏢 तुम्ही {unit} युनिटचे कर्मचारी आहात", removed "{unit} युनिटमधील तुमचा प्रवेश काढला".

## Backend (package `crmunit`, base `/api/crm-hierarchy`)
`CrmScope` gets one more kind, `staff`: a member whose row says `unit_role = 'staff'` in an active ladder unit gets `Scope(kind "staff", unitId, "staff", path, write false)`. `contains(path)` is true only for the staff member's own unit path (equal, not prefix); `/units` returns only that unit; `/me` shows `scopeKind staff`, `unitRole staff`, `readOnly true`, `canManageStaff false`. Archived unit or removed row → `none`, on the next request.
`/me` `permissions.canManageStaff` becomes true for the owner (their own unit) and for admin / superadmin.

| Endpoint | Who | Result |
|---|---|---|
| `GET /units/{id}/staff` | anyone whose scope contains the unit | `{ owner: {id,name}, staff: [{id,name,phone?,since}], max: 10 }`; `phone` only for owner of the unit and admin |
| `POST /units/{id}/staff` | owner of that unit, admin, superadmin | body `{ member }` or `{ phone }` (or `{ owner-style }` camelCase variants as in Step 1); 201 with the staff list |
| `DELETE /units/{id}/staff/{memberId}` | same | 200 with the staff list; `STAFF_NOT_FOUND` 404 |

Unit outside the actor's scope → 404 `UNIT_NOT_FOUND`; inside scope but not allowed to manage → 403 `NO_ACCESS`.
Add order: may manage → unit not archived (`UNIT_ARCHIVED` 409) → member exists (`MEMBER_NOT_FOUND` 404) → one phone match (`MEMBER_AMBIGUOUS` 409) → not admin/superadmin/ceo (`OWNER_NOT_ALLOWED` 400, reused code, message says "staff") → member free of any active unit (`MEMBER_IN_UNIT` 409; a member of an archived unit is released first, as in Step 1) → fewer than 10 staff (`STAFF_LIMIT` 409) → insert (conditional `ON CONFLICT DO NOTHING`, 0 rows → `MEMBER_IN_UNIT`) → audit, all in one transaction; bell after commit.
Step 1 interplay: making a staff member the owner of a unit still needs them removed first (`OWNER_IN_UNIT`); changing a unit's owner never touches its staff; archiving a unit cuts its staff off (scope `none`) without deleting their rows.

## Website (branch `feat/crm-staff-website`, on top of `feat/crm-units-website`)
- `apiClient.js`: `crmListStaff(unitId)`, `crmAddStaff(unitId, data)`, `crmRemoveStaff(unitId, memberId)`.
- `crmUnitsHelp.js` (+ tests): `canManageStaff(unit, me)` (admin writer, or owner whose own unit is `unit`), `staffLimitLeft(list, max)`.
- `UnitHierarchyPanel.jsx`: a "कर्मचारी (Staff)" section on the unit card: the list, an add box (phone or id, same `ownerQuery`), a remove button with a confirm; add and remove only shown when `canManageStaff`; staff see names only. Marathi messages for `MEMBER_IN_UNIT`, `STAFF_LIMIT`, `OWNER_NOT_ALLOWED`, `UNIT_ARCHIVED`.
- `CrmUnitsPage` needs no change: a staff member's `/me` is `scopeKind staff` and the panel opens read-only on their unit.
- Bell: the `crm_unit` type already opens `/crm/units`.

## Tests (written first)
Backend: staff `/me` and `/units` show only the own unit (no sibling, no child, no parent); staff cannot create, edit, archive, change owner or add staff (403); owner adds and removes staff (bells, audit); admin can too; owner of a unit above gets 403 on add but 200 on the list; CEO 403 on add, 200 on the list; the list hides phones from staff and from owners above; add refusals (unknown member, shared phone, admin/ceo, already in a unit, 11th staff member, archived unit); a member of an archived unit can be added; removal and archiving cut access on the next request; two simultaneous adds of the same member and of the 10th seat → exactly one wins; a staff member cannot become owner until removed. Website: helper tests and a passing build.

## Release
Needs Step 1 merged first. Order: Step 1 backend → deploy → Step 1 website; then Step 2 backend → deploy → check `/api/crm-hierarchy/units/x/staff` is 401 without login → Step 2 website. Nothing merges or deploys without the user.

## Out of scope
Recording activities (Step 3), roll-ups and the front-desk upgrade (Step 4), staff roles beyond "staff", passwords or new accounts.
