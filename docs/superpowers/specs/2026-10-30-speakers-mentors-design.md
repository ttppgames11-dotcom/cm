# Speakers and mentors: real profiles, admin approval and booking requests (design)

Date: 2026-10-30. Status: awaiting review.

## Goal

Make the "🎙️ प्रेरक वक्ते व मार्गदर्शक" page (`/speakers`) real. Members apply to be listed as a speaker and/or mentor; an admin approves them before they are public. The admin can also add speakers who have no Connect Maratha account. Logged-in members send a request to a speaker: an event talk or one-to-one guidance. The speaker (or the admin, for speakers without an account) accepts or declines, and both sides get a bell notification. This is website only; the app comes later.

## Decisions taken with the user

- Members apply; an admin approves before the profile is public (option B).
- Requests go straight to the speaker, who accepts or declines (option A).
- One profile offers talks, guidance or both; a request is of kind talk or guidance (option A).
- The 6 built-in sample cards are removed; an empty state invites members to apply (option A).
- The admin can also add speakers directly, already approved (option C).
- A speaker does not need a member account. Requests for a speaker without an account go to all admins, who phone the speaker and answer for them. An admin can later link the profile to the speaker's account.
- A new `speaker` feature built like `job` (approach 1).

## Findings in the current code

- `/speakers` is `pages/culture/MotivationalSpeakersPage.jsx` (612 lines). It calls `apiClient.getSpeakers()` (`GET /api/speakers`), `addSpeaker()` (`POST /api/speakers`) and `bookSpeaker()` (`POST /api/speakers/book`). The live API answers 404 to all three: no backend exists, in Java or in Node.
- Because of the 404, the page shows 6 built-in sample cards. Some use the names of real, well-known people with invented details (session counts, swapped photos).
- "Book" sends a fixed phone `9822011223` and a fixed date text, and on failure still tells the visitor they will be contacted. Nobody is contacted.
- The patterns to copy are live in the `job` feature: `JobRepository` (JdbcTemplate SQL, `INSERT … ON CONFLICT DO NOTHING`, conditional `UPDATE … WHERE status = …`), `JobService` (`MAX_JOBS_PER_DAY` with 429 `RATE_LIMIT_EXCEEDED`, `isAdmin` via `Roles.isAdmin`, `send()` in its own transaction), `LazyTables.createOnce`, `JobAdminController`, `jobsHelp.js` with `node --test`.
- Admins are found with `SELECT id FROM members WHERE lower(role) IN ('admin','superadmin','ceo')` (`BloodRepository.adminMembers`).

## Scope

In: the two tables, applying and editing a profile, admin approve/reject/hide/add/link, the public list, talk and guidance requests, accept/decline/cancel, bell notifications, the rewritten `/speakers` page with tabs, the admin "Speakers (वक्ते)" view, the bell links.
Out: the mobile app, photos/uploads (cards use an initial or a default icon), payments or fees, reviews and ratings, calendars and availability slots, email/SMS/WhatsApp messages, the Node backend.

## Data

Migration `database/migrations/015_speakers.sql`, also created on first use through `LazyTables` (`IF NOT EXISTS`).

`speakers`:

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PRIMARY KEY | `"SPK-" + millis + 4 random characters` |
| `member_id` | TEXT | NULL = added by an admin, no account |
| `name`, `title`, `category`, `city`, `topics`, `intro`, `phone` | TEXT | `name`, `category`, `city`, `topics`, `phone` required |
| `offers_talks`, `offers_guidance` | BOOLEAN NOT NULL | at least one true |
| `status` | TEXT NOT NULL DEFAULT `'pending'` | `pending` / `approved` / `rejected` |
| `reject_reason` | TEXT | optional |
| `hidden` | BOOLEAN NOT NULL DEFAULT false | |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

- `CREATE UNIQUE INDEX IF NOT EXISTS speakers_one_per_member ON speakers (member_id) WHERE member_id IS NOT NULL`.

`speaker_requests`:

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PRIMARY KEY | `"SRQ-" + millis + 4 random characters` |
| `speaker_id` | TEXT NOT NULL | |
| `member_id` | TEXT NOT NULL | who asks (the organiser) |
| `kind` | TEXT NOT NULL | `talk` / `guidance` |
| `event_date` | DATE | talk: required, today or later |
| `place`, `event_type` | TEXT | talk: `place` required |
| `audience` | INTEGER | talk: optional, 1 to 100000 |
| `topic`, `mode` | TEXT | guidance: `topic` required; `mode` `phone` / `meeting` |
| `message` | TEXT | optional |
| `status` | TEXT NOT NULL DEFAULT `'new'` | `new` / `accepted` / `declined` / `cancelled` |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

- `CREATE UNIQUE INDEX IF NOT EXISTS speaker_requests_one_open ON speaker_requests (speaker_id, member_id) WHERE status = 'new'`.
- Indexes on `speaker_requests (speaker_id)` and `speaker_requests (member_id)`.
- The organiser's name and phone are read from `members` when a request is shown, not copied.

Categories: `प्रेरणादायी वक्ते`, `व्यवसाय मार्गदर्शन`, `यशस्वी उद्योजक`, `युवा प्रेरणा`, `शिक्षण तज्ञ`, `इतर` (the page's current list).

## Rules

- **Applying:** logged in, one profile per member (a second → 409). New profiles are `pending`.
- **Editing my profile:** allowed in any status; the profile goes back to `pending` and `reject_reason` is cleared.
- **Public list:** only `approved` and not `hidden`. Never contains `phone` or `member_id`.
- **Sending a request:** logged in; the speaker is approved and not hidden (else 404); not my own profile (400); the speaker offers that kind (400); the kind's required fields are present (400); at most 5 requests per member in 24 hours (429 `RATE_LIMIT_EXCEEDED`); one open request per speaker (`ON CONFLICT DO NOTHING`, 0 rows → 409).
- **Answering:** `accept` / `decline` by the speaker's member, or by an admin when the speaker has no account. `cancel` by the organiser. All three only while `status = 'new'`, with `UPDATE … WHERE id = ? AND status = 'new'`; 0 rows → 409 "already answered".
- **Who sees phones:** the speaker's phone only to the organiser of an `accepted` request (and admins). The organiser's phone only to the speaker of that request (or the admins, for a speaker without an account).
- **Admin:** approve, reject (optional reason), hide, unhide, add a speaker (approved at once, `member_id` optional), link a speaker to a member (refused with 409 if that member already has a profile). Admin actions need `Roles.isAdmin` (403 otherwise).

## Notifications

Each sent with `ActivityRepository.notifyMember` in its own transaction inside try/catch: a failure is logged and never undoes the action.

| Type | To | When |
|---|---|---|
| `speaker` | the member | profile approved / rejected (with the reason) |
| `speaker_request` | the speaker's member, or every admin when there is no account | a new request |
| `speaker_reply` | the organiser | accepted / declined |

## Server

A new package `speaker/` (`controller`, `service`, `repository`, `dto/SpeakerSchemas`), like `job/`.

| Method and path | Who | What |
|---|---|---|
| `GET /api/speakers?category=&city=&search=` | anyone | approved, visible speakers; for a logged-in viewer each has `mine` and `requested` |
| `GET /api/speakers/mine` | logged in | my profile (any status) or `null` |
| `POST /api/speakers` | logged in | apply |
| `PUT /api/speakers/mine` | logged in | edit my profile |
| `POST /api/speakers/{id}/requests` | logged in | send a request |
| `GET /api/speakers/requests/mine` | logged in | requests I sent |
| `GET /api/speakers/requests/incoming` | logged in | requests to my profile |
| `PUT /api/speakers/requests/{id}` | logged in | `{ action: accept / decline / cancel }` |
| `GET /api/admin/speakers` | admin | every speaker, pending first |
| `POST /api/admin/speakers` | admin | add a speaker |
| `PUT /api/admin/speakers/{id}` | admin | `{ action: approve / reject / hide / unhide / link, reason?, member_id? }` |
| `GET /api/admin/speakers/requests` | admin | requests for speakers without an account |

Errors through `ApiException` with Marathi messages, as elsewhere.

## Website

`/speakers` keeps its current look (hero, colours, card style) and gets four tabs: 🎙️ सर्व वक्ते, 📋 माझ्या विनंत्या, 📥 मला आलेल्या विनंत्या (shown when I have a profile), 👤 माझे प्रोफाइल. `?tab=` opens a tab.

- `MotivationalSpeakersPage.jsx`: rewritten; the 6 samples, the fixed phone and the fixed date are removed. Empty state: "अजून वक्ते नाहीत. पहिले व्हा! 🎙️ [वक्ता म्हणून अर्ज करा]".
- `SpeakerApplyModal.jsx` (new): apply / edit.
- `SpeakerRequestModal.jsx` (new): choose talk or guidance (only the kinds the speaker offers), with that kind's fields.
- `speakersHelp.js` + `speakersHelp.test.js` (new, `node --test`): the card button (`login` / `own` / `requested` / `request`), status labels and icons, `speakerPayload`, `requestPayload`, `speakerQuery`.
- `apiClient.js`: the speaker calls replace `getSpeakers` / `addSpeaker` / `bookSpeaker`.
- `AdminShell.jsx`: a "Speakers (वक्ते)" view: pending first with Approve / Reject, Add speaker, Hide / Unhide, Link account, and the requests for speakers without an account with Accept / Decline.
- `notificationList.js` (+ test): `speaker` → `/speakers?tab=profile`, `speaker_request` → `/speakers?tab=incoming` (admins: `/admin/speakers`), `speaker_reply` → `/speakers?tab=mine`; icon 🎙️.

## Testing

- `SpeakerEndpointsTest` (JUnit on embedded PostgreSQL, like `JobEndpointsTest`): apply and the 409 for a second profile; pending/rejected/hidden profiles are not public; no `phone`/`member_id` in the public list; edit returns to pending; request rules (own profile, kind not offered, missing fields, 6th in a day → 429, open duplicate → 409); accept/decline/cancel permissions; the 409 when already answered; phones appear only after acceptance; admin add/approve/reject/hide/link and 403 for non-admins; requests for a speaker without an account notify admins and admins can answer them; a failing notification still saves the request.
- `speakersHelp.test.js` and `notificationList.test.js` with `node --test`.
- Manual check on the live site after release.

## Release

1. Merge the backend PR. 2. Run `deploy-java.ps1`. 3. Check that `GET https://api.connectmaratha.com/api/speakers` answers 200. 4. Merge the website PR.
