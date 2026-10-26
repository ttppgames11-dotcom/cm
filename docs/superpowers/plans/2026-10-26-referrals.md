# Referrals and Business Exchange Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make member-to-member business referrals real, private and live: real receivers (members who own a visible business), customer details visible only to the two members and admins, receiver-controlled statuses, live updates.

**Architecture:** Replace the referral half of `SangamService` with a new `ReferralService` (rules, validation, privacy) in the existing `sangam` feature; read-only SQL for receivers in a small JdbcTemplate repository; publish Spring events relayed after commit to the shared `common/live` hub. On the website, the existing create and tracker pages switch to real data through a tested pure-helper module.

**Tech Stack:** Java 17, Spring Boot 3.3.5 (Spring Data native queries, JdbcTemplate, `@TransactionalEventListener`), embedded PostgreSQL tests with MockMvc and the `SseTestClient` helper; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-26-referrals-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on a branch off `main` in `E:\community_mobile_main`. Pushes as abhayGond02. No schema change except one nullable column `referrals.business_id` (migration `009_referrals_business.sql`, identical SQL created by `LazyTables` in its own transaction via `createOnce`).
- Statuses written by the API are exactly: `New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost`. Existing rows with other words (`Deal Won`, `In Progress`, NULL) stay readable and are returned unchanged.
- Errors: `ApiException` → `{ success:false, code, error }`, Marathi then English. Codes: `RECIPIENT_NOT_ELIGIBLE` 400, `SELF_REFERRAL` 400, `BUSINESS_NOT_RECEIVERS` 400, `VALIDATION_ERROR` 400, `REFERRAL_NOT_FOUND` 404, `NOT_RECEIVER` 403, `RATE_LIMIT_EXCEEDED` 429.
- "Visible business" = `businesses.owner_id = member id` and `(status IS NULL OR status <> 'hidden')`. Admin = `Roles.isAdmin(CurrentUser)`.
- The giver is always the logged-in member (`giver_id`, `giver_name` from the member record, name fallback "सदस्य"); anything sent as giver is ignored. `recipient_name` comes from the member record. No invented defaults anywhere. Unknown request fields are ignored (the website sends extras such as `requirement`, `prospect`, `estimatedValue`, `city`).
- Phone: spaces and dashes removed, then the standard `phone` format (`Formats`). Daily limit: 20 referrals per giver (429).
- Live events carry only `{ id, giverId, recipientId, status }` on channel `referrals`, event name `referral.changed`; never a name, phone, email, value or notes.
- Keep unchanged: `GET /api/sangam/metrics`, meetings, the Node comparison for everything but referrals. The existing 116 backend tests stay green except the deliberate change in Task 6.
- Test member ids for this feature use `M96xx`; test businesses are named `Zr...` so cleanup is targeted.

## Review Focus

- **The giver tries to forge the giver or receiver** (`giver_id`, `giverName`, `recipient_name` in the body): ignored. Test in Task 2.
- **A receiver whose only business is hidden** (or becomes hidden later): cannot receive new referrals, but referrals already given stay visible to both people. Tests in Tasks 2 and 3.
- **A phone typed with spaces, dashes or +91:** accepted and stored without spaces or dashes. Test in Task 2.
- **An outsider tries to read or change a referral** (neither giver nor receiver, not admin): not in their list; status change is 403. Tests in Tasks 3 and 4.
- **Old rows with other statuses** (`Deal Won`, `In Progress`, NULL): still listed; `Deal Won` and `Won` both count in the totals; writing an unknown status word is a 400. Tests in Tasks 3 and 4. (Website: an empty real list must never show the page's sample referrals as the member's own; Task 9.)

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/009_referrals_business.sql` | the `business_id` column |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `REFERRAL_COLUMNS`, `ensureReferralColumns()` |
| `.../sangam/repository/ReferralReceiverRepository.java` (create) | receivers and "owns a visible business" queries (JdbcTemplate) |
| `.../sangam/repository/SangamReferralRepository.java` (modify) | `insertReferral` writes `business_id`; `wonDeals` counts `Won` and `Deal Won` |
| `.../sangam/dto/ReferralSchemas.java`, `ReferralJson.java` (create) | validation rules + phone/field-name normalising; reply shape with `role`, `business_id` |
| `.../sangam/service/ReferralService.java`, `ReferralLimiter.java` (create) | rules, listing, status, receivers, stats |
| `.../sangam/event/ReferralChanged.java`, `ReferralLiveRelay.java` (create) | event and after-commit relay |
| `.../sangam/controller/SangamController.java` (modify) | referral routes delegate to `ReferralService`; `/receivers`, `/stats`, `/stream` |
| `.../sangam/service/SangamService.java` (modify) | old referral methods removed |
| tests | `ReferralTablesTest`, `ReferralEndpointsTest`, `ReferralStreamTest`; `NodeParityTest` "sangam" scenario (modify) |
| `frontend/src/pages/sangam/referralList.js` + test (create) | pure helpers |
| `frontend/src/hooks/useReferralStream.js` (create) | EventSource hook |
| `frontend/src/services/apiClient.js` (modify) | `getReferralReceivers`, `getReferralStats` |
| `CreateReferralPage.jsx`, `ReferralsTrackerPage.jsx`, `pages/member/ReferralPortalPage.jsx` (modify) | real data |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.) Backend tests: `E:\community_mobile\.superpowers\sdd\2026-10-26-business-ownership\jt.sh <TestClass>` prints `exit 0: N tests, 0 failures, 0 errors` on success; `jt.sh ALL` runs everything. Website commands run in `E:\community_mobile_main\frontend`; test files are run by name (`node --test <file>`).

---

### Task 1: The column and the receiver queries

**Files:** Create `009_referrals_business.sql`, `ReferralReceiverRepository.java`, `ReferralTablesTest.java`; modify `LazyTables.java`.

**Interfaces:**
- Produces: `LazyTables.REFERRAL_COLUMNS` (package-private `static final String`: `ALTER TABLE referrals ADD COLUMN IF NOT EXISTS business_id TEXT`), `LazyTables.ensureReferralColumns()` (public, via `createOnce`).
- Produces: `ReferralReceiverRepository` (`@Repository`, constructor `(JdbcTemplate)`): `record Biz(String id, String name)`; `record Receiver(String id, String name, List<Biz> businesses)`; `List<Receiver> receivers(String excludeMemberId, int limit)` (members with ≥1 visible business, sorted by name then id, businesses sorted by name; the excluded member left out); `boolean ownsVisibleBusiness(String memberId)`; `boolean ownsVisibleBusiness(String memberId, String businessId)`.

- [ ] **Step 1: Write the failing tests.** `ReferralTablesTest` (extends `PostgresTestBase`, `@SpringBootTest`): `migrationFileMatchesTheJavaCopy` (the file with `--` lines removed equals `REFERRAL_COLUMNS` plus `;`, whitespace collapsed, as in `EnquiryTablesTest`); `columnSurvivesAFailedRequest` (drop the column, new `LazyTables(jdbc, txManager)`, call `ensureReferralColumns()` inside a `TransactionTemplate` that then throws, assert the column still exists, re-add it in `finally`). A receiver-repository test in the same class (members `M9601`, `M9602`, `M9603`; businesses `Zr Visible` owned by M9601, `Zr Hidden` owned by M9602 with status `hidden`, `Zr Second` owned by M9601, `Zr NoOwner` with `owner_id` NULL; cleanup deletes `Zr%` businesses): `receiversAreOwnersOfVisibleBusinessesOnly` (excluding `M9603` gives only M9601 with businesses `Zr Second`, `Zr Visible` in that order); `callerIsExcluded` (excluding M9601 leaves nobody from this set); `ownsVisibleBusinessChecks` (M9601 true; M9602 false; M9601 with M9601's business id true, with M9602's business id false).
- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralTablesTest` → compile error (`ensureReferralColumns`, `ReferralReceiverRepository` missing).
- [ ] **Step 3: Implement** the SQL file (one `--` comment line then the `ALTER`), `LazyTables` additions (follow `ensureEnquiryTables`), and the repository with parameterised SQL (`JOIN businesses b ON b.owner_id = m.id`).
- [ ] **Step 4: Run** `jt.sh ReferralTablesTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): referral business column and receiver queries`

---

### Task 2: Give a referral

**Files:** Create `ReferralSchemas.java`, `ReferralJson.java`, `ReferralService.java`, `ReferralLimiter.java`, `ReferralChanged.java`; modify `SangamReferralRepository.java`, `SangamController.java`, `SangamService.java`; test `ReferralEndpointsTest.java`.

**Interfaces:**
- Consumes: Task 1; `MemberRepository.findById` (`getName()`); `SchemaValidator.check(Map, Map<String,Rule>, boolean allowUnknown, List)`; `Ids.twoDigit("REF-", referrals::existsById, 100, 1000)`; `JsonBody`; `@RequireAuth`.
- Produces:
  - `ReferralSchemas.REFERRAL` rules on the normalised body: `title` required 3-150; `clientName` required max 100; `clientPhone` required `format("phone")`; `clientEmail` format email max 120; `recipientId` required max 20; `businessId` max 30; `category` max 100; `value` `Rule.number().minValue(0)`; `notes` max 1000. `static Map<String,Object> ReferralSchemas.normalize(Map<String,Object> body)`: copies the body, maps `client_name`→`clientName`, `client_phone`→`clientPhone`, `client_email`→`clientEmail`, `recipient_id`→`recipientId`, `business_id`→`businessId` (camel key wins when both exist), and removes spaces and dashes from a text `clientPhone`.
  - `ReferralJson.referral(SangamReferral r, String businessId, String viewerId)`: `SangamService.referral(r)` (make it package-private `static` accessible) plus `business_id` and, when `viewerId != null`, `role` (`giver`, `receiver`, or absent for an admin who is neither).
  - `record ReferralChanged(String id, String giverId, String recipientId, String status)`.
  - `ReferralLimiter` (`@Component`): `void check(String memberId)` (21st in a 24 h fixed window → 429 `RATE_LIMIT_EXCEEDED`, `"खूप जास्त संदर्भ दिले आहेत. कृपया उद्या पुन्हा प्रयत्न करा (Too many referrals today)."`), `void reset()`.
  - `SangamReferralRepository.insertReferral(...)` unchanged signature; `ReferralService` sets `business_id` with a `JdbcTemplate` update after the insert (`UPDATE referrals SET business_id = ? WHERE id = ?`), after `ensureReferralColumns()`. `@Transactional ReferralService.give(CurrentUser user, Map<String,Object> body)` → `{ success, message "नवीन संदर्भ यशस्वीरीत्या नोंदवला! (Referral given.)", referral }` and publishes `ReferralChanged`.
  - `SangamController`: `POST /api/sangam/referrals` is `@RequireAuth`, status 201, calls `ReferralService.give`; `SangamService.createReferral` removed.

- [ ] **Step 1: Write the failing tests** (`@SpringBootTest @AutoConfigureMockMvc`; fixtures like `BusinessOwnershipTest`: `member(id, name, phone)`, `business(ownerId, name, status)` inserting `Zr...` rows, `token(id, role)`; `@BeforeEach` resets limiters and deletes `Zr` businesses and referrals whose `title LIKE 'Zr%'`; members `M9601` giver, `M9602` receiver owning a visible business, `M9603` owning only a hidden one, `M9604` owning none).

```java
@Test void givingNeedsALogin()                       // POST without token → 401
@Test void giveSavesTheReferralWithRealNames()       // 201; M9601 → M9602; reply referral.giver_id "M9601", giver_name = member name, recipient_name = M9602's name, status "New", role "giver", client_phone as sent, business_id null; DB row same
@Test void giverAndReceiverNamesCannotBeForged()     // Review Focus: body also has giver_id "M9604", giverName "Fake", recipient_name "Fake" → saved giver_id M9601 and the real names
@Test void receiverMustOwnAVisibleBusiness()         // M9604 (none), M9603 (hidden only), "M0000" (unknown) → 400 RECIPIENT_NOT_ELIGIBLE each; nothing saved
@Test void cannotReferYourself()                     // M9602 → M9602 → 400 SELF_REFERRAL
@Test void businessMustBelongToTheReceiver()         // businessId of M9603's business → 400 BUSINESS_NOT_RECEIVERS; M9602's own business id → 201, reply business_id set
@Test void requiredFieldsAndPhoneFormat()            // no title, no clientName, no clientPhone, phone "12345", bad email, negative value → 400 VALIDATION_ERROR each
@Test void snakeCaseFieldsAndMessyPhoneAreAccepted() // Review Focus: client_name, client_phone "+91 98221-44550", recipient_id → 201; DB client_phone "+919822144550"; extra fields (requirement, prospect, estimatedValue, city) ignored
@Test void twentyFirstReferralInADayIsRefused()      // 20 × 201 then 429 RATE_LIMIT_EXCEEDED
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralEndpointsTest` → compile errors / 401-vs-201 failures.
- [ ] **Step 3: Implement** per Interfaces. Order in `give`: normalise, validate, `limiter.check`, eligibility (self, receiver exists and `ownsVisibleBusiness`, business ownership), insert, `business_id`, event, reply. Invalid requests do not count toward the limit (validate before `check`). Remove `SangamService.createReferral` and the helper methods only it used.
- [ ] **Step 4: Run** `jt.sh ReferralEndpointsTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): giving a referral needs a login and a real receiver`

---

### Task 3: List, receivers and totals

**Files:** Modify `ReferralService.java`, `SangamController.java`, `SangamReferralRepository.java`, `SangamService.java`; test `ReferralEndpointsTest.java` (add).

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: `ReferralService.list(CurrentUser user, String memberIdFilter, String status)` → `{ success, count, referrals }` (admins: all, optionally filtered by `memberIdFilter`; others: only referrals where they are giver or receiver, the filter ignored; `status` empty or `all` = every status; each item through `ReferralJson.referral(r, businessId, user.id())`; `business_id` read with one `SELECT id, business_id FROM referrals WHERE id IN (...)`); `receivers(CurrentUser user)` → `{ success, count, receivers }` (max 200, caller excluded); `stats()` → `{ success, stats: { given, won, wonValue } }`. `SangamReferralRepository.wonDeals()` counts `status IN ('Won','Deal Won')`.
- Controller: `GET /referrals` `@RequireAuth` with optional `memberId`, `status`; `GET /referrals/receivers` `@RequireAuth`; `GET /referrals/stats` public. `SangamService.listReferrals` removed (its metrics use of `wonDeals` stays).

- [ ] **Step 1: Write the failing tests** (add to `ReferralEndpointsTest`; a helper `give(token, recipientId, title)` returns the referral id).

```java
@Test void listNeedsALogin()                          // GET without token → 401
@Test void listShowsOnlyMyReferralsWithMyRole()       // M9601→M9602 and M9604→M9601 and M9604→M9602 exist: M9601 sees 2 (roles giver, receiver); M9602 sees 2 (receiver, receiver); outsider M9603 sees 0; phone present for participants
@Test void adminSeesEverythingAndMemberIdFilterIsAdminOnly() // admin count = all rows of the test set; admin ?memberId=M9601 → 2; member passing ?memberId=M9602 still gets only their own
@Test void statusFilterAndLegacyStatuses()            // Review Focus: rows with status 'Deal Won', 'In Progress' and NULL inserted by SQL for M9601 are listed unchanged; ?status=Deal Won finds one; ?status=all and ?status= find all
@Test void existingReferralsStayVisibleWhenTheReceiversBusinessIsHidden() // Review Focus: after hiding M9602's business the referral still lists for both
@Test void receiversListIsRealAndExcludesMe()         // M9601 sees M9602 with its business names, not M9603/M9604/M9601; M9602 does not see itself; no token → 401
@Test void statsAreNumbersOnly()                      // no login → 200; given counts all rows; won counts 'Won' and 'Deal Won'; wonValue sums them; body contains no client name or phone
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralEndpointsTest` → new tests fail (public list still returns data; `/receivers` and `/stats` missing).
- [ ] **Step 3: Implement** per Interfaces; check `/receivers` and `/stats` are not captured by another mapping.
- [ ] **Step 4: Run** `jt.sh ReferralEndpointsTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): referrals are private; receivers and totals endpoints`

---

### Task 4: Change the status

**Files:** Modify `ReferralService.java`, `SangamController.java`, `SangamService.java`; test `ReferralEndpointsTest.java` (add).

**Interfaces:**
- Produces: `ReferralSchemas.STATUS`: `status` required `oneOf("New","Contacted","Qualified","Proposal","Won","Lost")`, `value` `Rule.number().minValue(0)`; `@Transactional ReferralService.setStatus(CurrentUser user, String id, Map<String,Object> body)` → `{ success, message "स्थिती अद्ययावत केली! (Status updated.)", referral }`, publishes `ReferralChanged`. Controller `PUT /referrals/{id}/status` is `@RequireAuth`; `SangamService.updateReferralStatus` removed.

- [ ] **Step 1: Write the failing tests**

```java
@Test void onlyTheReceiverOrAnAdminChangesTheStatus() // no token → 401; giver → 403 NOT_RECEIVER; outsider → 403; receiver → 200 status "Contacted", role "receiver"; admin → 200; unknown id → 404 REFERRAL_NOT_FOUND
@Test void onlySixStatusWordsAreAccepted()            // Review Focus: "Deal Won", "x", "" , missing → 400 VALIDATION_ERROR; each of the six → 200
@Test void wonKeepsOrSetsTheValue()                   // Won with value 50000 → value 50000; then Lost without value → value still 50000; negative value → 400
@Test void legacyRowCanBeMovedToANewWord()            // a row with status NULL, receiver sets "New" → 200
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralEndpointsTest`.
- [ ] **Step 3: Implement.** Validate first (strict: unknown fields ignored), find (404), authorise (receiver or admin), update with `referrals.updateStatus(id, status, valueOrNull)`, re-read, publish, reply. A missing `value` keeps the old value (the repository already does this).
- [ ] **Step 4: Run** `jt.sh ReferralEndpointsTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): receivers move a referral through the pipeline`

---

### Task 5: Live updates

**Files:** Create `ReferralLiveRelay.java`, `ReferralStreamTest.java`; modify `SangamController.java`.

**Interfaces:**
- Consumes: `LiveUpdates.subscribe/publish`, `SseLiveUpdates.disconnectAll()`, `SseTestClient` (existing), `ReferralChanged`.
- Produces: `ReferralLiveRelay` (`@Component`, `CHANNEL = "referrals"`, `@TransactionalEventListener(AFTER_COMMIT)` → `live.publish(CHANNEL, "referral.changed", Map of id, giverId, recipientId, status)`); `GET /api/sangam/referrals/stream` (no login) → `live.subscribe(CHANNEL, req, res)`.

- [ ] **Step 1: Write the failing tests** (`@SpringBootTest(webEnvironment = RANDOM_PORT)`; real HTTP like `EnquiryStreamTest`; members `M9611` giver, `M9612` receiver with a visible business; `@AfterEach` closes clients, `live.disconnectAll()`, resets limiters).

```java
@Test void givingSendsAnEventWithoutPrivateData()     // event:referral.changed, data has the id, "giverId":"M9611", "recipientId":"M9612", "status":"New"; does not contain the client name, phone or the title
@Test void statusChangeSendsAnEvent()                 // receiver sets Won → data contains "status":"Won"
@Test void rejectedRequestSendsNothing()              // invalid give (no clientName) → 400; noLineWithin(event:referral.changed, 2 s)
@Test void sixthStreamFromOneIpIsRefused()            // 5 × 200, 6th 429
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralStreamTest` → 404 on the stream path.
- [ ] **Step 3: Implement** the relay and the route (declared before any `/referrals/{id}` shape).
- [ ] **Step 4: Run** `jt.sh ReferralStreamTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): live referral events`

---

### Task 6: Node comparison, README, full suite, PR

**Files:** Modify `NodeParityTest.java` ("sangam" scenario, referral requests ~lines 801-815 and any later request that depends on them), `backend-java/README.md`.

- [ ] **Step 1: Run the full suite and read the failure.** `jt.sh ALL`. Expected: the "sangam" parity scenario differs (referral create, status and list now behave differently on purpose).
- [ ] **Step 2: Fix the scenario.** Referral create, status and list requests leave the Node comparison (covered by `ReferralEndpointsTest`); where later requests (metrics) need referral rows, seed them straight into the shared database (`JdbcTemplate`, ids like `GZ<n|j>REF1`, statuses `Deal Won` and `New`) so metrics still compare. Meetings and everything else stay compared.
- [ ] **Step 3: README.** Under "Deliberate differences from Node": referrals need a login, only the giver, receiver and admins see them, only the receiver or an admin changes the status, receivers must own a visible business, no invented defaults. Under "New features": the endpoints of spec §5.
- [ ] **Step 4: Run the full suite.** `jt.sh ALL` → `exit 0` and `PARITY: compared N replies, 0 differ`.
- [ ] **Step 5: Commit, push, PR branch.** Commit; `git push origin Abhay_app`; then in `E:\community_mobile_main`: `git checkout main && git pull --ff-only origin main && git checkout -b feat/referrals-backend && git checkout Abhay_app -- backend-java database/migrations/009_referrals_business.sql docs/superpowers` (sparse warning expected), commit, `git push -u origin feat/referrals-backend`, back to `main`; confirm `git diff --stat Abhay_app feat/referrals-backend -- backend-java database` prints nothing. Give the user the PR link.
- [ ] **Step 6 (user):** merge, `git pull`, `deploy-java.ps1`. Check from outside: `GET /api/sangam/referrals` → 401; `/stats` → 200; `/receivers` → 401; the stream sends `connected`.

---

### Task 7: Website helpers and API calls

Work on a new branch off `main` in `E:\community_mobile_main`: `git checkout main && git pull --ff-only origin main && git checkout -b feat/referrals-website`.

**Files:** Create `frontend/src/pages/sangam/referralList.js`, `referralList.test.js`, `frontend/src/hooks/useReferralStream.js`; modify `frontend/src/services/apiClient.js`.

**Interfaces:**
- Produces (pure ES module): `STATUSES = ['New','Contacted','Qualified','Proposal','Won','Lost']`; `roleOf(referral, memberId)` → `'giver'`, `'receiver'` or `null` (by `giver_id` / `recipient_id`, falling back to the server's `role` field); `splitByRole(list, memberId)` → `{ given, received }`; `canChangeStatus(referral, memberId, isAdmin)` → true for the receiver or an admin; `needsValue(status)` → true only for `'Won'`; `eventConcernsMe(event, memberId)` → true when `event.giverId` or `event.recipientId` equals `memberId`; `asNumberOrUndefined(text)` → a non-negative number, or `undefined` for empty or invalid text.
- Produces: `apiClient.getReferralReceivers()` → the `receivers` array; `apiClient.getReferralStats()` → the `stats` object (both through `fetchJson`).
- Produces: `useReferralStream({ onChanged, onReconnect })` → `{ connected }`: same behaviour as `useEnquiryStream` (open `EventSource(apiUrl('/api/sangam/referrals/stream'))`, handlers in refs, reconnect after an error reply with a 10 s delay, close on unmount, `onReconnect` after every `connected` but the first), listening for the event `referral.changed`.

- [ ] **Step 1: Write the failing test** (`node:test`): `roleOf` for giver, receiver, stranger and a server-given role; `splitByRole`; `canChangeStatus` (receiver true, giver false, admin true, stranger false); `needsValue('Won')` true and every other status false; `eventConcernsMe` for giver, receiver and a stranger; `asNumberOrUndefined('')`, `('abc')`, `('-5')` → `undefined`, `('50000')` → 50000, `('0')` → 0; `STATUSES` equals the six words in order.
- [ ] **Step 2: Run and see it fail.** `node --test src/pages/sangam/referralList.test.js` → `Cannot find module`.
- [ ] **Step 3: Implement** the helpers, the two API calls and the hook (copy the structure of `hooks/useEnquiryStream.js`).
- [ ] **Step 4: Run** the same command → `ℹ fail 0`; `npm run build` → `✓ built in`.
- [ ] **Step 5: Commit** `feat(website): referral helpers, API calls and live hook`

---

### Task 8: Give-a-referral page

**Files:** Modify `frontend/src/pages/sangam/CreateReferralPage.jsx`.

**Interfaces:** Consumes `apiClient.getReferralReceivers`, `apiClient.createReferral`, `asNumberOrUndefined`.

- [ ] **Step 1: Make the changes** (spec §7): load receivers with `getReferralReceivers()` instead of `CMDB.raw().members`, show each as "name, business names" and, after choosing one, an optional business drop-down limited to that member's businesses; require customer name, requirement and a customer phone (no fake fallback), remove the `|| 50000` value fallback (an empty value is not sent), remove the `CMDB.createReferral` browser copy and the "+10 points" sentence (the success text says the referral was given and the receiver is notified); send `clientName`, `clientPhone`, `recipientId`, `businessId`, `title`, `category`, `notes`, `value`; show the server's error message on failure; with no receivers show "अद्याप कोणत्याही सदस्याने आपला व्यवसाय नोंदवलेला नाही" instead of an empty picker.
- [ ] **Step 2: Build.** `npm run build` → `✓ built in`. (Free memory first if the build fails with a memory error; if `cm-data.js` is missing run `git sparse-checkout add frontend/assets/js`.)
- [ ] **Step 3: Commit** `feat(website): give a referral to a real business owner`

---

### Task 9: Tracker and portal pages

**Files:** Modify `frontend/src/pages/sangam/ReferralsTrackerPage.jsx`, `frontend/src/pages/member/ReferralPortalPage.jsx`.

**Interfaces:** Consumes `splitByRole`, `canChangeStatus`, `needsValue`, `eventConcernsMe`, `STATUSES`, `asNumberOrUndefined`, `useReferralStream`, `apiClient.getReferrals/updateReferralStatus/getReferralStats`, `useToast().showToast`.

- [ ] **Step 1: Tracker changes.** The list comes only from `getReferrals()`: remove the `INITIAL_REFERRALS` fallback and the `localStorage` copy (an empty list shows an empty-state message, never sample referrals); map the server row (`id`, `title`, `client_name`, `client_phone`, `status`, `value`, `giver_name`, `recipient_name`, `created_at`, `role`) into the page's existing row shape without invented defaults; add the tabs "सर्व / मी दिलेले / मला मिळालेले" using `splitByRole`; the status drop-down offers `STATUSES` and is disabled unless `canChangeStatus`; choosing `Won` asks for the deal value (`needsValue`, `asNumberOrUndefined`) before sending; update only from the server reply (no optimistic local-only change, and show the error on failure); `useReferralStream`: when `eventConcernsMe` reload the list, and when the event's recipient is the member and the referral is new show a toast "नवीन संदर्भ मिळाला!"; the filter drop-down uses `STATUSES` plus `Lost`.
- [ ] **Step 2: Portal changes.** Keep the invite link; add links to `/referrals/create` and `/referrals/tracker` and a small totals strip from `getReferralStats()` (given, won, won value) with a quiet fallback if it fails.
- [ ] **Step 3: Build and test.** `npm run build` → `✓ built in`; `node --test src/pages/sangam/referralList.test.js src/pages/business/enquiryList.test.js src/pages/business/businessParams.test.js src/services/directApi.test.js` → `ℹ fail 0`.
- [ ] **Step 4: Commit** `feat(website): real, private referral tracker with live updates`

---

### Task 10: Ship the website

- [ ] **Step 1:** `git push -u origin feat/referrals-website`; give the user `https://github.com/ttppgames11-dotcom/cm/pull/new/feat/referrals-website`; `git checkout main`.
- [ ] **Step 2 (user):** merge it right after the Java deploy of Task 6 (between the two, the old create page fails).
- [ ] **Step 3: Live check with the user:** member A and member B (B owns a business); A gives B a referral at `/referrals/create`; B sees the popup and the referral under "मला मिळालेले"; B sets it to Contacted then Won with a value; A sees the change; a third logged-in member sees neither; a logged-out request to `/api/sangam/referrals` is 401; `/referrals` shows the totals.
- [ ] **Step 4: Rollback if needed:** revert the website PR; revert the backend PR and run `deploy-java.ps1`. The new column stays and does no harm.
