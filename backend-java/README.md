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
- The older community forms (blood donors, matrimony, grievances, volunteers, women's help, loans)
  save only the fields the website forms send, with type and size limits. Node saved any field, so a
  sender could set id, verified or createdAt. Doctors and blood requests were already strict.
- Grievances, women's help requests and loan applications are listed to admins only (401 without
  login, 403 for members). Node listed them publicly; no public page uses these lists.
- The public matrimony list leaves out phone numbers (the website does not show them).
- At most 20 form submissions per IP in 15 minutes (429 after that).
- Tested in PortalSecurityTest instead of the Node comparison.

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

## Code layout (package by feature, layers inside each feature)

```
com.connectmaratha.api
├── auth/        controller · service · dto
├── member/      controller · service · repository · entity · dto
├── community/   controller · service · repository · entity · dto
├── location/    service · repository · entity
├── mail/        service
├── health/      controller
└── common/      shared by every feature
    ├── exception/   ApiException, ValidationException, GlobalExceptionHandler
    ├── security/    JwtService, JwtAuthFilter, AuthInterceptor, CurrentUser, @RequireAuth
    ├── web/         WebConfig, JsonBody, ClientIp
    ├── ratelimit/   general + login limits (same numbers as Node, set by RATE_LIMIT_* env)
    ├── validation/  request schema checks (port of the Node validator)
    ├── config/      DATABASE_URL -> JDBC settings
    ├── schema/      tables Node creates on first use
    └── util/
```

Rules:
- A **controller** only handles HTTP: read the request, call one service method, return the reply.
- A **service** holds the rules (who may do what, what to save).
- A **repository** only talks to the database (Spring Data JPA; native SQL where the exact Node query matters).
- An **entity** maps one existing table. Hibernate never creates or changes tables (`ddl-auto: none`).
- A **dto** is the JSON shape sent back (same field names as the Node API) or a request schema.
- Errors are thrown as `ApiException` / `ValidationException`; `GlobalExceptionHandler` turns every
  error into the Node reply `{ success: false, code, error }` and hides internal details behind an `ERR-` id.
- A feature may use another feature's service or repository, never its controller.

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Project, health, JWT + bcrypt compatibility | ✅ done |
| 1 | Database access (JPA), error format, auth filter, rate limits | ✅ done |
| 2 | Auth: register, login, me, Google, password reset, delete account, referrals (+ per-account login backoff) | ✅ done — 11 endpoints, 80 replies match Node |
| 3 | Members, community (posts, likes, comments, report/block) | ✅ done — 14 endpoints, 133 replies match Node |
| 3b | Media upload (`/api/media`, `/media/:id`) | ✅ done — 188 replies match Node |
| 4 | Business: sangam, directories (builders, dairy), businesses, jobs, events, donations | ✅ done |
| 5 | Website features: AI assistant, services, CRM; culture, quiz, locations, admin | ✅ done |
| 6 | Older `server.js` endpoints (doctors, blood, matrimony, grievances, volunteers, women, loans) | ✅ done — moved from db.json to the database |
| 7 | Run side by side on the server, compare, switch traffic, retire Node | 🔶 Docker files ready (`Dockerfile`, `deploy/docker-compose.java.yml`); server steps pending |

## Endpoint checklist

### admin.routes (3)

- [x] `GET    /api/admin/audit-logs`
- [x] `GET    /api/admin/metrics`
- [x] `POST   /api/admin/verify-member/:id`
- [x] `GET    /api/admin/users`  (added to Node 2026-10-19)
- [x] `GET    /api/admin/users/:id`  (added to Node 2026-10-19)

### ai.routes (3)

- [x] `POST   /api/ai/chat`
- [x] `GET    /api/ai/health`
- [x] `POST   /api/ai/support  (also /api/ai/technical-support)`

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

- [x] `GET    /api/businesses`
- [x] `POST   /api/businesses`
- [x] `GET    /api/businesses/:id`
- [x] `POST   /api/businesses/:id/reviews`

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

- [x] `GET    /api/admin/crm/community-centers`
- [x] `POST   /api/admin/crm/community-centers`
- [x] `POST   /api/admin/crm/community-centers/:id/checkin`
- [x] `POST   /api/admin/crm/community-centers/:id/transaction`
- [x] `GET    /api/admin/crm/tickets`
- [x] `POST   /api/admin/crm/tickets`
- [x] `PATCH  /api/admin/crm/tickets/:id/escalate`
- [x] `PATCH  /api/admin/crm/tickets/:id/status`

### culture.routes (3)

- [x] `GET    /api/culture/oral-history`
- [x] `POST   /api/culture/oral-history`
- [x] `GET    /api/culture/stats`

### directories.routes (12)

- [x] `GET    /api/builders  (also /api/builders/builders)`
- [x] `POST   /api/builders  (also /api/builders/builders)`
- [x] `GET    /api/builders  (also /api/builders/dairy)`
- [x] `POST   /api/builders  (also /api/builders/dairy)`
- [x] `GET    /api/builders/:id  (also /api/builders/builders/:id)`
- [x] `GET    /api/builders/:id  (also /api/builders/dairy/:id)`
- [x] `POST   /api/builders/:id/enquiries  (also /api/builders/builders/:id/enquiries)`
- [x] `POST   /api/builders/:id/registrations  (also /api/builders/dairy/:id/registrations)`
- [x] `GET    /api/builders/:id/registrations  (also /api/builders/dairy/:id/registrations)`
- [x] `GET    /api/builders/products  (also /api/builders/dairy/products)`
- [x] `POST   /api/builders/products  (also /api/builders/dairy/products)`
- [x] `POST   /api/builders/products/:id/enquiries  (also /api/builders/dairy/products/:id/enquiries)`

### donations.routes (4)

- [x] `GET    /api/donations/campaigns`
- [x] `GET    /api/donations/campaigns/:id`
- [x] `POST   /api/donations/donate`
- [x] `GET    /api/donations/recent`

### events.routes (4)

- [x] `GET    /api/events`
- [x] `POST   /api/events`
- [x] `GET    /api/events/:id`
- [x] `POST   /api/events/:id/rsvp`

### jobs.routes (4)

- [x] `GET    /api/jobs`
- [x] `POST   /api/jobs`
- [x] `GET    /api/jobs/:id`
- [x] `POST   /api/jobs/:id/apply`

### locations.routes (5)

- [x] `GET    /api/locations/countries`
- [x] `GET    /api/locations/districts`
- [x] `GET    /api/locations/states`
- [x] `GET    /api/locations/talukas`
- [x] `GET    /api/locations/villages`

### media.routes (3)

- [x] `GET    /api/media/:id`
- [x] `POST   /api/media/:kind`
- [x] `DELETE /api/media/profile`

### members.routes (5)

- [x] `GET    /api/members`
- [x] `GET    /api/members/:id`
- [x] `PUT    /api/members/:id`
- [x] `GET    /api/members/stats`
- [x] `GET    /api/members/stats/summary`

### quiz.routes (6)

- [x] `GET    /api/quiz/categories`
- [x] `GET    /api/quiz/daily`
- [x] `GET    /api/quiz/leaderboard`
- [x] `GET    /api/quiz/questions`
- [x] `GET    /api/quiz/stats`
- [x] `POST   /api/quiz/submit`

### sangam.routes (8)

- [x] `GET    /api/sangam/meetings`
- [x] `POST   /api/sangam/meetings`
- [x] `PUT    /api/sangam/meetings/:id`
- [x] `PUT    /api/sangam/meetings/:id/status`
- [x] `GET    /api/sangam/metrics`
- [x] `GET    /api/sangam/referrals`
- [x] `POST   /api/sangam/referrals`
- [x] `PUT    /api/sangam/referrals/:id/status`

### server.js (legacy db.json) (17)

- [x] `GET    /api/bank/loans`
- [x] `POST   /api/bank/loans`
- [x] `GET    /api/blood/donors`
- [x] `POST   /api/blood/donors`
- [x] `GET    /api/blood/requests`
- [x] `POST   /api/blood/requests`
- [x] `GET    /api/doctors`
- [x] `POST   /api/doctors`
- [x] `GET    /api/health`
- [x] `GET    /api/matrimony`
- [x] `POST   /api/matrimony`
- [x] `GET    /api/political/grievances`
- [x] `POST   /api/political/grievances`
- [x] `GET    /api/social/volunteers`
- [x] `POST   /api/social/volunteers`
- [x] `GET    /api/women/help`
- [x] `POST   /api/women/help`

### services.routes (6)

- [x] `GET    /api/admin/services`
- [x] `POST   /api/admin/services`
- [x] `PUT    /api/admin/services/:id`
- [x] `DELETE /api/admin/services/:id`
- [x] `GET    /api/services`
- [x] `POST   /api/services/booking`
