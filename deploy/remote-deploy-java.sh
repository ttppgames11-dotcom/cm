#!/bin/sh
# Runs ON THE SERVER. Normally started by deploy/deploy-java.ps1 from your computer.
#
#   sh remote-deploy-java.sh /tmp/cm-java.tar
#
# Same safety steps as remote-deploy.sh, for the Spring Boot API (service api-java):
#   1. backs up the database
#   2. backs up the current Java code      (kept: the last 5)
#   3. remembers the running version      (image tag "previous")
#   4. replaces backend-java/ with the new code
#   5. rebuilds and restarts ONLY api-java (Node, postgres and epay are never touched)
#   6. waits until it answers its health check
#   7. if it does not: puts the old code and the old version back, and says so
set -eu

ROOT=/opt/connect-maratha
DEPLOY=$ROOT/deploy
JAVA=$ROOT/backend-java
TAR=${1:-/tmp/cm-java.tar}
STAMP=$(date +%Y%m%d-%H%M%S)
IMAGE=connect-maratha-api-java

say() { printf '\n== %s\n' "$1"; }

compose() { docker compose -f docker-compose.shared.yml -f ../backend-java/deploy/docker-compose.java.yml "$@"; }

healthy() {
  compose exec -T api-java wget -qO- http://localhost:5001/api/health >/dev/null 2>&1
}

# Spring Boot needs ~20 s to start, so wait up to 2 minutes.
wait_until_healthy() {
  i=0
  while [ "$i" -lt 60 ]; do
    if healthy; then return 0; fi
    i=$((i + 1))
    sleep 2
  done
  return 1
}

[ -f "$TAR" ] || { echo "Missing $TAR - nothing to deploy." >&2; exit 1; }
cd "$DEPLOY"

say "1/6 Backing up the database"
COMPOSE_FILE=docker-compose.shared.yml sh ./backup.sh

say "2/6 Backing up the current Java code"
CODE_BACKUP=$ROOT/java-backup-$STAMP.tgz
if [ -d "$JAVA" ]; then
  tar czf "$CODE_BACKUP" -C "$ROOT" backend-java
  echo "saved $CODE_BACKUP"
fi

say "3/6 Remembering the running version"
docker tag "$IMAGE:latest" "$IMAGE:previous" 2>/dev/null && echo "tagged $IMAGE:previous" || echo "(no earlier image to remember)"

say "4/6 Replacing backend-java with the new code"
# Remove first, so files deleted in Git do not linger on the server.
rm -rf "$JAVA"
tar -xf "$TAR" -C "$ROOT"
find "$JAVA" -name '*.yml' -o -name 'Dockerfile' | xargs sed -i 's/\r$//'
echo "done"

say "5/6 Rebuilding and restarting only the Java API (a few minutes; the API is briefly unavailable while it restarts)"
compose up -d --build --no-deps api-java

say "6/6 Waiting for the Java API to be healthy"
if wait_until_healthy; then
  echo "HEALTHY"
  ls -1t "$ROOT"/java-backup-*.tgz 2>/dev/null | tail -n +6 | xargs -r rm -f
  rm -f "$TAR"
  echo
  echo "DEPLOY OK ($STAMP)."
  exit 0
fi

echo
echo "!! The Java API did not become healthy. Putting the previous version back."
docker logs --tail 30 connect-maratha-api-java-1 2>&1 || true
if [ -f "$CODE_BACKUP" ]; then
  rm -rf "$JAVA"
  tar -xzf "$CODE_BACKUP" -C "$ROOT"
fi
if docker image inspect "$IMAGE:previous" >/dev/null 2>&1; then
  docker tag "$IMAGE:previous" "$IMAGE:latest"
  compose up -d --no-deps --no-build api-java
else
  compose up -d --build --no-deps api-java
fi
if wait_until_healthy; then
  echo "ROLLED BACK: the old version is running again. The new code was NOT kept."
else
  echo "ROLLBACK ALSO UNHEALTHY. Switch traffic to Node in Cloudflare (Service URL http://api:5000) and check: docker logs --tail 80 connect-maratha-api-java-1" >&2
fi
exit 1
