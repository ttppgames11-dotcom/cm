# Referrals and business exchange: private, real, live

**Date:** 2026-10-26
**Status:** design agreed section by section in chat; this document is for final review
**Builds on:** business ownership (`businesses.owner_id`, `status`), the live-update hub (`common/live`), `Roles`.

## 1. Goal

Let one member pass a customer lead to another member who owns a business, and let both follow it to a result:

- the giver picks a real receiver (a member who owns a visible business), enters the customer, and gives the referral;
- the receiver moves it through the pipeline and records the deal value when it is won;
- the customer's contact details stay private to the giver, the receiver and admins;
- both sides see changes live, and the community sees only totals (no names).

Website only (the mobile app comes later). Node stays the unchanged backup. epay is untouched.

**Success criteria**
1. A referral cannot be given to a member without a visible business, to yourself, or with a business that is not the receiver's (400).
2. `GET /api/sangam/referrals` needs a login and returns only the caller's referrals (admins: all); an outsider cannot read a referral, its customer phone or change its status.
3. Only the receiver or an admin can change the status; the giver sees it change live.
4. The create and tracker pages work with real members and invent no data (no fake phone, value, names or points).
5. The existing tests and the Node comparison stay green apart from the deliberate changes in §8.

## 2. Today

- Table `referrals` (migration 001): `id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status DEFAULT 'New', value, notes, created_at`.
- `GET /api/sangam/referrals` is public and returns every referral including `client_phone`; `PUT .../status` has no login check; create fills invented defaults (giver "M1001"/"अमोल जाधव", receiver "M1008"/"विकास गायकवाड") and does not check that the receiver exists. These are faithful ports of the Node behaviour.
- Website: `/referrals/create` (`CreateReferralPage.jsx`) picks receivers from sample members stored in the browser and substitutes a fake phone `9822144550` and value `50000`; `/referrals/tracker` (`ReferralsTrackerPage.jsx`) lists referrals with statuses New, Contacted, Qualified, Proposal, Won and updates them through `updateReferralStatus`. `/referrals` (`ReferralPortalPage.jsx`) only shows the member's invite link.
- Three admin pages (`AdminERPPage`, `AdminShell`, SuperAdmin) read and create referrals through the same endpoints, logged in as admins.

## 3. Decisions

| Topic | Decision |
|---|---|
| Who can receive | A member who owns at least one visible business (`owner_id` = member, `status` not `hidden`), never the giver |
| Statuses | `New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost`. The first five are the tracker page's existing words; `Lost` is the one ending that means "not interested" |
| Who changes the status | The receiver or an admin. The giver only watches |
| Who sees a referral and the customer's contact | The giver, the receiver and admins. Nobody else; the public list goes away |
| Community numbers | Totals only (referrals given, won, total won value), public, no names |
| Live updates | Server-sent events through the existing hub, carrying no customer data |

## 4. Data

One nullable column on the existing table: `ALTER TABLE referrals ADD COLUMN IF NOT EXISTS business_id TEXT;` (which of the receiver's businesses the referral is for). Java runs it on first use (`LazyTables` pattern, own transaction) and the same SQL is saved as `database/migrations/009_referrals_business.sql`. Existing rows keep `business_id` empty. No other column changes. `status` stays free text in the database; the service allows exactly the six words in §3 when writing (existing rows may hold other words, which stay readable).

## 5. API

Errors use `{ success:false, code, error }`, Marathi then English text.

**Referral (shape for giver, receiver and admins):** the existing keys (`id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at`) plus `business_id` and, for non-admin callers, `role` (`giver` or `receiver`).

| Endpoint | Who | Behaviour |
|---|---|---|
| `POST /api/sangam/referrals` | login (401) | Fields: `title` (required, 3-150), `clientName` or `client_name` (required, ≤100), `clientPhone`/`client_phone` (required, the standard phone format after removing spaces and dashes), `clientEmail`/`client_email` (optional, email format), `recipientId`/`recipient_id` (required), `businessId`/`business_id` (optional), `category` (≤100), `value` (optional number ≥ 0), `notes` (≤1000). The giver is the logged-in member (`giver_id`, `giver_name` from the profile; any giver sent in the body is ignored). The receiver must exist and own a visible business (400 `RECIPIENT_NOT_ELIGIBLE`), must not be the giver (400 `SELF_REFERRAL`); a given `businessId` must be one of the receiver's visible businesses (400 `BUSINESS_NOT_RECEIVERS`). `recipient_name` comes from the member record. Limit: 20 referrals per giver per day (429 `RATE_LIMIT_EXCEEDED`). Reply 201 `{ success, message, referral }` |
| `GET /api/sangam/referrals?status=` | login (401) | The caller's referrals as giver or receiver, newest first, each with `role`; `status=all` or empty means every status. Admins (`Roles.isAdmin`) get every referral. The old `memberId` filter is honoured only for admins. Reply `{ success, count, referrals }` |
| `PUT /api/sangam/referrals/{id}/status` | receiver or admin | Body `{ status, value? }`: `status` must be one of the six words (400 `VALIDATION_ERROR`), `value` an optional number ≥ 0 (kept as is when left out). 404 `REFERRAL_NOT_FOUND`; 403 `NOT_RECEIVER` for anyone else. Reply `{ success, referral }` |
| `GET /api/sangam/referrals/receivers` | login | Members who own at least one visible business, except the caller: `[{ id, name, businesses: [{ id, name }] }]`, sorted by name, at most 200. Reply `{ success, count, receivers }` |
| `GET /api/sangam/referrals/stats` | anyone | `{ success, stats: { given, won, wonValue } }` over all referrals (`won` = status `Won`, `wonValue` = sum of `value` of those) |
| `GET /api/sangam/referrals/stream` | anyone | `text/event-stream` on channel `referrals`; event `referral.changed` with `{ id, giverId, recipientId, status }` after a referral is given or its status changes (no names, phones or values) |

`/receivers`, `/stats` and `/stream` must not be shadowed by `/{id}` routes. Unknown status words on existing rows are returned unchanged.

## 6. Live updates

Same mechanism as the leads page: the service publishes a Spring event, an after-commit listener hands it to `LiveUpdates.publish("referrals", "referral.changed", payload)`; a rejected or failed request publishes nothing. A page opens the stream, ignores events whose `giverId` and `recipientId` are not the logged-in member, and otherwise reloads its own list (and shows a popup). The stream carries only member ids, referral id and status, which are not secrets (member ids are in the public member list). Stream limits are the hub's (5 per IP, 500 total).

## 7. Website

- `CreateReferralPage.jsx`: the receiver picker lists `GET /receivers` (member name and their business names, with an optional business choice); requires customer name, a valid phone and a receiver; sends `clientPhone`/`clientName`/`recipientId`/`businessId`/`value`; removes the substituted fake phone and value (an empty value is sent as nothing) and the "+10 points" message and the browser-local `CMDB.createReferral` copy.
- `ReferralsTrackerPage.jsx`: loads the real list; tabs "मी दिलेले" (given) and "मला मिळालेले" (received); the status dropdown is enabled only on referrals the member received (and for admins), with the statuses New, Contacted, Qualified, Proposal, Won and Lost; asking for the deal value when choosing Won; a popup and refresh when the stream reports a referral involving the member.
- `ReferralPortalPage.jsx`: keeps the invite link; adds links to give a referral and to the tracker, and the community totals from `/stats`.
- The three admin pages are unchanged (they log in as admins and still see everything).

## 8. Tests and the Node comparison

- New `ReferralEndpointsTest` (MockMvc, embedded PostgreSQL): login needed to give and to list; receiver rules (no business, hidden business, self, unknown member, wrong business); giver cannot be forged; required fields and phone format; list shows only the caller's referrals with `role`, an outsider sees none and cannot change a status (403/404-safe), admin sees all; status rules (receiver or admin only, six words, value kept or changed, `Won` and `Lost`); `/receivers` content and exclusions; `/stats` totals and no names; daily limit.
- New `ReferralStreamTest` (real HTTP): an event arrives after giving and after a status change, contains no phone or name, and a rejected request sends nothing.
- `NodeParityTest` "sangam" scenario: referral requests (create, status, list) differ from Node on purpose (login, privacy, validation); they move to the Java-only tests; meetings and metrics stay compared. Existing referral rows are seeded directly where the scenario still needs one.
- Website: `node --test` for the pure helpers (status words, role tabs, event relevance), `npm run build`, and a live two-member check.

## 9. Release and rollback

Java PR, then `deploy-java.ps1`, then outside checks (public list needs a login: 401; `/stats` 200; stream sends `connected`); then the website PR right away (the old create page would fail between the two). Rollback: revert the PRs; the new column stays and does no harm. Node would again expose referrals publicly if traffic were ever switched back.

## 10. Out of scope

Points or rewards · the mobile app · email or WhatsApp alerts · referral history and comments · editing or deleting a referral · assigning a referral to a different receiver · the "listed business" badge elsewhere · deleting the existing test referral (its phone stops being visible with this change).
