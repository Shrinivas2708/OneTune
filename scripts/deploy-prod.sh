#!/usr/bin/env bash
# Pull latest code and restart the production stack.
# Usage: ./scripts/deploy-prod.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="docker-compose.prod.yml"

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example first"
  exit 1
fi

echo "Pulling latest changes..."
git pull --ff-only

echo "Building and starting production stack..."
docker compose -f "$COMPOSE_FILE" up --build -d

docker image prune -f

echo "Deployment complete."
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Health check:"
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
curl -fsS "http://localhost/health" 2>/dev/null \
  || curl -fsS "https://${VIBEVAULT_DOMAIN:-localhost}/health" 2>/dev/null \
  || echo "(run curl manually once DNS/TLS is configured)"
