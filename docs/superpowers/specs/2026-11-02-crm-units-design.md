# Community Centers CRM — Step 1: unit ladder, owners, "who sees what"

Date: 2026-11-02. Website-only feature (no mobile app). Part 1 of 4 (Step 2 staff logins, Step 3 yearly 12-activity plan, Step 4 roll-up dashboards + front desk).

## Goal
A ladder of units (State → Branch → Division → District → Taluka). Each unit has one owner, who is an existing Connect Maratha member. An owner sees and manages their unit and everything below it. The rules for who sees what are in one place and are checked on every request.

## Decisions already made
- Owners are existing members, found by phone or member id (no new accounts, no passwords).
- No geography name-matching fallback: access comes only from the unit link.
- Extend the existing `community_centers` table (old rows without `level` are ignored).
- CEO is read-only. Admin and superadmin are global writers.
- Scope is read from the database on every CRM request, never from the token's role.
- A member belongs to at most one unit.
- The member's `role` is not changed in Step 1.

## Database (migration 017 + `LazyTables`)
`community_centers` new columns: `level` (state/branch/division/district/taluka), `parent_id`, `path` (e.g. `/UNIT-A/UNIT-B/`, includes the unit itself), `owner_id`, `state`, `created_by`, `updated_at` TIMESTAMPTZ. Status values `active` / `archived`. Indexes on `parent_id` and `path`; a unique index on `(parent_id, lower(name), level)` for ladder units only (`level IS NOT NULL`).
A new table `crm_unit_members` (`member_id` primary key, `unit_id`, `unit_role` `owner`; Step 2 adds `staff`; unique index: one owner per unit). The `members` table itself is not changed, because the Node backend returns every `members` column.
Audit: every create, edit, archive and owner change goes to `audit_logs` (`CRM_UNIT_CREATE`, `CRM_UNIT_UPDATE`, `CRM_UNIT_ARCHIVE`, `CRM_UNIT_OWNER_CHANGE`).
Notifications: type `crm_unit` (new owner: "🏢 तुम्ही {unit} युनिटचे मालक आहात"; old owner: "{unit} युनिटची मालकी काढली"). Sent in a REQUIRES_NEW transaction inside try/catch.

## Backend (package `crmunit`, base `/api/crm-hierarchy`)
Existing `/api/crm` and `/api/admin/crm` are untouched.

| Endpoint | Who | Result |
|---|---|---|
| `GET /me` | logged in | account, scopeKind, unit, unitRole, permissions (`canCreateState`, `canCreateUnits`, `readOnly`) |
| `GET /units?level&parentId&search` | has access | units inside scope |
| `GET /units/{id}` | has access | unit + ancestors; outside scope → 404 |
| `POST /units` | admin / owner | create |
| `PUT /units/{id}` | admin / owner | edit name, address; `status` archive/restore only by someone above the unit |
| `POST /units/{id}/owner` | someone above the unit | change owner; old owner reset (`unit_id`, `unit_role` cleared) |

JSON stays compatible with the other developer's `UnitHierarchyPanel`, except the owner input is `{member}` or `{phone}` instead of name/phone/email/password.

`CrmScope` (single class) reads the member row from the database: admin/superadmin → global write; ceo → global read-only; owner of an active unit → own `path` prefix, write; anyone else → nothing (empty reads, 403 on writes). Owner of an archived unit → nothing.

Create order of checks: level valid and directly below parent's level (`INVALID_LEVEL_ORDER` 400) → parent inside scope → only admins create a State → owner member exists (404) → phone matches two members (`MEMBER_AMBIGUOUS` 409) → owner not already in a unit (409) → owner is not admin/ceo (400) → same name under same parent (`UNIT_EXISTS` 409, enforced by the unique index) → save unit, set owner link, audit, notify, all in one transaction.

## Website (`feat/crm-units-website`, from `main`)
- `apiClient.js`: `crmHierarchy.me/listUnits/getUnit/createUnit/updateUnit/changeOwner`.
- `pages/crm/UnitHierarchyPanel.jsx` ported; owner form becomes one "find member" box (phone or id, shows the name to confirm); staff and activity tabs hidden; buttons follow `/me` (`readOnly` hides them).
- `pages/crm/CrmUnitsPage.jsx` at `/crm/units`; no access → "या विभागासाठी आपल्याकडे प्रवेश नाही".
- `pages/crm/crmUnitsHelp.js` + `node --test`: Marathi level labels, levels creatable below the current one, form checks.
- `AdminShell` menu "CRM Units (युनिट्स)"; `notificationList` `crm_unit` → 🏢 → `/crm/units`.
- Their five CRM pages (Branch, District, …) are not ported in Step 1.

## Tests (written first)
Backend: one per permission row (admin, ceo, owner, outsider, visitor); owner cannot see a sibling (404); level order; duplicate name; owner already in another unit; admin/ceo as owner; ambiguous phone; change owner (old owner loses access at once); archive (owner loses access); two simultaneous creates → one wins. Website: `crmUnitsHelp` tests and a passing build.

## Release
Backend PR → merge → `deploy-java.ps1` → `/api/crm-hierarchy/me` returns 401 without login → website PR → merge. Live test: admin creates a State, then a Branch with an owner; the owner sees only their branch; change owner and confirm the old one loses access. Nothing merges or deploys without the user.

## Out of scope (later steps)
Staff logins (2), yearly activity plan (3), roll-ups and the front-desk upgrade (4), owners getting area roles for level dashboards (decide in 4).
