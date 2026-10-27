# Business Sangam chapters: real chapters, join requests, coordinator approval (design)

Date: 2026-10-27. Status: awaiting review.

## Goal

Make "बिझनेस संगम व चॅप्टर्स" real. An admin creates local business chapters and picks a coordinator from real members. A business owner asks to join a chapter with one of their businesses; the chapter's coordinator (or an admin) approves or declines. Every number on the page comes from real data. Website first; the app comes later.

## Decisions taken with the user

- Admin creates chapters; members ask to join; the coordinator or an admin approves (option A).
- Only members who have a business listed may ask to join (option A).
- The "one seat per type of business" rule is a coordinator decision, not a system block: the coordinator is shown the requester's business, its category and the similar businesses already in the chapter (option A). The website has only 6 broad categories, so a strict system rule would cap a chapter at 6.
- The seat belongs to the business, not the person: each business can be in one chapter; a member with businesses in two cities can put each in its own chapter; one person cannot hold two seats in the same chapter.
- Visibility (option A): everyone sees the chapter list; only logged-in members see which businesses are in a chapter; phone numbers are not shown on chapter screens.

## Findings in the current code

- `BusinessSangamPage.jsx`: every chapter is invented (`HISTORIC_CHAPTERS`: coordinators, phone numbers, seats, ₹ turnover, "opportunities"). An effect calling `window.CMDB.getChapters` falls back to the same list. No API call.
- `AdminShell.jsx` `ChaptersView`: a hard-coded list in `useState`; the add form only changes the browser's memory.
- Database: no chapters table. Server: only a `chapterPresidents` role count in `AdminService`. Community `groups` keep only a member count (no membership list, no approvals, no businesses), so they are not reused.
- Businesses: table `businesses` with `owner_id`, `cat` (`it`, `restaurant`, `realestate`, `manufacturing`, `travel`, `services`), `city`, `status` (`hidden` = hidden; anything else = visible).

## Scope

In: chapters and seats tables, public chapter list, logged-in business lists, join/cancel/leave, coordinator and admin approve/decline/remove, admin create/edit/close/reopen, notifications, audit log, Sangam page and admin Chapters view rewritten on real data.
Out: the mobile app, live (SSE) updates, chapter photos upload, attendance tracking, chapter meetings calendar, turnover or "opportunity" figures.

## Data

Two new tables (migration `database/migrations/011_chapters.sql`, also created at runtime through `LazyTables` like the meetings columns, with `IF NOT EXISTS` so it is safe to run twice):

**`chapters`**: `id` (text, `CH…`), `name`, `city`, `district`, `area`, `meeting_day`, `meeting_time`, `venue`, `coordinator_id` (member id), `max_seats` (integer, nullable = no limit), `status` (`open` | `closed`), `created_at`, `updated_at`.

**`chapter_seats`**: `id` (text, `CS…`), `chapter_id`, `business_id`, `member_id` (the owner who asked), `message` (up to 300 characters, may be empty), `status`, `decided_by` (member id of whoever approved/declined/removed, nullable), `created_at`, `updated_at`.

Seat statuses: `waiting` (asked), `approved` (has a seat), `declined`, `cancelled` (member withdrew), `left` (member left), `removed` (coordinator/admin removed). Rows are never deleted; ended rows are history. A row is **active** when its status is `waiting` or `approved`.

Rules enforced by the database (partial unique indexes over active rows), so double clicks and simultaneous requests cannot break them:
- one active row per business (`business_id`), across all chapters;
- one active row per member per chapter (`chapter_id, member_id`).

Every status change is a conditional update (`WHERE id = :id AND status = :from`); zero rows changed means someone else decided first and the caller gets `INVALID_TRANSITION`.

## Server (Spring Boot, `sangam` feature)

Follow the meetings/referrals patterns (`MeetingService`, `MeetingLimiter`, `ActivityRepository.notifyMember/audit`, `SchemaValidator`, `ApiException`, `@RequireAuth`, `Roles.isAdmin`).

### Public and member endpoints (`/api/sangam/chapters`)

| Method and path | Who | What |
|---|---|---|
| `GET /api/sangam/chapters` | anyone, no login | Open chapters only. Each: `id, name, city, district, area, meeting_day, meeting_time, venue, coordinator_name, max_seats, businesses, open_seats, categories`. `businesses` = approved seats whose business is visible. `open_seats` = `max_seats` − all approved seats (hidden businesses still hold their seat), never below 0; `null` when there is no maximum. `categories` = `[{cat, count}]` from the visible approved businesses. No ids of members, no phones. |
| `GET /api/sangam/chapters/{id}/businesses` | logged in | Visible approved businesses of an open chapter: `business_id, name, cat, city, owner_id, owner` (owner name). 404 for an unknown or closed chapter (admins and the coordinator may also read a closed one). |
| `GET /api/sangam/chapters/mine` | logged in | `seats`: the caller's own rows (all statuses, newest first) with chapter name and business name. `coordinating`: chapters where the caller is coordinator (`id, name, status, waiting` count). |
| `GET /api/sangam/chapters/{id}/seats` | that chapter's coordinator, or admin | Waiting and approved rows with `business_id, business name, cat, city, member_id, owner name, message, status, created_at` and `similar` = number of approved businesses in this chapter with the same `cat` (excluding the row itself). |
| `POST /api/sangam/chapters/{id}/join` | logged in, business owner | Body `businessId` (required), `message` (optional, up to 300). Creates a `waiting` row; the coordinator is notified. |
| `PUT /api/sangam/chapters/seats/{seatId}` | depends on action | Body `action`: `approve`, `decline` (coordinator/admin, from `waiting`), `remove` (coordinator/admin, from `approved`), `cancel` (the member who asked, from `waiting`), `leave` (the member who asked, from `approved`). |

Join checks, in order: chapter exists (404) and is `open` (`CHAPTER_CLOSED`); business exists (404); caller owns it (`owner_id`, else 403 `NOT_OWNER`); business is visible (`BUSINESS_HIDDEN`); the business has no active row anywhere (`BUSINESS_ALREADY_IN_CHAPTER`); the caller has no active row in this chapter (`ALREADY_IN_THIS_CHAPTER`); rate limit of 10 join requests per member per 24 hours (`RATE_LIMIT_EXCEEDED`, 429, a `ChapterLimiter` like `MeetingLimiter`). A unique-index violation from a simultaneous request maps to the same two "already" codes, never a 500.

Approve also requires the chapter to be `open` (`CHAPTER_CLOSED`) and, when `max_seats` is set, approved seats < `max_seats` (`CHAPTER_FULL`). The coordinator may approve their own business's request.

Notifications (`ActivityRepository.notifyMember`, Marathi with English in brackets like meetings): new request → coordinator; approved, declined, removed → the member who asked; chapter closed → each member whose waiting request was declined by the close.

Audit log (`ActivityRepository.audit`): `CHAPTER_CREATE`, `CHAPTER_UPDATE`, `CHAPTER_CLOSE`, `CHAPTER_REOPEN`, `CHAPTER_SEAT_APPROVE`, `CHAPTER_SEAT_DECLINE`, `CHAPTER_SEAT_REMOVE`, with chapter, seat, business and member ids in the details.

### Admin endpoints (`/api/admin/chapters`, admin only; others 403)

| Method and path | What |
|---|---|
| `GET /api/admin/chapters` | All chapters, open and closed, with `coordinator_id, coordinator_name, businesses, waiting` counts. |
| `POST /api/admin/chapters` | Create (status `open`). |
| `PUT /api/admin/chapters/{id}` | Edit any field, change coordinator, change `max_seats`, set `status` to `open` or `closed`. |

Fields: `name` required 3–120; `city`, `district` required up to 60; `area` up to 120; `meeting_day`, `meeting_time` free text up to 40 (e.g. "प्रत्येक बुधवार", "सकाळी ७:३० ते ९:००"); `venue` up to 200; `coordinatorId` required and must be an existing member (`COORDINATOR_NOT_FOUND`); `maxSeats` optional whole number 1–200 or empty for no limit.

Closing a chapter declines all its `waiting` rows in the same transaction (members notified); approved seats stay, so reopening restores the chapter as it was. Lowering `max_seats` below the current approved count is allowed; nobody is removed, the chapter just shows full. A new coordinator gets the rights at once and the old one loses them (rights come from `coordinator_id`, not from the member's role).

The admin console's coordinator picker uses the existing `GET /api/admin/users`; no new search endpoint.

## Website (`E:\community_mobile_main\frontend\src`)

- `pages/sangam/chapterList.js` (+ `node --test`): pure helpers: seat status labels (Marathi), which actions a viewer has on a row, the "similar business" highlight, seats text ("12 व्यवसाय · 8 जागा उपलब्ध" / full), category labels, and choosing which of the member's businesses may be offered (visible and not already in a chapter).
- `services/apiClient.js`: functions for every endpoint above.
- `BusinessSangamPage.jsx` rewrite on real data: `HISTORIC_CHAPTERS` and the `window.CMDB.getChapters` fallback deleted; hero, look, search and city filter kept; top numbers bar shows real counts (chapters, businesses with seats, cities); cards show name, city, area, meeting day/time/venue, coordinator name, seats text or a Full badge, category tags; card photo is an existing city photo where one exists, otherwise a standard picture; buttons "View businesses" (login asked first; list links to each business page and offers "Book 1-to-1 meeting" through the meetings page) and "Ask to join" (pick a business, optional message; with no business listed it says "List your business first" and links to the business directory). A "My chapters" box for logged-in members shows their requests and seats with Cancel/Leave and, for coordinators, waiting requests with Approve/Decline (similar businesses highlighted) and the member list with Remove. The "How it works" step 1 text changes from "one seat per business" to the coordinator keeping similar businesses from competing. With no chapters it shows "No chapters yet — coming soon".
- `AdminShell.jsx` `ChaptersView` rewrite: table of all chapters (open and closed, businesses and waiting counts), create/edit form with the coordinator picked from real members, Close/Reopen, and per chapter the same Approve/Decline/Remove list the coordinator sees.

## Errors and edge cases

- No login on a login-only endpoint: 401. Not the coordinator/admin, or not the owner: 403. Unknown chapter, seat or business: 404. Everything else: 400 with a code from above and a clear Marathi message.
- A hidden business keeps its seat but is not listed to others while hidden; a hidden business cannot ask to join. A request that was waiting when the business was hidden can still be approved or declined (the coordinator's list shows it with a "hidden" mark).
- A deleted business disappears from lists and counts (queries join on `businesses`).
- A declined, cancelled, left or removed business may ask again (subject to the daily limit).
- No live updates: the page reloads its data when opened and after each action.
- Known limits: the standby Node backend has no chapters, so if traffic is ever switched back to it the page shows no chapters; the Flutter app is unchanged.
- After release the page is empty until an admin creates the first chapter — expected, because the invented chapters are removed.

## Testing

- Backend: `ChapterEndpointsTest` covering access for visitor/member/owner/coordinator/admin; public list fields and counts (hidden business counted in `open_seats` but not in `businesses`; no phones or member ids); every join check; every seat action and the forbidden ones; full and closed chapters; closing declines waiting rows and notifies; reopening restores seats; coordinator change moves the rights; simultaneous approve/join (one wins, the other gets the "already"/`INVALID_TRANSITION` code, no 500); audit rows and notifications; the daily limit. The existing suite (195) must stay green and the Node parity test unchanged (Node has no chapter routes).
- Website: `node --test src/pages/sangam/chapterList.test.js` and `npm run build`.

## Release order

Database backup, backend PR, the user runs `deploy-java.ps1` (types `YES`; epay untouched), outside checks of the public list, then the website PR (Vercel), then the user creates one real chapter and runs a two-account test.
