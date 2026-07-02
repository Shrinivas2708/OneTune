# OneTune

**Your music. Your stack. One tune.**

OneTune is a self-hosted music platform for **iOS and Android**. Search once across **YouTube, JioSaavn, and Spotify**, build a personal library, stream with background playback, download for offline, and import playlists, albums, or singles from a link — all behind accounts you control.

No Spotify Premium required for discovery. No vendor lock-in. Deploy on **Render + MongoDB Atlas** in an afternoon, or run everything on your own VPS with Docker.

---

## Why OneTune?

| | |
|---|---|
| **Unified search** | One query hits every provider; results are deduped and ranked. |
| **Real mobile app** | Native playback, queue, lock-screen controls, offline downloads — not a web wrapper. |
| **Import anything** | Paste a Spotify, YouTube, or JioSaavn playlist, album, or track URL. |
| **Your infrastructure** | API, extractors, and database — you host them, you own the data. |
| **Provider adapters** | YouTube (yt-dlp), JioSaavn, Spotify metadata — swappable architecture. |

> **Note:** Built for private / household use. Scraping third-party services may violate their terms of service. Not intended as a public commercial streaming product.

---

## Features

- **Auth** — Register, login, JWT sessions with refresh rotation
- **Search** — Parallel multi-provider search with caching and timeouts
- **Playback** — Background audio, queue, skip, scrub, now-playing UI
- **Library** — Playlists, favorites, listening history (clearable)
- **Import** — Universal URL import (playlist / album / single)
- **Downloads** — Save tracks to device; play offline from local storage
- **Spotify bridge** — Spotify tracks resolve to playable JioSaavn/YouTube matches

---

## How it works

```
┌─────────────────────┐
│   Expo mobile app   │  React Native · track-player · MMKV
└──────────┬──────────┘
           │ HTTPS / JSON
           ▼
┌─────────────────────┐
│   OneTune API     │  Bun · Hono · MongoDB
└──────────┬──────────┘
           │
     ┌─────┼─────┬─────────────┐
     ▼     ▼     ▼             ▼
  yt-dlp  JioSaavn  Spotify   MongoDB
  extractor  API    scraper   Atlas / local
```

The mobile app only talks to **your API**. The API orchestrates provider microservices and normalizes everything into one schema. Spotify supplies metadata and imports; playback goes through JioSaavn or YouTube.

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Mobile | Expo 54, React Native, NativeWind, TanStack Query, Zustand, react-native-track-player |
| API | Bun, Hono, Zod, MongoDB |
| Providers | Python (FastAPI + yt-dlp), self-hosted JioSaavn API, SpotifyScraper |
| Monorepo | Turborepo, Bun workspaces |
| Deploy | Docker Compose · Render Blueprint · **local Android APK** · static React site |

---

## Get started

### Prerequisites

- [Bun](https://bun.sh) 1.2+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Android Studio](https://developer.android.com/studio) + ADB for native builds (**Expo Go is not supported**)

### Local development

```powershell
git clone <your-repo-url> onetune
cd onetune
bun install
docker compose up --build -d
curl http://localhost:3000/health
```

**Mobile (native dev build):**

```powershell
cd apps/mobile
# Set EXPO_PUBLIC_API_URL in apps/mobile/.env (see guide)
npx expo run:android          # first time + after native changes
npx expo start --dev-client   # later sessions — Metro hot reload
```

Press `w` in Metro for quick UI work in the browser. Playback and downloads require the native build above.

**Guides:** [Development](docs/DEVELOPMENT.md) · [Deployment / APK](docs/DEPLOYMENT.md)

---

## Deploy to production

| Path | Best for | Guide |
|------|----------|--------|
| **Render + MongoDB Atlas** | Managed cloud API | [→ Step-by-step](docs/DEPLOYMENT-RENDER.md) |
| **VPS + Docker + Nginx** | Self-hosted API | [Deployment guide](docs/DEPLOYMENT.md) |
| **Android APK (local)** | Install app on phones | [Build + ADB](docs/DEPLOYMENT.md#3-mobile-apk-local-build) |

**Quick path (API on Render + APK on your PC):**

1. Deploy backend — [DEPLOYMENT-RENDER.md](docs/DEPLOYMENT-RENDER.md)
2. Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your HTTPS API URL
3. `cd apps/mobile && bun run build:android:standalone`
4. `adb install -r android/app/build/outputs/apk/release/OneTune-1.0.0.apk`

**Optional — marketing site with APK download:**

```powershell
bun run website:sync-apk
bun run website:build
# deploy website/dist/ to your static host
```

---

## Project structure

```
OneTune/
├── apps/
│   ├── mobile/          # Expo app (Android + iOS)
│   └── api/             # Hono API on Bun
├── website/             # React + Vite marketing site
├── services/
│   ├── extractor/       # Python + yt-dlp
│   └── spotify/         # SpotifyScraper service
├── packages/
│   ├── types/           # Shared Zod schemas + TypeScript types
│   ├── config/          # Env validation, feature flags
│   ├── provider-core/   # MusicProvider adapter contract
│   ├── ui/              # Design tokens
│   └── utils/           # Shared helpers
├── docker/              # Dockerfiles
├── render.yaml          # Render Blueprint
└── docs/                # Architecture, API, deployment, design
```

---

## Documentation

| Document | What's inside |
|----------|----------------|
| [Development](docs/DEVELOPMENT.md) | Daily dev, Metro, `expo run:android`, ADB, website |
| [Deploy on Render](docs/DEPLOYMENT-RENDER.md) | Atlas + Render API + local APK |
| [Deploy on VPS](docs/DEPLOYMENT.md) | Docker, Nginx, TLS, APK, website hosting |
| [API reference](docs/API.md) | Auth, search, stream, library, playlists |
| [Architecture](docs/ARCHITECTURE.md) | System design, provider pattern, data flow |
| [Implementation](docs/IMPLEMENTATION.md) | Where to add features in the codebase |
| [Design](docs/DESIGN.md) | UI tokens, typography, component patterns |
| [Marketing site](website/) | React landing page — `bun run website:dev` |
| [Roadmap](docs/ROADMAP.md) | Milestones (M1–M16 complete) |

---

## API at a glance

| Endpoint | Description |
|----------|-------------|
| `POST /v1/auth/register` | Create account |
| `GET /v1/search?q=` | Unified multi-provider search |
| `POST /v1/stream/resolve` | Get playable stream URL |
| `POST /v1/playlists/import` | Import playlist, album, or track URL |
| `GET /v1/library/favorites` | Saved tracks |
| `GET /v1/library/history` | Recently played |

All `/v1/*` routes except auth require a Bearer token. See **[API.md](docs/API.md)** for the full reference.

---

## Status

**MVP complete (M1–M14).** Post-MVP polish and marketing site are done (M15–M16): Render deploy guide, library navigation, lock-screen controls, playback history, adaptive icon, and React landing page with APK download.

Search, playback, queue, downloads, library, universal import, API deploy (Render + VPS), local Android builds, and the marketing site are documented and working. See [ROADMAP.md](docs/ROADMAP.md) for future backlog only.

---

## License

Private / personal use. See repository license if present.
