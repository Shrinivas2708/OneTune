#!/usr/bin/env bash
# Renew Let's Encrypt certificates and reload nginx.
# Add to cron: 0 3 * * * /path/to/OneTune/scripts/renew-letsencrypt.sh

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose -f "$COMPOSE_FILE" --profile certbot run --rm certbot renew --quiet

docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo "Certificates renewed and nginx reloaded."
