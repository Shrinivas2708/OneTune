#!/usr/bin/env bash
# Obtain or renew Let's Encrypt certificates for OneTune nginx.
# Run on the VPS from the repository root.
#
# Prerequisites:
#   - DNS A record for OneTune_DOMAIN → this server
#   - docker compose -f docker-compose.prod.yml up -d (HTTP bootstrap)
#   - .env with OneTune_DOMAIN and CERTBOT_EMAIL
#
# Usage:
#   ./scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh --staging   # test with Let's Encrypt staging

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
STAGING=0

for arg in "$@"; do
  case "$arg" in
    --staging) STAGING=1 ;;
  esac
done

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example and configure OneTune_DOMAIN, CERTBOT_EMAIL, JWT_SECRET"
  exit 1
fi

# shellcheck disable=SC1091
source .env

if [ -z "${OneTune_DOMAIN:-}" ] || [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "Set OneTune_DOMAIN and CERTBOT_EMAIL in .env"
  exit 1
fi

STAGING_ARG=()
if [ "$STAGING" -eq 1 ]; then
  STAGING_ARG=(--staging)
  echo "Using Let's Encrypt staging (untrusted cert — for testing only)"
fi

echo "Requesting certificate for ${OneTune_DOMAIN}..."

docker compose -f "$COMPOSE_FILE" --profile certbot run --rm certbot certonly --webroot -w /var/www/certbot \
  "${STAGING_ARG[@]}" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$OneTune_DOMAIN"

echo ""
echo "Certificate obtained. Enable HTTPS:"
echo "  1. Set USE_HTTPS=true in .env"
echo "  2. docker compose -f $COMPOSE_FILE up -d --force-recreate nginx"
echo "  3. Set EXPO_PUBLIC_API_URL=https://${OneTune_DOMAIN} for mobile builds"
