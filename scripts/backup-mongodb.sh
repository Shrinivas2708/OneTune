#!/usr/bin/env bash
# Dump MongoDB to ./backups/vibevault-YYYY-MM-DD/
# Run from repository root on the VPS or any host with Docker access.

set -euo pipefail

CONTAINER="${MONGODB_CONTAINER:-vibevault-mongodb}"
DB="${MONGO_INITDB_DATABASE:-vibevault}"
STAMP="$(date +%F-%H%M)"
OUT_DIR="backups/vibevault-${STAMP}"

mkdir -p "$OUT_DIR"

echo "Backing up ${DB} from ${CONTAINER} → ${OUT_DIR}"

docker exec "$CONTAINER" mongodump --db "$DB" --out "/data/db-backup-${STAMP}"

docker cp "${CONTAINER}:/data/db-backup-${STAMP}/${DB}" "${OUT_DIR}/"

docker exec "$CONTAINER" rm -rf "/data/db-backup-${STAMP}"

echo "Backup complete: ${OUT_DIR}"
echo "Copy off-server: scp -r ${OUT_DIR} user@backup-host:/path/"
