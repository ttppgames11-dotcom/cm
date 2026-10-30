# Speakers and Mentors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/speakers` real: members apply and an admin approves, the admin can add speakers without an account, members send talk or guidance requests that the speaker (or the admin) accepts or declines, with bell notifications both ways.

**Architecture:** A new `speaker` feature in the Spring Boot backend, built like `job`: two tables (migration 015 + `LazyTables.ensureSpeakerTables()`), `SpeakerRepository` (JdbcTemplate SQL), `SpeakerService` (rules, phones, notifications in their own transaction), `SpeakerController` and `SpeakerAdminController`. The website rewrites `MotivationalSpeakersPage.jsx` with four tabs and two modals over tested pure helpers in `speakersHelp.js`, and adds an admin "Speakers (वक्ते)" view.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-30-speakers-mentors-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/speakers-website` off an up-to-date `main` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only.
- Tables, statuses, indexes, required fields and categories exactly as in the spec's Data section: `speakers` (`status` `pending`/`approved`/`rejected`, `hidden`, `member_id` NULL = no account, unique index `speakers_one_per_member ON speakers (member_id) WHERE member_id IS NOT NULL`) and `speaker_requests` (`kind` `talk`/`guidance`, `status` `new`/`accepted`/`declined`/`cancelled`, unique index `speaker_requests_one_open ON speaker_requests (speaker_id, member_id) WHERE status = 'new'`, indexes on `speaker_id` and `member_id`).
- Categories exactly `प्रेरणादायी वक्ते`, `व्यवसाय मार्गदर्शन`, `यशस्वी उद्योजक`, `युवा प्रेरणा`, `शिक्षण तज्ञ`, `इतर`. Text limits: name/title/city 100, topics 300, intro 1000, place/event_type/topic 200, message 1000; phone 10 digits after removing spaces and dashes; audience 1–100000; `event_date` `YYYY-MM-DD`, today or later; `mode` `phone`/`meeting`.
- Ids `"SPK-"` / `"SRQ-"` + millis + 4 random base36 (copy `JobService.newId`). Limit 5 requests per member in 24 hours → 429 `RATE_LIMIT_EXCEEDED`. Second profile → 409 `SPEAKER_EXISTS`; open duplicate request → 409 `REQUEST_EXISTS`; answer after it was answered → 409 `ALREADY_ANSWERED`; not found / not visible → 404 `SPEAKER_NOT_FOUND` / `REQUEST_NOT_FOUND`; not allowed → 403 `FORBIDDEN`; validation → 400 `VALIDATION_ERROR`.
- The public list never contains `phone` or `member_id`. The speaker's phone goes only to the organiser of an `accepted` request; the organiser's name and phone (read from `members`) only to that request's speaker and, for a speaker without an account, admins.
- Notifications through `ActivityRepository.notifyMember(id, memberId, title, message, type)`, each in its own transaction inside try/catch (copy `JobService.send`). Copy:
  - `speaker`, approved: `🎙️ तुमचे वक्ता प्रोफाइल प्रकाशित झाले` / `आता सदस्य तुम्हाला विनंती पाठवू शकतात.`
  - `speaker`, rejected: `🎙️ वक्ता प्रोफाइल मंजूर झाले नाही` / the reason, or `कृपया माहिती तपासून पुन्हा अर्ज करा.`
  - `speaker_request`: `🎙️ नवीन विनंती: व्याख्यान` (talk) or `🧭 नवीन विनंती: मार्गदर्शन` (guidance) / `{organiser name}: {place}, {event_date}` or `{organiser name}: {topic}`
  - `speaker_admin` (each admin, speaker without an account): `🎙️ {speaker name} साठी नवीन विनंती` / `{organiser name}: … वक्त्यांना फोन करून उत्तर द्या.`
  - `speaker_reply`: `✅ {speaker name} यांनी तुमची विनंती स्वीकारली` / `संपर्क क्रमांक 'माझ्या विनंत्या' मध्ये पहा.`; declined `❌ {speaker name} यांनी तुमची विनंती नाकारली` / `'माझ्या विनंत्या' मध्ये पहा.`
- Admins = `lower(role) IN ('admin','superadmin','ceo')` (as `BloodRepository.adminMembers`); admin checks via `Roles.isAdmin`.
- Test members `M91xx` (admin `M9109`), names `Zs…`. Backend tests: `E:\community_mobile\.superpowers\sdd\2026-10-24-b2b-leads-realtime\jt.sh <Class>|ALL`. Website: `node --test …` and `npm run build` from `E:\community_mobile_main\frontend`.
- Website only; the Flutter app is not touched. Release: backend PR → `deploy-java.ps1` → `/api/speakers` 200 → website PR.

## Rulings made while planning

- **R1:** Admin notifications use a fourth type `speaker_admin` (bell link `/admin/speakers`), because the bell link is chosen by type only and the spec sends admins to the admin view (same as `blood_admin`). Cost if wrong: one extra type name.
- **R2:** The admin "link" action takes `member`: a member id or a 10-digit phone, resolved on the server (404 `MEMBER_NOT_FOUND`), because admins know phones, not ids. Cost if wrong: none.
- **R3:** Tables come from a new `LazyTables.ensureSpeakerTables()` (`SPEAKER_TABLES`), called first in every `SpeakerService` method, like `ensureBloodTables()`. Cost if wrong: none.

## Review Focus

- **A rejected or hidden speaker with an open request:** accepting it later still works for the speaker, but no new requests can be sent (404). Test in Task 2.
- **Kind not offered:** a guidance request to a talks-only speaker → 400, and the website modal only offers the kinds the speaker has. Tests in Task 2 and Task 3.
- **A member requesting a speaker without an account** gets `speaker_admin` notifications for every admin, and none goes to a `NULL` member id. Test in Task 2.
- **Phone leak through `GET /api/speakers/requests/mine`** before acceptance, or through a declined request. Test in Task 2.
- **Edit while approved** removes the speaker from the public list until re-approved. Test in Task 1.

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/015_speakers.sql` (create) | The two tables and indexes |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `SPEAKER_TABLES`, `ensureSpeakerTables()` |
| `backend-java/.../speaker/dto/SpeakerSchemas.java` (create) | `CATEGORIES`, `PROFILE`, `TALK`, `GUIDANCE`, `ANSWER`, `ADMIN_ACTION`, `normalize` |
| `backend-java/.../speaker/repository/SpeakerRepository.java` (create) | All speaker SQL |
| `backend-java/.../speaker/service/SpeakerService.java` (create) | Rules, JSON shapes, phones, notifications |
| `backend-java/.../speaker/controller/SpeakerController.java`, `SpeakerAdminController.java` (create) | Routes |
| `backend-java/src/test/.../speaker/SpeakerProfilesTest.java`, `SpeakerRequestsTest.java` (create) | Tests |
| `backend-java/README.md` (modify) | Route table |
| `frontend/src/pages/culture/speakersHelp.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/pages/culture/MotivationalSpeakersPage.jsx` (rewrite), `SpeakerApplyModal.jsx`, `SpeakerRequestModal.jsx` (create) | The page |
| `frontend/src/services/apiClient.js`, `pages/member/notificationList.js` + test, `pages/admin/AdminShell.jsx` (modify) | Calls, bell, admin view |

---

### Task 1: Backend — tables, profiles and admin actions

**Interfaces:**
- Consumes: `LazyTables.createOnce`, `SchemaValidator`/`Rule`, `JsonBody`, `CurrentUser`, `@RequireAuth`, `Roles.isAdmin`, `ActivityRepository.notifyMember`.
- Produces: `SpeakerRepository` — `publicList(category, city, search, viewerId) -> List<Map>` (with `mine`, `requested` booleans), `find(id) -> Optional<Map>`, `ofMember(memberId) -> Optional<Map>`, `insert(Map) -> int` (0 = member already has one), `update(id, Map) -> int` (sets `status='pending'`, `reject_reason=NULL`), `setStatus(id, status, reason) -> int`, `setHidden(id, hidden) -> int`, `link(id, memberId) -> int` (0 = member already has one), `all() -> List<Map>` (pending first, then newest), `adminIds() -> List<String>`, `memberByIdOrPhone(String) -> Optional<String>`. `SpeakerService` — `list`, `mine`, `apply`, `editMine`, `adminAll`, `adminAdd`, `adminAct`. JSON `speakerJson` (public: `id, name, title, category, city, topics, intro, offers_talks, offers_guidance, mine, requested`), `ownJson` (+ `phone, status, reject_reason, hidden`), `adminJson` (+ `has_account`, `member_id`). Routes `GET /api/speakers`, `GET|PUT /api/speakers/mine`, `POST /api/speakers`, `GET|POST /api/admin/speakers`, `PUT /api/admin/speakers/{id}`.

- [ ] **Step 1: Write the failing tests** in `SpeakerProfilesTest` (copy the `JobEndpointsTest` helpers: `fresh()` calls `GET /api/speakers` first, then deletes `speaker_requests` / `speakers` of `M91%` or name `Zs%`, notifications of `M91%`, upserts `M9101`–`M9106` and admin `M9109` with role `admin`; `profile(name)` body: `name`, `title "Zs वक्ते"`, `category "शिक्षण तज्ञ"`, `city "पुणे"`, `topics "MPSC तयारी"`, `intro`, `phone "98765-00011"`, `offers_talks true`, `offers_guidance true`):
  - `applyingNeedsALogin` (POST and `GET /mine` without token → 401).
  - `memberAppliesAndWaits` (POST → 201, id starts `SPK-`, `status` `pending`, phone `9876500011`; `GET /mine` shows it; public list does not contain it).
  - `oneProfilePerMember` (second POST → 409 `SPEAKER_EXISTS`).
  - `badProfilesAreRefused` (no name; category `Cooking`; both offers false; phone `12345` → 400 `VALIDATION_ERROR`).
  - `adminApprovesAndTheMemberIsTold` (admin PUT `{action:"approve"}` → public list has it with no `phone` / `member_id` keys; one `speaker` notification `🎙️ तुमचे वक्ता प्रोफाइल प्रकाशित झाले`).
  - `adminRejectsWithAReason` (`{action:"reject", reason:"Zs अधिक माहिती द्या"}` → `GET /mine` shows `rejected` and the reason; notification message is the reason).
  - `editingSendsItBackForApproval` (approved, then `PUT /mine` → `pending`, reason cleared, gone from the public list).
  - `hiddenSpeakersAreNotPublic` (approve, hide → absent; unhide → present).
  - `adminAddsASpeakerWithoutAnAccount` (admin POST profile → 201, `approved`, public at once, admin list `has_account` false).
  - `adminLinksASpeakerToAMember` (link by phone of M9103 → `GET /mine` as M9103 returns it; linking to a member who has a profile → 409 `SPEAKER_EXISTS`; unknown phone → 404 `MEMBER_NOT_FOUND`).
  - `adminRoutesAreForAdmins` (member token on all three admin routes → 403).
  - `publicListFilters` (two approved speakers in `पुणे` / `सातारा`, categories differ; `?city=पुणे`, `?category=`, `?search=MPSC` each return the right one; case-insensitive).
- [ ] **Step 2: Run** `jt.sh SpeakerProfilesTest`. Expected: failures (404 / missing table), not compile errors.
- [ ] **Step 3: Implement** migration 015, `LazyTables.SPEAKER_TABLES` + `ensureSpeakerTables()`, `SpeakerSchemas` (rules per Global Constraints; `normalize` maps `offersTalks`/`offersGuidance` aliases and trims), the repository, the service methods and both controllers (admin controller under `/api/admin/speakers`, routes `/mine` declared before `/{id}`), README rows.
- [ ] **Step 4: Run** `jt.sh SpeakerProfilesTest`, then `jt.sh ALL`. Expected: `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): speaker profiles with admin approval (tests)`.

---

### Task 2: Backend — requests, answers and notifications

**Interfaces:**
- Consumes: Task 1 repository and service.
- Produces: `SpeakerRepository` — `recentRequests(memberId) -> int` (last 24 h), `insertRequest(Map) -> int` (`ON CONFLICT DO NOTHING`, 0 = open duplicate), `findRequest(id) -> Optional<Map>`, `requestsBy(memberId)`, `requestsTo(speakerId)`, `requestsForUnlinked()`, `answer(id, newStatus) -> int` (`WHERE id = ? AND status = 'new'`). `SpeakerService` — `sendRequest(user, speakerId, body)` (201 `{success, message, request}`), `myRequests`, `incoming`, `adminRequests`, `answer(user, requestId, body)`. Request JSON: `id, kind, event_date, place, event_type, audience, topic, mode, message, status, created_at`, plus `speaker {id, name, phone?}` (phone only when `accepted`) in "mine", and `organiser {name, phone}` in incoming/admin. Routes `POST /api/speakers/{id}/requests`, `GET /api/speakers/requests/mine`, `GET /api/speakers/requests/incoming`, `PUT /api/speakers/requests/{id}`, `GET /api/admin/speakers/requests`.

- [ ] **Step 1: Write the failing tests** in `SpeakerRequestsTest` (same helpers; `approved(memberId)` makes an approved profile; `talk()` body `kind:"talk", event_date: today+10, place:"Zs Satara", event_type:"शिवजयंती", audience:300`; `guidance()` body `kind:"guidance", topic:"Zs MPSC", mode:"phone"`):
  - `requestsNeedALogin` (all four routes → 401).
  - `memberSendsATalkRequest` (M9102 → M9101's speaker → 201, id `SRQ-`, `status` `new`; M9101 gets `speaker_request` `🎙️ नवीन विनंती: व्याख्यान` / `Member M9102: Zs Satara, {date}`; public list for M9102 shows `requested` true).
  - `requestRulesAreChecked` (own profile → 400; guidance to a talks-only speaker → 400; talk without place → 400; past `event_date` → 400; pending / hidden / unknown speaker → 404; second open request → 409 `REQUEST_EXISTS`; 6th request in a day across speakers → 429).
  - `speakerAcceptsAndThePhoneIsShared` (before: "mine" has no `speaker.phone`; incoming shows `organiser.phone` of M9102; accept → organiser gets `speaker_reply` `✅ Zs … यांनी तुमची विनंती स्वीकारली`; "mine" now has `speaker.phone`).
  - `declinedRequestsShareNoPhone` (decline → `❌ …` notification; "mine" has no `speaker.phone`).
  - `onlyTheRightPeopleAnswer` (organiser cannot accept → 403; speaker cannot cancel → 403; another member → 403; organiser cancels → `cancelled`, no notification to the organiser).
  - `answeredOnce` (accept, then decline → 409 `ALREADY_ANSWERED`; cancel after accept → 409).
  - `askingAgainAfterAnAnswer` (declined, then a new request → 201).
  - `speakerWithoutAnAccountGoesToAdmins` (admin-added speaker; request → `speaker_admin` notification for `M9109`, none with a null member; `GET /api/admin/speakers/requests` lists it with the organiser phone; admin accepts → organiser told; a member token on the admin route → 403; a member cannot answer it → 403).
  - `rejectedSpeakerCanStillAnswerOldRequests` (request, then admin rejects the speaker → speaker accepts → 200; new request → 404).
  - `aFailingNotificationStillSavesTheRequest` (rename `notifications` to `notifications_off` inside the test, send → 201 and the row exists; rename back in `finally`).
- [ ] **Step 2: Run** `jt.sh SpeakerRequestsTest`. Expected: failures.
- [ ] **Step 3: Implement** the repository methods, service methods (order of checks as in the spec's Rules; the request is saved before any notification; `answer` decides the allowed actor from the request's speaker `member_id`: null → admin only), routes (`/requests/mine`, `/requests/incoming`, `/requests/{id}` declared before `/{id}`), README rows.
- [ ] **Step 4: Run** `jt.sh SpeakerRequestsTest`, `jt.sh SpeakerProfilesTest`, then `jt.sh ALL`. Expected: `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): speaker requests with accept, decline and notifications (tests)`.

---

### Task 3: Website — helpers, API calls and bell links

**Interfaces:**
- Consumes: Task 1–2 routes.
- Produces (`speakersHelp.js`): `SPEAKER_CATEGORIES` (the 6), `REQUEST_STATUSES` (`new` ⏳ `उत्तराची प्रतीक्षा`, `accepted` ✅ `स्वीकारली`, `declined` ❌ `नाकारली`, `cancelled` ⛔ `रद्द केली`), `PROFILE_STATUSES` (`pending` ⏳ `मंजुरीच्या प्रतीक्षेत`, `approved` ✅ `प्रकाशित`, `rejected` ❌ `नामंजूर`), `statusInfo(map, value)`, `requestButton(speaker, loggedIn) -> 'login'|'own'|'requested'|'request'`, `offeredKinds(speaker) -> ['talk'?, 'guidance'?]`, `speakerPayload(form)`, `requestPayload(kind, form)` (only that kind's fields, trimmed, empties dropped, audience as a number), `speakerQuery(category, city, search)` (drops `सर्व वक्ते` and empties). `apiClient`: `getSpeakers(params)`, `getMySpeaker()`, `applySpeaker(data)`, `updateMySpeaker(data)`, `sendSpeakerRequest(id, data)`, `getMySpeakerRequests()`, `getIncomingSpeakerRequests()`, `answerSpeakerRequest(id, action)`, `adminGetSpeakers()`, `adminAddSpeaker(data)`, `adminSpeakerAction(id, data)`, `adminGetSpeakerRequests()`; the old `getSpeakers` / `addSpeaker` / `bookSpeaker` are removed. Bell: `speaker` → `/speakers?tab=profile`, `speaker_request` → `/speakers?tab=incoming`, `speaker_reply` → `/speakers?tab=mine`, `speaker_admin` → `/admin/speakers`; icon `🎙️` for all four.

- [ ] **Step 1: Write the failing tests** in `speakersHelp.test.js` (`requestButton` four cases in the order login, own, requested, request; `offeredKinds` for talks-only / both; `requestPayload('guidance', {topic:' Zs ', mode:'phone', place:'x'})` → `{kind:'guidance', topic:'Zs', mode:'phone'}`; `requestPayload('talk', {event_date:'2026-12-15', place:' Satara ', audience:'300'})` → audience `300` number; `speakerPayload` cleans the phone `98765-00011` → `9876500011` and drops empty intro; `speakerQuery('सर्व वक्ते', '', ' MPSC ')` → `{search:'MPSC'}`; `statusInfo(REQUEST_STATUSES, 'accepted').label` → `स्वीकारली`) and in `notificationList.test.js` (the four links and icons).
- [ ] **Step 2: Run** `node --test src/pages/culture/speakersHelp.test.js src/pages/member/notificationList.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, the bell entries and the API calls.
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (Expected: `built in`; the page's old calls are replaced in Task 4, on the same branch, before anything is pushed).
- [ ] **Step 5: Commit** `feat(website): speaker helpers, API calls and bell links (tests)`.

---

### Task 4: Website — the speakers page and the admin view

**Interfaces:**
- Consumes: Task 3 helpers and calls; `AuthContext` `user` / login redirect as used in `JobsPortalPage.jsx`; AdminShell's `SectionTitle`, `T`, `toast`.
- Produces: the rewritten `/speakers` page and the admin route `/admin/speakers`.

- [ ] **Step 1: Rewrite `MotivationalSpeakersPage.jsx`** keeping the hero, colours and card style: remove `speakersData`, the fixed phone `9822011223` and the fixed date; tabs `🎙️ सर्व वक्ते` / `📋 माझ्या विनंत्या` (logged in) / `📥 मला आलेल्या विनंत्या` (has a profile) / `👤 माझे प्रोफाइल` (logged in), selected by `?tab=all|mine|incoming|profile`; the list from `getSpeakers(speakerQuery(…))` with the search kept in a ref (the Jobs stale-closure lesson); cards show initial + 🎙️/🧭 badges and the `requestButton` button; empty state `अजून वक्ते नाहीत. पहिले व्हा! 🎙️` with `[वक्ता म्हणून अर्ज करा]`; lists reload when `user?.id` changes; server errors shown inline, never as success.
- [ ] **Step 2: Create `SpeakerApplyModal.jsx`** (apply or edit; the six categories; at least one offer ticked before submit; after submit `⏳ तुमचा अर्ज मंजुरीच्या प्रतीक्षेत आहे.`) and **`SpeakerRequestModal.jsx`** (kind picker from `offeredKinds`; talk fields date/place/type/audience/message, guidance fields topic/mode/message; `min` date = today; success `✅ विनंती पाठवली. उत्तर आल्यावर 🔔 सूचना मिळेल.`).
- [ ] **Step 3: Add `SpeakersView` to `AdminShell.jsx`** (nav `{ path: '/admin/speakers', label: 'Speakers (वक्ते)', icon: '🎙️' }`, route `/speakers`): pending count in the subtitle; per speaker Approve / Reject (prompt for an optional reason) / Hide / Unhide / Link (prompt for member id or phone); an "Add speaker" form (the profile fields); a "विनंत्या (खाते नसलेले वक्ते)" list with the organiser's name and phone and Accept / Decline.
- [ ] **Step 4: Run** `node --test src/pages/culture/speakersHelp.test.js src/pages/member/notificationList.test.js` and `npm run build`. Expected: pass, `built in`. Then check by hand with `npm run dev` against a local backend: apply → admin approve → second member requests → accept → phone visible.
- [ ] **Step 5: Commit** `feat(website): real speakers and mentors page with requests and admin view`.
