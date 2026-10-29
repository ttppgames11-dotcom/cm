# Job Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Members save up to 3 job alerts (district + category, either may be "any", not both) and get one bell notification when a matching job is posted.

**Architecture:** A `job_alerts` table (migration 014 + `LazyTables`) inside the existing `job` feature: `JobRepository` gets alert SQL and the matching query, `JobService` gets list/add/delete and notifies after `create`, `JobController` gets three `/api/jobs/alerts` routes. The website adds three pure helpers, three API calls, an alert box on the `/jobs` board and a bell link.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-29-job-alerts-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on branch `feat/job-alerts-website` off an up-to-date `main` in `E:\community_mobile_main`. Pushes as abhayGond02. Never commit `database/connect_maratha.db`; `git add` named files only.
- Table: `job_alerts(id TEXT PRIMARY KEY, member_id TEXT NOT NULL, district TEXT, category TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`; `CREATE UNIQUE INDEX IF NOT EXISTS job_alerts_one_each ON job_alerts (member_id, coalesce(lower(district), ''), coalesce(lower(category), ''))`; `CREATE INDEX IF NOT EXISTS job_alerts_member ON job_alerts (member_id)`. NULL = any. Values stored trimmed.
- Categories exactly `IT & Software`, `Finance & Accounts`, `Manufacturing`, `Marketing & Sales`, `सामान्य`. Empty / `all` / `सर्व` (category) and empty / `सर्व` (district) mean any (stored NULL). District ≤100.
- Limit 3 alerts per member (409 `ALERT_LIMIT`); duplicate (any case/spaces) 409 `ALERT_EXISTS` via `INSERT ... ON CONFLICT DO NOTHING` (0 rows → 409); both any → 400 `VALIDATION_ERROR`; delete of someone else's/unknown → 404 `ALERT_NOT_FOUND`. Ids `"JA-" + millis + 4 random base36` (`JobService.newId`).
- Matching after a job is saved: `member_id <> poster`, `(district IS NULL OR lower(trim(district)) = lower(trim(:district)))`, `(category IS NULL OR lower(trim(category)) = lower(trim(:category)))`, `GROUP BY member_id ORDER BY max(created_at) DESC LIMIT 200`. Notification type `job_alert`, title `"💼 नवीन नोकरी: {title} — {district}"`, message `"{company} · {salary}. रोजगार केंद्रात पहा."`, each via `JobService.send` (own transaction). `create` reply gains `alerted` (number sent).
- Test members `M90xx`, titles `Zj…`; backend tests `E:\community_mobile\.superpowers\sdd\2026-10-26-referrals\jt.sh <Class>|ALL`. Website: `node --test` and `npm run build` from `E:\community_mobile_main\frontend`.
- The matching SQL was offered to the user; they did not take it, so the executor writes it and explains each line.

## Rulings made while planning

- **R1:** Alert tests live in a new `JobAlertsTest` (copying `JobEndpointsTest` helpers), and `JobEndpointsTest.fresh()` also deletes `job_alerts` of `M90%`, so alerts left by one class never add notifications in the other. Cost if wrong: none.
- **R2:** The table is created by `LazyTables.ensureJobColumns()` (one more statement group), not a new flag, because every job route already calls it. Cost if wrong: none.

## Review Focus

- **Double notification:** a member with two matching alerts ("पुणे + any" and "any + Accounts") gets exactly one notification. Test in Task 1.
- **The poster's own alert:** never notified about their own job. Test in Task 1.
- **Case and spaces:** an alert "pune " / "finance & accounts" (stored trimmed; compared lower-case) matches a job "Pune" / "Finance & Accounts"; and is a duplicate of "Pune" for `ALERT_EXISTS`. Test in Task 1.
- **Someone else's alert:** DELETE by another member → 404 and the row stays. Test in Task 1.
- **Notification failure:** a failing notification does not fail the job post (covered by the existing `send` pattern; check in review).

---

## File Structure

| File | Responsibility |
|---|---|
| `database/migrations/014_job_alerts.sql` (create) | Table and indexes |
| `backend-java/.../common/schema/LazyTables.java` (modify) | Append the table and indexes to `JOB_COLUMNS` |
| `backend-java/.../job/dto/JobSchemas.java` (modify) | `CATEGORIES`, `ALERT` rule |
| `backend-java/.../job/repository/JobRepository.java` (modify) | Alert SQL, matching |
| `backend-java/.../job/service/JobService.java` (modify) | `alerts`, `addAlert`, `deleteAlert`; notify in `create` |
| `backend-java/.../job/controller/JobController.java` (modify) | `/api/jobs/alerts` routes before `/{id}` |
| `backend-java/src/test/.../job/JobAlertsTest.java` (create), `JobEndpointsTest.java` (modify `fresh`) | Tests |
| `backend-java/README.md` (modify) | Three routes |
| `frontend/src/pages/jobs/jobsHelp.js` + test, `pages/member/notificationList.js` + test, `services/apiClient.js`, `pages/jobs/JobsPortalPage.jsx` (modify) | Website |

---

### Task 1: Backend — alerts table, routes and matching

**Files:** as in File Structure (backend rows).

**Interfaces:**
- Consumes: `JobService.send(jobId, memberId, title, message, type)`, `JobService.newId(prefix, taken)`, `LazyTables.JOB_COLUMNS`, `SchemaValidator`/`Rule`.
- Produces: `JobRepository.alertsOf(memberId) -> List<Map>`, `alertCount(memberId) -> int`, `existsAlert(id) -> boolean`, `insertAlert(id, memberId, district, category) -> int` (0 = duplicate), `deleteAlert(id, memberId) -> int`, `matchingAlertMembers(district, category, posterId, limit) -> List<String>`; `JobService.alerts(CurrentUser) -> Map` (`{success, count, alerts}`), `addAlert(CurrentUser, Map) -> Map` (201, `{success, message, alert}`), `deleteAlert(CurrentUser, id) -> Map`; alert JSON `id, district, category, created_at` (null = any); `create` reply `alerted`; routes `GET|POST /api/jobs/alerts`, `DELETE /api/jobs/alerts/{id}`.

- [ ] **Step 1: Write the failing tests** in `JobAlertsTest` (`fresh()`: GET `/api/jobs` first, delete `job_alerts`, notifications, applications and jobs of `M90%` / `Zj%`, upsert `M9001`–`M9006`; helpers `token`, `m(n)`, `jobBody()` (district `पुणे`, category `Finance & Accounts`, title `Zj Accountant`, company `Zj Traders`, salary `₹25,000`, phone `9876500001`), `alert(token, district, category)` → `ResultActions`, `notificationsOf(id)`). Also add the `job_alerts` delete (guarded with `to_regclass('job_alerts')`) to `JobEndpointsTest.fresh()`.
  - `alertsNeedALogin` (GET, POST, DELETE without token → 401).
  - `memberAddsListsAndDeletesAlerts` (POST `पुणे` + `Finance & Accounts` → 201, id starts `JA-`; POST `सर्व` + `IT & Software` → 201 with `district` null; GET → 2 alerts oldest first; DELETE first → 200; GET → 1).
  - `bothAnyIsRefused` (`सर्व` + `all`, `""` + `""`, missing both → 400 `VALIDATION_ERROR`); `badCategoryIsRefused` (`Cooking` → 400).
  - `atMostThreeAlerts` (3 different → 201; 4th → 409 `ALERT_LIMIT`).
  - `sameAlertTwiceIsRefused` (`पुणे` + `Finance & Accounts`, then `" पुणे "` + `Finance & Accounts` → 409 `ALERT_EXISTS`; one row).
  - `othersCannotDeleteMyAlert` (M9002 deletes M9001's → 404 `ALERT_NOT_FOUND`, row stays; unknown id → 404).
  - `matchingMembersAreTold` (alerts: M9002 `पुणे`+`Finance & Accounts`; M9003 any+`Finance & Accounts`; M9004 `पुणे`+any; M9005 `सातारा`+`Finance & Accounts`; M9006 `पुणे`+`IT & Software`; M9001 (poster) `पुणे`+any. M9001 posts → reply `alerted` 3; one `job_alert` notification each for M9002, M9003, M9004 with title `💼 नवीन नोकरी: Zj Accountant — पुणे` and message `Zj Traders · ₹25,000. रोजगार केंद्रात पहा.`; none for M9005, M9006, M9001).
  - `twoMatchingAlertsGiveOneNotification` (M9002 `पुणे`+any and any+`Finance & Accounts` → one notification).
  - `alertsAreCappedAt200` (insert 205 alert rows by SQL for members `M90A000`… with `पुणे` + NULL; post → `alerted` 200).
- [ ] **Step 2: Run** `jt.sh JobAlertsTest`. Expected: failures (404 / missing table), not test compile errors.
- [ ] **Step 3: Implement** migration 014, the `JOB_COLUMNS` additions, `JobSchemas.CATEGORIES` + `ALERT` (`district` string ≤100, `category` string oneOf the 5) applied after mapping any-values to absent, the repository methods (matching SQL per Global Constraints — explain each line to the user in the task report), service methods (limit check, then insert; both any → 400 before the limit), the notify loop at the end of `create` (after the job is saved, outside its transaction: make `create` non-`@Transactional` for the notify part, keeping the insert in one statement as today), routes, README.
- [ ] **Step 4: Run** `jt.sh JobAlertsTest`, `jt.sh JobEndpointsTest`, then `jt.sh ALL`. Expected: `exit 0` (a parity referral/register flake passes on rerun).
- [ ] **Step 5: Commit** `feat(backend-java): job alerts — members are told about matching new jobs (tests)`.

---

### Task 2: Website — alert box and bell link

**Files:** as in File Structure (frontend rows).

**Interfaces:**
- Consumes: Task 1 routes; `CATEGORIES`, `selectedCat`, `selectedDistrict`, `loggedIn`, `loginFirst` in `JobsPortalPage.jsx`.
- Produces: `alertLabel(alert) -> string`, `canSaveAlert(alerts, category, district, loggedIn) -> 'login'|'limit'|'pick'|'exists'|'ok'` (order: login, pick, exists, limit, ok), `alertPayload(category, district) -> object`; `apiClient.getJobAlerts()` (array), `addJobAlert(data)`, `deleteJobAlert(id)`; `notificationLink('job_alert')` → `/jobs`, icon `💼`.

- [ ] **Step 1: Write the failing tests:** `alertLabel({district:'पुणे', category:'Finance & Accounts'})` → `पुणे · Finance & Accounts`; null district → `सर्व जिल्हे · …`; null category → `… · सर्व क्षेत्रे`. `canSaveAlert`: visitor → `login`; `all`+`सर्व` → `pick`; an alert `{district:'पुणे', category:'IT & Software'}` and filters `IT & Software`+`पुणे` → `exists` (also when the stored district has other case/spaces); 3 alerts → `limit`; otherwise `ok`. `alertPayload('all','पुणे')` → `{ district: 'पुणे' }`; `alertPayload('IT & Software','सर्व')` → `{ category: 'IT & Software' }`. Bell: `job_alert` link and icon.
- [ ] **Step 2: Run** `node --test src/pages/jobs/jobsHelp.test.js src/pages/member/notificationList.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers, bell entry, the three API calls, and in the "सर्व नोकऱ्या" tab above the filters a box "🔔 नवीन नोकरीची सूचना मिळवा": chips from `getJobAlerts()` (logged in only) with ✕ (confirm → `deleteJobAlert` → reload), a button by `canSaveAlert` (`ok` "🔔 या शोधासाठी सूचना द्या" → `addJobAlert(alertPayload(selectedCat, selectedDistrict))` → reload + "✅ सूचना जतन झाली"; `login` "लॉगिन करा व सूचना मिळवा" → `loginFirst()`; `pick` disabled "आधी जिल्हा किंवा क्षेत्र निवडा"; `exists` disabled "ही सूचना आधीच आहे"; `limit` disabled "जास्तीत जास्त ३ सूचना"), "({n}/३ वापरल्या)" in Marathi digits, server errors inside the box; alerts reload when `user?.id` changes.
- [ ] **Step 4: Run** the node tests (pass) and `npm run build` (Expected: `built in`).
- [ ] **Step 5: Commit** `feat(website): job alerts box and bell link`.
