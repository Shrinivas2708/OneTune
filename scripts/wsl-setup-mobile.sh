#!/usr/bin/env bash
# One-time WSL setup for local EAS / Expo Android builds.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"

echo "==> Install Linux-native Bun (not Windows bun on /mnt/c)"
if ! command -v bun >/dev/null 2>&1 || [[ "$(command -v bun)" == /mnt/c/* ]]; then
  curl -fsSL https://bun.sh/install | bash
  # shellcheck disable=SC1091
  source "$HOME/.bun/env"
fi
echo "Bun: $(command -v bun) ($(bun --version))"

echo "==> Clean install (no sudo)"
rm -rf node_modules apps/*/node_modules packages/*/node_modules

if [[ -f bun.lock ]]; then
  bun install
else
  echo "bun.lock missing — run: git checkout bun.lock"
  exit 1
fi

echo "==> Verify workspace links"
for pkg in api mobile config provider-core types ui utils; do
  target="$REPO_ROOT/node_modules/@OneTune/$pkg"
  if [[ ! -e "$target" ]]; then
    echo "Missing workspace link: $target"
    exit 1
  fi
done

echo "==> Done. Build with:"
echo "  cd apps/mobile"
echo "  eas build --profile development --platform android --local"
