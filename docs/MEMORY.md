# OneTune — Session Memory

> **Read this first in every new session.** Living handoff document — update after every milestone.

**Last updated:** 2026-07-02 · **Current milestone:** M16 complete — production polish + marketing site

---

## What Is OneTune?

Self-hosted, multi-provider music + music-video app for **iOS & Android**. Friends/household share a **VPS** with individual accounts. **Unified search** across providers is the product identity.

| Area | Decision |
|------|----------|
| Mobile | Expo 54, local Android builds, NativeWind, TanStack Query, Zustand, track-player |
| Backend | Node/Bun API (Hono) + Python extractor (yt-dlp) + self-hosted JioSaavn API |
| Database | MongoDB (local Docker, **Atlas on Render**, or VPS) |
| Monorepo | Turborepo + Bun workspaces |
| Streaming | **Option A** — direct client URLs; `StreamManifest.deliveryMode` allows future proxy |
| Downloads | Device-only; server orchestrates |
| Providers | Adapter pattern — SpotifyScraper, yt-dlp, JioSaavn (no official APIs) |
| Design | `docs/DESIGN.md` — Spotify-inspired dark UI, Inter + Plus Jakarta Sans |

---

## Repository Layout

```
apps/mobile/          Expo app
apps/api/             Hono API on Bun
website/              React + Vite marketing site (Android download landing)
services/extractor/   Python FastAPI + yt-dlp
services/jiosaavn/    Docker build from upstream repo
packages/
  types/              Zod schemas + inferred TypeScript types
  config/             Constants, feature flags, server env (./server export)
  provider-core/      MusicProvider interface + ProviderRegistry
  ui/                 Design tokens + Tailwind preset
  utils/              Shared pure helpers
docs/                 ARCHITECTURE, DESIGN, DECISIONS, ROADMAP, MEMORY, DEVELOPMENT, IMPLEMENTATION, DEPLOYMENT, DEPLOYMENT-RENDER, API
docker/               Dockerfiles
render.yaml           Render Blueprint (API + providers)
scripts/dev.ps1       Windows dev bootstrap
scripts/sync-website-apk.ps1   Copy release APK → website/public/downloads/
patches/              react-native-track-player new-arch fix
```

---

## Completed Milestones

### M1 — Monorepo & Infrastructure ✅
- Turborepo + Bun workspaces
- Expo moved to `apps/mobile`
- Hono API with `/health` and `/health/deps`
- Python extractor with `/health`
- JioSaavn via `docker/jiosaavn.Dockerfile` (clones upstream, port 3000 internal)
- `docker-compose.yml`: api, extractor, jiosaavn, mongodb
- Requires **Docker Desktop** running for full stack

### M2 — Shared Packages ✅
- Full Zod schemas in `@OneTune/types`
- Server env validation in `@OneTune/config/server`
- Complete `MusicProvider` contract in `@OneTune/provider-core`
- Design tokens + Tailwind preset in `@OneTune/ui`
- Utils: duration formatting, track key normalization, pagination helpers

### M3 — API Foundation ✅
- Hono middleware pipeline: request ID, CORS, global error handler
- Structured logging via **pino** with `X-Request-Id` propagation
- MongoDB (`users`, `refreshSessions` collections with indexes)
- JWT auth (access 15min + refresh 7d with rotation)
- Routes: `POST /v1/auth/register|login|refresh|logout`, `GET /v1/auth/me`
- Test script: `scripts/test-auth.ps1`

### M4 — Provider Layer ✅
- **Extractor** (Python/yt-dlp): metadata, search, stream, download, playlist
- **Spotify service** (Python/SpotifyScraper): search, metadata, playlist import
- **Node adapters**: `youtube`, `jiosaavn`, `spotify` → normalized DTOs
- **Provider registry** wired at API startup
- **Internal test routes** (dev only): `/v1/internal/providers/*`
- Test script: `scripts/test-providers.ps1`

**Provider capabilities:**
| Provider | Search | Stream | Download | Playlist | Video |
|----------|--------|--------|----------|----------|-------|
| youtube | ✓ | ✓ | ✓ | ✓ | ✓ |
| jiosaavn | ✓ | ✓ | ✓ | ✓ | ✗ |
| spotify | ✓ | ✗ | ✗ | ✓ | ✗ |

**Docker services:** api, extractor, jiosaavn, spotify, mongodb

### M5 — Unified Search ✅
- `GET /v1/search?q=&page=&limit=` — parallel fan-out, dedupe, rank (auth required)
- `GET /v1/tracks/:providerId/:externalId` — metadata
- `POST /v1/stream/resolve` — StreamManifest
- `POST /v1/downloads/resolve` — DownloadManifest
- Per-provider timeouts (JioSaavn 5s, Spotify 4s, YouTube 6s) + 2min in-memory cache
- Dedup prefers **jiosaavn > youtube > spotify** for same title/artist
- Test script: `scripts/test-search.ps1`

### M6 — Mobile Shell ✅
- Local Android build scripts (`apps/mobile/scripts/`)
- Expo Router: auth stack + tab shell (Home, Search, Library, Settings)
- NativeWind + `@OneTune/ui` tokens; Inter + Plus Jakarta Sans via `expo-font`
- TanStack Query provider + typed API client (`src/lib/api-client.ts`)
- Zustand stores: `auth-store`, `player-store` (skeleton)
- MMKV token storage (native) with web `localStorage` fallback
- Login / Register screens (React Hook Form + Zod)
- Auth guard: unauthenticated → login; authenticated → tabs
- Settings: account info + sign out

**Mobile paths:**
```
apps/mobile/src/
  app/           Expo Router (auth + tabs)
  components/ui/ Screen, VaultButton, VaultInput
  lib/           api-client, storage, query-client, config
  stores/        auth-store, player-store
  providers/     app-providers
```

**Note:** `react-native-mmkv` requires a **native dev build** (`npx expo run:android`, not Expo Go). Web dev uses `localStorage`.

### M7 — Search UI ✅
- Pill search input with debounced TanStack Query (`400ms`)
- `GET /v1/search` via `musicApi` + `useUnifiedSearch`
- FlashList results with `expo-image` artwork
- Provider badges (YouTube, JioSaavn, Spotify)
- Loading skeletons, empty/error states, partial provider failure banner
- Tap result → queue track + `POST /v1/stream/resolve` (playback engine in M8)

**Search paths:**
```
apps/mobile/src/
  components/search/   SearchInput, TrackRow, ProviderBadge, skeleton, list
  hooks/               use-unified-search, use-play-track, use-debounced-value
  lib/music-api.ts
```

### M8 — Playback Engine ✅
- `react-native-track-player` + `expo-dev-client` (requires `npx expo run:android`)
- Custom entry `apps/mobile/index.js` registers background playback service
- `player-engine` — setup, play, pause, seek, skip, queue, stream resolve
- `playback-service` — lock screen / notification remote controls
- Stream URL auto-refresh via `isStreamExpired` (30s poll)
- `PlayerSync` — progress + playback state → Zustand
- `usePlaybackControls` hook (for M9 mini/full player)
- iOS background audio + Android cleartext for dev streams (`expo-build-properties`)

**Player paths:**
```
apps/mobile/
  index.js                    # RNTP service registration
  src/services/
    player-engine.native.ts   # Core engine
    playback-service.ts       # Remote event handlers
  src/components/player/      # PlayerSync
  src/hooks/use-playback-controls.ts
```

### M9 — Player UI ✅
- Mini-player bar above tab bar (artwork, title, thin progress, play/pause)
- Full-screen Now Playing modal (blur + artwork backdrop, slide animation)
- Gesture seek progress bar with time labels
- Queue sheet (“Up next”) with tap-to-play
- `usePlaybackControls` + `usePlayerUiStore` for UI state
- Haptics on play/pause/skip/seek
- `expo-blur`, `react-native-gesture-handler`

### M10 — Playlist Import ✅
- `POST /v1/playlists/import` — Spotify URL → imported tracks saved to MongoDB
- `GET /v1/playlists`, `GET /v1/playlists/:id` — user library
- Spotify adapter `importPlaylist` (existing) wired through playlist service
- Mobile: Library tab with import flow, playlist list, detail screen with playable tracks
- Re-import same URL updates tracks (upsert by `userId` + `sourceUrl`)
- Test script: `scripts/test-playlists.ps1` (set `SPOTIFY_PLAYLIST_URL`)

### M11 — Downloads & Offline ✅
- `POST /v1/downloads/resolve` wired on mobile via `musicApi.resolveDownload`
- Download manager (`expo-file-system/legacy`) saves to app documents + MMKV index
- Offline playback: player prefers local `file://` before stream resolve
- Library → Downloads screen (list, progress, delete)
- Download button on Search + playlist tracks (YouTube/JioSaavn only)
- Stream expiry refresh skipped for local playback

### M12 — Library Features ✅
- `GET/POST/DELETE /v1/library/favorites` — per-user favorites in MongoDB
- `GET/POST /v1/library/history` — playback history (deduped by track, newest first)
- Mobile: Favorites + History screens under Library tab
- Heart toggle on search results + Now Playing modal
- Auto-record history on successful play (`use-play-track`)
- Test script: `scripts/test-library.ps1`

**Library paths:**
```
apps/api/src/
  routes/library.ts
  services/library-service.ts
  repositories/library-repository.ts
apps/mobile/src/
  lib/library-api.ts
  hooks/use-favorites.ts, use-history.ts
  components/library/favorite-button.tsx, library-track-row.tsx
  app/(tabs)/library/favorites.tsx, history.tsx
```

### M13 — Polish & Hardening ✅
- Shared skeleton loaders (`TrackListSkeleton`, `PlaylistListSkeleton`, `PlaylistDetailSkeleton`)
- `ErrorState` component with retry on library screens
- Global toast host for play, favorite, and download failures
- Pull-to-refresh on playlists, favorites, history, playlist detail
- `ArtworkImage` with memory-disk cache + musical-notes placeholder

**Polish paths:**
```
apps/mobile/src/
  components/ui/skeleton.tsx, error-state.tsx, toast-host.tsx, artwork-image.tsx
  stores/toast-store.ts
  lib/error-message.ts
```

### M14 — VPS Deploy ✅
- `docker-compose.prod.yml` — production stack (no public MongoDB/API ports)
- Nginx reverse proxy + rate limits (`docker/nginx/`)
- Let's Encrypt via `scripts/init-letsencrypt.sh` + `scripts/renew-letsencrypt.sh`
- `scripts/backup-mongodb.sh` / `.ps1` + `scripts/deploy-prod.sh`
- Local Android builds (`build-android-standalone.ps1`, `rebundle-release-apk.ps1`) + `app.config.js` for HTTPS/cleartext
- Full guide: `docs/DEPLOYMENT.md`

**Infra paths:**
```
docker-compose.prod.yml
docker/nginx/
scripts/init-letsencrypt.sh, renew-letsencrypt.sh, backup-mongodb.sh, deploy-prod.sh
apps/mobile/scripts/build-android-standalone.ps1, rebundle-release-apk.ps1, app.config.js
```

### Post-MVP — Playback, Queue & Spotify Polish ✅
- **Queue semantics:** `queue` = upcoming tracks only; `addToQueue()` is explicit; Play does not auto-add
- **Skip safety:** playback generation token — rapid skips ignore stale match/resolve completions
- **Queue preloader:** pre-match + pre-resolve next 3 tracks (`queue-preloader.ts`, `playable-cache.ts`)
- **Spotify playback:** `POST /v1/tracks/match` (JioSaavn-first, YouTube fallback) + playlist Play/Shuffle/Download
- **Spotify artwork:** oEmbed fallback + `playlist-artwork-service` enrichment on read
- **Search UX:** Likes/History hub removed from Search tab (Home/Library only)
- **Web volume:** mini-player vertical popover (portal); Now Playing horizontal slider beside skip-forward (centered transport)
- **Artwork:** `upgradeArtworkUrl` / `pickBestImageUrl` → higher-res thumbnails

**Key paths:**
```
apps/api/src/services/match-service.ts, search-service.ts
apps/mobile/src/services/resolve-playable-track.ts, queue-preloader.ts, playback-session.ts
apps/mobile/src/components/player/playback-buttons.web.tsx, inline-volume-control.web.tsx
apps/mobile/src/components/library/playlist-actions.tsx
packages/utils/src/image.ts
```

**Mobile / testing:** See `docs/DEVELOPMENT.md` — `npx expo run:android`, `expo start --dev-client`, ADB, API URL by device type.

**Production deploy:** See `docs/DEPLOYMENT-RENDER.md` (Render + Atlas) or `docs/DEPLOYMENT.md` (VPS).

### M16 — Production Polish & Marketing Site ✅
- **Library navigation:** Sub-screens always back to library index; Library tab pops stack when deep; explicit stack in `_layout.tsx`
- **Lock-screen / notification controls:** `react-native-track-player` patch — `MusicService.emit()` uses `reactContext` (new architecture / bridgeless); requires native rebuild after patch
- **Playback history:** `recordPlaybackHistory()` from `player-sync` when `currentTrack` changes (covers playlist play, skip, lock-screen skip — not only `use-play-track`)
- **App icon:** `scripts/generate-adaptive-icon.cjs` — logo scaled to 56% on 1024px canvas → `adaptive-icon.png`
- **Marketing website:** `website/` — React 19 + Vite + TypeScript; Lyra-style landing page; APK download via `src/config.ts` / `VITE_APK_URL`
- **Docs:** Local Android workflow (CLI + ADB); EAS/cloud build removed from primary path

**Key paths:**
```
apps/mobile/src/components/ui/sub-screen-header.tsx
apps/mobile/src/services/playback-history.ts
apps/mobile/src/components/player/player-sync.native.tsx
apps/mobile/scripts/generate-adaptive-icon.cjs
patches/react-native-track-player+4.1.2.patch
website/src/                    # React landing page
website/public/downloads/       # APK for site (sync script)
scripts/sync-website-apk.ps1
```

**Website commands:**
```powershell
bun run website:dev          # Vite dev server
bun run website:build        # → website/dist/
bun run website:sync-apk     # Copy OneTune-1.0.0.apk into public/downloads/
bun run website:serve        # Build + static serve dist/
```

---

## Package Dependency Rules

```
apps/mobile  →  ui, types, utils, config (not config/server)
apps/api     →  types, config/server, provider-core, utils
packages/*   →  acyclic; never import from apps/
services/*   →  HTTP only; no TS imports from apps
```

---

## Key Architecture Contracts

### Provider adapter (`@OneTune/provider-core`)
```typescript
MusicProvider { search, getMetadata, resolveStream, importPlaylist, resolveDownload? }
```
Runtime (Node/Python) is invisible to mobile. Spotify is metadata-only — playback uses `POST /v1/tracks/match` then stream resolve on JioSaavn/YouTube.

### Stream manifest (`@OneTune/types`)
```typescript
StreamManifest { deliveryMode: 'direct' | 'proxied', url, expiresAt, ... }
```
Client always plays `url`. Backend can switch to proxy without mobile API changes.

### API envelope (`@OneTune/types`)
```typescript
{ data: T, meta? }  // success
{ error: { code, message, details? } }  // failure
```

---

## Docker Services

| Service | Internal URL | Host |
|---------|--------------|------|
| API | — | localhost:3000 |
| Extractor | extractor:8001 | internal |
| JioSaavn | jiosaavn:3000 | internal |
| Spotify | spotify:8003 | internal |
| MongoDB | mongodb:27017 | localhost:27017 |

---

## Commands

```powershell
bun install
docker compose up --build -d          # needs Docker Desktop
curl http://localhost:3000/health
bun run typecheck
bun run build
bun run dev --filter=@OneTune/mobile
.\scripts\dev.ps1                     # full stack + mobile

# Native dev build (once) + daily Metro
cd apps/mobile && npx expo run:android
cd apps/mobile && npx expo start --dev-client

# Standalone release APK
cd apps/mobile && bun run build:android:standalone
adb install -r apps/mobile/android/app/build/outputs/apk/release/OneTune-1.0.0.apk

# Marketing website
bun run website:dev
bun run website:sync-apk
bun run website:build
```

---

## Open Questions / Deferred

| Item | Status |
|------|--------|
| Spotify → playable stream matching | ✅ `POST /v1/tracks/match` + mobile `resolve-playable-track` |
| Nginx + TLS | ✅ M14 |
| Proxied streaming | Feature flag ready, not implemented |
| react-native-track-player | ✅ M8 (+ M16 new-arch patch) |
| Marketing landing page | ✅ M16 — `website/` React + Vite |

---

## Working Protocol

1. Read `docs/MEMORY.md` (this file), `docs/ARCHITECTURE.md`, `docs/DESIGN.md`
2. Explain plan → implement → update docs → suggest commit → summarize
3. Never skip design system for UI work
4. Never leak provider-specific logic past adapters

---

## Documentation Index

| File | Purpose |
|------|---------|
| [MEMORY.md](./MEMORY.md) | Session handoff (this file) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Local dev workflow |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Code structure and patterns |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Docker, VPS, local APK |
| [API.md](./API.md) | HTTP API reference |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Living system design |
| [DESIGN.md](./DESIGN.md) | UI/UX source of truth |
| [DECISIONS.md](./DECISIONS.md) | ADR log |
| [ROADMAP.md](./ROADMAP.md) | Milestones |

---

## Project status

**MVP (M1–M14) and post-MVP polish (M15–M16) are complete.** The Android app, API deploy paths, and marketing website are documented and working. See `ROADMAP.md` for future backlog only.

---

## Suggested Next Commit

All planned MVP and polish milestones are done. Use `ROADMAP.md` post-MVP backlog for new work.
