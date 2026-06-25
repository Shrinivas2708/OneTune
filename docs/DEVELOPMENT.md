# VibeVault — Development Guide

> Day-to-day workflow for working on VibeVault locally.

---

## Prerequisites

Install before starting:

| Tool | Install |
|------|---------|
| [Bun](https://bun.sh) | `curl -fsSL https://bun.sh/install \| bash` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Required for backend stack |
| [Git](https://git-scm.com/) | Clone repo |
| Node (optional) | Expo tooling; Bun is primary |

For mobile later: [Expo CLI](https://docs.expo.dev/), EAS CLI, Xcode (iOS), Android Studio (Android).

---

## First-Time Setup

```sh
git clone <repo-url> vibevault
cd vibevault
bun install
cp .env.example .env
```

Start Docker Desktop, then:

```sh
docker compose up --build -d
```

Verify:

```sh
curl http://localhost:3000/health
```

---

## Daily Workflow

### Option A — Full stack script

```powershell
# Windows
.\scripts\dev.ps1
```

```sh
# macOS / Linux
./scripts/dev.sh
```

Starts Docker, waits for API health, runs `bun run dev --filter=@vibevault/mobile`.

### Option B — Manual (recommended while backend-only)

**Terminal 1 — Docker backend:**

```sh
docker compose up --build
```

**Terminal 2 — API hot reload (optional, outside Docker):**

```sh
cd apps/api
bun run dev
```

Uses local MongoDB at `mongodb://localhost:27017/vibevault` if you set that in `.env` instead of the Docker hostname.

**Terminal 3 — Mobile:**

```sh
bun run dev --filter=@vibevault/mobile
```

Set `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`). For Android emulator pointing at host API: `http://10.0.2.2:3000`.

**Native dev build (MMKV + playback):** Expo Go is not supported. From `apps/mobile`:

```sh
npx eas-cli build --profile development --platform android
# or --platform ios
npx expo start --dev-client
```

Web (`w` in Expo) works for auth and search; audio requires a dev build.

---

## Common Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all workspace dependencies |
| `bun run typecheck` | TypeScript check all packages |
| `bun run build` | Build all packages |
| `bun run dev --filter=@vibevault/api` | API with watch mode |
| `bun run dev --filter=@vibevault/mobile` | Expo dev server |
| `docker compose up -d` | Start backend in background |
| `docker compose down` | Stop backend |
| `docker compose logs -f api` | Follow API logs |
| `docker compose up --build -d` | Rebuild after Dockerfile changes |

---

## Testing the API (No UI)

### Health (no auth)

```sh
curl http://localhost:3000/health
curl http://localhost:3000/health/deps
```

### Auth

```powershell
.\scripts\test-auth.ps1
```

Or manually:

```sh
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@test.com","password":"password123","displayName":"You"}'
```

Save `data.tokens.accessToken` from the response.

### Unified search (auth required)

```powershell
.\scripts\test-search.ps1
```

Or with a token:

```sh
curl "http://localhost:3000/v1/search?q=believer&limit=5" \
  -H "Authorization: Bearer <accessToken>"
```

### Per-provider (dev only, no auth)

Only when `NODE_ENV=development`:

```sh
curl http://localhost:3000/v1/internal/providers
curl "http://localhost:3000/v1/internal/providers/jiosaavn/search?query=test&limit=3"
```

```powershell
.\scripts\test-providers.ps1
```

---

## Auth During Development

Search/stream routes require JWT (M5). The mobile app (M6) provides login/register screens that persist tokens via MMKV.

**Without the app:**

- Use `scripts/test-search.ps1` (auto-registers a test user)
- Use `scripts/test-auth.ps1`
- Use `/v1/internal/*` routes to test providers without auth (dev only)

---

## Environment Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | Yes | Template |
| `.env` | No (gitignored) | Your local secrets |

**Local API outside Docker** — use:

```env
MONGODB_URI=mongodb://localhost:27017/vibevault
EXTRACTOR_URL=http://localhost:8001
JIOSAAVN_URL=http://localhost:3001
SPOTIFY_URL=http://localhost:8003
```

You must expose provider ports in `docker-compose.yml` for host networking, or run API inside Compose (default).

---

## Working on Packages

Shared packages live in `packages/`. After changing one:

```sh
bun run typecheck --filter=@vibevault/types
bun run build --filter=@vibevault/utils
```

Turbo caches builds — run from repo root.

### Package dependency graph

```
types          (no internal deps)
config         → zod
utils          → types
provider-core  → types
ui             (standalone tokens)
api            → types, config, provider-core, utils
mobile         → types, ui, config
```

---

## Working on Python Services

### Extractor (yt-dlp)

```sh
cd services/extractor
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Spotify (SpotifyScraper)

```sh
cd services/spotify
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

---

## Git Conventions

```
feat(api): add playlist import endpoint
feat(mobile): add login screen
fix(extractor): handle expired youtube URLs
docs: update deployment guide
chore: bump yt-dlp
```

One logical change per commit. Split unrelated work.

---

## IDE Tips

- Open repo root in Cursor/VS Code
- TypeScript project references resolve via Bun workspaces
- Read `docs/MEMORY.md` at the start of each session
- For UI: read `docs/DESIGN.md` first

---

## Troubleshooting

See [DEPLOYMENT.md — Troubleshooting](./DEPLOYMENT.md#troubleshooting).

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Code structure |
| [API.md](./API.md) | Endpoints |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Docker / VPS |
