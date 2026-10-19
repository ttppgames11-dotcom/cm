# Connect Maratha API — Spring Boot

Java port of the Node backend in `../backend`. It runs **next to** the Node API
until every endpoint is ported and tested, then traffic switches over.
The Flutter app and the website keep calling the same `/api/...` addresses,
so neither needs changes.

## Run

```sh
mvn test                 # tests run on an embedded PostgreSQL 16 (no Docker needed)
mvn spring-boot:run      # http://localhost:5001/api/health
```

Settings (environment variables): `PORT` (default 5001), `DATABASE_URL`
(same value as the Node backend, postgres://...), `PGSSL`, `JWT_SECRET`
(must equal the Node backend's), `APP_PRODUCTION=true` on the server,
and the same `RATE_LIMIT_*` variables as Node.

## Building blocks

- **Entities** map existing tables; `ddl-auto: none` — JPA never changes the schema.
- **`@RequireAuth`** on a controller method = Node's `authenticateToken`; add a
  `CurrentUser` parameter to get the logged-in member (null when logged out).
- **`ApiException`** for expected errors: becomes `{ success:false, code, error }`.
- **`AuthRateLimiter.check(req, res)`** at the start of login/register/reset handlers.
- Tests extend **`PostgresTestBase`**: real PostgreSQL with the schema built from
  `../database/migrations`.

## Proving it matches Node

`NodeParityTest` starts the real Node backend (needs `node`, `../backend/node_modules` and
`../database/node_modules` — run `npm install --no-save` in `database/`) and the Java server on one
PostgreSQL, sends both the same requests, and diffs status, field names and messages. Run it for every
new group of endpoints: add a scenario to `javaAnswersLikeNode`. It also checks the cut-over case:
accounts, passwords and tokens made by one server work on the other.

## Deliberate differences from Node (all safer, none visible to the app or website)

- Reset-code tokens are not accepted as login tokens (Node accepted them for 15 minutes).
- OTPs come from SecureRandom, not Math.random; a reset code is never logged in production.
- Registration retries a taken member id instead of failing with a 500.
- Registration and the referral count update in one transaction.

## Known gaps found while porting

- Migration numbers clash (two `001_`, two `004_`) and run in name order; both Node and the tests
  tolerate this today. Rename them before building a database from scratch.
- The live `members` table may have columns beyond the `Member` entity (login returns `SELECT *`).
  Compare `d members` on the server with `MemberJson.ALL` before the cut-over.
- Tokens are not single-use: a password-reset token can be reused until it expires (15 min), as in Node.
- Forgot-password answers 404 for unknown emails, which lets anyone test who is registered (as in Node).

## Rules for the port

1. **Same contract.** Same paths, methods, status codes and JSON field names
   (`reference_id`, `total_referrals`, `success`, `error`, `code`, ...).
   One renamed field breaks a screen in the app or website.
2. **Same data.** Same PostgreSQL database and tables. No schema changes
   during the port; Java must not run migrations on the live database.
3. **Same logins.** Tokens and password hashes are interchangeable with
   Node — proven by `CompatibilityTest` (both directions). Nobody is logged
   out or locked out at the switch.
4. **Same security.** Keep every check the Node version has (owner-only
   profile edits, private contact details, Google token verification,
   report/block, rate limits, upload checks).
5. **Port with tests.** Each group is done when its responses match the
   Node backend for the same requests.

## Code layout (layered architecture)

Each request goes down through the layers and never skips one:

| Layer | Package | Job |
|---|---|---|
| Controller | `controller` | HTTP only: read the request, call one service method, return the reply. No rules, no SQL. |
| Service | `service` | The rules (who may do what, what to save). Works with entities and repositories. |
| Repository | `repository` | Database access only (Spring Data JPA, native SQL where the exact Node query matters). |
| Entity | `entity` | One class per database table. |
| DTO / mapping | `dto` | The JSON shapes sent back (same field names as the Node API) and validation schemas. |
| Support | `web`, `config`, `ratelimit`, `validation`, `schema`, `util` | Filters, error format, JWT, rate limits, input checks. |

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Project, health, JWT + bcrypt compatibility | ✅ done |
| 1 | Database access (JPA), error format, auth filter, rate limits | ✅ done |
| 2 | Auth: register, login, me, Google, password reset, delete account, referrals (+ per-account login backoff) | ✅ done — 11 endpoints, 80 replies match Node |
| 3 | Members, community (posts, likes, comments, report/block) | ✅ done — 14 endpoints, 133 replies match Node |
| 3b | Media upload (`/api/media`, `/media/:id`) | ⬜ next |
| 4 | Business: sangam, directories (builders, dairy), businesses, jobs, events, donations | ⬜ |
| 5 | Website features: AI, services, CRM; culture, quiz, locations, admin | ⬜ |
| 6 | Legacy `server.js` endpoints (blood, matrimony, ...) — port or retire | ⬜ |
| 7 | Run side by side on the server, compare, switch traffic, retire Node | ⬜ |

## Endpoint checklist

### admin.routes (3)

- [ ] `GET    /api/admin/audit-logs`
- [ ] `GET    /api/admin/metrics`
- [ ] `POST   /api/admin/verify-member/:id`

### ai.routes (3)

- [ ] `POST   /api/ai/chat`
- [ ] `GET    /api/ai/health`
- [ ] `POST   /api/ai/support  (also /api/ai/technical-support)`

### auth.routes (11)

- [x] `DELETE /api/auth/account`
- [x] `POST   /api/auth/delete-account`
- [x] `POST   /api/auth/forgot-password`
- [x] `POST   /api/auth/google`
- [x] `POST   /api/auth/login`
- [x] `GET    /api/auth/me`
- [x] `GET    /api/auth/referrals/my-referrals`
- [x] `GET    /api/auth/referrals/verify/:code`
- [x] `POST   /api/auth/register`
- [x] `POST   /api/auth/reset-password`
- [x] `POST   /api/auth/verify-reset-otp`

### businesses.routes (4)

- [ ] `GET    /api/businesses`
- [ ] `POST   /api/businesses`
- [ ] `GET    /api/businesses/:id`
- [ ] `POST   /api/businesses/:id/reviews`

### community.routes (10)

- [x] `GET    /api/community/blocks`
- [x] `POST   /api/community/blocks/:memberId`
- [x] `DELETE /api/community/blocks/:memberId`
- [x] `GET    /api/community/groups`
- [x] `POST   /api/community/groups/:id/join`
- [x] `GET    /api/community/posts`
- [x] `POST   /api/community/posts`
- [x] `POST   /api/community/posts/:id/comments`
- [x] `POST   /api/community/posts/:id/like`
- [x] `POST   /api/community/report`

### crm.routes (8)

- [ ] `GET    /api/admin/crm/community-centers`
- [ ] `POST   /api/admin/crm/community-centers`
- [ ] `POST   /api/admin/crm/community-centers/:id/checkin`
- [ ] `POST   /api/admin/crm/community-centers/:id/transaction`
- [ ] `GET    /api/admin/crm/tickets`
- [ ] `POST   /api/admin/crm/tickets`
- [ ] `PATCH  /api/admin/crm/tickets/:id/escalate`
- [ ] `PATCH  /api/admin/crm/tickets/:id/status`

### culture.routes (3)

- [ ] `GET    /api/culture/oral-history`
- [ ] `POST   /api/culture/oral-history`
- [ ] `GET    /api/culture/stats`

### directories.routes (12)

- [ ] `GET    /api/builders  (also /api/builders/builders)`
- [ ] `POST   /api/builders  (also /api/builders/builders)`
- [ ] `GET    /api/builders  (also /api/builders/dairy)`
- [ ] `POST   /api/builders  (also /api/builders/dairy)`
- [ ] `GET    /api/builders/:id  (also /api/builders/builders/:id)`
- [ ] `GET    /api/builders/:id  (also /api/builders/dairy/:id)`
- [ ] `POST   /api/builders/:id/enquiries  (also /api/builders/builders/:id/enquiries)`
- [ ] `POST   /api/builders/:id/registrations  (also /api/builders/dairy/:id/registrations)`
- [ ] `GET    /api/builders/:id/registrations  (also /api/builders/dairy/:id/registrations)`
- [ ] `GET    /api/builders/products  (also /api/builders/dairy/products)`
- [ ] `POST   /api/builders/products  (also /api/builders/dairy/products)`
- [ ] `POST   /api/builders/products/:id/enquiries  (also /api/builders/dairy/products/:id/enquiries)`

### donations.routes (4)

- [ ] `GET    /api/donations/campaigns`
- [ ] `GET    /api/donations/campaigns/:id`
- [ ] `POST   /api/donations/donate`
- [ ] `GET    /api/donations/recent`

### events.routes (4)

- [ ] `GET    /api/events`
- [ ] `POST   /api/events`
- [ ] `GET    /api/events/:id`
- [ ] `POST   /api/events/:id/rsvp`

### jobs.routes (4)

- [ ] `GET    /api/jobs`
- [ ] `POST   /api/jobs`
- [ ] `GET    /api/jobs/:id`
- [ ] `POST   /api/jobs/:id/apply`

### locations.routes (5)

- [ ] `GET    /api/locations/countries`
- [ ] `GET    /api/locations/districts`
- [ ] `GET    /api/locations/states`
- [ ] `GET    /api/locations/talukas`
- [ ] `GET    /api/locations/villages`

### media.routes (3)

- [ ] `GET    /api/media/:id`
- [ ] `POST   /api/media/:kind`
- [ ] `DELETE /api/media/profile`

### members.routes (5)

- [x] `GET    /api/members`
- [x] `GET    /api/members/:id`
- [x] `PUT    /api/members/:id`
- [x] `GET    /api/members/stats`
- [x] `GET    /api/members/stats/summary`

### quiz.routes (6)

- [ ] `GET    /api/quiz/categories`
- [ ] `GET    /api/quiz/daily`
- [ ] `GET    /api/quiz/leaderboard`
- [ ] `GET    /api/quiz/questions`
- [ ] `GET    /api/quiz/stats`
- [ ] `POST   /api/quiz/submit`

### sangam.routes (8)

- [ ] `GET    /api/sangam/meetings`
- [ ] `POST   /api/sangam/meetings`
- [ ] `PUT    /api/sangam/meetings/:id`
- [ ] `PUT    /api/sangam/meetings/:id/status`
- [ ] `GET    /api/sangam/metrics`
- [ ] `GET    /api/sangam/referrals`
- [ ] `POST   /api/sangam/referrals`
- [ ] `PUT    /api/sangam/referrals/:id/status`

### server.js (legacy db.json) (17)

- [ ] `GET    /api/bank/loans`
- [ ] `POST   /api/bank/loans`
- [ ] `GET    /api/blood/donors`
- [ ] `POST   /api/blood/donors`
- [ ] `GET    /api/blood/requests`
- [ ] `POST   /api/blood/requests`
- [ ] `GET    /api/doctors`
- [ ] `POST   /api/doctors`
- [ ] `GET    /api/health`
- [ ] `GET    /api/matrimony`
- [ ] `POST   /api/matrimony`
- [ ] `GET    /api/political/grievances`
- [ ] `POST   /api/political/grievances`
- [ ] `GET    /api/social/volunteers`
- [ ] `POST   /api/social/volunteers`
- [ ] `GET    /api/women/help`
- [ ] `POST   /api/women/help`

### services.routes (6)

- [ ] `GET    /api/admin/services`
- [ ] `POST   /api/admin/services`
- [ ] `PUT    /api/admin/services/:id`
- [ ] `DELETE /api/admin/services/:id`
- [ ] `GET    /api/services`
- [ ] `POST   /api/services/booking`
