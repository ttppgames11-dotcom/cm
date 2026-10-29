# Job alerts: tell members when a matching job is posted (design)

Date: 2026-10-29. Status: awaiting review.

## Goal

A logged-in member saves up to 3 job alerts, each a district and a category (either may be "सर्व" = any, not both). When someone posts a job, every member with a matching alert gets one bell notification straight away. Website first; the app comes later. This is step 2 of the jobs plan (step 1: `2026-10-28-jobs-applications-design.md`, live).

## Decisions taken with the user

- Up to 3 alerts per member (option A).
- District or category may be "सर्व" (any), but not both at once (option A).
- Notify immediately, one notification per matching job (option A); no daily summary.
- A new `job_alerts` table, one row per alert (approach 1).
- The matching SQL is offered to the user to write (optional).

## Findings in the current code

- Jobs are posted by `JobService.create` (logged in, 5 per 24 h, `closes_at = now + 30 days`). Notifications are sent one per transaction by `JobService.send(...)` through `ActivityRepository.notifyMember(id, memberId, title, message, type)`.
- `BloodRepository.matchingDonorMembers` is the model: one SQL query returns the member ids to notify, with a cap.
- The website's job form and filters use the category list `IT & Software`, `Finance & Accounts`, `Manufacturing`, `Marketing & Sales`, `सामान्य` (`CATEGORIES` in `JobsPortalPage.jsx`) and the 35 districts `MAHARASHTRA_DISTRICTS`.
- `notificationList.js` maps a notification `type` to a page and an icon.

## Scope

In: the table, list/add/delete alerts, matching and notifying on every new job, the alert box on `/jobs`, the bell link.
Out: the mobile app, daily summaries, email/SMS/WhatsApp messages, alerts by salary or job type, pausing an alert, alerts for edited or extended jobs (only new posts notify).

## Data

Migration `database/migrations/014_job_alerts.sql`, also created on first use through `LazyTables` (`IF NOT EXISTS`):

`job_alerts(id TEXT PRIMARY KEY, member_id TEXT NOT NULL, district TEXT, category TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`

- `district` / `category` NULL = "सर्व" (any). Stored trimmed.
- `CREATE UNIQUE INDEX IF NOT EXISTS job_alerts_one_each ON job_alerts (member_id, coalesce(lower(district), ''), coalesce(lower(category), ''))`: the same alert twice is refused by the database.
- `CREATE INDEX IF NOT EXISTS job_alerts_member ON job_alerts (member_id)`.
- Ids `"JA-" + millis + 4 random characters` (like application ids).

## Matching

After a job is saved, members to notify:

```sql
SELECT member_id FROM job_alerts
WHERE member_id <> :poster
  AND (district IS NULL OR lower(trim(district)) = lower(trim(:district)))
  AND (category IS NULL OR lower(trim(category)) = lower(trim(:category)))
GROUP BY member_id
ORDER BY max(created_at) DESC
LIMIT 200
```

One notification per member (two matching alerts still give one). Type `job_alert`, title `"💼 नवीन नोकरी: {title} — {district}"`, message `"{company} · {salary}. रोजगार केंद्रात पहा."`. Each send in its own transaction with try/catch (a failure is logged and never undoes the post). The post reply is unchanged apart from a new `alerted` count.

## Server

In the `job` feature (`JobRepository`, `JobService`, `JobController`, `JobSchemas`).

| Method and path | Who | What |
|---|---|---|
| `GET /api/jobs/alerts` | logged in | `{ success, count, alerts: [{ id, district, category, created_at }] }`, oldest first; `district` / `category` null = any |
| `POST /api/jobs/alerts` | logged in | Body `district` (≤100, empty/`सर्व` = any), `category` (one of the 5, empty/`all`/`सर्व` = any). Both any → 400 `VALIDATION_ERROR`. 4th alert → 409 `ALERT_LIMIT`. Same district+category again (any case) → 409 `ALERT_EXISTS`. Replies 201 with `alert`. |
| `DELETE /api/jobs/alerts/{id}` | logged in | Deletes one of the caller's alerts; someone else's or unknown → 404 `ALERT_NOT_FOUND`. |

`/alerts` routes are declared before `/{id}`. The 3-alert limit is counted in SQL before the insert; the unique index makes a duplicate race a 409, never a 500.

## Website (`E:\community_mobile_main\frontend\src`)

- `pages/jobs/jobsHelp.js`: `alertLabel(alert)` (`"पुणे · Finance & Accounts"`, any district → `"सर्व जिल्हे"`, any category → `"सर्व क्षेत्रे"`); `canSaveAlert(alerts, category, district, loggedIn)` → `'login' | 'limit' | 'pick' | 'exists' | 'ok'`; `alertPayload(category, district)` (`all` / `सर्व` → omitted).
- `services/apiClient.js`: `getJobAlerts()`, `addJobAlert(data)`, `deleteJobAlert(id)`.
- `JobsPortalPage.jsx`, tab "सर्व नोकऱ्या", above the list: a "🔔 नवीन नोकरीची सूचना मिळवा" box with the member's alerts as chips (✕ removes, with confirm), a button "🔔 या शोधासाठी सूचना द्या" that saves the current category and district filters, and "(n/३ वापरल्या)". Button text and state by `canSaveAlert` (`login` → "लॉगिन करा व सूचना मिळवा" to the login page; `limit` → disabled "जास्तीत जास्त ३ सूचना"; `pick` → disabled "आधी जिल्हा किंवा क्षेत्र निवडा"; `exists` → disabled "ही सूचना आधीच आहे"). Server errors show in the box.
- `pages/member/notificationList.js`: `job_alert` → `/jobs`, icon `💼`.

## Errors and edge cases

- Not logged in → 401. Category not in the list → 400.
- A member deleted after saving alerts: their rows stay but notifications to a missing member are harmless (same as blood).
- A job posted with a category outside the list (old API callers) only matches "any category" alerts.
- The poster is never told about their own job.

## Testing

- Backend (`JobAlertsTest` or added to `JobEndpointsTest`, members `M90xx`): login required; add/list/delete; both any → 400; bad category → 400; 4th → 409 `ALERT_LIMIT`; duplicate (different case/spaces) → 409 `ALERT_EXISTS`; someone else's delete → 404; matching: exact, any-district, any-category told; other district, other category, the poster not told; two matching alerts → one notification; cap 200; post reply `alerted` count. Full suite stays green.
- Website: `node --test` for the new helpers and the bell link; `npm run build`.
- The user tests on the live site.

## Release order

1. Backend PR → merge → deploy with `deploy-java.ps1` (the table is created on first use).
2. Then the website PR → merge → Vercel.
3. The user tests.
