# Officer Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/officers` a real guidance network: officers apply and an admin approves (or adds them without an account), students send MPSC / UPSC guidance requests that the officer (or the admin) accepts or declines, and officers can pause new requests.

**Architecture:** A new `officer` feature copied from and adapted to the live `speaker` feature: two tables (migration 016 + `LazyTables.ensureOfficerTables()`), `OfficerRepository`, `OfficerService`, `OfficerSchemas`, `OfficerController`, `OfficerAdminController`. The website rewrites `GovernmentOfficersPage.jsx` with four tabs and two modals over tested helpers in `officersHelp.js`, and adds an admin "Officers (अधिकारी)" view. No speaker file is changed.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-30-officers-guidance-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/officers-website` off an up-to-date `main` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only. Nothing is merged or deployed without the user.
- Codes, tables, indexes, limits, error codes, notification copy and routes exactly as in the spec (sections Codes, Data, Rules, Notifications, Server).
- Copy-and-adapt sources: backend `backend-java/src/main/java/com/connectmaratha/api/speaker/**` and `src/test/.../speaker/**` (on `Abhay_app`); website `frontend/src/pages/culture/{speakersHelp.js,speakersHelp.test.js,SpeakerApplyModal.jsx,SpeakerRequestModal.jsx,MotivationalSpeakersPage.jsx}` and `SpeakersView` in `AdminShell.jsx` — these are on branch `feat/speakers-website`, not on `main`: read them with `git show origin/feat/speakers-website:<path>`.
- Keep the two speaker review rules: a request saves only its own checked fields (`retainAll` on the schema keys); linking by phone returns all matches and refuses more than one (409 `MEMBER_AMBIGUOUS`).
- Test members `M92xx` (admin `M9209`, role `admin`), phones `987650` + digits (10 digits), names `Zo…`. Backend tests: from `E:\community_mobile\backend-java`, `mvn -q -B test -Dtest=<Class>` and the full `mvn -q -B test` (no `clean`: a stuck surefire JVM from an earlier session can lock `target/`). Known flake: `NodeParityTest` register/no-password → rerun alone. Website: `node --test …` and `npm run build` from `E:\community_mobile_main\frontend`.

## Rulings made while planning

- **R1:** `exams` is stored sorted, de-duplicated, comma-separated (`mpsc_group_b,upsc_cse`); the JSON returns it as an array `exams: [...]`. The `?exam=` filter matches with `(',' || exams || ',') LIKE '%,' || ? || ',%'`. Cost if wrong: none (codes contain no commas).
- **R2:** The exam label in the `officer_request` title comes from `OfficerSchemas.EXAM_LABELS` (a `Map<String,String>` with the spec's five labels). Cost if wrong: a label typo on the server only.
- **R3:** The accepting switch is `PUT /api/officers/mine/accepting` (`{accepting: boolean}` required, 400 otherwise; 404 `OFFICER_NOT_FOUND` without a profile). Cost if wrong: none.

## Review Focus

- **Switch off with open requests:** the officer can still accept an old request; new requests get 409 `NOT_ACCEPTING`; turning the switch on/off never changes `status`. Tests in Task 1 and Task 2.
- **Exam spoofing:** a hand-made request for an exam the officer does not guide → 400 `EXAM_NOT_OFFERED`, and the modal only lists the officer's exams. Tests in Task 2 and Task 3.
- **Bad codes in a profile:** unknown service / exam, empty exams list, duplicate exams, `batch_year` 1949 or next year → 400 (duplicates are stored once). Test in Task 1.
- **Phone leak:** no `phone` / `member_id` in the public list; the officer's phone in "mine" only once accepted. Tests in Task 1 and Task 2.
- **Paused card on the website:** a logged-in student sees the disabled `⏸️` button, never the request form. Test in Task 3 (`requestButton` order).

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/016_officers.sql` (create) | Tables and indexes |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `OFFICER_TABLES`, `ensureOfficerTables()` |
| `backend-java/.../officer/dto/OfficerSchemas.java` (create) | Code lists, `EXAM_LABELS`, `PROFILE`, `REQUEST`, `ACCEPTING`, `ANSWER`, `ADMIN_ACTION`, `normalize` |
| `backend-java/.../officer/repository/OfficerRepository.java` (create) | All officer SQL |
| `backend-java/.../officer/service/OfficerService.java` (create) | Rules, JSON, phones, notifications |
| `backend-java/.../officer/controller/OfficerController.java`, `OfficerAdminController.java` (create) | Routes |
| `backend-java/src/test/.../officer/OfficerTestBase.java`, `OfficerProfilesTest.java`, `OfficerRequestsTest.java` (create) | Tests |
| `backend-java/README.md` (modify) | Route table |
| `frontend/src/pages/governance/officersHelp.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/pages/governance/GovernmentOfficersPage.jsx` (rewrite), `OfficerApplyModal.jsx`, `OfficerRequestModal.jsx` (create) | Page |
| `frontend/src/services/apiClient.js`, `pages/member/notificationList.js` + test, `pages/admin/AdminShell.jsx` (modify) | Calls, bell, admin view |

---

### Task 1: Backend — tables, profiles, switch and admin actions

**Interfaces:**
- Consumes: as the speaker feature (`LazyTables.createOnce`, `SchemaValidator`/`Rule`, `JsonBody`, `CurrentUser`, `@RequireAuth`, `Roles.isAdmin`, `ActivityRepository.notifyMember`).
- Produces: `OfficerRepository` — `publicList(exam, service, search, viewerId)`, `find(id)`, `ofMember(memberId)`, `exists(id)`, `insert(id, memberId, Map, status) -> int`, `update(id, Map) -> int` (status `pending`, reason NULL, `accepting` unchanged), `setAccepting(id, boolean)`, `setStatus`, `setHidden`, `link -> int`, `all()`, `adminIds()`, `membersByIdOrPhone(String) -> List<String>`. `OfficerService` — `list`, `mine`, `apply`, `editMine`, `setAccepting(user, body)`, `adminAll`, `adminAdd`, `adminAct` (actions incl. `pause` / `resume`). JSON `officerJson` (public: `id, name, service, service_status, batch_year, post, department, city, exams[], intro, accepting, mine, requested`), `ownJson` (+ `phone, status, reject_reason, hidden, created_at`), `adminJson` (+ `has_account, member_id`). Routes per spec, `/mine` and `/mine/accepting` before `/{id}`.

- [ ] **Step 1: Write the failing tests** in `OfficerTestBase` (copy `SpeakerTestBase`: tables `officer_requests` / `officers`, `M92xx`, `profile(name)` = `name`, `service "mpsc_1"`, `service_status "serving"`, `batch_year 2018`, `post "Zo उपजिल्हाधिकारी"`, `department "महसूल"`, `city "सातारा"`, `exams ["mpsc_rajyaseva","mpsc_group_b"]`, `intro`, `phone "98765-00021"`) and `OfficerProfilesTest` — the 19 `SpeakerProfilesTest` cases adapted (codes `OFFICER_EXISTS` / `OFFICER_NOT_FOUND`, notification copy from the spec, search on name / post / city / department), plus:
  - `badCodesAreRefused` (service `collector`; exams `[]`; exams `["neet"]`; stage-free profile with `service_status "active"`; `batch_year` 1949 and next year → 400).
  - `duplicateExamsAreStoredOnce` (`["upsc_cse","mpsc_group_b","upsc_cse"]` → `exams` = `["mpsc_group_b","upsc_cse"]`).
  - `examFilterMatchesWholeCodes` (officer A `["mpsc_group_b"]`, B `["upsc_cse"]`; `?exam=mpsc_group_b` → A only; `?service=mpsc_1` filters by service).
  - `officerPausesAndResumes` (approved; `PUT /mine/accepting {accepting:false}` → public card `accepting` false, `status` still `approved`; back to true; missing / string value → 400; without a profile → 404).
  - `adminPausesAnOfficerWithoutAnAccount` (admin-added; `pause` → `accepting` false; `resume` → true).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=OfficerProfilesTest`. Expected: failures (404), not compile errors.
- [ ] **Step 3: Implement** migration 016, `LazyTables`, `OfficerSchemas` (code lists from the spec; `normalize` also turns `exams` into a sorted de-duplicated list and validates each code; batch year range uses the current year in Asia/Kolkata), repository, service, controllers, README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='Officer*Test'`, then the full suite. Expected: all pass (parity flake → rerun alone).
- [ ] **Step 5: Commit** `feat(backend-java): officer mentor profiles with approval and an accepting switch (tests)`.

---

### Task 2: Backend — guidance requests, answers and notifications

**Interfaces:**
- Consumes: Task 1.
- Produces: `OfficerRepository` — `recentRequests`, `existsRequest`, `insertRequest(id, officerId, memberId, Map) -> int`, `findRequest`, `requestsBy`, `requestsTo`, `requestsForUnlinked`, `answer(id, status) -> int`. `OfficerService` — `sendRequest`, `myRequests`, `incoming`, `adminRequests`, `answer`. Request JSON: `id, exam, stage, question, mode, message, status, created_at` + `officer {id, name, phone?}` (mine; phone only when accepted) or `student {name, phone}` (incoming / admin; admin also `officer.phone`).

- [ ] **Step 1: Write the failing tests** in `OfficerRequestsTest` — the 15 `SpeakerRequestsTest` cases adapted (body `request()` = `exam "mpsc_group_b"`, `stage "prelims"`, `question "Zo अभ्यास कसा सुरू करू?"`, `mode "phone"`; notification titles per spec: `🧭 नवीन मार्गदर्शन विनंती: MPSC गट ब`, message `Member M9202: Zo अभ्यास कसा सुरू करू?`; `student` instead of `organiser`), plus:
  - `pausedOfficerRefusesNewRequests` (switch off → 409 `NOT_ACCEPTING`; an open request made before the pause can still be accepted).
  - `examMustBeTheOfficers` (`upsc_cse` to an officer without it → 400 `EXAM_NOT_OFFERED`; unknown stage / mode → 400; missing question → 400).
  - `longQuestionIsShortenedInTheBellOnly` (a 200-character question → notification message has the first 80 characters; the stored question is whole).
- [ ] **Step 2: Run** `mvn -q -B test -Dtest=OfficerRequestsTest`. Expected: failures.
- [ ] **Step 3: Implement** repository and service methods (check order as in the spec's Rules), routes (`/requests/mine`, `/requests/incoming`, `/requests/{requestId}` before `/{id}`), README rows.
- [ ] **Step 4: Run** `mvn -q -B test -Dtest='Officer*Test'`, then the full suite. Expected: all pass.
- [ ] **Step 5: Commit** `feat(backend-java): officer guidance requests with accept, decline and notifications (tests)`.

---

### Task 3: Website — helpers, API calls and bell links

**Interfaces:**
- Produces (`officersHelp.js`): `SERVICES`, `SERVICE_STATUSES`, `EXAMS`, `STAGES`, `MODES` (`[{value, label}]` with the spec's labels), `REQUEST_STATUSES`, `PROFILE_STATUSES` (as speakers), `label(list, code)` (unknown → the code), `statusInfo(list, value)`, `examList(codes) -> string` (labels joined with ` · `), `requestButton(officer, loggedIn) -> 'login'|'own'|'paused'|'requested'|'request'`, `officerPayload(form)` (trims, cleans phone, `batch_year` number or dropped, `exams` array), `requestPayload(form)` (only `exam, stage, question, mode, message`, empties dropped), `officerQuery(exam, service, search)` (drops `all` and empties). `apiClient`: `getOfficers(params)`, `getMyOfficer()`, `applyOfficer`, `updateMyOfficer`, `setOfficerAccepting(accepting)`, `sendOfficerRequest(id, data)`, `getMyOfficerRequests()`, `getIncomingOfficerRequests()`, `answerOfficerRequest(id, action)`, `adminGetOfficers()`, `adminAddOfficer`, `adminOfficerAction(id, data)`, `adminGetOfficerRequests()`; old `getOfficers` / `addOfficer` replaced. Bell: `officer` → `/officers?tab=profile`, `officer_request` → `/officers?tab=incoming`, `officer_reply` → `/officers?tab=mine`, `officer_admin` → `/admin/officers`; icon ⭐.

- [ ] **Step 1: Write the failing tests** (`requestButton` five cases in order login, own, paused (accepting false, logged in, not mine), requested, request — a paused officer the viewer already requested shows `paused`; `label(SERVICES,'mpsc_psi')` → `PSI / STI / ASO`; `examList(['upsc_cse','mpsc_group_b'])` → `UPSC नागरी सेवा · MPSC गट ब`; `officerPayload` cleans phone, `batch_year: '2018'` → 2018, `''` → absent; `requestPayload({exam:'upsc_cse', stage:'start', question:' Zo ', mode:'online', place:'x'})` → `{exam:'upsc_cse', stage:'start', question:'Zo', mode:'online'}`; `officerQuery('all','all',' IAS ')` → `{search:'IAS'}`) and the four bell entries.
- [ ] **Step 2: Run** `node --test src/pages/governance/officersHelp.test.js src/pages/member/notificationList.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, bell entries and calls.
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (`built in`).
- [ ] **Step 5: Commit** `feat(website): officer helpers, API calls and bell links (tests)`.

---

### Task 4: Website — the officers page and the admin view

- [ ] **Step 1: Rewrite `GovernmentOfficersPage.jsx`** keeping the hero, colours and card style: remove `officersData` (25 officers) and the old add form; tabs per spec; filters exam + service (selects with `सर्व` = `all`) and search with button / Enter (search in a ref); card per spec with `requestButton`; empty state per spec; lists reload when `user?.id` changes; errors inline. "माझे प्रोफाइल": status, reason, details, the switch (`⏯️ विनंत्या घेत आहे / ⏸️ बंद` toggle → `setOfficerAccepting` → reload), Edit.
- [ ] **Step 2: Create `OfficerApplyModal.jsx`** (copy `SpeakerApplyModal`; fields per spec; exams as tick boxes, at least one) and **`OfficerRequestModal.jsx`** (exam select from the officer's exams, stage, question (500), mode, message; success `✅ विनंती पाठवली. उत्तर आल्यावर 🔔 सूचना मिळेल.`).
- [ ] **Step 3: Add `OfficersView` to `AdminShell.jsx`** (nav `{ path: '/admin/officers', label: 'Officers (अधिकारी)', icon: '⭐' }` after Jobs, route `/officers`; copy `SpeakersView` + a "विनंत्या" column showing 🟢 चालू / ⏸️ बंद and Pause / Resume for officers without an account).
- [ ] **Step 4: Run** all website tests (`node --test` over every `src/**/*.test.js`) and `npm run build`. Expected: pass, `built in`.
- [ ] **Step 5: Commit** `feat(website): officer guidance page with requests, switch and admin view`.
