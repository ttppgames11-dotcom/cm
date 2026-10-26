# Connect Maratha — Full-Stack Audit Report

**Date:** 2026-10-18 · **Branch:** `main` @ `58851d0` · **Scope:** `frontend/`, `backend/`, `database/`, deployment config, repo hygiene
**Method:** static code review plus read-only queries of the local `database/connect_maratha.db` and `backend/db.json`. No servers were started and no data was changed. Every finding comes from the code; none of the exploits was run against a live server.

---

## 0. Executive summary

The product covers a lot of ground: 326 frontend routes, 21 API route modules and 82 SQL tables spanning business, community, culture, CRM and emergency features. The **security model is broken**, though. Any visitor can currently:

1. **Log in as any member without a password.** The password check is skipped when no password is sent.
2. **Log in as superadmin** by typing `superadmin` as the identifier.
3. **Delete any member's account** without being logged in.
4. **Read every member's email and phone**, and read anyone's private messages.
5. **Watch a live stream of database changes**, including new members' password hashes.

There is also a deeper architecture problem. The app has **two databases that disagree** (a JSON file and SQLite), both kept entirely in memory and rewritten to disk on every write, while the production config runs **multiple processes**, each with its own copy. That setup is guaranteed to lose data.

The frontend works, but it ships as one **7.5 MB JavaScript bundle** with no code splitting, and it uses **947 MB of images**.

| Area | Grade | One-liner |
|---|---|---|
| Authentication & authorization | **F** | Passwordless login, master passwords, hardcoded admins, unauthenticated mutations |
| Data privacy | **F** | Public PII listing, unauthenticated SSE leak, PII + browser profiles committed to git |
| Database design | **D** | Dual source of truth, schema drift, 2 foreign keys across 82 tables, whole-file rewrites |
| Scalability / ops | **D** | Cluster mode + in-memory file DBs = split-brain; sync 42 MB disk write per query |
| Backend code quality | **C** | Parameterized SQL everywhere (good), but 2,000-line route files, inconsistent responses |
| Frontend architecture | **C+** | Clean React/Vite structure, but no lazy loading, 3.5 MB inline data, risky fetch fallback |
| Repo hygiene | **D** | 3 duplicated app trees, 1,250 Chrome-profile files tracked, ~30 one-off root scripts |

---

## 1. System map

```
Browser (React 18 + Vite 6 + React Router 6)   frontend/src  — 326 routes, 109 eager page imports
   │  fetchJson(): tries getBaseUrl → /api → localhost:5000 → api.connectmaratha.com
   ▼
Express 4 API (backend/server.js, port 5000)   21 route modules, ~13k LOC
   │  helmet · compression · CORS · sanitizer · response masker · in-memory rate limiter
   ├── realtimeDb.js  → backend/db.json        (JSON, 60+ collections, whole-file rewrite)
   └── database.js    → database/connect_maratha.db (sql.js in-memory SQLite, 42 MB)
                        or PostgreSQL if DATABASE_URL is set
   ▲
   AI agent (Python/uvicorn :8000) proxied by /api/ai
Deploy targets: Vercel (static + rewrite to api.connectmaratha.com) · Docker compose (nginx + node)
                · PM2 cluster "max" + custom load balancer (loadbalancer/balancer.js)
```

**Size:** 4,868 tracked files. About 157k LOC in `frontend/src`, of which about 30k is static data files.

---

## 2. Critical findings (fix before anything else)

| # | Finding | Location | Impact |
|---|---|---|---|
| C1 | **Password is optional at login.** The check runs only `if (password && member.password_hash)`. A request with just an email, phone or ID gets a valid 30-day JWT. **84 of 87** SQLite members also have no `password_hash` at all. | `backend/routes/auth.routes.js:317-323` | Takeover of any account |
| C2 | **Universal master passwords.** `password123` and `admin123` are accepted for any account, and `password123` is accepted for account deletion. Registration with no password sets the hash to `password123`. | `auth.routes.js:101, 294, 320, 700` | Takeover of any account |
| C3 | **Hardcoded official accounts.** If the identifier isn't in the DB, it is matched against 7 built-in profiles by phone, ID **or role name**. Logging in with `superadmin` and no password returns a superadmin token. | `auth.routes.js:282-306` | Full admin takeover |
| C4 | **Google login trusts the client.** `/api/auth/google` takes `email` from the request body and issues a token. No Google ID token is verified. | `auth.routes.js:350-389` | Takeover of any account |
| C5 | **Unauthenticated account deletion.** `/api/auth/delete-account` (POST and DELETE) finds the victim by id, email, phone or **partial ID substring**, and only needs `confirm: "DELETE"`. A password is optional. | `auth.routes.js:600-831` | Anyone can wipe any account |
| C6 | **Admin credentials shipped to every browser.** `AuthContext.jsx` contains a table of official IDs and passwords, plus master passwords, and forges unsigned tokens (`…official_sig`). CRM route guards trust the role stored in `localStorage`. | `frontend/src/context/AuthContext.jsx:72-140`, `components/auth/CRMProtectedRoute.jsx:44-53` | Credentials are public. Client-side "security" only |
| C7 | **Unauthenticated writes and IDOR.** Examples: `PUT /api/members/:id` (edit anyone's profile), `PATCH /api/businesses/:id/moderation` (approve or verify any business), `POST /api/admin/verify-member/:id` (`optionalToken`), and messages, where the user ID comes from the `x-user-id` header, query or body, so anyone can read or send DMs as anyone. Roughly **90 mutating endpoints** have no required auth. | `members.routes.js:591`, `businesses.routes.js:137`, `admin.routes.js:68`, `messages.routes.js:10-13` | Data tampering, privacy breach |
| C8 | **Realtime stream leaks raw records.** `GET /api/realtime/stream` is public (`Access-Control-Allow-Origin: *`) and pushes every `insert`/`update` item verbatim. Registration inserts the member **with `password_hash`**. The response masker only wraps `res.json`, not `res.write`. | `backend/server.js` (SSE handler), `db/realtimeDb.js` `insert`/`update` | Live PII and hash exfiltration |
| C9 | **Sensitive data committed to git.** `backend/db.json` (74 members' emails, phones and hashes, plus OTP codes, blacklisted tokens and audit logs), `server/db.json`, `database/connect_maratha.db`, and **1,250 files of Chrome profiles** (`scratch/chrome_test_profile*`, including `Login Data`, `Cookies` and `History`). `.gitignore` lists `scratch/`, but those files were tracked before the rule was added. | repo root | Data exposure to anyone with repo access |

---

## 3. High-severity findings

| # | Finding | Location |
|---|---|---|
| H1 | `GET /api/members` is public and returns `email` and `phone` for up to 500 members per call. `GET /api/members/:id` and `/:id/card` are public too. | `members.routes.js:60, 539, 568` |
| H2 | **Hardcoded JWT fallback secret** `connect_maratha_secret_key_2026` in 3 places. `server.js` never loads dotenv. `JWT_SECRET` is set only because `database/database.js` happens to be imported before `middleware/auth.js`. Any reordering silently switches to the public secret. | `middleware/auth.js:5`, `auth.routes.js:12, 620` |
| H3 | **Tokens are never revoked.** Role, tier and district are baked into a 30-day JWT. `verifySessionFreshness` (blacklist + live role check) and `enforceUserOwnership` exist but are **used nowhere**. Logout, account deletion and role demotion don't take effect until expiry. `requireRole` also always lets admin, ceo and superadmin through. | `middleware/dataIsolation.js`, `middleware/auth.js:55-66` |
| H4 | **Rate limiter is bypassable.** The client IP comes from `CF-Connecting-IP` or `X-Forwarded-For`, which the client can set. Counters are per-process memory, so N cluster workers give N× the limit. | `middleware/rateLimiter.js:28-36` |
| H5 | **Registration trusts client fields.** `memberId`/`id` let users pick their own (vanity/VIP) ID, and `isVip` self-grants VIP status. | `auth.routes.js:90-99` |
| H6 | **CORS mismatch.** Production only allows `*.connectmaratha.org`, but the API and site use `connectmaratha.com`. Outside production, every origin is allowed with `credentials: true`. | `middleware/security.js:42-56` |
| H7 | **Password reset email can never send.** `mailer.js` dynamically imports `nodemailer`, which isn't a dependency and isn't installed, and SMTP isn't configured. The OTP falls back to `console` output. | `backend/utils/mailer.js:18`, `backend/package.json` |

---

## 4. Database analysis

### 4.1 Two sources of truth
| Store | Engine | Holds | Read by |
|---|---|---|---|
| `backend/db.json` (1.4 MB) | Custom `RealtimeDatabase` (in-memory object, JSON file) | 60+ collections: doctors, blood, matrimony, CRM, audit logs, site content… | community, emergency, directories, CRM, delete-account, SSE |
| `database/connect_maratha.db` (42 MB) | sql.js (SQLite compiled to WASM, fully in memory) or PostgreSQL | 82 tables: members, referrals, quiz (26,000 Qs), messages, media BLOBs… | login, register, profile, messages, sangam, locations |

Members alone already differ: **87 in SQLite vs 74 in JSON**. Login reads SQLite while delete-account reads JSON. A "deleted" user can therefore still log in, and a SQLite-only user can't be deleted. Directory tables in SQLite (doctors, builders, blood…) are **empty (0 rows)**, and the real data lives only in JSON.

### 4.2 Durability and performance
- **sql.js writes the whole DB on every query.** `runQuery()` calls `saveDatabase()`, which runs `sqliteDb.export()` plus `fs.writeFileSync` of the **entire 42 MB file, synchronously, on the event loop**, for every insert or update. Under load this stalls every request.
- **JSON DB rewrites the whole file** on every change (50 ms debounce). The write isn't atomic: a stray `db.json.*.tmp` is present, and a crash mid-write corrupts the file. `touchUserActivity()` schedules a full save on **every authenticated request**.
- **Cluster mode guarantees data loss.** `ecosystem.config.cjs` runs `instances: 'max'` and `cluster.js` forks workers. Each worker loads its own copy of both files and overwrites the others' writes. SSE subscribers only see changes from their own worker.

### 4.3 Schema quality
- 82 tables and 179 indexes, but **only 2 `REFERENCES` clauses**, and `PRAGMA foreign_keys` is **off**, so there is no referential integrity. Orphaned referrals, RSVPs and messages are expected.
- `organizations` and `social_workers` are each defined **twice** in `schema.sql`.
- **Schema drift.** `members.verified_profile` exists in the live DB but **not in `schema.sql`**, yet `/api/auth/me` and `admin/verify-member` select or update it. On a fresh database built from the schema, those endpoints throw. Migrations happen through `ALTER TABLE` calls in `try {} catch {}` at startup. There is no migration history.
- **Location hierarchy is empty locally:** `countries`, `states`, `districts`, `talukas` and `villages` all have 0 rows. The README claims 44,810 villages. Registration's location validation is wrapped in `catch (_) {}`, so it silently does nothing.
- Dates are stored as `TEXT`, and booleans as mixed `INTEGER` and JSON `true`.
- **ID generation collides.** `` `${col}-${Date.now().toString().slice(-6)}` `` wraps around every ~16.7 minutes. As collections grow, `findById` returns the first match, which may be the wrong record. Member IDs `M100000–M999999` come from `Math.random` with no uniqueness retry, so a collision throws a PK error and registration fails.
- `toPgSql()` replaces **every** `?` (including inside string literals) and turns every `LIKE` into `ILIKE`, so the SQLite and Postgres paths behave differently.
- Image uploads are stored as BLOBs in the same DB, which bloats every full-file save.

### 4.4 What's good
- **Every SQL statement reviewed uses bound parameters.** No SQL injection was found.
- Passwords are hashed with bcrypt. Reset OTPs are hashed, expire after 10 minutes and allow 5 attempts.
- Upload MIME type is sniffed from magic bytes and limited to JPEG, PNG and WebP.

---

## 5. Backend code analysis

| Topic | Observation |
|---|---|
| Structure | 21 route modules. `admin.routes.js` (2,076 LOC) and `directories.routes.js` (1,951 LOC) mix many domains. There's no service or repository layer: SQL and JSON-DB calls sit inline in handlers. |
| Mounting | The same router is mounted at several prefixes: seva at `/api/v1` and `/api/seva`, CRM at `/api/crm` and `/api/admin/crm`, messages twice. `directoriesRoutes` and `emergencyRoutes` are mounted at `/api` root, which risks path collisions. |
| Route-order bug | `GET /api/businesses/my` never runs because `/:id` (line 46) is declared before `/my` (line 101). |
| Responses | Three shapes in use: `sendSuccess/sendError`, `{success, data}`, and `{success, member, data: member}`. Many handlers return `err.message` directly in a 500, bypassing `errorHandler`'s stack-hiding. |
| Middleware | Helmet CSP allows `'unsafe-inline' 'unsafe-eval'`, which weakens it. The sanitizer rewrites all input, passwords included (e.g. it strips `on…=` and `javascript:`). It's consistent on register and login, but it changes user content. `hasSqlInjection` and `mutationRateLimiter` are defined but never used. |
| Health | `/api/health` publicly exposes heap and RSS numbers. It's minor, but it gives attackers useful information. |
| Tests | No unit or integration test framework. Only ad-hoc `test-*.mjs` scripts at the root. No CI. |

---

## 6. Frontend analysis

| Topic | Observation |
|---|---|
| Stack | React 18.3, Vite 6, React Router 6.28, with Context for auth, scope, language, site content and toasts. The folder structure is clean (`pages/<domain>`, `components`, `services`, `context`). |
| Bundle | **326 `<Route>`s, 109 page imports, 0 `React.lazy`.** The main chunk `dist/assets/index-*.js` is **7.5 MB** (≈2 MB gzipped), so every visitor downloads every admin CRM page. `src/data` adds 3.5 MB of inline datasets (`collegesData.js` alone is 21k lines). |
| Images | `frontend/public/assets/images` is **947 MB**, with 107 files over 2 MB. There are also many timestamped duplicate copies (e.g. `maratha_*_hero.jpg` plus `maratha_*_hero_17900…jpg`). |
| Build output | The root `build` script copies `frontend/dist` into `dist/` without cleaning it first, so old bundles pile up (**`dist/` is 1.1 GB**). |
| API client | `fetchJson()` tries 4 base URLs in sequence and retries on **any** error, including 4xx, 5xx and non-idempotent POSTs. A failed or slow write can be **sent again** to the next URL, and a dev machine falls through to the **production** API. `vite.config.js` also proxies `/api` to production by default. |
| Auth state | Token, user object and `cm_logged_in` flag live in `localStorage` (127 `localStorage` uses in total). That's acceptable for UX only if the server enforces auth, and right now it doesn't (see C6/C7). |
| XSS | Good news: **0 `dangerouslySetInnerHTML`** and 1 `innerHTML` assignment. React escaping covers the rest. |
| Dead code | `services/dataStore.js` (278 LOC of seed data) is imported by nothing. `react_version/` is an older 25-file copy. |

*The home page was left out of the recommendations on purpose. It's treated as finalized.*

---

## 7. Repo and deployment hygiene

- **Three diverged copies of the app:** `frontend/src` vs root `src/` (27 files differ, and the root copy is missing `pages/ai`), `backend/` vs `server/` (5 route files differ, and `server/` lacks the AI and seva routes), plus `react_version/`. Root `public/` is deleted on disk but still has 984 tracked files. It isn't clear which copy is canonical. `Dockerfile.backend` uses `backend/`.
- About 30 one-off scraper and download scripts at the repo root (`download_*.cjs`, `fetch_*.cjs`, `search_*.cjs`), plus `scripts/`.
- Binary clutter: three identical 15 MB `.docx` profiles, Office lock files (`~$*.docx`), a stray empty file named `=`, 7 MB screenshots named `UsersYashraj Sathe…png`, `ai_venv/`, and two copies of `Connect-Maratha-AI-Agent`.
- The Docker image copies the whole `database/` folder, including the 42 MB DB, into the image and mounts it as a volume. Compose sets no `JWT_SECRET`, so the hardcoded fallback is used (H2).
- There are 3 deployment paths (Vercel, Docker/nginx, PM2 cluster + custom LB) and none is documented as canonical.

---

## 8. Recommended roadmap

### Phase 1: Stop the bleeding (1–3 days)
1. **Fix auth (backend):** make the password mandatory, delete master passwords and hardcoded official profiles, and create real admin accounts in the DB with strong passwords. Make `/auth/google` verify the Google ID token (`google-auth-library`) or disable it.
2. **Delete the credential table and token forging from `AuthContext.jsx`.** The frontend should only store what the server returns.
3. **Make the app refuse to start without `JWT_SECRET`.** Add `import 'dotenv/config'` at the top of `server.js` and remove all fallbacks.
4. **Require `authenticateToken` plus an ownership or role check on every POST, PUT, PATCH and DELETE.** Wire in the existing `enforceUserOwnership` and `verifySessionFreshness`. Take the user ID only from `req.user`, never from headers, query or body.
5. **Lock down or remove `/api/realtime/stream`:** require auth, and emit only `{collection, action, id}`.
6. **Require auth for `delete-account`,** plus a password or OTP re-check.
7. **Strip `email` and `phone` from public member endpoints.**
8. **Clean the repo:** `git rm --cached` the DB files, `server/db.json` and `scratch/`. Treat the leaked data as exposed: rotate secrets, purge history with `git filter-repo` if the repo has ever been shared, and **force a password reset for all members** (84 have no hash).
9. Trust `X-Forwarded-For` only through Express `trust proxy` (`req.ip`). Fix the CORS domain to `.com`.

### Phase 2: One database (1–2 weeks)
1. Choose **PostgreSQL** (`database.js` already supports it). Migrate every `db.json` collection into tables and delete `realtimeDb.js` writes.
2. Until that's done, **run a single process** (`instances: 1`, no `cluster.js` or LB).
3. Adopt a migration tool (node-pg-migrate, Knex or Drizzle). Fix the duplicate tables and `verified_profile` drift, add foreign keys, and use `TIMESTAMPTZ` and `BOOLEAN`.
4. Use UUIDs or DB sequences for IDs. Seed the location hierarchy, or remove the dead validation.
5. Move media BLOBs to object storage (S3, R2 or Cloudinary).

### Phase 3: Performance and maintainability (2–4 weeks)
1. `React.lazy` + `Suspense` per route group, especially admin/CRM. The target initial JS is under 400 KB gzipped.
2. Move the big `src/data/*` datasets to JSON fetched on demand or to API endpoints.
3. Image pipeline: convert to WebP/AVIF, cap at around 300 KB, delete the timestamped duplicates, and serve from a CDN.
4. Make the `fetchJson` fallback retry only on network errors and only for GET. Point the dev proxy at localhost.
5. Delete `src/`, `server/`, `react_version/`, `public/` and `dataStore.js` once the canonical tree is confirmed. Move scrapers into `scripts/`.
6. Split the 2,000-line route files into a service layer and use a single response helper.
7. Add Vitest + Supertest for auth and ownership tests, ESLint, and a GitHub Actions CI.

---

### Appendix: numbers at a glance
| Metric | Value |
|---|---|
| Tracked files | 4,868 (1,250 are Chrome profile data) |
| API route modules / route definitions | 21 / ~300 |
| Mutating endpoints without required auth | ~90 |
| SQL tables / indexes / foreign keys | 82 / 179 / 2 |
| SQLite members / without password hash | 87 / 84 |
| JSON DB members | 74 |
| Quiz questions | 26,000 |
| Frontend routes / lazy routes | 326 / 0 |
| Main JS bundle | 7.5 MB |
| Public images | 947 MB (107 files > 2 MB) |
| `dist/` on disk | 1.1 GB |
