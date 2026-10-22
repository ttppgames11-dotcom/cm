# Production runbook — Connect Maratha API

Status: **procedures documented, not yet executed against a production environment.**
Every "Verified" box below must be ticked by whoever performs it.

## 1. Environments

| | Development | Staging | Production |
|---|---|---|---|
| API URL | `http://<LAN-IP>:5000` | `https://staging-api.<domain>` | `https://api.<domain>` |
| Database | Docker Postgres (`docker compose up -d`, port 5442) | Separate managed DB | Separate managed DB |
| `NODE_ENV` | `development` | `production` | `production` |
| Secrets | `.env` (git-ignored) | Host secret store | Host secret store |

Production and staging **must not share** a database, JWT secret, Google client IDs
or Firebase project. Never commit `.env`, keystores or connection strings.

Required production variables: `NODE_ENV=production`, `DATABASE_URL`, `PGSSL=true`
(if the provider needs TLS), `JWT_SECRET` (≥ 48 random bytes), `GOOGLE_CLIENT_IDS`,
`CORS_ORIGINS`, `TRUST_PROXY` (number of proxies in front of the API).
The process refuses to start without `JWT_SECRET` in production.

## 2. Deploying a release

1. Tag the commit; CI runs `npm test --prefix backend` against **staging** (never production).
2. **Back up production** (section 3) and note the backup ID.
3. Deploy the staging build first and run the migrations there:
   `npm run migrate --prefix database` — verify `/api/health` and the app smoke test.
4. Repeat on production: run migrations **before** starting the new version
   (`DB_AUTO_MIGRATE` is off in production; the server never changes the schema at startup).
5. Verify: `GET /api/health` → `{"status":"OK"}`, log in with the reviewer account, delete-account
   flow on a throwaway account.
6. Watch error rate / latency for 30 minutes.

Migrations are additive (`database/migrations/NNN_*.sql`, applied once each, recorded in
`schema_migrations`). Destructive changes (DROP/TRUNCATE/type narrowing) need a separate,
reviewed two-step migration and a fresh backup.

## 3. Backups and restore

- Use the provider's automated daily backups **and** point-in-time recovery; retention ≥ 30 days.
- Before every migration take a manual logical backup:
  `pg_dump --format=custom --file=cm-$(date +%F).dump "$DATABASE_URL"`
- Store backups in a separate account/region from the database, encrypted at rest.
- **Restore drill (do quarterly, and once before launch):**
  1. `createdb cm_restore_test`
  2. `pg_restore --clean --if-exists --no-owner -d cm_restore_test cm-YYYY-MM-DD.dump`
  3. Point a staging API at it, run `npm test --prefix backend`, check row counts of
     `members`, `posts`, `donations`.
  4. Record the date and the time it took.
- [ ] Automated backups enabled — Verified: ______
- [ ] Restore drill completed — Verified: ______  (a backup that was never restored is unverified)

Deleted accounts remain in backups until they expire — keep retention short and say so in the privacy policy.

## 4. Rollback

- **Application:** redeploy the previous tag (migrations are additive, so the old code still runs).
- **Database:** only restore from backup for data corruption. Restore into a *new* database,
  verify, then switch `DATABASE_URL`; never restore over production in place.

## 5. Operations checklist

- [ ] HTTPS terminated in front of the API; HTTP redirected; HSTS enabled (helmet sets it behind HTTPS)
- [ ] Rate limits verified behind the proxy (`TRUST_PROXY` set so client IPs are real)
- [ ] Log shipping + alerting on 5xx rate, p95 latency, DB connections
- [ ] Uptime check on `/api/health`
- [ ] Rotate `JWT_SECRET` procedure: rotating logs everyone out (access tokens are 15 min; refresh tokens are
      stored hashed in the DB and remain valid) — revoke with `UPDATE refresh_tokens SET revoked_at = now()`.
- [ ] Demo/seed accounts (`M1001`–`M1008`, password `password123`) **removed** from the production database.
      Never run `seed.js` against production; create the first admin manually.

## 6. Known gaps to close before launch

- Legacy collections in `backend/db.json` (doctors, blood requests, matrimony, grievances, volunteers,
  women help, builders, bank loans) are stored in a JSON file: not durable, not backed up, not covered by
  account deletion. Migrate them to PostgreSQL or disable them for the first release.
- Donations are disabled (`POST /api/donations/donate` → 503). Enable only with a real payment gateway,
  server-side verification, idempotency keys, and completed legal/tax review (80G).
- No email/SMS service: there is no password reset or OTP verification. Members reset via support.
