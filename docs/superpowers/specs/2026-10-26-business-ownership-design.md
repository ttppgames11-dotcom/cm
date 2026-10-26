# Business directory: owners can edit and hide their business

**Date:** 2026-10-26
**Status:** design agreed in chat; this document is for final review
**Next:** the referrals feature (`/referrals`) uses `owner_id` to offer only business owners as receivers.

## 1. Goal

Link each directory business to the member who owns it, and let that member manage it:
- adding a business needs a login, and the owner is recorded;
- the owner (and admins) can edit it and hide or show it;
- an admin can assign a business to a member.

Website only for now (the mobile app's edit screen starts working once the server supports it). Node stays the unchanged backup. epay is untouched.

**Success criteria**
1. A logged-in member adds a business and is its owner; a logged-out request gets 401.
2. Only the owner or an admin can edit or hide it (others get 403); the website shows the edit and hide controls only on a member's own businesses.
3. Hidden businesses disappear from the public list and detail pages but stay in the database, and the owner still sees them.
4. The existing 98 backend tests and the Node comparison keep passing (the one deliberate change is recorded in §7).

## 2. Today

- `businesses` already has `owner_id TEXT` (migration 002) and `status TEXT DEFAULT 'visible'`; the Java entity `Business` already maps both. One live business exists, with `owner_id = M6076`, `status = visible`.
- `POST /api/businesses` needs no login, never sets `owner_id`; the `owner` field is plain typed text.
- There is no `PUT /api/businesses/{id}`, although the website (`api.businesses.update`) and the app (`updateBusiness`) both call it.
- `BusinessRepository.search` and the detail lookup do not look at `status`.

## 3. Decisions

| Topic | Decision |
|---|---|
| Add a business | Login required; `owner_id` = the logged-in member, never taken from the request body |
| Edit | The owner or an admin (admin, superadmin, ceo) |
| Delete | None. The owner hides the business instead (`status = 'hidden'`), and can show it again |
| Assign owner | Admins only |
| Several businesses per member | Allowed |

## 4. Data

No schema change and no migration. `status` takes the values `visible` and `hidden`; rows with another or empty status count as visible. Existing rows without `owner_id` (none are known) simply have no owner and can be managed by admins.

## 5. API

Errors use the existing format `{ success: false, code, error }`.

| Endpoint | Who | Behaviour |
|---|---|---|
| `POST /api/businesses` | login (401 without) | Same fields and rules as today. Saves `owner_id` and `status = 'visible'`. Reply unchanged (201 `{ success, message, business }`) |
| `PUT /api/businesses/{id}` | owner or admin | Updates the same fields as adding (`name`, `owner`, `cat`, `city`, `district`, `phone`, `whatsapp`, `website`, `hours`, `services`, `offers`). Fields left out keep their value; `name`, `owner` and `cat` cannot be set empty (400 with the same message as adding). Unknown fields are ignored. `owner_id`, `status`, `rating`, `id` cannot be changed here. 404 if missing; 403 `NOT_OWNER` otherwise. Reply 200 `{ success, message, business }` |
| `PUT /api/businesses/{id}/visibility` | owner or admin | Body `{ "hidden": true or false }`, anything else 400 `VALIDATION_ERROR`. Sets `status`. Reply 200 `{ success, business }` |
| `GET /api/businesses/mine` | login | The member's own businesses, hidden ones included, newest first. `{ success, count, businesses }` |
| `PUT /api/admin/businesses/{id}/owner` | admin (403 `ADMIN_ONLY`) | Body `{ "memberId": "M1234" }`; the member must exist (404 `MEMBER_NOT_FOUND`), the business must exist. Reply 200 `{ success, business }` |
| `GET /api/businesses` | anyone | Same reply as today, but hidden businesses are left out |
| `GET /api/businesses/{id}` | anyone | Same reply as today; a hidden business is 404 for everyone except its owner and admins |

Both list and detail replies gain one field per business, `isMine` (true when the logged-in viewer owns it, false otherwise and when logged out). The existing `owner_id` and `status` fields stay as they are. A bad token on these optional-login endpoints counts as logged out, as elsewhere.

"Admin" means `Roles.isAdmin`. The route `/api/businesses/mine` must not be shadowed by `/{id}`.

## 6. Website

`BusinessDirectoryPage.jsx`:
- "Add a business" asks logged-out visitors to log in first and returns to the directory, as `/leads` does.
- A business the member owns (`isMine`) shows an "✏ edit" button that opens the existing add form filled with its values and saves with `api.businesses.update`, and a "hide / show" toggle that calls the visibility endpoint.
- A "माझे व्यवसाय" (my businesses) filter button for logged-in members, backed by `/api/businesses/mine`, which also shows hidden ones with a "लपवलेला" (hidden) mark.
- `api.js`: add `businesses.mine()`, `businesses.setVisibility(id, hidden)` (`update` already exists).

## 7. Tests and the Node comparison

- New `BusinessOwnershipTest` (MockMvc, embedded PostgreSQL): add needs a login and records the owner; the body cannot set `owner_id`; edit by owner and by admin works, by another member is 403, missing is 404, empty `name` is 400; visibility hides a business from list and detail but not from its owner and admins; `/mine` includes hidden ones; assign-owner is admin-only, checks the member exists, and the new owner can then edit; `isMine` is right for owner, other member and logged out; a broken token still gets the public list.
- `NodeParityTest` ("businesses" scenario): adding a business now needs a login, so Java and Node differ on purpose there. Its create requests move to a Java-only test (the README lists this as a deliberate difference); list and detail stay in the comparison.
- Website: the `node --test` suite keeps passing and `npm run build` succeeds, plus a hand check on the live site.

## 8. Release and rollback

Java PR, then `deploy-java.ps1`, then check the endpoints from outside; then the website PR (merged right after the deploy, because the website's add form would show an error between the two). Rollback: revert the PRs; no data was changed, so nothing needs undoing. If traffic is ever switched back to Node, adding a business works without a login again and the new buttons stop working.

## 9. Out of scope

Deleting a business · the owner transferring ownership · the "listed business" badge on `/leads` quotes · the mobile app screens · several owners per business · moderation by reports.
