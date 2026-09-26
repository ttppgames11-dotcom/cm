#!/bin/sh
# Daily PostgreSQL + legacy JSON backup. Install with cron (see deploy/README.md):
#   15 2 * * * /opt/connect-maratha/deploy/backup.sh >> /var/log/cm-backup.log 2>&1
# Copy the backups OFF this server (e.g. rclone to object storage) - a backup on the
# same disk as the database does not survive losing the server.
set -eu

cd "$(dirname "$0")"
DEST=${BACKUP_DIR:-/var/backups/connect-maratha}
KEEP_DAYS=${KEEP_DAYS:-30}
STAMP=$(date +%F-%H%M)

mkdir -p "$DEST"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U cm_user -d connect_maratha --format=custom > "$DEST/cm-$STAMP.dump"
tar -czf "$DEST/cm-json-$STAMP.tar.gz" -C data .

# Refuse to keep an empty dump.
[ -s "$DEST/cm-$STAMP.dump" ] || { echo "backup $STAMP is empty" >&2; exit 1; }

find "$DEST" -name 'cm-*' -mtime +"$KEEP_DAYS" -delete
echo "backup $STAMP ok"
