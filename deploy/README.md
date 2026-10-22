# Deploying the Connect Maratha API to a VPS

One Linux server runs three containers: PostgreSQL, the API, and Caddy, which gets
HTTPS certificates automatically. It serves:

- `https://api.connectmaratha.com`: the API the mobile app calls
- `https://connectmaratha.com/privacy` and `/delete-account`: the pages Google Play requires

See also `docs/PRODUCTION_RUNBOOK.md` (backups, rollback) and `docs/ACCOUNT_DELETION.md`.

## 1. Server

- Ubuntu 24.04, **at least 2 GB RAM**, 1-2 vCPU, 25+ GB disk (for example a DigitalOcean
  $12/month droplet, a Hetzner CX22 or AWS Lightsail). Pick a region close to your users (Mumbai/Bangalore).
- Enable the provider's weekly server snapshots.
- Firewall: allow only 22 (SSH), 80 and 443.

```sh
# as root on the new server
adduser deploy && usermod -aG sudo deploy
curl -fsSL https://get.docker.com | sh && usermod -aG docker deploy
ufw allow OpenSSH && ufw allow 80 && ufw allow 443/tcp && ufw allow 443/udp && ufw enable
```

Use SSH keys and disable password login (`PasswordAuthentication no` in `/etc/ssh/sshd_config`).

## 2. DNS

At your domain registrar, create these records pointing to the server's IP address:

| Type | Name | Value |
|---|---|---|
| A | `@` | server IP |
| A | `www` | server IP |
| A | `api` | server IP |

Wait until `ping api.connectmaratha.com` shows the server's IP address before step 4.

## 3. Code and secrets

```sh
sudo mkdir -p /opt/connect-maratha && sudo chown deploy /opt/connect-maratha
git clone <your repo URL> -b feature/postgres /opt/connect-maratha
cd /opt/connect-maratha/deploy

cp env.prod.example .env && chmod 600 .env
openssl rand -hex 24   # paste as POSTGRES_PASSWORD
openssl rand -hex 48   # paste as JWT_SECRET
nano .env              # also set ACME_EMAIL and GOOGLE_CLIENT_IDS

# Legacy collections start EMPTY in production (the repo copies contain demo entries).
mkdir -p data && cp data-template/*.json data/ && sudo chown -R 1000:1000 data
```

Keep a copy of `.env` in your password manager. Losing `POSTGRES_PASSWORD` locks you out of the database.

## 4. Start

```sh
docker compose -f docker-compose.prod.yml up -d --build postgres
docker compose -f docker-compose.prod.yml run --rm api node database/migrate.js
docker compose -f docker-compose.prod.yml up -d --build
curl https://api.connectmaratha.com/api/health      # -> {"status":"OK",...}
```

**Never run `seed.js` in production.** It creates demo accounts with the password `password123`.
The production image does not include it.

## 5. First admin and Play reviewer account

1. Install the app from internal testing, then register your own account and a separate reviewer account.
2. Make your account an admin:
   ```sh
   docker compose -f docker-compose.prod.yml exec postgres \
     psql -U cm_user -d connect_maratha -c "UPDATE members SET role='admin' WHERE email='you@example.com';"
   ```
3. Put the reviewer account's login in Play Console → App content → App access.

## 6. Backups

```sh
chmod +x backup.sh && ./backup.sh           # test once
crontab -e                                   # add:
15 2 * * * /opt/connect-maratha/deploy/backup.sh >> /var/log/cm-backup.log 2>&1
```

Copy `/var/backups/connect-maratha` off the server every day (for example `rclone` to
Backblaze B2 or S3). Before launch, do one **restore drill**:

```sh
docker compose -f docker-compose.prod.yml exec -T postgres createdb -U cm_user cm_restore_test
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U cm_user -d cm_restore_test --no-owner < /var/backups/connect-maratha/cm-<date>.dump
```

## 7. Updating

```sh
cd /opt/connect-maratha && ./deploy/backup.sh && git pull
cd deploy
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml run --rm api node database/migrate.js
docker compose -f docker-compose.prod.yml up -d
```

Rollback: `git checkout <previous tag>` and repeat the build and `up` steps. Migrations are additive, so older code still runs.

## 8. Monitoring

Add a free uptime check (UptimeRobot or Better Stack) on `https://api.connectmaratha.com/api/health`.
To see logs: `docker compose -f docker-compose.prod.yml logs -f api`.
