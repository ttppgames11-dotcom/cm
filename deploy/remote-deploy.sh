#!/bin/sh
# Runs ON THE SERVER. Normally started by deploy/deploy.ps1 from your computer.
#
#   sh remote-deploy.sh /tmp/cm-deploy.tar
#
# What it does, in order (it stops at the first problem):
#   1. backs up the database            (a bad update can always be undone)
#   2. backs up the current code        (kept: the last 5)
#   3. remembers the running version    (image tag "previous")
#   4. unpacks the new code over the old one (never touches .env, the data folder or the database file)
#   5. rebuilds and restarts ONLY the Connect Maratha API (epay is never touched)
#   6. waits until the API answers its health check
#   7. if it does not: puts the old code and the old version back, and says so
set -eu

ROOT=/opt/connect-maratha
DEPLOY=$ROOT/deploy
COMPOSE_FILE=docker-compose.shared.yml
TAR=${1:-/tmp/cm-deploy.tar}
STAMP=$(date +%Y%m%d-%H%M%S)
IMAGE=connect-maratha-api

say() { printf '\n== %s\n' "$1"; }

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

# 0 = the API answered "ok" to its health check from inside its own container
healthy() {
  compose exec -T api node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1
}

wait_until_healthy() {
  i=0
  while [ "$i" -lt 30 ]; do
    if healthy; then return 0; fi
    i=$((i + 1))
    sleep 2
  done
  return 1
}

[ -f "$TAR" ] || { echo "Missing $TAR - nothing to deploy." >&2; exit 1; }
[ -f "$DEPLOY/$COMPOSE_FILE" ] || { echo "Missing $DEPLOY/$COMPOSE_FILE" >&2; exit 1; }
cd "$DEPLOY"

say "1/6 Backing up the database"
COMPOSE_FILE=$COMPOSE_FILE ./backup.sh

say "2/6 Backing up the current code"
CODE_BACKUP=$ROOT/code-backup-$STAMP.tgz
tar czf "$CODE_BACKUP" -C "$ROOT" --exclude=node_modules --exclude='*.db' --exclude='*.tgz' --exclude='*.dump' backend database deploy
echo "saved $CODE_BACKUP"

say "3/6 Remembering the running version"
docker tag "$IMAGE:latest" "$IMAGE:previous" 2>/dev/null && echo "tagged $IMAGE:previous" || echo "(no earlier image to remember)"

say "4/6 Unpacking the new code"
# Server-only things are never overwritten: passwords (.env), the live data folder, the SQLite file, JSON data files.
tar -xf "$TAR" -C "$ROOT" \
  --exclude='deploy/.env' --exclude='deploy/.env.*' --exclude='deploy/cloudflared.env' --exclude='deploy/data' \
  --exclude='*.db' --exclude='backend/db.json' --exclude='backend/data_oral_history.json'
# Files made on Windows can carry carriage returns; scripts and Docker files must not.
for f in "$DEPLOY"/*.sh "$DEPLOY"/*.yml "$DEPLOY"/Dockerfile*; do
  [ -f "$f" ] && sed -i 's/\r$//' "$f"
done
echo "done"

say "5/6 Rebuilding and restarting only the Connect Maratha API"
compose up -d --build --no-deps api

say "6/6 Waiting for the API to be healthy"
if wait_until_healthy; then
  echo "HEALTHY"
  # keep only the 5 newest code backups
  ls -1t "$ROOT"/code-backup-*.tgz 2>/dev/null | tail -n +6 | xargs -r rm -f
  rm -f "$TAR"
  echo
  echo "DEPLOY OK ($STAMP). To undo: sh $DEPLOY/remote-rollback.sh"
  exit 0
fi

echo
echo "!! The API did not become healthy. Putting the previous version back."
tar -xzf "$CODE_BACKUP" -C "$ROOT"
if docker image inspect "$IMAGE:previous" >/dev/null 2>&1; then
  docker tag "$IMAGE:previous" "$IMAGE:latest"
  compose up -d --no-deps --no-build api
else
  compose up -d --build --no-deps api
fi
if wait_until_healthy; then
  echo "ROLLED BACK: the old version is running again. The new code was NOT kept."
else
  echo "ROLLBACK ALSO UNHEALTHY. Check: docker logs --tail 80 connect-maratha-api-1" >&2
fi
echo "Note: database changes (new tables/columns) are kept; they only add things and the old code ignores them."
exit 1
