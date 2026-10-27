# Business Sangam Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real business chapters: admins create them and pick a coordinator; business owners ask to join with one business; the coordinator or an admin approves; the Sangam page and the admin Chapters view show only real data.

**Architecture:** A new `ChapterService` with two controllers (`ChapterController` for `/api/sangam/chapters`, `ChapterAdminController` for `/api/admin/chapters`) in the existing `sangam` feature, over two new tables (`chapters`, `chapter_seats`) read and written with `JdbcTemplate` through a `ChapterRepository`. Rules that must survive simultaneous clicks are partial unique indexes plus conditional updates. The website gets a pure helper module, API calls, a rewritten `BusinessSangamPage.jsx` and a rewritten `ChaptersView`.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-business-chapters-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/chapters-website` off an up-to-date `main` in `E:\community_mobile_main` (run `git -C E:\community_mobile_main checkout main` and `git pull` first; local `main` is 4 commits behind). Pushes as abhayGond02. Never commit `database/connect_maratha.db`.
- Tables (migration `database/migrations/011_chapters.sql` and `LazyTables.ensureChapterTables()`, all `IF NOT EXISTS`):
  - `chapters(id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT, district TEXT, area TEXT, meeting_day TEXT, meeting_time TEXT, venue TEXT, coordinator_id TEXT, max_seats INTEGER, status TEXT NOT NULL DEFAULT 'open', created_at TEXT, updated_at TEXT)`
  - `chapter_seats(id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL, business_id TEXT NOT NULL, member_id TEXT NOT NULL, message TEXT, status TEXT NOT NULL, decided_by TEXT, created_at TEXT, updated_at TEXT)`
  - `CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_business ON chapter_seats(business_id) WHERE status IN ('waiting','approved')`
  - `CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_member ON chapter_seats(chapter_id, member_id) WHERE status IN ('waiting','approved')`
- Ids: `Ids.millis("CH", taken)` for chapters, `Ids.millis("CS", taken)` for seats. Timestamps: ISO text like the meetings rows (`Instant.now().toString()`).
- Chapter status `open` | `closed`. Seat status `waiting`, `approved`, `declined`, `cancelled`, `left`, `removed`; active = `waiting` or `approved`. Seat actions (body `action`, trimmed, lower case): `approve`, `decline` (coordinator/admin, from `waiting`), `remove` (coordinator/admin, from `approved`), `cancel`, `leave` (the member who asked, from `waiting` / `approved`). Every status change is `UPDATE ... WHERE id = ? AND status = ?`; 0 rows → 400 `INVALID_TRANSITION`.
- Visible business = `status IS NULL OR status <> 'hidden'`. Lists and counts join `businesses`, so a deleted business disappears.
- Error codes (400 unless noted): `VALIDATION_ERROR`, `CHAPTER_NOT_FOUND` (404), `SEAT_NOT_FOUND` (404), `BUSINESS_NOT_FOUND` (404), `NOT_OWNER` (403), `FORBIDDEN` (403), `CHAPTER_CLOSED`, `BUSINESS_HIDDEN`, `BUSINESS_ALREADY_IN_CHAPTER`, `ALREADY_IN_THIS_CHAPTER`, `CHAPTER_FULL`, `INVALID_TRANSITION`, `COORDINATOR_NOT_FOUND`, `RATE_LIMIT_EXCEEDED` (429). Messages Marathi with English in brackets, like meetings. A unique-index violation (`DataIntegrityViolationException`) from a simultaneous join maps to the matching "already" code, never a 500.
- Chapter fields: `name` required 3–120; `city`, `district` required, up to 60; `area` up to 120; `meetingDay`, `meetingTime` up to 40; `venue` up to 200; `coordinatorId` required, an existing member; `maxSeats` optional whole number 1–200, `null`/empty = no limit. snake_case aliases (`meeting_day`, `meeting_time`, `coordinator_id`, `max_seats`) accepted. Join body: `businessId` (alias `business_id`) required, `message` optional up to 300.
- JSON out uses snake_case field names as in the spec tables.
- `ChapterLimiter`: 10 joins per member per 24 h (copy of `MeetingLimiter`).
- Notifications via `ActivityRepository.notifyMember`: new request → coordinator; approved, declined, removed → the member; closing → each member whose waiting request it declined. Audit via `ActivityRepository.audit`: `CHAPTER_CREATE`, `CHAPTER_UPDATE`, `CHAPTER_CLOSE`, `CHAPTER_REOPEN`, `CHAPTER_SEAT_APPROVE`, `CHAPTER_SEAT_DECLINE`, `CHAPTER_SEAT_REMOVE`.
- Test members `M93xx`, test businesses named `Zc...`, test chapters named `Zc...`; tests clean their own rows in `@BeforeEach`.
- Existing 195 backend tests and the Node comparison stay green (Node has no chapter routes; `NodeParityTest` is not touched). Website tests with `node --test <file>` and `npm run build`.

## Rulings made while planning

- **R1:** Meeting day and time are free text (the spec's examples are Marathi phrases), only length-checked. Cost if wrong: an admin can type an odd value; it is only displayed.
- **R2:** `GET /api/sangam/chapters` lists open chapters sorted by `city`, then `name`. Cost if wrong: a different order on the page.
- **R3:** An admin is treated as coordinator of every chapter for the seat actions and `/{id}/seats`, but `mine.coordinating` lists only chapters where the caller is the named coordinator. Cost if wrong: an admin does not see every chapter in "My chapters" (they use the admin console).

- **R4:** The spec says each listed business links to its business page; the website has no single-business route (only the `/business` directory), so the list links to the directory. Cost if wrong: one extra click to find the business.

## Review Focus

- **Two requests at the same instant** for the same business (two tabs) or two approvals of the same request: one wins, the other gets the "already"/`INVALID_TRANSITION` code, never a 500. Tests in Task 2.
- **Someone else's business:** joining with a business id the caller does not own is 403 `NOT_OWNER`, and nothing is saved. Test in Task 2.
- **Privacy of the public list:** no phone, no member id, no business names for visitors. Test in Task 1.
- **Closed chapter:** not in the public list, refuses join and approve, closing declines waiting rows, reopening brings approved seats back. Tests in Tasks 1 and 2.
- **Full chapter and lowered maximum:** approve refused at the limit; lowering below the current count removes nobody and `open_seats` is 0, not negative. Tests in Tasks 1 and 2.

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../sangam/dto/ChapterSchemas.java` (create) | Validation rules for chapter, join, seat action; `normalize` |
| `backend-java/.../sangam/repository/ChapterRepository.java` (create) | All chapter and seat SQL (JdbcTemplate) |
| `backend-java/.../sangam/service/ChapterLimiter.java` (create) | 10 joins per member per 24 h |
| `backend-java/.../sangam/service/ChapterService.java` (create) | Public list, admin create/edit/close, join, mine, seats, seat actions |
| `backend-java/.../sangam/controller/ChapterController.java` (create) | `/api/sangam/chapters` routes |
| `backend-java/.../sangam/controller/ChapterAdminController.java` (create) | `/api/admin/chapters` routes |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `ensureChapterTables()` |
| `database/migrations/011_chapters.sql` (create) | The two tables and two indexes |
| `backend-java/src/test/.../sangam/ChapterEndpointsTest.java` (create) | Backend tests |
| `backend-java/README.md` (modify) | Chapters endpoint table |
| `frontend/src/pages/sangam/chapterList.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/services/apiClient.js` (modify) | Chapter calls |
| `frontend/src/pages/sangam/BusinessSangamPage.jsx` (rewrite) | Public page, join, My chapters |
| `frontend/src/pages/admin/AdminShell.jsx` (modify `ChaptersView` only) | Admin chapters console |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.) Backend tests run with `E:\community_mobile\.superpowers\sdd\2026-10-26-referrals\jt.sh <TestClass>|ALL` (prints one line: `exit 0: N tests, 0 failures, 0 errors`).

---

### Task 1: Chapter tables, admin create/edit/list, public list

**Files:**
- Create: `dto/ChapterSchemas.java`, `repository/ChapterRepository.java`, `service/ChapterService.java`, `controller/ChapterController.java`, `controller/ChapterAdminController.java` (under `.../sangam/`), `database/migrations/011_chapters.sql`
- Modify: `common/schema/LazyTables.java`, `backend-java/README.md`
- Test: `src/test/.../sangam/ChapterEndpointsTest.java`

**Interfaces:**
- Consumes: `LazyTables.createOnce`; `MemberRepository.findById`; `ActivityRepository.audit(id, userId, userName, action, details)`; `Roles.isAdmin(CurrentUser)`; `SchemaValidator`/`Rule` as in `MeetingSchemas`; `JsonBody` as in `MeetingController`.
- Produces: `LazyTables.ensureChapterTables()`; `ChapterSchemas.CHAPTER`, `ChapterSchemas.normalize(Map)`; `ChapterService.publicList() -> Map` (`{success, count, chapters}`), `adminList(CurrentUser) -> Map` (`{success, count, chapters}`), `create(CurrentUser, Map) -> Map` (`{success, message, chapter}`), `update(CurrentUser, String id, Map) -> Map` (same shape; a missing field keeps its value); `ChapterRepository.findChapter(String id) -> Optional<Map<String,Object>>`, `approvedCount(String chapterId) -> int` (all approved seats, hidden businesses included); routes `GET /api/sangam/chapters`, `GET|POST /api/admin/chapters`, `PUT /api/admin/chapters/{id}`.

- [ ] **Step 1: Write the failing tests** in `ChapterEndpointsTest` (same skeleton as `MeetingEndpointsTest`: `fresh()` deletes `chapter_seats` and `chapters` rows whose chapter name starts `Zc`, `notifications` and `audit_logs` of `M93%`, `businesses` named `Zc%`; upserts members `M9301` coordinator, `M9302` owner of visible `ZCB1` (cat `it`, city `Pune`) and visible `ZCB2` (cat `it`, city `Mumbai`), `M9303` owner of visible `ZCB3` (cat `restaurant`), `M9304` owner of hidden `ZCB4`, `M9305` no business, `M9306` owner of visible `ZCB6` (cat `it`), `M9309` admin; helpers `token(id, role)`, `chapterBody()` = name `Zc Pune West`, city `पुणे`, district `पुणे`, area `हिंजवडी`, meetingDay `प्रत्येक बुधवार`, meetingTime `सकाळी ७:३० ते ९:००`, venue `Zc Hall`, coordinatorId `M9301`, maxSeats `3`; `createChapter(body) -> id` as admin; `seat(chapterId, businessId, memberId, status)` inserts a seat row with SQL). Tests: `onlyAnAdminCanCreateChapters` (no login 401, member 403, admin 201 with `status` `open` and an id starting `CH`, one `CHAPTER_CREATE` audit row); `chapterFieldsAreValidated` (name `Zc` too short, missing city, `maxSeats` 0, 201, `"x"`, a 41-character meetingDay, unknown coordinator `M9399` → 400 with `VALIDATION_ERROR` or `COORDINATOR_NOT_FOUND`; no row saved); `snakeCaseFieldsAreAccepted` (`coordinator_id`, `max_seats`, `meeting_day`); `adminEditsKeepUnsentFields` (PUT only `venue` → venue changed, name unchanged, `CHAPTER_UPDATE` audit); `adminChangesTheCoordinator` (PUT `coordinatorId` `M9303` → `coordinator_id` `M9303`); `closingAndReopeningAreAudited` (PUT `status` `closed` → `CHAPTER_CLOSE`, then `open` → `CHAPTER_REOPEN`; `status` `paused` → 400); `editingAnUnknownChapterIs404`; `adminListShowsOpenAndClosedWithCounts` (one closed chapter appears; `businesses` and `waiting` counts from seeded seat rows; `coordinator_name` `Member M9301`); `publicListNeedsNoLoginAndShowsOnlyOpenChapters` (closed chapter absent); `publicListCountsRealSeatsOnly` (seed approved `ZCB1`, approved hidden `ZCB4`, waiting `ZCB3`, declined `ZCB2` → `businesses` 1, `open_seats` 1 (3 − 2 approved), `categories` `[{cat:"it",count:1}]`); `openSeatsIsNullWithoutAMaximumAndNeverNegative` (no maxSeats → `open_seats` null; maxSeats 1 with 2 approved → 0); `publicListHasNoPrivateFields` (raw response text contains neither `phone`, `coordinator_id`, `member_id`, nor `Zc Shop`); `aDeletedBusinessDropsOutOfCounts` (approved seat whose business row is deleted → `businesses` 0).
- [ ] **Step 2: Run to verify they fail:** `jt.sh ChapterEndpointsTest`. Expected: failures (404 or missing classes), not compile errors in the test itself.
- [ ] **Step 3: Implement** the migration SQL and `LazyTables.ensureChapterTables()` (statements per Global Constraints; every service method calls it first), `ChapterSchemas` (rules per Global Constraints; `maxSeats` checked in the service as an integer 1–200 or null), `ChapterRepository` (JdbcTemplate; list queries `LEFT JOIN members` for `coordinator_name` and count seats with `JOIN businesses`), `ChapterService` methods above and the two controllers (`@RequireAuth` on admin routes; non-admin → 403 `FORBIDDEN`). `update` with `status` `closed` only sets the status in this task (declining waiting rows is Task 2). Add a Chapters table to the README under new features.
- [ ] **Step 4: Run** `jt.sh ChapterEndpointsTest` (Expected: `exit 0`), then `jt.sh ALL` (Expected: `exit 0`, no failures; parity line `0 differ`).
- [ ] **Step 5: Commit** `feat(backend-java): chapters tables, admin create/edit and public list (tests)`.

---

### Task 2: Join, my chapters, coordinator seats and seat actions

**Files:**
- Create: `service/ChapterLimiter.java`
- Modify: `service/ChapterService.java`, `repository/ChapterRepository.java`, `controller/ChapterController.java`, `backend-java/README.md`
- Test: `ChapterEndpointsTest` (add)

**Interfaces:**
- Consumes: Task 1's service, repository, schemas and helpers; `ActivityRepository.notifyMember(id, memberId, title, message)`.
- Produces: `ChapterService.businesses(CurrentUser, String chapterId) -> Map` (`{success, count, businesses}`), `mine(CurrentUser) -> Map` (`{success, seats, coordinating}`), `seats(CurrentUser, String chapterId) -> Map` (`{success, count, seats}`, each with `similar` and `business_hidden`), `join(CurrentUser, String chapterId, Map) -> Map` (201, `{success, message, seat}`), `act(CurrentUser, String seatId, Map) -> Map` (`{success, message, seat}`); `ChapterLimiter.check(String)`, `reset()`; routes `GET /{id}/businesses`, `GET /mine`, `GET /{id}/seats`, `POST /{id}/join`, `PUT /seats/{seatId}` (all `@RequireAuth`).

- [ ] **Step 1: Write the failing tests** (helper `join(token, chapterId, businessId)`, `act(token, seatId, action)`): `joinNeedsALogin` (401); `ownerAsksToJoin` (201, `status` `waiting`, coordinator `M9301` gets one notification); `cannotJoinWithSomeoneElsesBusiness` (M9303 with `ZCB1` → 403 `NOT_OWNER`, no seat row); `joinChecks` (unknown chapter 404, closed chapter `CHAPTER_CLOSED`, unknown business 404, hidden `ZCB4` `BUSINESS_HIDDEN`, message of 301 characters 400); `aBusinessCanBeInOnlyOneChapter` (ZCB1 waiting in chapter A → joining B with ZCB1 gives `BUSINESS_ALREADY_IN_CHAPTER`); `oneSeatPerMemberPerChapter` (M9302 with ZCB1 then ZCB2 in the same chapter → `ALREADY_IN_THIS_CHAPTER`; ZCB2 into another chapter → 201); `simultaneousJoinsGiveOneSeat` (two threads join the same business at once, repeated 10 rounds: exactly one 201, the other `BUSINESS_ALREADY_IN_CHAPTER`, never 500); `tenJoinsADayIsTheMaximum` (direct `limiter.check` calls; the 11th → 429); `coordinatorApproves` (`approved`, `decided_by` `M9301`, member notified, `CHAPTER_SEAT_APPROVE` audit); `adminCanApproveAnyChapter`; `othersCannotDecide` (the asking member and a stranger → 403 `FORBIDDEN` on approve/decline/remove; status unchanged); `approvingTwiceIsRefused` (`INVALID_TRANSITION`); `simultaneousApprovalsDecideOnce` (two threads, 10 rounds: one 200, one `INVALID_TRANSITION`, one notification per round); `fullChapterRefusesApproval` (maxSeats 1, one approved, approve another → `CHAPTER_FULL`); `declineAndRemoveNotifyTheMember` (with audit rows; remove only from `approved`); `memberCancelsAndLeaves` (cancel from `waiting`, leave from `approved`; a stranger → 403; the business may then join again → 201); `coordinatorMayApproveTheirOwnBusiness` (coordinator `M9302` of a chapter approves their own `ZCB1` request); `closingDeclinesWaitingRequestsAndReopeningRestoresSeats` (one waiting, one approved; admin closes → waiting becomes `declined` and its member notified, approve on a closed chapter → `CHAPTER_CLOSED`; reopen → the approved seat still counted in the public list); `aNewCoordinatorGetsTheRightsAtOnce` (admin moves coordinator to `M9303`; `M9301` → 403, `M9303` → 200); `businessesListIsForLoggedInMembersOnly` (401 without login; shows approved visible businesses with `owner_id`, hides hidden ones and waiting ones; closed chapter → 404 for a member, 200 for its coordinator); `mineShowsMyRowsAndChaptersICoordinate` (M9302 sees its seat rows with `chapter_name` and `business_name`; M9301 sees `coordinating` with `waiting` 1); `seatsListShowsSimilarAndHidden` (approved ZCB1 `it`, waiting ZCB6 `it`, waiting ZCB3 `restaurant` → the ZCB6 row has `similar` 1, the ZCB3 row 0; a waiting request whose business was hidden afterwards has `business_hidden` true and can still be approved; a member → 403); `badActionWordsAre400` (`accept`, empty, missing, a number).
- [ ] **Step 2: Run to verify they fail:** `jt.sh ChapterEndpointsTest`. Expected: the new tests fail (404/405), Task 1 tests pass.
- [ ] **Step 3: Implement** per Global Constraints. `join` order: chapter exists and open → business exists → owner → visible → no active row for the business → no active row for this member in the chapter → `limiter.check` → insert (catch `DataIntegrityViolationException`, re-check which index fired, throw the matching code). `act`: load seat; for `approve`/`decline`/`remove` the caller must be the chapter's `coordinator_id` or an admin; `approve` checks open and `approvedCount < max_seats` inside the transaction after `SELECT ... FOR UPDATE` on the chapter row (so two approvals cannot both pass the full check); conditional update; notify; audit. In `update`, `status` → `closed` now also declines all `waiting` rows of that chapter in the same transaction (`decided_by` = the admin) and notifies each. Add the routes to the README table.
- [ ] **Step 4: Run** `jt.sh ChapterEndpointsTest`, then `jt.sh ALL`. Expected: `exit 0`, no failures.
- [ ] **Step 5: Commit** `feat(backend-java): chapter join requests, coordinator approval and my chapters (tests)`.

---

### Task 3: Website helpers

**Files:**
- Create: `frontend/src/pages/sangam/chapterList.js`
- Test: `frontend/src/pages/sangam/chapterList.test.js` (run from `E:\community_mobile_main\frontend`: `node --test src/pages/sangam/chapterList.test.js`)

**Interfaces:**
- Consumes: the server rows from Tasks 1–2 (public chapter, seat row from `mine`/`seats`, the member's own businesses from `api.businesses.mine()` in `services/api`, as `BusinessDirectoryPage` uses it; it returns `{businesses}` including hidden ones).
- Produces (pure, named exports): `SEAT_STATUS_LABELS` (the six statuses → Marathi label); `CATEGORY_LABELS` (the six `cat` ids → the labels in `BusinessDirectoryPage.CATEGORIES`); `seatsText(chapter) -> string` (`"12 व्यवसाय · 8 जागा उपलब्ध"`; `"12 व्यवसाय"` when `open_seats` is null; `"12 व्यवसाय · जागा पूर्ण"` when 0); `isFull(chapter) -> boolean`; `seatActions(seat, { memberId, isCoordinator }) -> string[]` (coordinator on `waiting`: `['approve','decline']`, on `approved`: `['remove']`; the asking member on `waiting`: `['cancel']`, on `approved`: `['leave']`; a member who is both gets the union, coordinator actions first; ended statuses: `[]`); `joinableBusinesses(myBusinesses, mySeats) -> business[]` (visible ones, i.e. `status !== 'hidden'`, with no `waiting`/`approved` seat); `filterChapters(chapters, { search, city }) -> chapter[]` (case-insensitive match on name, city, area; `city` `'all'` = any); `summary(chapters) -> { chapters, businesses, cities }`.

- [ ] **Step 1: Write the failing test** with: `seatsText` for 12/8, 12/null, 12/0; `isFull` true only at 0; `seatActions` for each status and role combination above (including a coordinator viewing their own waiting request → `['approve','decline','cancel']`); `joinableBusinesses` drops a hidden business and one with an approved seat but keeps one whose seat was `declined`; `filterChapters` matches `हिंजवडी` by area and `city: 'all'`; `summary` counts distinct cities.
- [ ] **Step 2: Run to verify it fails.** Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `chapterList.js` to the signatures above.
- [ ] **Step 4: Run** the same command. Expected: all tests pass.
- [ ] **Step 5: Commit** (branch `feat/chapters-website`): `feat(website): chapter helpers`.

---

### Task 4: API calls and the Business Sangam page

**Files:**
- Modify: `frontend/src/services/apiClient.js`, `frontend/src/pages/sangam/BusinessSangamPage.jsx` (rewrite)

**Interfaces:**
- Consumes: Task 3 exports; `fetchJson` in `apiClient.js` (same style as `getMeetingPartners`); `useAuth()`; meetings page link `/meetings?recipient=<owner_id>`.
- Produces: `apiClient.getChapters()`, `getChapterBusinesses(id)`, `getMyChapters()`, `getChapterSeats(id)`, `joinChapter(id, { businessId, message })`, `chapterSeatAction(seatId, action)`, `adminGetChapters()`, `adminCreateChapter(data)`, `adminUpdateChapter(id, data)`.

- [ ] **Step 1: Add the API calls** (each returns the parsed body; list calls return the array, e.g. `res.chapters || []`).
- [ ] **Step 2: Rewrite `BusinessSangamPage.jsx`:** delete `HISTORIC_CHAPTERS`, the `window.CMDB.getChapters` effect and every invented figure (turnover, opportunities, visitors, phones, coordinators). Keep the topbar, hero, stats-bar layout (fed by `summary`), search and city tabs (fed by `filterChapters`, city list from the data), card layout and the "How it works" section; change step 1's text to say the coordinator makes sure similar businesses do not compete. Card: name, city, area, meeting day/time/venue, coordinator name, `seatsText` or a Full badge, category tags from `categories` with `CATEGORY_LABELS`, photo from a small city→existing-image map with `/assets/images/sangam-wf-mandal.jpg` as the fallback. "View businesses": if not logged in, navigate to `/login?redirect=/sangam`; else open a modal from `getChapterBusinesses` showing each business name, category label, city and owner, a link to the business directory `/business` (the website has no single-business page, Ruling R4) and a "Book 1-to-1 meeting" link to `/meetings?recipient=<owner_id>` (hidden for the member's own business). "Ask to join": not logged in → `/login?redirect=/sangam`; the member's businesses come from `api.businesses.mine()`; no `joinableBusinesses` → message "आधी तुमचा व्यवसाय नोंदवा" with a link to the business directory; else a modal with a business picker and message (max 300) that calls `joinChapter` and shows the server's message on refusal. "My chapters" box (logged in): rows from `getMyChapters().seats` with `SEAT_STATUS_LABELS` and `seatActions`; for each `coordinating` chapter a panel loaded with `getChapterSeats` showing waiting rows (highlight when `similar > 0`, a "hidden" badge when `business_hidden`) and approved rows, buttons from `seatActions`, each action calling `chapterSeatAction` then reloading. Empty list → "अद्याप चॅप्टर्स नाहीत — लवकरच सुरू होत आहेत". Disable a button while its request is running.
- [ ] **Step 3: Verify:** `node --test src/pages/sangam/chapterList.test.js` (pass); `grep -n "HISTORIC_CHAPTERS\|CMDB\|monthlyBusiness\|+91" src/pages/sangam/BusinessSangamPage.jsx` (no output); `npm run build` (Expected: `built in`, no error; restore the root `package-lock.json` if `npm install` changed it).
- [ ] **Step 4: Commit** `feat(website): real Business Sangam chapters page`.

---

### Task 5: Admin Chapters view

**Files:**
- Modify: `frontend/src/pages/admin/AdminShell.jsx` (`ChaptersView` and its route only, line ~664 passes `data` too)

**Interfaces:**
- Consumes: Task 4's admin and seat API calls; Task 3's `SEAT_STATUS_LABELS`, `seatActions`; `data.users` (from the existing `/api/admin/users` load) for the coordinator picker; existing `Card`, `Table`, `Modal`, `Input`, `Btn`, `Badge`, `SectionTitle`, `T`.
- Produces: nothing used elsewhere.

- [ ] **Step 1: Rewrite `ChaptersView({ toast, data })`:** delete the hard-coded list. Load `adminGetChapters()` on mount; search box over name/city/district; table columns ID, name, city/district, coordinator, businesses, waiting, max seats, status (Badge), actions (Edit, Close/Reopen, Requests). Create/Edit modal with every chapter field; coordinator chosen from `data.users` filtered by typed name, id or phone (shows `name (id)`; stores the id); max seats empty = no limit; shows the server's message on refusal. Close/Reopen calls `adminUpdateChapter(id, { status })` after a `window.confirm` for close ("waiting requests will be declined"). Requests modal loads `getChapterSeats(id)` and offers `approve`, `decline`, `remove` via `chapterSeatAction`, then reloads both lists.
- [ ] **Step 2: Verify:** `grep -n "CHP-MH" src/pages/admin/AdminShell.jsx` (no output); `node --test src/pages/sangam/chapterList.test.js` (pass); `npm run build` (Expected: `built in`, no error).
- [ ] **Step 3: Commit** `feat(website): admin chapters console on real data`.
