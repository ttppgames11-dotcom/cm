# Blood help: member-owned requests that close, donor profiles, matching notifications (design)

Date: 2026-10-28. Status: awaiting review.

## Goal

Make "रक्तदान मदत" (`/blood-help`) reliable enough for real emergencies. Only logged-in members post. Requests belong to the member who posted them and close (blood received, cancelled, or after 7 days). Each member keeps one donor profile with an availability switch and a 90-day gap after a donation. Matching donors are told through the notification bell. Phone numbers are shown only to logged-in members. Every row on the page is real. Website first; the app comes later.

## Decisions taken with the user

- Both trust/safety and closing requests (option C).
- Phone numbers (donor phone and request contact phone) are shown to logged-in members only; visitors see name, blood group, city and a "log in to see the number" button (option A).
- A request closes automatically 7 days after it was posted or last extended; the owner may close it earlier or press "still needed" for 7 more days (option A).
- "My donor profile": one per member, linked to the account, available on/off switch, last donation date with a 90-day gap, edit and delete (option A).
- When a request is posted, available donors with the same blood group in the same district get a bell notification (option A). SMS/WhatsApp are out (they cost money).
- New proper tables, not the shared `directory_records` box (option A).

## Findings in the current code

- Server: `PortalController` serves `GET/POST /api/blood/requests` and `GET/POST /api/blood/donors` from the shared `directory_records` table (`collection`, `id`, `data` JSON, `seq`; no date column). No login, no owner, no status. The public list returns every field, phones included.
- `PortalSchemas.BLOOD_REQUEST` requires `patientName, bloodGroup, hospital, city, district, contactPhone`. The website sends `patient, hospital, bloodGroup, units, urgency, contact` (no `city`, `district`, `patientName`, `contactPhone`), so the server answers 400 and **website blood requests have most likely never been saved**. The page's `catch` adds the request to the screen and shows success anyway.
- Donor posts do save (`BLOOD_DONOR` has only optional fields).
- `BloodHelpPortalPage.jsx` falls back to invented `ACTIVE_REQUESTS` / `DONORS_SAMPLE` lists when loading fails; request time is always "आत्ताच".
- Admin `/admin/seva` "Blood Helpdesk" in `AdminShell.jsx` starts from a hard-coded 3-row `defaultBlood` list.
- The Flutter app does not call the blood endpoints (only built-in text), so changing them cannot break it.
- `CurrentUser` is `null` on endpoints without `@RequireAuth` when the caller has no valid token, so one public endpoint can answer with or without phone numbers.
- The website already has a 35-district Marathi list: `MAHARASHTRA_DISTRICTS` in `frontend/src/services/referralService.js`.

## Scope

In: two new tables, a one-time copy of the old entries, request post/close/received/extend, my requests, donor profile create/update/delete, availability and 90-day rule, phone hiding for visitors, matching-donor notifications, admin list/close/hide, the Blood help page and the admin Blood Helpdesk view rewritten on real data.
Out: the mobile app, SMS/WhatsApp, blood compatibility matching (only the same group is matched), donation history beyond the last date, hospitals/blood-bank management (the static blood-bank phone table stays), live (SSE) updates.

## Data

Migration `database/migrations/012_blood_help.sql`, also created at runtime through `LazyTables` (`IF NOT EXISTS`, safe to run twice).

**`blood_requests`**: `id` (text, `BR…`), `member_id` (nullable: null for old entries), `patient_name`, `blood_group`, `units` (integer 1–20), `hospital`, `city`, `district`, `contact_phone`, `urgency`, `note`, `status` (`open` | `fulfilled` | `closed`), `closed_by` (member id, nullable), `closes_at`, `created_at`, `updated_at`.

**`blood_donors`**: `id` (text, `BD…`), `member_id` (nullable for old entries; unique when not null: one profile per member), `name`, `blood_group`, `city`, `district`, `phone`, `available` (boolean, default true), `last_donated` (date, nullable), `hidden` (boolean, default false), `created_at`, `updated_at`.

Blood groups: `A+ A- B+ B- AB+ AB- O+ O-` exactly.

Derived values (computed when read, never stored):
- A request is **active** when `status = 'open'` and `closes_at > now()`. An open request past `closes_at` is shown as **expired** (`state: "expired"`); nothing is written when it expires.
- A donor is **eligible** when `last_donated` is null or at least 90 days ago; `can_donate_from` = `last_donated + 90 days` otherwise. A donor is **available** when `available` and eligible and not `hidden`.

Every status change is a conditional update (`WHERE id = ? AND status = 'open'`); zero rows changed means someone else closed it first → `INVALID_TRANSITION`.

### Old entries (one-time copy)

When the tables are first created, rows of `directory_records` in collections `bloodRequests` and `bloodDonors` are copied in, keeping their ids, with `member_id = null` (`ON CONFLICT DO NOTHING`, so a second run copies nothing). Field names are read leniently (`patientName`/`patient`, `contactPhone`/`contact`, `bloodGroup`/`group`). The old rows have no date, and website requests were never saved, so old requests are copied as `status = 'closed'` (admin can still see them); old donors are copied as visible, `available = true`, `last_donated = null`. A row missing a valid blood group or a name is skipped. The `directory_records` rows are left in place.

## Server (Spring Boot, new `blood` feature)

Follow the chapters/meetings patterns (`ActivityRepository.notifyMember/audit`, `SchemaValidator`/`Rule`, `ApiException`, `@RequireAuth`, `Roles.isAdmin`, `LazyTables`). The four blood routes move out of `PortalController`/`PortalService`/`PortalSchemas`; the other portal lists are untouched.

### Requests (`/api/blood/requests`)

| Method and path | Who | What |
|---|---|---|
| `GET /api/blood/requests` | anyone | Active requests, newest first. Each: `id, patient_name, blood_group, units, hospital, city, district, urgency, note, created_at, closes_at, state` (`open`), `mine` (boolean), and `contact_phone` only when the caller is logged in. Optional filters `bloodGroup`, `district`. |
| `POST /api/blood/requests` | logged in | Body `patientName` (2–100), `bloodGroup` (required, one of the 8), `units` (integer 1–20, default 1), `hospital` (2–150), `city` (2–100), `district` (2–100), `contactPhone` (phone format, 10–15), `urgency` (max 50), `note` (max 300). Creates an `open` request with `closes_at = now + 7 days`, notifies matching donors, replies 201 with `request` and `notified` (count). |
| `PUT /api/blood/requests/{id}` | the owner, or admin | Body `action`: `received` (→ `fulfilled`), `close` (→ `closed`), `extend` (`closes_at = now + 7 days`; also allowed on an open request that has expired). Only from `open`. |
| `GET /api/blood/requests/mine` | logged in | The caller's requests, all statuses, newest first, each with `state` (`open` / `expired` / `fulfilled` / `closed`). |

Post limit: at most 3 requests per member in the last 24 hours, counted in the table (`RATE_LIMIT_EXCEEDED`, 429), so a server restart does not reset it.

**Notifications:** after a request is saved, every donor that is available (switch on, eligible, not hidden), has `member_id` not null and not the poster, the same `blood_group`, and the same `district` (compared trimmed, case-insensitive) gets `notifyMember` with title "🩸 {group} रक्ताची गरज — {district}" and message "{hospital}, {city}: {units} युनिट. रक्तदान मदत पानावर संपर्क पहा." Capped at 100 donors per request (most recently updated profiles first). A notification failure is logged and never fails the post.

### Donors (`/api/blood/donors`)

| Method and path | Who | What |
|---|---|---|
| `GET /api/blood/donors` | anyone | Visible (not hidden) donors, available first, then newest. Each: `id, name, blood_group, city, district, available` (the derived value), `can_donate_from` (or null), `mine`, and `phone` only when the caller is logged in. Optional filters `bloodGroup`, `district`. |
| `GET /api/blood/donors/me` | logged in | The caller's profile, or `{ donor: null }`. |
| `POST /api/blood/donors` | logged in | Create or update the caller's own profile. Body `name` (2–100), `bloodGroup` (one of the 8), `city` (2–100), `district` (2–100), `phone` (phone format, 10–15), `available` (boolean, default true), `lastDonated` (`YYYY-MM-DD`, not in the future, may be empty). 201 on create, 200 on update. A hidden profile stays hidden when updated. |
| `DELETE /api/blood/donors/me` | logged in | Deletes the caller's profile (the row is removed). 404 if none. |

### Admin (`/api/admin/blood`, admin only; others 403)

| Method and path | What |
|---|---|
| `GET /api/admin/blood` | `requests` (all, newest first, with `state`, owner name) and `donors` (all, hidden ones included, with owner name). Phones included. |
| `PUT /api/admin/blood/donors/{id}` | Body `hidden` (boolean). Hide or unhide a donor. |

The admin closes a request with `PUT /api/blood/requests/{id}` (`close`). Admin actions are written to the audit log (`BLOOD_REQUEST_CLOSE`, `BLOOD_DONOR_HIDE`, `BLOOD_DONOR_UNHIDE`).

## Website (`E:\community_mobile_main\frontend\src`)

- New pure helpers `pages/community/bloodHelp.js` with a node test: `timeAgo` ("२ तासांपूर्वी"), `closesInText` ("५ दिवसांत बंद"), `donorBadge` (available / "{date} पासून उपलब्ध"), `requestActions` (which buttons for which state), `filterDonors`, `filterRequests`, `BLOOD_GROUPS`, `STATE_LABELS`.
- `services/apiClient.js`: `getBloodRequests(params)`, `addBloodRequest`, `bloodRequestAction(id, action)`, `getMyBloodRequests`, `getDonors(params)`, `getMyDonor`, `saveMyDonor`, `deleteMyDonor`, `adminGetBlood`, `adminSetDonorHidden`.
- `BloodHelpPortalPage.jsx`: hero and blood-bank table kept. Remove `ACTIVE_REQUESTS`/`DONORS_SAMPLE` fallbacks and the fake success in `catch`; errors show inside the form. Request cards show real time, "closes in", and phone + call button for logged-in members or "लॉगिन करा व नंबर पहा" for visitors. The post form asks for login first, sends the server's field names with a district dropdown from `MAHARASHTRA_DISTRICTS`, and shows "✅ मागणी प्रसिद्ध झाली. {n} रक्तदात्यांना कळवले." A "माझ्या मागण्या" box with "रक्त मिळाले ✅", "अजून गरज आहे", "बंद करा". Donor list with group and district filters and badges. A "माझे रक्तदाता प्रोफाइल" box: create/edit form, availability switch, last donation date, delete (with confirm).
- `AdminShell.jsx` Blood Helpdesk (`/admin/seva`): drop `defaultBlood`; real requests and donors tables with filters (state, group, district), "Close" on open requests and "Hide"/"Unhide" on donors, both with confirm.

## Errors and edge cases

- Not logged in on a member endpoint → 401; the page shows the login prompt.
- Unknown request or donor id → 404. Not the owner and not admin → 403 `NOT_OWNER`.
- Action on a request that is not `open` → `INVALID_TRANSITION` (409); unknown action → 400.
- Two first-time donor posts at once from the same member: the save is an insert-or-update on the unique `member_id` (`ON CONFLICT (member_id) DO UPDATE`), so the second simply updates the profile, never a 500.
- `lastDonated` in the future or not a date → 400. Phone not matching the phone format → 400.
- A donor's profile deleted after a notification was sent: the notification stays; the list simply no longer shows them.
- Visitors never receive `contact_phone` or `phone` in any blood response.

## Testing

- Backend (embedded PostgreSQL + MockMvc, like `ChapterEndpointsTest`): login required for posting; validation; 3-per-24h limit; list hides phones for visitors and shows them to members; expired requests leave the public list and show `expired` in mine; extend; received/close by owner and admin, others 403, second close `INVALID_TRANSITION`; one profile per member (create then update); 90-day rule and `can_donate_from`; availability switch; delete; admin hide/unhide hides from the public list; notifications go to matching group + district available donors only (not the poster, not hidden, not ineligible, not other districts) and are capped; old-entry copy (ids kept, requests closed, donors visible, bad rows skipped, second run copies nothing). Full suite and PARITY run stay green.
- Website: `node --test` for `bloodHelp.js`; `npm run build`.
- The user tests on the live site with a checklist.

## Release order

1. Backend on `Abhay_app` → PR to `main` → deploy with `deploy-java.ps1`. The tables and the copy happen on first use.
2. Website PR → merge → Vercel deploys.
3. The user runs the test checklist.
