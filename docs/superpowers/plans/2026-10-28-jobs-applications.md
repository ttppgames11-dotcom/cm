# Jobs Applications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jobs owned by logged-in members that close (by the poster or after 30 days), real applications the poster can read and mark new / shortlisted / not selected / hired with bell notifications both ways, contact details only for logged-in members, a public single-job page with a WhatsApp share link, a hired counter, and an admin jobs view.

**Architecture:** The `backend-java` `job` feature is rewritten in the blood style: `JobSchemas`, `JobRepository` on `JdbcTemplate` (the JPA entity `Job` is deleted), `JobService`, `JobController` (`/api/jobs/...`), `JobAdminController` (`/api/admin/jobs`). The existing `jobs` and `job_applications` tables gain columns and a unique index (migration 013 + `LazyTables`). The website gets a pure helper module, API calls, a rewritten `JobsPortalPage.jsx` with three tabs, a new `JobDetailPage.jsx` at `/jobs/:id`, and an admin `JobsView`.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-28-jobs-applications-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/jobs-website` off an up-to-date `main` in `E:\community_mobile_main` (`git -C E:\community_mobile_main checkout main`, `git pull` first). Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only.
- Columns (migration `database/migrations/013_job_applications.sql` and `LazyTables.ensureJobColumns()`, all `IF NOT EXISTS`, nothing dropped):
  - `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'`, `closes_at TIMESTAMPTZ`, `hidden BOOLEAN NOT NULL DEFAULT false`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`; also `poster_id TEXT` (exists on live via 002; repeated for safety).
  - `ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `member_id TEXT`.
  - `CREATE UNIQUE INDEX IF NOT EXISTS job_applications_one_per_member ON job_applications(job_id, member_id) WHERE member_id IS NOT NULL`
  - `CREATE INDEX IF NOT EXISTS job_applications_job ON job_applications(job_id)`
  - The migration file also runs `UPDATE jobs SET closes_at = now() + interval '30 days' WHERE closes_at IS NULL`.
- `created_at` stays TEXT `YYYY-MM-DD HH24:MI:SS` written with `to_char(now(), ...)` (existing rows use it). JSON `created_at` is ISO-8601, converted like `NotificationRepository`/`NotificationService.iso` (regex guard + `to_timestamp`); `closes_at` ISO-8601.
- Ids: new jobs `Ids.millis("JOB-", taken)`, applications `Ids.millis("APP-", taken)`. Old ids unchanged.
- Job status `open` | `closed`. Derived `state` in SQL: `CASE WHEN status = 'closed' THEN 'closed' WHEN closes_at <= now() THEN 'expired' ELSE 'open' END`. Listed = state `open` AND NOT `hidden`. Actions (body `action`, trimmed, lower case): `close` → `closed`, `extend` → `closes_at = now() + interval '30 days'`; both `UPDATE ... WHERE id = ? AND status = 'open'`; 0 rows → 409 `INVALID_TRANSITION`.
- Application status exactly `new`, `shortlisted`, `rejected`, `hired`. Labels: `new` ⏳ `नवीन`, `shortlisted` ✅ `शॉर्टलिस्ट`, `rejected` ❌ `निवड नाही`, `hired` 🎉 `नोकरी मिळाली`.
- Job body: `title` 2–100, `company` 2–100, `district` 2–100, `phone` phone format 10–15 (all required); `category` ≤50, `salary` ≤50, `job_type` ≤30, `experience` ≤30, `desc` ≤1000, `contact_email` email format (optional, empty allowed). Empty optional fields get the old defaults: category `सामान्य`, salary `चर्चेनुसार`, job_type `Full-time`, experience `१-३ वर्षे`. Application body: `applicant_name` 2–100, `phone` phone format 10–15 (required); `email` email format, `resume_summary` ≤500 (optional). camelCase aliases accepted (`jobType`, `contactEmail`, `applicantName`, `resumeSummary`). Unknown fields ignored.
- Error codes (400 unless noted): `VALIDATION_ERROR`, `JOB_NOT_FOUND` (404), `APPLICATION_NOT_FOUND` (404), `NOT_OWNER` (403), `FORBIDDEN` (403), `OWN_JOB`, `JOB_CLOSED` (409), `ALREADY_APPLIED` (409), `INVALID_TRANSITION` (409), `RATE_LIMIT_EXCEEDED` (429). Unauthenticated on `@RequireAuth` → 401. Messages Marathi with English in brackets, like blood.
- Post limit: 5 jobs per member where `created_at > to_char(now() - interval '24 hours', 'YYYY-MM-DD HH24:MI:SS')` (text compare is safe for this fixed format), counted in SQL.
- Privacy: public job rows carry `phone` and `contact_email` only when `CurrentUser` is not null (key absent otherwise); `poster_id` / `member_id` never appear in public rows. Applicant `phone`/`email` appear only in `GET /api/jobs/{id}/applications` (poster/admin) and the admin list.
- Notifications via `ActivityRepository.notifyMember(id, memberId, title, message, type)`, each in its own `REQUIRES_NEW` transaction with try/catch (as `BloodService.send`): on apply → poster, type `job`, title `"📩 नवीन अर्ज: {title}"`, message `"{applicant_name} यांनी अर्ज केला. माझ्या जाहिराती मध्ये पहा."`; on a status change to shortlisted/rejected/hired → applicant, type `job_application`, title `"{icon} अर्जाची स्थिती: {title}"`, message `"{company}: {label}"`. No notification when the poster is null, the applicant member is null, or the status did not change.
- Audit only for admin actions: `JOB_CLOSE` (admin closing a job that is not theirs), `JOB_HIDE`, `JOB_UNHIDE`.
- Test members `M90xx` (unused prefix), test titles/names starting `Zj`; tests clean their own rows in `@BeforeEach`.
- Backend tests: `E:\community_mobile\.superpowers\sdd\2026-10-26-referrals\jt.sh <TestClass>|ALL` (one line: `exit 0: N tests, 0 failures, 0 errors`). Website: `node --test <file>` and `npm run build` from `E:\community_mobile_main\frontend`.
- **Learner parts:** three pieces are written by the user with guidance (marked 🎓). The executor stops at each, explains what to write in plain words, waits for the user's code, then runs the test. If the user asks, the executor writes it.

## Rulings made while planning

- **R1:** New job ids switch from `Ids.twoDigit("JOB-")` (only 90 possible ids before falling back) to `Ids.millis("JOB-")`. Cost if wrong: ids look longer.
- **R2:** `poster_id` leaves the public job JSON (it was there before); the spec's row fields do not include it and `mine` replaces its only use. Cost if wrong: none; the website did not read it.
- **R3:** The old-job `closes_at` backfill is a repository method `backfillClosesAt()` called once per start by `JobService.ensure()` (like blood's `copyOldEntries`), plus the migration's `UPDATE`. Tests call it directly. Cost if wrong: one cheap UPDATE per start.
- **R4:** A duplicate application is detected with `INSERT ... ON CONFLICT (job_id, member_id) WHERE member_id IS NOT NULL DO NOTHING` (0 rows → 409), not by catching a database error, so the transaction is never left aborted. Cost if wrong: none.
- **R5:** The website moves from `services/api.js` `api.jobs.*` to `apiClient` (`fetchJson`), as blood did; `api.jobs` is left in place (dead) to keep the diff small. Cost if wrong: dead code.

## Review Focus

- **Visitor privacy:** no visitor response from any `/api/jobs` route contains a job phone/email, `poster_id`, or any applicant data, including a 404 and a failed apply. Tests in Tasks 1 and 2.
- **Someone else's job:** member B reading `GET /api/jobs/{A's job}/applications`, changing an applicant status, or closing A's job → 403, nothing changed. Test in Task 2.
- **Expired edges:** a job one second past `closes_at` leaves the board, refuses applications (409), shows `expired` in mine and on detail, can be extended back to open. Test in Task 1 and 2.
- **Double apply:** two simultaneous applications by one member to one job leave one row, statuses {201, 409}, never 500. Test in Task 2.
- **Hidden job:** a hidden job is absent from the board, 404 on detail and apply for others, still visible to its poster (detail and mine) and admin. Test in Tasks 1 and 2.

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../job/dto/JobSchemas.java` (create) | Rules for job, application, action, status, hidden; `normalize` (aliases, trim, lower-case action/status) |
| `backend-java/.../job/repository/JobRepository.java` (rewrite as `@Repository` class on `JdbcTemplate`) | All job SQL |
| `backend-java/.../job/entity/Job.java` (delete) | — |
| `backend-java/.../job/service/JobService.java` (rewrite) | Board, posting, actions, mine, applications, statuses, stats, admin, notifications |
| `backend-java/.../job/controller/JobController.java` (rewrite) | `/api/jobs…` |
| `backend-java/.../job/controller/JobAdminController.java` (create) | `/api/admin/jobs…` |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `JOB_COLUMNS`, `ensureJobColumns()` |
| `database/migrations/013_job_applications.sql` (create) | Columns, indexes, backfill |
| `backend-java/src/test/.../job/JobEndpointsTest.java` (create) | Backend tests |
| `backend-java/src/test/.../parity/NodeParityTest.java` (modify) | Drop the `jobs` comparison (~line 729) |
| `backend-java/README.md` (modify) | Jobs endpoint table |
| `frontend/src/pages/jobs/jobsHelp.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/pages/member/notificationList.js` + test (modify) | `job`, `job_application` links and icons |
| `frontend/src/services/apiClient.js` (modify) | Job calls |
| `frontend/src/pages/jobs/JobsPortalPage.jsx` (rewrite logic, keep banner look) | Board + tabs |
| `frontend/src/pages/jobs/JobDetailPage.jsx` (create), `frontend/src/App.jsx` (modify) | `/jobs/:id` |
| `frontend/src/pages/admin/AdminShell.jsx` (modify) | `JobsView`, route `/jobs`, nav item |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.)

---

### Task 1: Columns, posting, board, detail, my jobs, close/extend, open-jobs count

**Files:**
- Create: `job/dto/JobSchemas.java`, `database/migrations/013_job_applications.sql`
- Rewrite: `job/repository/JobRepository.java`, `job/service/JobService.java`, `job/controller/JobController.java`
- Delete: `job/entity/Job.java`
- Modify: `common/schema/LazyTables.java`, `src/test/.../parity/NodeParityTest.java`, `backend-java/README.md`
- Test: `src/test/.../job/JobEndpointsTest.java`

**Interfaces:**
- Consumes: `LazyTables.createOnce`; `Ids.millis`; `SchemaValidator`/`Rule` (`format("phone")`, `format("email")`); `JsonBody`; `Roles.isAdmin(CurrentUser)`; `CurrentUser` (null for visitors on non-`@RequireAuth` routes); `NotificationService.iso`-style conversion.
- Produces: `LazyTables.ensureJobColumns()`; `JobRepository.backfillClosesAt() -> int`; `JobService.ensure()`, `list(CurrentUser, category, district, search) -> Map` (`{success, count, jobs}`), `detail(CurrentUser, id) -> Map` (`{success, job}`), `create(CurrentUser, Map) -> Map` (`{success, message, job}`), `act(CurrentUser, id, Map) -> Map` (`{success, message, job}`), `mine(CurrentUser) -> Map` (`{success, count, jobs}` with `applications`, `new_applications`), `stats() -> Map` (`{success, open_jobs, hired}`; `hired` returns 0 until Task 2); `static Map<String,Object> jobJson(Map row, CurrentUser viewer)` (`id, title, company, district, category, salary, job_type, experience, desc, created_at, closes_at, state, mine, applied` + `phone`, `contact_email` when logged in); routes `GET /api/jobs`, `GET /api/jobs/stats`, `GET /api/jobs/mine` (both declared before `/{id}`), `GET /api/jobs/{id}`, `POST /api/jobs`, `PUT /api/jobs/{id}`. Repository `JOB_SELECT` computes `state`, `created_ts`, `applied` (EXISTS for a viewer id parameter, false when null).

- [ ] **Step 1: Write the failing tests** in `JobEndpointsTest` (skeleton as `BloodEndpointsTest`: `fresh()` resets `RateLimitFilter`, calls the service's `ensure()` via any GET, deletes `job_applications` of jobs with `poster_id LIKE 'M90%'` or `title LIKE 'Zj%'` and rows with `member_id LIKE 'M90%'`, then those jobs, `notifications`/`audit_logs` of `M90%`; upserts members `M9001`–`M9006` and admin `M9009`; helpers `token(id, role)`, `jobBody()` = title `Zj Accountant`, company `Zj Traders`, district `पुणे`, category `Accounts`, salary `₹25,000`, phone `9876500001`, contact_email `hr@zj.test`, desc `Tally`; `postJob(token)` returns the id; `expire(id)` sets `closes_at = now() - interval '1 second'`; `hide(id)` sets `hidden = true`). Tests:
  - `postingNeedsALogin` (POST without token → 401; no row).
  - `memberPostsAJob` (201, id starts `JOB-`, `state` `open`, `closes_at` ≈ now + 30 days (±1 min), `mine` true, row `poster_id` = `M9001`).
  - `emptyOptionalFieldsGetDefaults` (only required fields → category `सामान्य`, salary `चर्चेनुसार`, job_type `Full-time`, experience `१-३ वर्षे`).
  - `jobFieldsAreValidated` (title `Z`, missing company, missing district, phone `123`, contact_email `abc`, desc 1001 chars → 400 `VALIDATION_ERROR`; no row).
  - `fiveJobsADay` (6th → 429 `RATE_LIMIT_EXCEEDED`; after SQL moves the first five's `created_at` back 25 hours (text), a new one → 201).
  - `visitorsSeeNoContactsMembersDo` (visitor list raw text has no `9876500001`, no `hr@zj.test`, no `poster_id`, no `M9001`; member list row has `phone` and `contact_email`; `mine` true only for own).
  - `boardShowsOnlyOpenVisibleJobsNewestFirst` (closed (via action), expired, hidden absent; two open in newest-first order; `?district=पुणे`, `?category=Accounts`, `?search=tally` (case-insensitive over title, company, desc), `district=सर्व` and `category=all` mean no filter).
  - `detailOpensClosedJobsButHidesHiddenOnes` (closed job detail → 200 `state` `closed`; expired → `expired`; hidden → 404 `JOB_NOT_FOUND` for visitor and another member, 200 for the poster and admin; unknown id → 404).
  - `ownerClosesAndExtends` (`close` → `closed`, gone from board; another job `expire` then `extend` → `state` `open`, `closes_at` ≈ now + 30 days, back on board).
  - `othersCannotCloseMyJob` (M9002 → 403 `NOT_OWNER`, unchanged; admin closes → 200 and one `JOB_CLOSE` audit row; owner closing own → no audit row).
  - `actingTwiceIsRefused` (`close` twice → 409 `INVALID_TRANSITION`; `accept`, empty, missing → 400).
  - `mineListsAllMyJobsWithCounts` (open, expired, closed, hidden all present for M9001 with `state`; none of M9002's; `applications` and `new_applications` 0 here — Task 2 adds counted cases).
  - `statsCountsOpenJobs` (two open, one closed, one hidden → `open_jobs` increases by exactly 2 compared with a reading taken in the test before posting).
  - `oldJobsGetThirtyMoreDays` (insert a job row by SQL with `closes_at` NULL and `poster_id` NULL; `backfillClosesAt()` → its `closes_at` ≈ now + 30 days, listed on the board with `mine` false; a second call returns 0).
- [ ] **Step 2: Run to verify they fail:** `jt.sh JobEndpointsTest`. Expected: failures (404 / wrong status / missing columns), not compile errors in the test itself (compile errors from the missing `backfillClosesAt` are fixed by adding the method signature first).
- [ ] **Step 3: Implement** the migration, `JOB_COLUMNS` + `ensureJobColumns()` (DDL per Global Constraints), `JobSchemas`, `JobRepository` (all SQL; listing order `created_at DESC, id DESC`), `JobService` (every public method calls `ensure()` first: `ensureJobColumns()` then `backfillClosesAt()` once per start in its own transaction), `JobController`. Delete `Job.java`. Remove the `compare("jobs", ...)` block from `NodeParityTest`. README: Jobs table (these routes).
- [ ] **Step 4: Run** `jt.sh JobEndpointsTest` (Expected: `exit 0`), then `jt.sh ALL` (Expected: `exit 0`; a parity referral flake passes on rerun).
- [ ] **Step 5: Commit** `feat(backend-java): jobs that belong to members and close, contacts for members only (tests)`.

---

### Task 2: Applications, statuses, notifications, hired counter, admin

**Files:**
- Create: `job/controller/JobAdminController.java`
- Modify: `job/service/JobService.java`, `job/repository/JobRepository.java`, `job/controller/JobController.java`, `job/dto/JobSchemas.java`, `backend-java/README.md`
- Test: `JobEndpointsTest` (add)

**Interfaces:**
- Consumes: Task 1's classes and test helpers; `ActivityRepository.notifyMember(id, memberId, title, message, type)`, `audit(...)`.
- Produces: `JobService.apply(CurrentUser, jobId, Map) -> Map` (201, `{success, message, application}`), `myApplications(CurrentUser) -> Map` (`{success, count, applications}`; each `id, status, created_at, job: {id, title, company, district, state}`), `applications(CurrentUser, jobId) -> Map` (`{success, count, applications}`; each `id, applicant_name, phone, email, resume_summary, status, created_at`), `setStatus(CurrentUser, appId, Map) -> Map` (`{success, message, application}`), `adminAll(CurrentUser) -> Map` (`{success, jobs}`; each job row + `hidden`, `poster_name` (null for old), `applications`, `phone`, `contact_email`), `setHidden(CurrentUser, jobId, Map) -> Map` (`{success, job}`); `JobRepository.hiredCount() -> int`; routes `POST /api/jobs/{id}/apply`, `GET /api/jobs/applications/mine`, `GET /api/jobs/{id}/applications`, `PUT /api/jobs/applications/{appId}`, `GET /api/admin/jobs`, `PUT /api/admin/jobs/{id}`.

- [ ] **Step 1: Write the failing tests** (helpers `applyBody()` = applicant_name `Zj Rahul`, phone `9876500002`, email `rahul@zj.test`, resume_summary `3 years Tally`; `apply(token, jobId)`; `status(token, appId, value)`):
  - `applyingNeedsALogin` (401; no row).
  - `memberApplies` (M9002 on M9001's job → 201, id starts `APP-`, status `new`, row `member_id` `M9002`; board row for M9002 now has `applied` true, for M9003 false).
  - 🎓 `applyingTwiceIsRefused` — **written by the user**: apply as M9002, apply again → 409 with code `ALREADY_APPLIED`; exactly one row for (job, M9002). The executor shows the user `memberApplies` as the model and explains the three changes (second call, expected status, row count).
  - `simultaneousApplicationsLeaveOneRow` (two threads apply as M9003 at once, 10 rounds deleting first: statuses ⊂ {201, 409} with exactly one 201 per round, never 500; one row).
  - `cannotApplyToOwnClosedExpiredHiddenOrMissingJobs` (own → 400 `OWN_JOB`; closed → 409 `JOB_CLOSED`; expired → 409 `JOB_CLOSED`; hidden → 404 `JOB_NOT_FOUND`; unknown → 404; none saved).
  - `applicationFieldsAreValidated` (name `Z`, phone `12`, email `x`, summary 501 chars → 400; the 400 body contains no phone).
  - `posterIsNotified` (one notification for M9001, type `job`, title `📩 नवीन अर्ज: Zj Accountant`, message contains `Zj Rahul`; applying to an old job with no poster → 201 and no notification).
  - `posterAndAdminSeeApplicantsOthersDont` (M9001 and admin → list with phone and email, newest first; M9002 (the applicant) and M9003 → 403 `NOT_OWNER`; visitor → 401; unknown job → 404).
  - `posterSetsStatusesAndApplicantIsNotified` (`shortlisted` → status changed and one `job_application` notification to M9002 with title `✅ अर्जाची स्थिती: Zj Accountant` and message `Zj Traders: शॉर्टलिस्ट`; same status again → 200 and no new notification; `new` → no notification; `boss`, empty → 400; works after the job is closed; M9003 → 403; unknown app → 404 `APPLICATION_NOT_FOUND`).
  - `myApplicationsShowJobAndStatus` (M9002 applied to two jobs, one later closed → both listed newest first with `job.title`, `job.state` (`open` / `closed`) and status; M9003's not included; visitor → 401).
  - `mineCountsApplications` (three applicants, one shortlisted → `applications` 3, `new_applications` 2).
  - 🎓 `hiredCounterCountsHiredApplications` — test written by the executor (read `hired` before; mark one applicant `hired` → `hired` increases by 1; mark them `rejected` → back), and **the SQL inside `JobRepository.hiredCount()` is written by the user**: one `SELECT COUNT(*) ... WHERE status = 'hired'` line. The executor leaves the method returning 0, runs the test to show it failing, explains `COUNT(*)` and `WHERE`, and waits.
  - `oldApplicationsAreAdminOnly` (insert by SQL an application with `member_id` NULL to an old no-poster job → admin sees it in `GET /api/jobs/{id}/applications`; any member → 403).
  - `adminSeesAllJobsAndHides` (member → 403 on both admin routes; admin list includes closed, expired, hidden and old jobs with `poster_name` (null for old), `applications`, phone; hide → off the board, `JOB_HIDE` audit; unhide → back, `JOB_UNHIDE`; `hidden` missing → 400; unknown → 404).
- [ ] **Step 2: Run to verify they fail:** `jt.sh JobEndpointsTest`. Expected: new tests fail, Task 1 tests pass.
- [ ] **Step 3: Implement** per Global Constraints. `apply`: load job (404 also when hidden and caller is not poster/admin) → state open (else 409 `JOB_CLOSED`) → caller ≠ poster (400 `OWN_JOB`) → validate → `INSERT ... ON CONFLICT ... DO NOTHING` (0 → 409) → notify poster → reply. `setStatus`: load application + its job (404) → poster or admin (403) → validate → `UPDATE job_applications SET status = ?, updated_at = now() WHERE id = ? AND status <> ?` → notify only when 1 row changed and the new status is not `new`. Admin routes `@RequireAuth`, non-admin → 403 `FORBIDDEN`. `stats` uses `hiredCount()`. README: application and admin routes.
- [ ] **Step 4: Run** `jt.sh JobEndpointsTest`, then `jt.sh ALL`. Expected: `exit 0`, no failures.
- [ ] **Step 5: Commit** `feat(backend-java): real job applications with statuses, notifications, hired counter, admin (tests)`.

---

### Task 3: Website helpers and bell links

**Files:**
- Create: `frontend/src/pages/jobs/jobsHelp.js`, `frontend/src/pages/jobs/jobsHelp.test.js`
- Modify: `frontend/src/pages/member/notificationList.js`, `frontend/src/pages/member/notificationList.test.js`

**Interfaces:**
- Consumes: server rows from Tasks 1–2.
- Produces (pure, named exports; time functions take `now` (Date) last): `APPLICATION_STATUSES` (array of `{ value, label, icon }` in order new, shortlisted, rejected, hired, labels per Global Constraints); `STATE_LABELS` (`open` `खुली`, `expired` `मुदत संपली`, `closed` `जागा बंद`); `closesInText(iso, now)` (`{n} दिवसांत बंद` rounding up, `आज बंद` within 24 h, `मुदत संपली` when past; Marathi digits — reuse `toMarathiDigits` and `timeAgo` by importing from `../community/bloodHelp.js`); `applyButton(job, loggedIn) -> 'login'|'own'|'applied'|'closed'|'apply'` (order: not logged in → `login` unless the job is not open → `closed`; `mine` → `own`; `applied` → `applied`; state not `open` → `closed`; else `apply`); `whatsappText(job, origin) -> string`; `whatsappLink(job, origin) -> string` (`https://wa.me/?text=` + `encodeURIComponent(whatsappText(...))`); `jobPayload(form)` (trimmed strings, phone spaces removed, empty optional fields omitted); `applicationPayload(form)` (keys `applicant_name, phone, email, resume_summary`, same cleaning). `notificationLink('job')` → `/jobs?tab=mine`, `notificationLink('job_application')` → `/jobs?tab=applied`; icons `💼` and `📋`.

- [ ] **Step 1: Write the failing tests:** `closesInText` at +27.5 days (`२८ दिवसांत बंद`), +3 h (`आज बंद`), −1 min (`मुदत संपली`); `applyButton` for each of the five outcomes (including a visitor on a closed job → `closed`); 🎓 `whatsappText` — **the user writes this test and the function**: for `{ id: 'JOB-12', title: 'Accountant', company: 'Patil Traders', district: 'पुणे', salary: '₹25,000' }` and origin `https://connectmaratha.com` the text is exactly three lines `💼 नोकरी: Accountant — Patil Traders (पुणे)` / `पगार: ₹25,000` / `अर्ज करा 👉 https://connectmaratha.com/jobs/JOB-12`; without salary the second line is left out. The executor writes `whatsappLink`'s test (starts with `https://wa.me/?text=`, decodes back to the text). `jobPayload` drops an empty `contact_email` and turns `"98765 00001"` into `"9876500001"`; `applicationPayload` maps a form `{name, phone, email, summary}`. Bell: the two new links and icons.
- [ ] **Step 2: Run to verify they fail:** `node --test src/pages/jobs/jobsHelp.test.js src/pages/member/notificationList.test.js`. Expected: FAIL (module not found / wrong link).
- [ ] **Step 3: Implement** `jobsHelp.js` to the signatures above (the user writes `whatsappText`), add the two entries to `LINKS` and `ICONS`.
- [ ] **Step 4: Run** the same command. Expected: all pass.
- [ ] **Step 5: Commit** (branch `feat/jobs-website`): `feat(website): jobs helpers and bell links`.

---

### Task 4: API calls, the jobs page and the shared-link page

**Files:**
- Modify: `frontend/src/services/apiClient.js`, `frontend/src/pages/jobs/JobsPortalPage.jsx`, `frontend/src/App.jsx`
- Create: `frontend/src/pages/jobs/JobDetailPage.jsx`

**Interfaces:**
- Consumes: Task 3 exports; `fetchJson` (throws `Error(message)` on refusal); `useAuth()`; `MAHARASHTRA_DISTRICTS` from `services/referralService.js`; `useSearchParams`.
- Produces: `apiClient.getJobs(params)` (array), `getJob(id)` (job), `postJob(data)`, `jobAction(id, action)`, `getMyJobs()` (array), `getJobStats()` (`{open_jobs, hired}`), `applyToJob(id, data)`, `getMyApplications()` (array), `getJobApplications(id)` (array), `setApplicationStatus(appId, status)`, `adminGetJobs()` (array), `adminSetJobHidden(id, hidden)`; route `/jobs/:id`.

- [ ] **Step 1: Add the calls** to `apiClient.js` (`params` → query string `category`, `district`, `search`, skipping empty values).
- [ ] **Step 2: Rewrite `JobsPortalPage.jsx` logic** (keep the banner styling): banner shows `🎉 {hired} सदस्यांना नोकरी मिळाली` and `📋 {open_jobs} खुल्या जागा` from `getJobStats` (Marathi digits). Tabs from `?tab=` (`all` default, `mine`, `applied`); `mine`/`applied` for a visitor show a login button (`/login?redirect=/jobs?tab=…`). **All:** existing filters and search, cards with `timeAgo(created_at)`, `closesInText`, contact (`phone` with `tel:` link, `contact_email`) for members or `संपर्कासाठी लॉगिन करा`, button by `applyButton` (`login` → login redirect; `apply` → modal; `applied` `✅ अर्ज केला` disabled; `own` `तुमची जाहिरात` disabled; `closed` `🔒 जागा बंद` disabled), `📲 WhatsApp शेअर` (`<a href={whatsappLink(job, window.location.origin)} target="_blank" rel="noopener noreferrer">`), and the title links to `/jobs/{id}`. Apply modal sends `applicationPayload`, shows the server error inside the modal, success `✅ अर्ज पाठवला!` then reloads. "Post a job" for a visitor → login redirect; form (district `<select>` from `MAHARASHTRA_DISTRICTS`) sends `jobPayload`, server error inside the form, success reloads and switches to `mine`. No `alert` for errors, no fake success. **Mine:** `getMyJobs`; each job with `STATE_LABELS` badge, `closesInText`, `👥 {applications} अर्ज ({new_applications} नवीन)`, `+३० दिवस` (`extend`, shown for open/expired), `जागा बंद करा` (`close`, confirm), `अर्ज पहा ▾` toggles `getJobApplications(id)`: name, phone with `tel:` link, email, summary, `timeAgo`, status `<select>` from `APPLICATION_STATUSES` → `setApplicationStatus` then reload that list. **Applied:** `getMyApplications`; job title (link to `/jobs/{id}`), company, district, status badge (icon + label), and `🔒 जागा बंद` when `job.state` is not `open`. Empty states: `सध्या कोणतीही खुली जागा नाही`, `तुम्ही अजून नोकरी जाहिरात दिलेली नाही`, `तुम्ही अजून अर्ज केलेला नाही`. Buttons disabled while their request runs.
- [ ] **Step 3: Create `JobDetailPage.jsx`** and add `<Route path="/jobs/:id" element={<JobDetailPage />} />` next to `/jobs` in `App.jsx`: loads `getJob(id)`; shows all job fields, contact rule as on the board, the apply button by `applyButton` with the same modal behaviour (login redirect back to `/jobs/{id}`), the WhatsApp button, `ही जागा आता बंद आहे` when state is not `open`, and `💼 अजून नोकऱ्या पहा` → `/jobs`. Not found → `ही नोकरी सापडली नाही` + the same link.
- [ ] **Step 4: Verify:** `node --test src/pages/jobs/jobsHelp.test.js` (pass); `grep -n "alert(" src/pages/jobs/JobsPortalPage.jsx src/pages/jobs/JobDetailPage.jsx` (no output); `npm run build` (Expected: `built in`, no error).
- [ ] **Step 5: Commit** `feat(website): real job applications, my jobs, my applications, shareable job page`.

---

### Task 5: Admin jobs view

**Files:**
- Modify: `frontend/src/pages/admin/AdminShell.jsx` (nav `ops` group at ~87–92: add `{ path: '/admin/jobs', label: 'Jobs (नोकरी)', icon: '💼' }`; routes at ~647–691: add `<Route path="/jobs" element={<JobsView toast={toast$} />} />`; new `JobsView` component next to `BloodView`)

**Interfaces:**
- Consumes: Task 4's `adminGetJobs`, `adminSetJobHidden`, `jobAction`, `getJobApplications`; Task 3's `STATE_LABELS`, `APPLICATION_STATUSES`; `timeAgo` from `../community/bloodHelp.js`; existing `Card`, `Table`, `Badge`, `Btn`, `SectionTitle`, `T`.
- Produces: nothing used elsewhere.

- [ ] **Step 1: Write `JobsView({ toast })`:** load `adminGetJobs()` on mount. Filters: state (all/open/expired/closed), hidden (all/shown/hidden), text search over title/company/district. Table: ID, title, company, district, poster (`poster_name` or `जुनी`), state Badge, applications, created (`timeAgo`), hidden Badge, actions: Hide/Unhide (confirm → `adminSetJobHidden`), Close on open/expired (confirm → `jobAction(id,'close')`), `अर्ज` toggles a list from `getJobApplications(id)` (name, phone, email, summary, status label). Toast the server message on error; reload after each action.
- [ ] **Step 2: Verify:** `node --test src/pages/jobs/jobsHelp.test.js` (pass); `npm run build` (Expected: `built in`).
- [ ] **Step 3: Commit** `feat(website): admin jobs view`.
