# B2B Opportunities (`/leads`): backend and live updates

**Date:** 2026-10-24
**Status:** design agreed section by section in chat; this document is for final review

## 1. Goal

Make the website page "🚀 B2B संधी व व्यावसायिक सौदे" (`/leads`) work end to end, and make it live:

- logged-in members post business requirements, and other logged-in members send quotes;
- everyone on `/leads` sees new requirements, quote counts and status changes without refreshing;
- the poster sees new quotes arrive straight away in a "My requirements" tab.

Website only; the mobile app gets this section later. The backend is the live Spring Boot API.
Nothing else may change for other features, for Node (the backup server) or for epay.

**Success criteria**

1. `/leads` lists real requirements from the database. Posting and quoting work for logged-in members.
2. With two browsers open, a new requirement, a new quote or a close shows on the other screen within about 2 seconds, without a refresh.
3. No phone number appears in any public reply or on the live channel.
4. The new automated tests pass, and the existing 62 tests and the Node comparison still pass.

## 2. Today

- The page exists (`frontend/src/pages/business/BusinessLeadsPortalPage.jsx`). It calls `GET /api/enquiries`,
  `POST /api/enquiries` and `POST /api/enquiries/{id}/quote`. None of these exist, in Java or in Node, so the
  page is always empty and posting fails.
- Three admin pages (SuperAdminDashboardPage, CEOPage, DistrictAdminCRM) call `GET /api/admin/enquiries-summary`
  (also missing) and expect `{ enquiries: [...] }` with `id, title, clientName, phone, category, city, district,
  budget, status, quotesCount`.

## 3. Decisions

| Topic | Decision |
|---|---|
| Who can post a requirement | Logged-in members only |
| Who can quote | Any logged-in member. A "✓ listed business" badge comes later, after directory businesses are linked to member accounts |
| Quoting your own requirement | Not allowed (403) |
| Duplicate quotes | One quote per member per requirement. Sending again updates it |
| Quote privacy | Only the poster sees quote details (amount, phone). Everyone else, admins included, sees only the number of quotes: no admin screen shows quote details yet, so no endpoint exposes them to admins |
| Poster's phone | Never shown to other members, quoting businesses included. Admins can see it |
| Live updates | Server-Sent Events (one-way), not WebSocket or polling |
| Status | `open` or `closed`. The poster or an admin can close or reopen |

## 4. Data

The same SQL goes in `database/migrations/008_enquiries.sql` and in Java's table creation on first use:

```sql
CREATE TABLE IF NOT EXISTS enquiries (
  id          TEXT PRIMARY KEY,
  member_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  city        TEXT,
  district    TEXT NOT NULL,
  budget      TEXT,
  client_name TEXT,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_enquiries_member  ON enquiries (member_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS enquiry_quotes (
  id             TEXT PRIMARY KEY,
  enquiry_id     TEXT NOT NULL REFERENCES enquiries (id) ON DELETE CASCADE,
  member_id      TEXT NOT NULL,
  business_name  TEXT NOT NULL,
  owner_name     TEXT,
  phone          TEXT NOT NULL,
  quote_amount   TEXT,
  proposal_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enquiry_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_enquiry_quotes_member ON enquiry_quotes (member_id);
```

- IDs are `ENQ-<milliseconds>` and `QT-<milliseconds>`, from the existing `Ids.millis`.
- `member_id` always comes from the login token, never from the request body.
- There is no foreign key to `members`, as in the existing tables. Account deletion removes the rows explicitly (§9).
- Java creates both tables the first time they are needed, following the `LazyTables` pattern, so there is no
  manual database step on the server. When Node next restarts with this migration file present, it runs the
  same no-op SQL and records `008` in `schema_migrations`.

## 5. API

Replies use the existing envelope. Errors are `{ success: false, code, error }` with Marathi and English text.

**Card (public shape):**

```json
{ "id": "ENQ-1792…", "title": "…", "description": "…", "category": "…", "city": "…",
  "district": "…", "budget": "…", "clientName": "…", "status": "open",
  "quotesCount": 2, "createdAt": "2026-10-24T08:00:00Z", "isMine": false, "quotedByMe": false }
```

`isMine` and `quotedByMe` are `false` when the caller is not logged in.

**Quote (only in `/mine`):** `{ id, businessName, ownerName, phone, quoteAmount, proposalNotes, createdAt, updatedAt }`

| Method and path | Login | Request | Success reply |
|---|---|---|---|
| `GET /api/enquiries?district=&category=` | optional | exact-match filters; empty or `सर्व` means all | 200 `{ success, count, enquiries: [card] }`, open first then newest first, at most 100 |
| `POST /api/enquiries` | member | `{ title, description, category, city, district, budget, clientName, phone }` | 201 `{ success, message, enquiry: card }` |
| `POST /api/enquiries/{id}/quote` | member | `{ businessName, ownerName, phone, quoteAmount, proposalNotes }` | 201 for a new quote, 200 for an update: `{ success, message, updated, quote }` |
| `GET /api/enquiries/mine` | member | none | 200 `{ success, count, enquiries: [card + phone + quotes: [quote]] }`, newest first |
| `PUT /api/enquiries/{id}/status` | poster or admin | `{ "status": "open" \| "closed" }` | 200 `{ success, enquiry: card }` |
| `GET /api/enquiries/stream` | none | none | `text/event-stream` (§6) |
| `GET /api/admin/enquiries-summary` | admin | none | 200 `{ success, count, enquiries: [card fields + phone + memberId] }` |

**Validation.** Unknown fields are a 400, and text is trimmed.

- Requirement: `title` required, 3–150 · `category` required, ≤100 · `district` required, ≤100 · `city` ≤100 ·
  `budget` ≤50 · `description` ≤2000 · `clientName` ≤100, defaulting to the member's name (or "सदस्य" when the
  profile has none) · `phone` optional, defaulting to the member's profile phone.
- Quote: `businessName` required, 2–150 · `phone` required · `ownerName` ≤100, defaulting to the member's name
  (or "सदस्य") · `quoteAmount` ≤50 · `proposalNotes` ≤2000. Updating a quote keeps its `created_at` and sets a
  new `updated_at`.
- Status: closing sets `closed_at`, reopening clears it. Setting the status it already has is allowed (200).
- Phone (both): spaces and dashes are removed, then it must match the existing `phone` format (an Indian mobile
  number with optional +91 or 0, or an international +… number).

**Rules and errors**

| Situation | Reply |
|---|---|
| Not logged in where login is required | 401 (existing behaviour) |
| Missing or invalid fields, or an invalid status value | 400 `VALIDATION_ERROR` |
| Requirement not found | 404 `ENQUIRY_NOT_FOUND` |
| Quoting your own requirement | 403 `OWN_ENQUIRY` |
| Quoting a closed requirement | 409 `ENQUIRY_CLOSED` |
| Status change by anyone other than the poster or an admin | 403 `NOT_OWNER` |
| Admin summary by a non-admin | 403 `ADMIN_ONLY` |
| More than 10 requirements per member in 24 hours, or more than 30 quotes per member in an hour | 429 `RATE_LIMIT_EXCEEDED` |
| More than 5 live connections from one IP, or more than 500 in total | 429 `RATE_LIMIT_EXCEEDED` |

"Admin" means the roles admin, superadmin and ceo (the existing `Roles.isAdmin`).

The per-member limits use fixed windows that start at the member's first post or quote, like the existing
limiters. They are kept in memory, so a restart resets them.

## 6. Live updates (SSE)

- `GET /api/enquiries/stream` replies with `text/event-stream`. On connect, the server sends `retry: 5000` and
  an event named `connected`. A heartbeat comment follows every 25 seconds. The server ends each connection
  after 30 minutes (`SseEmitter` timeout), and the browser reconnects by itself.
- Events:
  - `enquiry.created`: the public card (`isMine` and `quotedByMe` are `false`), sent when a requirement is posted.
  - `enquiry.updated`: `{ id, status, quotesCount }`, sent when a quote is added or updated, or the status changes.
- Private data (phones, quote amounts, member IDs) is never sent on the stream.
- Events go out only after the database transaction commits: the service publishes a Spring application event,
  and `@TransactionalEventListener(phase = AFTER_COMMIT)` relays it. The service methods are `@Transactional`.
  Sending happens on one background thread, so a slow client cannot delay the request that caused the event.
  A client whose send fails is dropped.
- Limits: 5 connections per IP and 500 in total. Over the limit, the server replies 429 before the stream starts.
- Connected clients are kept in memory behind a `LiveUpdates` interface (subscribe, publish). `SseLiveUpdates`
  is the only implementation. Running more than one Java server would need a shared channel such as Redis,
  which is out of scope.
- Missed events are not replayed. After a reconnect, the page reloads the list instead.
- Cloudflare: the heartbeats keep a quiet connection under Cloudflare's idle timeout. The browser must open the
  stream on `api.connectmaratha.com` directly, not through Vercel's `/api` rewrite. The existing open CORS
  policy applies, and `EventSource` is used without credentials.

## 7. Backend code layout

```
backend-java/src/main/java/com/connectmaratha/api/
  enquiry/
    controller/EnquiryController.java        /api/enquiries/**, including the stream
    controller/EnquiryAdminController.java   /api/admin/enquiries-summary
    service/EnquiryService.java              rules, transactions, publishes events
    service/PostingLimiter.java              per-member limits
    repository/EnquiryRepository.java        JdbcTemplate SQL, including the ON CONFLICT upsert for quotes
    dto/EnquirySchemas.java                  validation rules
    dto/EnquiryJson.java                     public, mine and admin shapes
    event/EnquiryCreated.java, event/EnquiryUpdated.java
    event/EnquiryLiveRelay.java              AFTER_COMMIT → LiveUpdates
  common/live/
    LiveUpdates.java, SseLiveUpdates.java
  common/schema/LazyTables.java              + ensureEnquiryTables()
  auth/service/AuthService.java              account deletion also removes enquiries and quotes
database/migrations/008_enquiries.sql
```

## 8. Website changes (frontend, `main` branch)

- `services/directApi.js`: export `apiUrl(path)`, which returns `https://api.connectmaratha.com` + path on the
  live hosts and the plain path elsewhere. `EventSource` does not go through the patched `fetch`.
- `services/api.js`: add `enquiries.mine()` and `enquiries.setStatus(id, status)`. `getAll`, `create` and
  `submitQuote` stay as they are.
- `hooks/useEnquiryStream.js` (new): opens `EventSource(apiUrl('/api/enquiries/stream'))`, exposes whether it
  is connected, calls handlers for `enquiry.created` and `enquiry.updated`, calls `onReconnect` after a
  reconnect, and closes when the page unmounts.
- `pages/business/BusinessLeadsPortalPage.jsx`:
  1. "Post a requirement" asks for login first and returns to `/leads`, as quoting already does.
  2. Status labels: `open` → "सक्रिय (Open)", `closed` → "पूर्ण (Closed)".
  3. On your own requirement, a "तुमची मागणी" badge replaces the quote button. If you have already quoted, the
     button reads "कोटेशन अपडेट करा". Closed requirements have no quote button.
  4. A new "माझ्या मागण्या" (My requirements) tab for logged-in members: your requirements with the quotes
     received (business, owner, phone as a `tel:` link, amount, notes, time) and a Close/Reopen button.
  5. Live: `enquiry.created` adds the card if it matches the current filters, never duplicating an id.
     `enquiry.updated` updates the card. If the requirement is yours, the "My requirements" tab refreshes, and
     when the quote count went up, `showToast('नवीन कोटेशन मिळाले!')` is shown. After a reconnect, the list
     reloads. A "● लाइव्ह" dot shows while connected.
- The admin pages are unchanged.

## 9. Account deletion

Deleting an account also deletes the member's quotes and the member's requirements. The quotes on those
requirements go with them (`ON DELETE CASCADE`). No live events are sent for this.

## 10. Testing

- **`EnquiryEndpointsTest`** (MockMvc, embedded PostgreSQL): posting needs a login; validation, including
  unknown fields and phone normalisation; the public list never contains a phone; `isMine` and `quotedByMe`
  are correct; quoting your own requirement → 403; quoting a closed one → 409; a second quote from the same
  member updates instead of adding (count stays 1, reply 200); `/mine` returns quotes with phones only to the
  owner; only the poster or an admin can change the status; the admin summary is admin-only; the 11th
  requirement in 24 hours → 429; account deletion removes requirements and quotes.
- **`EnquiryStreamTest`** (real HTTP on a random port): the stream starts with `connected`; posting a
  requirement delivers `enquiry.created` with no phone; a quote delivers `enquiry.updated` with
  `quotesCount: 1`; a rejected post (validation error) delivers nothing; the 6th connection from one IP → 429.
- Not part of `NodeParityTest`, because Node has no such feature.
- Website: `npm run build` passes, plus a two-browser check on the live site. Member A posts and member B sees
  the card appear. B quotes; A sees the toast and the quote under "माझ्या मागण्या". A closes; B's card turns
  "पूर्ण (Closed)" and loses its quote button.

## 11. Release and rollback

1. Java: PR to `main`, then `deploy/deploy-java.ps1`, then check `GET /api/enquiries` (200) and that the stream
   sends `connected` and heartbeats.
2. Website: PR to `main`; Vercel publishes it; then the two-browser check.

Rollback: revert the website PR on GitHub. For Java, `deploy-java.ps1` rolls back by itself when the new version
is unhealthy; after a successful deploy, revert the Java PR and run `deploy-java.ps1` again. The new tables stay;
unused, they do no harm. If traffic is ever switched back to Node, `/leads` stops working (Node has none of this),
which is accepted while Node is only the backup.

## 12. Out of scope

The mobile app · a "quotes I have sent" page · editing or deleting requirements · attachments · automatic expiry
of old requirements · paging beyond 100 · email or WhatsApp notifications · the "✓ listed business" badge
(needs directory owner-linking) · several Java servers (Redis) · replaying missed events.
