#!/bin/sh
# Runs ON THE SERVER. Puts back the code from the newest code backup and restarts only the API.
#
#   sh remote-rollback.sh                 # the newest backup
#   sh remote-rollback.sh code-backup-20261022-121500.tgz
#
# Use it when a deploy went through but you find a problem afterwards.
set -eu

ROOT=/opt/connect-maratha
DEPLOY=$ROOT/deploy
COMPOSE_FILE=docker-compose.shared.yml
cd "$DEPLOY"

BACKUP=${1:-$(ls -1t "$ROOT"/code-backup-*.tgz 2>/dev/null | head -n 1)}
case "$BACKUP" in /*) ;; *) BACKUP=$ROOT/$BACKUP ;; esac
[ -f "$BACKUP" ] || { echo "No code backup found." >&2; exit 1; }

echo "Putting back the code from $BACKUP"
tar -xzf "$BACKUP" -C "$ROOT"
for f in "$DEPLOY"/*.sh "$DEPLOY"/*.yml "$DEPLOY"/Dockerfile*; do
  [ -f "$f" ] && sed -i 's/\r$//' "$f"
done
docker compose -f "$COMPOSE_FILE" up -d --build --no-deps api

i=0
while [ "$i" -lt 30 ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T api node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
    echo "ROLLED BACK and healthy."
    exit 0
  fi
  i=$((i + 1))
  sleep 2
done
echo "Restarted, but the API is not healthy yet. Check: docker logs --tail 80 connect-maratha-api-1" >&2
exit 1
