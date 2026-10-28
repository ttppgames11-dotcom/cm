# Jobs: member-owned jobs, real applications, WhatsApp share and a hired counter (design)

Date: 2026-10-28. Status: awaiting review.

## Goal

Make the job board (`/jobs`) work like a real notice board. Only logged-in members post and apply. Each job belongs to the member who posted it and closes (by the poster, or 30 days after it was posted or last extended). The poster sees the applicants for their own jobs and marks each one new / shortlisted / not selected / hired; both sides are told through the notification bell. Every job has a WhatsApp share link that opens a page for that one job, and the board shows how many members got a job through Connect Maratha. Website first; the app comes later.

## Decisions taken with the user

- First build = step 1: real applications + WhatsApp share + hired counter (option A). Job alerts, the "looking for work" profile, referrals, chapter badges and internships come later.
- Any logged-in member may post a job (option A).
- Login is required to apply (option A).
- Four application statuses: `new` (नवीन), `shortlisted` (शॉर्टलिस्ट), `rejected` (निवड नाही), `hired` (नोकरी मिळाली) (option A).
- The job's contact phone and email are shown to logged-in members only (option A).
- A job closes automatically 30 days after it was posted or last extended; the poster may close it earlier or extend it by 30 days (option A).
- Jobs already on the board get 30 more days from release, are managed by admins, and their old applications are visible to admins only (option A).
- Upgrade the existing `jobs` and `job_applications` tables in place; no new tables, no copy (approach 1).

## Findings in the current code

- Server: `job/` feature (`JobController`, `JobService`, `JobRepository` (Spring Data JPA native queries), entity `Job`) serves `GET /api/jobs`, `GET /api/jobs/{id}`, `POST /api/jobs`, `POST /api/jobs/{id}/apply`. None needs login.
- `POST /api/jobs/{id}/apply` inserts into `job_applications`, but **no endpoint reads that table**: the poster never sees an application.
- `jobs.poster_id` and `job_applications.member_id` exist (migration 002) but are never filled.
- Apply does not check that the job exists, and the same person can apply any number of times.
- Jobs never close; anyone can post; the public list returns `phone` and `contact_email` to everyone.
- `jobs.created_at` and `job_applications.created_at` are TEXT `YYYY-MM-DD HH24:MI:SS`. Job ids come from `Ids.twoDigit("JOB-")`, application ids from `Ids.millis("APP-")`.
- Website: only `pages/jobs/JobsPortalPage.jsx` calls the jobs API, through `services/api.js` (`api.jobs.*`). The Flutter app does not call it, so changing the rules cannot break the app.
- `NodeParityTest` has a `jobs` comparison (anonymous create/apply) that no longer applies once login is required.
- The admin panel (`AdminShell.jsx`) has no jobs view.

## Scope

In: new columns and a unique index, login and ownership for posting and applying, privacy of contact details, 30-day closing with close/extend, my posted jobs with applicants, application statuses, my applications, both notifications, the hired counter, a public single-job page with a WhatsApp share button, admin list and hide/unhide, the `/jobs` page rewritten on real data.
Out: the mobile app, job alerts, a job-seeker profile, referrals, chapter badges, internships category, resume file uploads, applicant withdrawal, editing a posted job, SMS/WhatsApp API messages (the share uses a free `wa.me` link only).

## Data

Migration `database/migrations/013_job_applications.sql`, also run at first use through `LazyTables` (`IF NOT EXISTS`, safe to run twice; nothing is dropped or deleted).

**`jobs`** gains: `status` (text, default `'open'`; `open` | `closed`), `closes_at` (timestamptz), `hidden` (boolean, default false), `updated_at` (timestamptz, default now()). Existing rows with `closes_at` null get `closes_at = now() + 30 days` (so old jobs run 30 more days from release). New jobs: `poster_id` from the token, `closes_at = now() + 30 days`.

**`job_applications`** gains: `status` (text, default `'new'`), `updated_at` (timestamptz, default now()). Index `job_applications_one_per_member` unique on `(job_id, member_id) WHERE member_id IS NOT NULL` (old rows have no member and are unaffected). New applications: `member_id` from the token.

Derived values (computed when read, never stored):
- A job's `state`: `closed` when `status = 'closed'`; `expired` when `status = 'open'` and `closes_at <= now()`; otherwise `open`. A job is **listed** when its state is `open` and it is not `hidden`.
- The hired counter = number of `job_applications` rows with `status = 'hired'`.

Every job status change is a conditional update (`WHERE id = ? AND status = 'open'`); zero rows changed → `INVALID_TRANSITION`.

## Server (Spring Boot, `job` feature rewritten)

Rewrite the feature in the blood style: `JobRepository` becomes a `JdbcTemplate` class (the JPA entity `Job` goes), plus `JobSchemas` (`SchemaValidator`/`Rule`), `JobService`, `JobController`, `JobAdminController`. Use `ActivityRepository.notifyMember(..., type)` and `audit`, `ApiException`, `@RequireAuth`, `Roles.isAdmin`, `LazyTables`. Notifications are each sent in their own transaction (as in `BloodService`) so a failure is logged and never undoes the action.

### Board and posting (`/api/jobs`)

| Method and path | Who | What |
|---|---|---|
| `GET /api/jobs` | anyone | Listed jobs, newest first. Filters `category`, `district` (`all` / `सर्व` = no filter), `search` (title, company, description). Each: `id, title, company, district, category, salary, job_type, experience, desc, created_at, closes_at, state, mine, applied` (the caller has applied; false for visitors), and `phone`, `contact_email` only when the caller is logged in. |
| `GET /api/jobs/{id}` | anyone | One job in the same shape, any state (a closed or expired job still opens so a shared link can say it is closed). Hidden → 404 except for its poster and admins. |
| `POST /api/jobs` | logged in | Body `title` (2–100), `company` (2–100), `district` (2–100), `category` (max 50), `salary` (max 50), `job_type` (max 30), `experience` (max 30), `desc` (max 1000), `phone` (phone format, 10–15, required), `contact_email` (email format, optional). Existing defaults kept for empty optional fields (`सामान्य`, `चर्चेनुसार`, `Full-time`, `१-३ वर्षे`). Replies 201 with `job`. At most 5 jobs per member in the last 24 hours (`RATE_LIMIT_EXCEEDED`, 429), counted in the table. |
| `PUT /api/jobs/{id}` | the poster, or admin | Body `action`: `close` (→ `closed`) or `extend` (`closes_at = now() + 30 days`; also allowed on an open job that has expired). Only from `open`. |
| `GET /api/jobs/mine` | logged in | The caller's jobs, all states, newest first, each with `state`, `applications` (count) and `new_applications` (count with status `new`). |
| `GET /api/jobs/stats` | anyone | `{ open_jobs, hired }`. |

### Applications

| Method and path | Who | What |
|---|---|---|
| `POST /api/jobs/{id}/apply` | logged in | Body `applicant_name` (2–100), `phone` (phone format, 10–15), `email` (email format, optional), `resume_summary` (max 500). Checks in order: job exists and is not hidden (404 `JOB_NOT_FOUND`), state is `open` (409 `JOB_CLOSED`), caller is not the poster (400 `OWN_JOB`), fields valid (400), then inserts with `status = 'new'`. A second application → 409 `ALREADY_APPLIED` (the unique index; a race never gives 500). Replies 201 with `application`. Notifies the poster (if any): type `job`, title "📩 नवीन अर्ज: {title}", message "{applicant_name} यांनी अर्ज केला. माझ्या जाहिराती मध्ये पहा." |
| `GET /api/jobs/applications/mine` | logged in | The caller's applications, newest first, each with `id, status, created_at` and the job's `id, title, company, district, state`. |
| `GET /api/jobs/{id}/applications` | the poster, or admin | The job's applications, newest first: `id, applicant_name, phone, email, resume_summary, status, created_at`. Others 403 `NOT_OWNER`. |
| `PUT /api/jobs/applications/{appId}` | the job's poster, or admin | Body `status`: one of `new`, `shortlisted`, `rejected`, `hired` (else 400). Allowed whatever the job's state (hiring often happens after closing). When the status actually changes to `shortlisted`, `rejected` or `hired`, the applicant (if any) is notified: type `job_application`, title "{icon} अर्जाची स्थिती: {title}", message "{company}: {status label}". Unknown application → 404. |

### Admin (`/api/admin/jobs`, admin only; others 403)

| Method and path | What |
|---|---|
| `GET /api/admin/jobs` | All jobs (hidden, closed, expired and old ones), newest first, with `state`, `hidden`, poster name (null for old jobs), `applications` count, phones and emails. |
| `PUT /api/admin/jobs/{id}` | Body `hidden` (boolean). Audit `JOB_HIDE` / `JOB_UNHIDE`. |

An admin reads any job's applicants (old ones included) with `GET /api/jobs/{id}/applications` and closes a job with `PUT /api/jobs/{id}` (audit `JOB_CLOSE` when it is not their own job).

## Website (`E:\community_mobile_main\frontend\src`)

- New pure helpers `pages/jobs/jobsHelp.js` with a node test: `APPLICATION_STATUSES` (value, Marathi label, icon), `STATE_LABELS`, `closesInText` ("२८ दिवसांत बंद"), `applyButton(job, loggedIn)` (`apply` / `login` / `applied` / `own` / `closed`), `whatsappText(job, origin)` and `whatsappLink(job, origin)` (`https://wa.me/?text=…`), `jobPayload(form)`, `applicationPayload(form)` (trimmed, phone spaces removed).
- `services/apiClient.js`: `getJobs(params)`, `getJob(id)`, `postJob`, `jobAction(id, action)`, `getMyJobs`, `getJobStats`, `applyToJob(id, data)`, `getMyApplications`, `getJobApplications(id)`, `setApplicationStatus(appId, status)`, `adminGetJobs`, `adminSetJobHidden`. The page stops using `api.jobs`.
- `JobsPortalPage.jsx`: banner shows the hired counter and open jobs. Three tabs (`?tab=` `all` / `mine` / `applied`). Board cards: real time, "closes in", contact for members or "संपर्कासाठी लॉगिन करा", the apply button by `applyButton`, a WhatsApp share button. Apply and post ask for login first (and come back to `/jobs`); server errors show inside the form; no fake success. "माझ्या जाहिराती": each job with state, counts, "+३० दिवस" and "जागा बंद करा" (confirm), and an applicant list with call link and a status selector. "माझे अर्ज": job, company, district and status badge (closed jobs shown as "🔒 जागा बंद").
- New route `/jobs/:id` → `JobDetailPage.jsx`: the one job with apply and share; a closed or expired job shows "ही जागा आता बंद आहे"; "अजून नोकऱ्या पहा" links to `/jobs`. Not found → a short message with the link.
- `AdminShell.jsx`: new "💼 नोकरी" view: jobs table (title, company, poster or "जुनी", state, applications, hidden) with hide/unhide (confirm) and an applicants list per job.
- `pages/member/notificationList.js`: `job` → `/jobs?tab=mine`, `job_application` → `/jobs?tab=applied`, with icons.

## Errors and edge cases

- Not logged in on a member endpoint → 401; the page shows the login prompt.
- Unknown or hidden job → 404 `JOB_NOT_FOUND`; unknown application → 404.
- Not the owner and not admin → 403 `NOT_OWNER`.
- Close/extend on a job that is not `open` → 409 `INVALID_TRANSITION`; unknown action → 400.
- Two applications at once from the same member to the same job → one row, the other 409 `ALREADY_APPLIED`.
- Old jobs (no poster): nobody but admins can close them or read their applications; applying to them still works while open (no poster to notify).
- A member deleted after applying: the application stays (name and phone are stored on it).
- Visitors never receive `phone` or `contact_email` of a job; applicant phone and email go only to the job's poster and admins.

## Testing

- Backend (embedded PostgreSQL + MockMvc, `JobEndpointsTest`, like `BloodEndpointsTest`): login required for post/apply/mine/manage; validation; 5-per-24h limit; list hides contacts for visitors and shows them to members; closed, hidden and expired jobs not listed; detail of a closed job still opens, hidden → 404; `mine` and `applied` flags; apply once, twice → 409, own job → 400, closed → 409, missing → 404; concurrent duplicate apply → one row; applicants visible to the poster and admin, others 403; status change with notification to the applicant, invalid status 400, no notification when unchanged; poster notified on apply; close/extend by owner and admin, second close 409; stats `hired` increases; old jobs get `closes_at` and old applications are admin-only. Remove the `jobs` comparison from `NodeParityTest`. Full suite and PARITY run stay green.
- Website: `node --test` for `jobsHelp.js` and `notificationList.js`; `npm run build`.
- The user writes three parts with guidance: the hired-counter SQL, the "apply twice → 409" test, and `whatsappText` with its node test.
- The user tests on the live site with a checklist.

## Release order

1. Backend on `Abhay_app` → PR to `main` → deploy with `deploy-java.ps1`. The columns are added on first use (and by migration 013).
2. Website PR → merge → Vercel deploys.
3. The user runs the test checklist.
