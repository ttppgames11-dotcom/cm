# Deploying the Connect Maratha API

One command, from your computer (PowerShell):

```powershell
cd E:\community_mobile_main
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1
```

It asks you to type `YES` before it does anything.

## What happens
1. Gets the latest `main` from GitHub (it refuses to run if you are on another branch or have uncommitted changes in backend/database/deploy).
2. Packs `backend`, `database` and `deploy` exactly as they are on `main`.
3. Uploads the pack and `deploy/remote-deploy.sh` to the server.
4. On the server, `remote-deploy.sh`:
   - backs up the database (`backup.sh`) - stops if that fails;
   - backs up the current code (`code-backup-<time>.tgz`, the last 5 are kept);
   - remembers the running Docker image as `connect-maratha-api:previous`;
   - unpacks the new code. Never overwritten: `deploy/.env*`, `deploy/data`, `*.db`, `backend/db.json`, `backend/data_oral_history.json`;
   - rebuilds and restarts **only** the `api` container (epay is never touched);
   - waits up to 60 s for the health check;
   - if it never becomes healthy: puts the old code and the old image back and says "ROLLED BACK".
5. Calls `https://api.connectmaratha.com/api/health`.

## Undo a deploy that "worked" but turned out wrong
```powershell
ssh root@200.234.43.252 "sh /opt/connect-maratha/deploy/remote-rollback.sh"
```
(Run `remote-deploy.sh` once first so the rollback script is on the server.)
Database changes (new tables/columns from migrations) stay; they only add things.

## Good to know
- Wait about 30 s after a deploy before testing; the API restarts.
- Server passwords live only in `/opt/connect-maratha/deploy/.env` on the server. They are never in git.
- To restore the database itself, use the dump the script made (`/var/backups/connect-maratha/`).
