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

## Known gaps found while porting

- `004_password_resets.sql` and `005_media.sql` exist only on the server, not in git.
  `members.photo` comes from 005; tests add it by hand. Copy both files into
  `database/migrations`.

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

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Project, health, JWT + bcrypt compatibility | ✅ done |
| 1 | Database access (JPA), error format, auth filter, rate limits | ✅ done |
| 2 | Auth: register, login, me, Google, password reset, delete account, referrals (+ per-account login backoff) | ⬜ |
| 3 | Members, community (posts, likes, comments, report/block), media upload | ⬜ |
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

- [ ] `DELETE /api/auth/account`
- [ ] `POST   /api/auth/delete-account`
- [ ] `POST   /api/auth/forgot-password`
- [ ] `POST   /api/auth/google`
- [ ] `POST   /api/auth/login`
- [ ] `GET    /api/auth/me`
- [ ] `GET    /api/auth/referrals/my-referrals`
- [ ] `GET    /api/auth/referrals/verify/:code`
- [ ] `POST   /api/auth/register`
- [ ] `POST   /api/auth/reset-password`
- [ ] `POST   /api/auth/verify-reset-otp`

### businesses.routes (4)

- [ ] `GET    /api/businesses`
- [ ] `POST   /api/businesses`
- [ ] `GET    /api/businesses/:id`
- [ ] `POST   /api/businesses/:id/reviews`

### community.routes (10)

- [ ] `GET    /api/community/blocks`
- [ ] `POST   /api/community/blocks/:memberId`
- [ ] `DELETE /api/community/blocks/:memberId`
- [ ] `GET    /api/community/groups`
- [ ] `POST   /api/community/groups/:id/join`
- [ ] `GET    /api/community/posts`
- [ ] `POST   /api/community/posts`
- [ ] `POST   /api/community/posts/:id/comments`
- [ ] `POST   /api/community/posts/:id/like`
- [ ] `POST   /api/community/report`

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

- [ ] `GET    /api/members`
- [ ] `GET    /api/members/:id`
- [ ] `PUT    /api/members/:id`
- [ ] `GET    /api/members/stats`
- [ ] `GET    /api/members/stats/summary`

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
