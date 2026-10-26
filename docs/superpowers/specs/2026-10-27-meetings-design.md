# 1-to-1 business meetings: real, private, live (design)

Date: 2026-10-27. Status: awaiting review.

## Goal

Make "1-to-1 व्यावसायिक बैठका" real: a member requests a meeting with another business-owning member, the receiver accepts or declines, and both see the result live. No invented data, no public access. Website first; the app comes later.

## Findings in the current code

- `MeetingsPortalPage.jsx`: partner list is 6 made-up members; meetings live in browser storage; booking is local-first and fire-and-forget to the API; a fake Google Meet link is generated; cancel and minutes are local only.
- `SangamController` / `SangamService`: `GET /meetings` and `POST /meetings` need no login. `createMeeting` invents defaults (`M1001`, "अमोल जाधव", a fixed date) and trusts `requester_id` from the body. Date and time are free text.
- Table `meetings` (id, requester_id/name, recipient_id/name, date, time, topic, status, notes, location, created_at, updated_at) is enough; no schema change is needed beyond new status values.

## Scope

In: real partner list, request/accept/decline/cancel/complete, reschedule needs re-acceptance, private access, live stream, a shared note, website page rewrite.
Out: the mobile app, calendar sync, generated video links, chat.

## Backend (Spring Boot, `sangam` feature)

Stay within the existing feature package and patterns (see `ReferralService`, `ReferralLiveRelay`, `ReferralChanged`).

- **Partners:** `GET /api/sangam/meetings/partners` (login required) returns members who own a business, excluding the caller (same source as referral receivers).
- **Create:** `POST /api/sangam/meetings` (`@RequireAuth`). Requester id and name come from the login only. Body: `recipientId`, `date` (`YYYY-MM-DD`), `time` (`HH:mm`), `mode` (`Offline`|`Online`), `place` (venue or the requester's own link, up to 200 chars), `topic` (up to 300 chars). The recipient must be a business-owning member and not the caller; the date must not be in the past; a member may have at most 10 open (Requested) requests. Status starts `Requested`; the recipient is notified.
- **List:** `GET /api/sangam/meetings` (`@RequireAuth`) returns only meetings where the caller is requester or recipient (admins see all; `Roles.isAdmin`). The `memberId` query parameter is ignored for non-admins.
- **Respond:** `PUT /api/sangam/meetings/{id}/status` body `status`: `accepted` (recipient only, only from `Requested`), `declined` (recipient only, only from `Requested`), `cancelled` (either side, from `Requested` or `Confirmed`), `completed` (either side, only from `Confirmed`, only once the meeting date has arrived). Statuses stored: `Requested`, `Confirmed`, `Declined`, `Cancelled`, `Completed`. Anything else is a 400 with a clear message; a stranger gets 403 and an unknown id 404.
- **Reschedule:** `PUT /api/sangam/meetings/{id}` (either side, from `Requested` or `Confirmed`) with new date, time and optional place; validated like create; status returns to `Requested` and the other side is notified.
- **Note:** `PUT /api/sangam/meetings/{id}/notes` (either side) saves a note up to 2000 characters in `notes`.
- **Live:** `GET /api/sangam/meetings/stream` (SSE, login required through the same ticket/token mechanism as the referral stream). Each committed change publishes `MeetingChanged(meetingId, requesterId, recipientId)` after commit (`@TransactionalEventListener(AFTER_COMMIT)`); the relay sends one small event only to the two people involved.
- **Rate limits:** a `MeetingLimiter` mirrors `ReferralLimiter` (per member and per IP).
- **Deliberate difference from Node:** the public list, the unauthenticated create and the invented defaults are removed. Recorded in `backend-java/README.md`; the parity test keeps the old behaviour only where it was not a security hole.

## Website (`E:\community_mobile_main\frontend\src`)

- `pages/sangam/meetingList.js` (+ `node --test`): pure helpers for grouping (requests waiting for me, requests I sent, confirmed, past), status labels, who may do what, and date/time checks.
- `hooks/useMeetingStream.js`: EventSource with retry, same as `useReferralStream`.
- `MeetingsPortalPage.jsx` rewrite: server data only, real partner picker, no storage of meetings in the browser, no generated links, the old made-up lists deleted; actions per the rules above; the shared note replaces "log minutes".

## Errors and edge cases

Past dates, equal-to-today times already gone, self-booking, a non-owner recipient, a repeat request while one is open for the same pair, too many open requests, double actions (accepting twice), and acting on someone else's meeting all return clear 400/403/404 messages.

## Testing

- Backend: `MeetingEndpointsTest` (access, validation, every transition and the forbidden ones, privacy of list and stream, live event reaches only the two people, limiter) plus the existing parity tests updated for the deliberate differences.
- Website: `node --test src/pages/sangam/meetingList.test.js` and `npm run build`.

## Release order

Backend PR, then the user runs `deploy-java.ps1` (types `YES`), outside checks, then the website PR, then a two-account live test.
