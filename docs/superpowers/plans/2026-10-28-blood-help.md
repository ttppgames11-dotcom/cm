# Blood Help Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blood requests owned by logged-in members that close (received, cancelled, after 7 days), one donor profile per member with availability and a 90-day gap, bell notifications to matching donors, phones only for logged-in members, and the Blood help page and admin Blood Helpdesk on real data.

**Architecture:** A new `blood` feature in `backend-java` (`BloodSchemas`, `BloodRepository` on `JdbcTemplate`, `BloodService`, `BloodController` for `/api/blood/...`, `BloodAdminController` for `/api/admin/blood`) over two new tables, replacing the four blood routes in `PortalController`. Old `directory_records` entries are copied in idempotently. The website gets a pure helper module, API calls, a rewritten `BloodHelpPortalPage.jsx` and a rewritten admin `BloodView`.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-28-blood-help-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/blood-help-website` off an up-to-date `main` in `E:\community_mobile_main` (`git -C E:\community_mobile_main checkout main`, `git pull` first). Pushes as abhayGond02. Never commit `database/connect_maratha.db`.
- Tables (migration `database/migrations/012_blood_help.sql` and `LazyTables.ensureBloodTables()`, all `IF NOT EXISTS`):
  - `blood_requests(id TEXT PRIMARY KEY, member_id TEXT, patient_name TEXT NOT NULL, blood_group TEXT NOT NULL, units INTEGER NOT NULL DEFAULT 1, hospital TEXT, city TEXT, district TEXT, contact_phone TEXT, urgency TEXT, note TEXT, status TEXT NOT NULL DEFAULT 'open', closed_by TEXT, closes_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`
  - `blood_donors(id TEXT PRIMARY KEY, member_id TEXT, name TEXT NOT NULL, blood_group TEXT NOT NULL, city TEXT, district TEXT, phone TEXT, available BOOLEAN NOT NULL DEFAULT true, last_donated DATE, hidden BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`
  - `CREATE UNIQUE INDEX IF NOT EXISTS blood_donors_one_per_member ON blood_donors(member_id) WHERE member_id IS NOT NULL`
  - `CREATE INDEX IF NOT EXISTS blood_requests_member ON blood_requests(member_id, created_at)`
- Timestamps are `TIMESTAMPTZ` (not ISO text like chapters) because expiry and the 24-hour limit compare times in SQL. JSON out: ISO-8601 strings (`created_at`, `closes_at`), `can_donate_from` and `last_donated` as `YYYY-MM-DD`.
- Ids: `Ids.millis("BR", taken)` for requests, `Ids.millis("BD", taken)` for donors. Old copied rows keep their old ids (`REQ-…`, `DON-…`).
- Blood groups exactly `A+ A- B+ B- AB+ AB- O+ O-`. Request status `open` | `fulfilled` | `closed`. Derived `state`: `open` (status open and `closes_at > now()`), `expired` (status open and `closes_at <= now()`), `fulfilled`, `closed`. Actions (body `action`, trimmed, lower case): `received` → `fulfilled`, `close` → `closed`, `extend` → `closes_at = now() + 7 days`; all only from status `open` via `UPDATE ... WHERE id = ? AND status = 'open'`; 0 rows → 409 `INVALID_TRANSITION`.
- Donor eligible = `last_donated IS NULL OR last_donated <= current_date - 90`; `can_donate_from` = `last_donated + 90` when not eligible, else null; `available` (output) = stored `available` AND eligible AND NOT `hidden`.
- Request body: `patientName` 2–100, `bloodGroup` one of 8, `units` integer 1–20 (default 1), `hospital` 2–150, `city` 2–100, `district` 2–100, `contactPhone` phone format 10–15, `urgency` ≤50, `note` ≤300, all required except `units`, `urgency`, `note`. Donor body: `name` 2–100, `bloodGroup`, `city`, `district`, `phone` (phone format 10–15) required; `available` boolean (default true); `lastDonated` `YYYY-MM-DD`, not in the future, empty/null allowed. Unknown fields are ignored (never stored). snake_case aliases accepted (`patient_name`, `blood_group`, `contact_phone`, `last_donated`).
- Error codes (400 unless noted): `VALIDATION_ERROR`, `REQUEST_NOT_FOUND` (404), `DONOR_NOT_FOUND` (404), `NOT_OWNER` (403), `FORBIDDEN` (403), `INVALID_TRANSITION` (409), `RATE_LIMIT_EXCEEDED` (429). Unauthenticated on `@RequireAuth` → 401 (existing filter). Messages Marathi with English in brackets, like chapters.
- Post limit: 3 requests per member where `created_at > now() - interval '24 hours'`, counted in SQL (no in-memory limiter).
- Phone rule: `contact_phone` (requests) and `phone` (donors) are present in public list rows only when `CurrentUser` is not null; absent (key missing) otherwise. Rows also carry `mine` (boolean; false for visitors). `member_id` is never in public rows.
- Notifications (`ActivityRepository.notifyMember`, id `"NOTIF-"+millis+"-"+UUID8` like chapters): on a new request, donors with `member_id IS NOT NULL`, `member_id <> poster`, stored `available`, eligible, not `hidden`, same `blood_group`, `lower(trim(district)) = lower(trim(:district))`, ordered `updated_at DESC`, `LIMIT 100`. Title `"🩸 {group} रक्ताची गरज — {district}"`, message `"{hospital}, {city}: {units} युनिट. रक्तदान मदत पानावर संपर्क पहा."`. Each send in try/catch (logged); the reply's `notified` = number sent.
- Audit (`ActivityRepository.audit`) only for admin actions: `BLOOD_REQUEST_CLOSE` (admin closing someone else's request), `BLOOD_DONOR_HIDE`, `BLOOD_DONOR_UNHIDE`.
- Test members `M94xx`, test names starting `Zb`; tests clean their own rows in `@BeforeEach`.
- Existing backend suite and the Node comparison stay green; the blood checks leave `NodeParityTest` (Java now deliberately differs) and `PortalSecurityTest`'s donor checks move to the new test. Website: `node --test <file>` and `npm run build`.

## Rulings made while planning

- **R1:** The old-entry copy runs on every first use after a start (inside `ensureBloodTables`, `INSERT ... ON CONFLICT (id) DO NOTHING`), not only when the tables are created. Same result as "once" because copied ids already exist; it also covers a database where the tables were created by the migration file. Cost if wrong: a few milliseconds per start.
- **R2:** Timestamps are `TIMESTAMPTZ`, unlike the chapters' text timestamps (see Global Constraints). Cost if wrong: none for the website, which only displays them.
- **R3:** The admin view's dashboard count (`data.blood` from `adminApi.getBloodRequests` → public list) is left as is: it now counts active requests, which is the right meaning. Cost if wrong: one dashboard number differs from the Blood Helpdesk total.
- **R4:** `extend` on an expired-but-open request is allowed (spec), and the old copied requests are `closed`, so they cannot be extended. Cost if wrong: none.

## Review Focus

- **Visitor privacy:** no blood response for a visitor contains a phone or `member_id`, including requests, donors and the reply of a failed post. Tests in Tasks 1 and 2.
- **Someone else's request or profile:** another member's `PUT /api/blood/requests/{id}` → 403 and no change; there is no donor endpoint taking another member's id except admin hide. Test in Task 2.
- **Expired request edges:** a request one second past `closes_at` leaves the public list, shows `expired` in mine, can be extended back, and `received` still works on it. Test in Task 2.
- **Double submit of the first donor profile:** two simultaneous first `POST /api/blood/donors` by one member leave exactly one row, never a 500. Test in Task 1.
- **Notification targeting:** a donor with a different district spelling case/spaces ("pune " vs "Pune") is matched; one with last donation 89 days ago, hidden, switched off, the poster themself, or an old no-owner donor is not. Test in Task 2.

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../blood/dto/BloodSchemas.java` (create) | Rules for request, donor, action; `normalize` (aliases, trim, lower-case action) |
| `backend-java/.../blood/repository/BloodRepository.java` (create) | All blood SQL, old-entry copy |
| `backend-java/.../blood/service/BloodService.java` (create) | Lists, post, actions, mine, donor profile, admin, notifications |
| `backend-java/.../blood/controller/BloodController.java` (create) | `/api/blood/requests…`, `/api/blood/donors…` |
| `backend-java/.../blood/controller/BloodAdminController.java` (create) | `/api/admin/blood…` |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `ensureBloodTables()` |
| `backend-java/.../portal/{controller/PortalController, service/PortalService, dto/PortalSchemas}.java` (modify) | Remove the four blood routes, constants and schemas |
| `database/migrations/012_blood_help.sql` (create) | Tables and indexes |
| `backend-java/src/test/.../blood/BloodEndpointsTest.java` (create) | Backend tests |
| `backend-java/src/test/.../parity/NodeParityTest.java`, `.../portal/PortalSecurityTest.java` (modify) | Drop blood checks |
| `backend-java/README.md` (modify) | Blood endpoint table |
| `frontend/src/pages/community/bloodHelp.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/services/apiClient.js` (modify) | Blood calls |
| `frontend/src/pages/community/BloodHelpPortalPage.jsx` (rewrite logic, keep hero + blood-bank table) | Public page |
| `frontend/src/pages/admin/AdminShell.jsx` (modify `BloodView` only) | Admin Blood Helpdesk |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.) Backend tests run with `E:\community_mobile\.superpowers\sdd\2026-10-26-referrals\jt.sh <TestClass>|ALL` (one line: `exit 0: N tests, 0 failures, 0 errors`).

---

### Task 1: Tables, old-entry copy, donor profiles and donor list

**Files:**
- Create: `blood/dto/BloodSchemas.java`, `blood/repository/BloodRepository.java`, `blood/service/BloodService.java`, `blood/controller/BloodController.java`, `database/migrations/012_blood_help.sql`
- Modify: `common/schema/LazyTables.java`, `portal/controller/PortalController.java`, `portal/service/PortalService.java`, `portal/dto/PortalSchemas.java`, `src/test/.../parity/NodeParityTest.java`, `src/test/.../portal/PortalSecurityTest.java`, `backend-java/README.md`
- Test: `src/test/.../blood/BloodEndpointsTest.java`

**Interfaces:**
- Consumes: `LazyTables.createOnce`; `Ids.millis`; `SchemaValidator`/`Rule` (phone format as in `PortalSchemas.BLOOD_REQUEST`); `JsonBody`; `Roles.isAdmin(CurrentUser)`; `CurrentUser` (null for visitors on non-`@RequireAuth` routes).
- Produces: `LazyTables.ensureBloodTables()`; `BloodRepository.copyOldEntries() -> int[]` (`{requestsCopied, donorsCopied}`); `BloodService.donors(CurrentUser, String bloodGroup, String district) -> Map` (`{success, count, donors}`), `myDonor(CurrentUser) -> Map` (`{success, donor}`; donor null when none), `saveMyDonor(CurrentUser, Map) -> ResponseEntity<Map>` (201 created / 200 updated, `{success, message, donor}`), `deleteMyDonor(CurrentUser) -> Map`; a private `donorRow(Map row, CurrentUser viewer)` shaping a donor (`id, name, blood_group, city, district, available, can_donate_from, last_donated` (own/admin only), `mine`, `phone` when logged in); routes `GET /api/blood/donors`, `GET /api/blood/donors/me`, `POST /api/blood/donors`, `DELETE /api/blood/donors/me`.

- [ ] **Step 1: Write the failing tests** in `BloodEndpointsTest` (skeleton as `ChapterEndpointsTest`: `fresh()` resets `RateLimitFilter`, deletes `blood_requests`/`blood_donors` rows with `member_id LIKE 'M94%'` or `name/patient_name LIKE 'Zb%'` (guarded by `to_regclass`), `directory_records` with `id LIKE '%Zb%'`, `notifications`/`audit_logs` of `M94%`; upserts members `M9401`–`M9408` and admin `M9409`; helpers `token(id, role)`, `donorBody()` = name `Zb Donor`, bloodGroup `O+`, city `Pune`, district `पुणे`, phone `9876543210`; `donor(id, memberId, group, district, available, lastDonatedDaysAgo, hidden)` inserts with SQL). Tests:
  - `donorProfileNeedsALogin` (POST and GET me without token → 401).
  - `memberCreatesThenUpdatesTheirProfile` (first POST 201, id starts `BD`; second POST with city `Satara` → 200, same id, one row for `M9401`).
  - `simultaneousFirstProfilesLeaveOneRow` (two threads POST for `M9402` at once, 10 rounds, each round deleting first: statuses ⊂ {200, 201}, never 500; exactly one row).
  - `donorFieldsAreValidated` (name `Z`, bloodGroup `Z+`, missing district, phone `123`, lastDonated tomorrow, lastDonated `28-10-2026` → 400 `VALIDATION_ERROR`; no row).
  - `unknownFieldsAreNotStored` (body with `hidden: true`, `member_id: "M9499"` → profile not hidden, owned by the caller).
  - `ninetyDayGapControlsAvailability` (lastDonated 30 days ago → list row `available` false, `can_donate_from` = that date + 90; 90 days ago → `available` true, `can_donate_from` null).
  - `availabilitySwitchOffHidesFromAvailable` (`available: false` → row `available` false).
  - `visitorsSeeNoPhonesMembersDo` (visitor GET list: raw text has no `9876543210`, no `member_id`, rows lack `phone`; member GET: `phone` present; `mine` true only for own row).
  - `listFiltersByGroupAndDistrictAndSkipsHidden` (O+ पुणे, A+ पुणे, O+ सातारा, hidden O+ पुणे → `?bloodGroup=O%2B&district=पुणे` returns one; available donors first).
  - `deleteRemovesOnlyMyProfile` (DELETE me → 200 and row gone; again → 404 `DONOR_NOT_FOUND`).
  - `hiddenProfileStaysHiddenWhenUpdated` (SQL hide `M9401`'s row; POST update → still hidden, absent from list).
  - `oldEntriesAreCopiedOnce` (insert `directory_records` rows: `bloodDonors`/`DON-Zb1` `{"name":"Zb Old","group":"B+","city":"Pune","phone":"9000000001"}`, `bloodDonors`/`DON-Zb2` with `group` `X`, `bloodRequests`/`REQ-Zb1` `{"patient":"Zb Patient","bloodGroup":"A+","hospital":"Sassoon","contact":"9000000002"}`; call `copyOldEntries()` → donor `DON-Zb1` visible with `member_id` null, `DON-Zb2` absent, request `REQ-Zb1` status `closed`; second call copies 0 and changes nothing).
- [ ] **Step 2: Run to verify they fail:** `jt.sh BloodEndpointsTest`. Expected: failures (missing classes/404), not errors in test code itself.
- [ ] **Step 3: Implement** the migration, `ensureBloodTables()` (DDL per Global Constraints, then `copyOldEntries()`; every service method calls it first), `BloodSchemas`, `BloodRepository` (donor upsert `INSERT ... ON CONFLICT (member_id) WHERE member_id IS NOT NULL DO UPDATE SET name, blood_group, city, district, phone, available, last_donated, updated_at = now()` returning the row and whether it was an insert via `xmax = 0`), the donor service methods and routes. `copyOldEntries` reads `directory_records` rows of `bloodDonors`/`bloodRequests` with Jackson, accepts `bloodGroup` or `group` (must be one of the 8), `name` / `patientName` or `patient` (non-blank), `phone` / `contactPhone` or `contact`, `city`, `district`, `hospital`, `units` (integer 1–20 else 1), `urgency`; requests inserted `status 'closed'`, `closes_at now()`. Remove `BLOOD_REQUESTS`/`BLOOD_DONORS`, `addBloodRequest`/`addBloodDonor`, the two schemas and the four routes from the portal classes. In `NodeParityTest` delete the blood request records (lines ~1101–1117), drop `/api/blood/requests` and `/api/blood/donors` from the plain-list loop and the "blood request listed" assertion. In `PortalSecurityTest` replace the donor part of the first test and the `/api/blood/donors` oversize check with the same checks on `/api/social/volunteers`. README: Blood table (donor routes).
- [ ] **Step 4: Run** `jt.sh BloodEndpointsTest` (Expected: `exit 0`), then `jt.sh ALL` (Expected: `exit 0`, parity `0 differ`).
- [ ] **Step 5: Commit** `feat(backend-java): blood tables, donor profiles and donor list (tests)`.

---

### Task 2: Requests, my requests, actions, notifications, admin

**Files:**
- Create: `blood/controller/BloodAdminController.java`
- Modify: `blood/service/BloodService.java`, `blood/repository/BloodRepository.java`, `blood/controller/BloodController.java`, `backend-java/README.md`
- Test: `BloodEndpointsTest` (add)

**Interfaces:**
- Consumes: Task 1's classes and test helpers; `ActivityRepository.notifyMember(id, memberId, title, message)`, `audit(id, userId, userName, action, details)`.
- Produces: `BloodService.requests(CurrentUser, String bloodGroup, String district) -> Map` (`{success, count, requests}`), `post(CurrentUser, Map) -> Map` (201, `{success, message, request, notified}`), `act(CurrentUser, String id, Map) -> Map` (`{success, message, request}`), `myRequests(CurrentUser) -> Map` (`{success, count, requests}`), `adminAll(CurrentUser) -> Map` (`{success, requests, donors}`, phones included, each with `owner_name`), `setHidden(CurrentUser, String donorId, Map) -> Map` (`{success, donor}`); request row fields `id, patient_name, blood_group, units, hospital, city, district, urgency, note, created_at, closes_at, state, mine` (+ `contact_phone` when logged in); routes `GET|POST /api/blood/requests`, `GET /api/blood/requests/mine` (declared before `/{id}`), `PUT /api/blood/requests/{id}`, `GET /api/admin/blood`, `PUT /api/admin/blood/donors/{id}`.

- [ ] **Step 1: Write the failing tests** (helpers `requestBody()` = patientName `Zb Patient`, bloodGroup `O+`, units 2, hospital `Zb Hospital`, city `Pune`, district `पुणे`, contactPhone `9876543211`, urgency `तात्काळ`; `post(token)`, `act(token, id, action)`; `expire(id)` sets `closes_at = now() - interval '1 second'`):
  - `postingNeedsALogin` (401; nothing saved).
  - `memberPostsARequest` (201, id starts `BR`, `state` `open`, `closes_at` ≈ now + 7 days (±1 min), `mine` true).
  - `requestFieldsAreValidated` (bloodGroup `Z+`, city empty, contactPhone `1`, units 25, units 2.5, note 301 chars → 400; the 400 body contains no phone).
  - `threeRequestsADay` (4th → 429 `RATE_LIMIT_EXCEEDED`; after SQL moves the first 3 back 25 hours, a new one → 201).
  - `visitorsSeeRequestsWithoutPhones` (raw visitor list has no `9876543211`, no `member_id`; member list has `contact_phone`).
  - `listShowsOnlyActiveNewestFirstWithFilters` (fulfilled, closed and expired absent; two open in newest-first order; `?bloodGroup=` and `?district=` filter).
  - `ownerMarksReceivedOrCloses` (`received` → `fulfilled` and gone from list; another request `close` → `closed`; `closed_by` = owner).
  - `extendAddsSevenDaysEvenAfterExpiry` (`expire`, absent from list, mine shows `expired`; `extend` → `state` `open`, back in list; `received` on an expired one also works).
  - `othersCannotActOnMyRequest` (M9402 on M9401's request → 403 `NOT_OWNER`, status unchanged; unknown id → 404 `REQUEST_NOT_FOUND`).
  - `actingTwiceIsRefused` (`received` then `close` → 409 `INVALID_TRANSITION`).
  - `badActionWordsAre400` (`accept`, empty, missing, a number).
  - `adminClosesAnyRequestAndItIsAudited` (one `BLOOD_REQUEST_CLOSE` row; owner closing own → no audit row).
  - `mineListsAllMyRequestsWithState` (open, expired, fulfilled, closed — all four present for M9401, none of M9402's).
  - `matchingDonorsAreNotified` (donors: M9402 O+ district stored as `" पुणे "` (extra spaces), available, eligible → notified; M9403 O+ पुणे last donated 89 days ago → no; M9404 O+ पुणे switched off → no; M9405 O+ पुणे hidden → no; M9406 A+ पुणे → no; M9407 O+ सातारा → no; M9401 (the poster) O+ पुणे → no; an old no-owner O+ पुणे → no. Post as M9401 → `notified` 1, exactly one notification row for M9402 whose title contains `O+` and `पुणे`).
  - `notificationsAreCappedAt100` (insert 105 eligible O+ पुणे donors with members `M94A000`…; post → `notified` 100).
  - `adminSeesEverythingAndHidesDonors` (member → 403 on both admin routes; admin list includes closed requests, hidden donors, phones and `owner_name`; hide → absent from public list and `BLOOD_DONOR_HIDE` audit; unhide → back, `BLOOD_DONOR_UNHIDE`; unknown donor → 404).
- [ ] **Step 2: Run to verify they fail:** `jt.sh BloodEndpointsTest`. Expected: new tests fail, Task 1 tests pass.
- [ ] **Step 3: Implement** per Global Constraints. `post`: validate → count last-24h rows for the member (≥3 → 429) → insert with `closes_at = now() + interval '7 days'` → notify matching donors → reply. `act`: load (404) → owner or admin else 403 → conditional update (`closed_by` = caller for `received`/`close`) → audit when an admin closes another member's request. `state` computed in SQL (`CASE WHEN status='open' AND closes_at <= now() THEN 'expired' ELSE status END`). Admin routes `@RequireAuth`, non-admin → 403 `FORBIDDEN`. README: request and admin routes.
- [ ] **Step 4: Run** `jt.sh BloodEndpointsTest`, then `jt.sh ALL`. Expected: `exit 0`, no failures.
- [ ] **Step 5: Commit** `feat(backend-java): blood requests that close, matching-donor notifications, admin (tests)`.

---

### Task 3: Website helpers

**Files:**
- Create: `frontend/src/pages/community/bloodHelp.js`
- Test: `frontend/src/pages/community/bloodHelp.test.js` (from `E:\community_mobile_main\frontend`: `node --test src/pages/community/bloodHelp.test.js`)

**Interfaces:**
- Consumes: server rows from Tasks 1–2.
- Produces (pure, named exports; every time function takes `now` (Date) as last argument for testing): `BLOOD_GROUPS` (the 8, in order `A+ A- B+ B- AB+ AB- O+ O-`); `STATE_LABELS` (`open` `सुरू`, `expired` `मुदत संपली`, `fulfilled` `रक्त मिळाले ✅`, `closed` `बंद`); `toMarathiDigits(n) -> string`; `timeAgo(iso, now) -> string` (`आत्ताच` < 1 min, `{n} मिनिटांपूर्वी`, `{n} तासांपूर्वी`, `{n} दिवसांपूर्वी`, digits Marathi); `closesInText(iso, now) -> string` (`{n} दिवसांत बंद` rounding up, `आज बंद` within 24 h, `मुदत संपली` when past); `donorBadge(donor) -> { tone: 'green'|'amber', text }` (`उपलब्ध` when `available`; `{DD-MM-YYYY} पासून उपलब्ध` when `can_donate_from`; else `सध्या उपलब्ध नाही`); `requestActions(request) -> string[]` (`open`: `['received','extend','close']`; `expired`: `['received','extend','close']`; others `[]`); `filterDonors(donors, { group, search })` and `filterRequests(requests, { group, search })` (`group` `'all'` = any; search case-insensitive over name/patient_name, city, district, hospital); `requestPayload(form) -> object` (server field names, `units` as a number, trimmed strings, empty `note` omitted).

- [ ] **Step 1: Write the failing test** covering: `timeAgo` at 30 s, 5 min, 3 h, 2 days with Marathi digits (`५ मिनिटांपूर्वी`); `closesInText` at +4.5 days (`५ दिवसांत बंद`), +3 h (`आज बंद`), −1 min (`मुदत संपली`); `donorBadge` three cases (`2026-12-01` → `01-12-2026 पासून उपलब्ध`); `requestActions` for all four states; filters on group and on a district search; `requestPayload` turns `units: "2"` into `2`, trims `" Pune "` and drops empty note.
- [ ] **Step 2: Run to verify it fails.** Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `bloodHelp.js` to the signatures above.
- [ ] **Step 4: Run** the same command. Expected: all pass.
- [ ] **Step 5: Commit** (branch `feat/blood-help-website`): `feat(website): blood help helpers`.

---

### Task 4: API calls and the Blood help page

**Files:**
- Modify: `frontend/src/services/apiClient.js`, `frontend/src/pages/community/BloodHelpPortalPage.jsx`

**Interfaces:**
- Consumes: Task 3 exports; `fetchJson` (throws `Error(message)` on refusal); `useAuth()`; `MAHARASHTRA_DISTRICTS` from `services/referralService.js`.
- Produces: `apiClient.getBloodRequests(params)` (array), `addBloodRequest(data)`, `bloodRequestAction(id, action)`, `getMyBloodRequests()` (array), `getDonors(params)` (array), `getMyDonor()` (donor or null), `saveMyDonor(data)`, `deleteMyDonor()`, `adminGetBlood()` (`{requests, donors}`), `adminSetDonorHidden(id, hidden)`.

- [ ] **Step 1: Replace the four existing blood calls** in `apiClient.js` with the ones above (`params` → query string `bloodGroup`, `district`).
- [ ] **Step 2: Rewrite the page logic:** delete `ACTIVE_REQUESTS`, `DONORS_SAMPLE` and every fake-success `catch`; keep the hero and the blood-bank table. Requests section: cards from `getBloodRequests` with group, units, patient, hospital, city/district, `timeAgo`, `closesInText`, urgency; logged in → phone and a `tel:` call button; visitor → button "लॉगिन करा व नंबर पहा" to `/login?redirect=/blood-help`; group filter (`BLOOD_GROUPS`) and search via `filterRequests`. "Post a request": visitor → login redirect; form fields per Global Constraints with a district `<select>` from `MAHARASHTRA_DISTRICTS`, sends `requestPayload(form)`, shows the server's error inside the form, on success "✅ मागणी प्रसिद्ध झाली. {n} रक्तदात्यांना कळवले." and reloads. "माझ्या मागण्या" box (logged in, from `getMyBloodRequests`): `STATE_LABELS`, buttons from `requestActions` labelled `रक्त मिळाले ✅` / `अजून गरज आहे` / `बंद करा` (close asks `window.confirm`), each calls `bloodRequestAction` then reloads both lists. Donors section: list from `getDonors` with `donorBadge`, phone rule as for requests, group filter and search via `filterDonors`. "माझे रक्तदाता प्रोफाइल" (logged in, from `getMyDonor`): form (name, group, city, district select, phone, available switch, last donation date `max` = today) → `saveMyDonor`; delete with confirm → `deleteMyDonor`; errors shown in the form. Empty lists: "सध्या कोणतीही सुरू मागणी नाही" / "अद्याप रक्तदाते नोंदवलेले नाहीत". Disable a button while its request runs.
- [ ] **Step 3: Verify:** `node --test src/pages/community/bloodHelp.test.js` (pass); `grep -n "ACTIVE_REQUESTS\|DONORS_SAMPLE\|REST API Confirmation" src/pages/community/BloodHelpPortalPage.jsx` (no output); `npm run build` (Expected: `built in`, no error).
- [ ] **Step 4: Commit** `feat(website): real blood help page with my requests and donor profile`.

---

### Task 5: Admin Blood Helpdesk

**Files:**
- Modify: `frontend/src/pages/admin/AdminShell.jsx` (`BloodView` at ~2035 and its route at ~682; delete `defaultBlood` rows at ~369–373 and use `[]`)

**Interfaces:**
- Consumes: Task 4's `adminGetBlood`, `adminSetDonorHidden`, `bloodRequestAction`; Task 3's `STATE_LABELS`, `BLOOD_GROUPS`, `timeAgo`; existing `Card`, `Table`, `Badge`, `Btn`, `SectionTitle`, `T`.
- Produces: nothing used elsewhere.

- [ ] **Step 1: Rewrite `BloodView({ toast })`:** load `adminGetBlood()` on mount. Filters: state (all/open/expired/fulfilled/closed), blood group, district text. Requests table: ID, patient, group, units, hospital/city/district, phone, owner (`owner_name` or "जुनी नोंद"), state Badge, created (`timeAgo`), action "Close" on open/expired (confirm → `bloodRequestAction(id,'close')`). Donors table: name, group, city/district, phone, owner, available, hidden Badge, action Hide/Unhide (confirm → `adminSetDonorHidden`). Toast the server message on error; reload after each action.
- [ ] **Step 2: Verify:** `grep -n "BLD-101\|defaultBlood = \[$" src/pages/admin/AdminShell.jsx` (no `BLD-101`); `node --test src/pages/community/bloodHelp.test.js` (pass); `npm run build` (Expected: `built in`).
- [ ] **Step 3: Commit** `feat(website): admin blood helpdesk on real data`.
