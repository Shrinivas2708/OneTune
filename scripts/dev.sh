#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies..."
bun install

echo "==> Starting Docker services..."
docker compose up --build -d

echo "==> Waiting for API health..."
until curl -sf http://localhost:3000/health > /dev/null; do
  sleep 2
done

echo "==> OneTune stack is ready."
echo "    API:       http://localhost:3000/health"
echo "    MongoDB:   localhost:27017"
echo ""
echo "==> Starting mobile dev server..."
bun run dev --filter=@OneTune/mobile
