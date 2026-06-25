# VibeVault — Interview Pitch

> How to talk about this project in interviews, portfolio reviews, and technical discussions.

---

## The Elevator Pitch (30 seconds)

**VibeVault** is a self-hosted music platform I’m building as a production-grade monorepo — think Spotify’s UX meets a personal media server. Users on iOS and Android search across multiple music providers through one unified interface, stream tracks, download for offline playback, and manage favorites and playlists. The backend runs on a VPS via Docker Compose, with a clean provider-adapter architecture so adding a new source is plug-and-play, not a rewrite.

---

## The Problem

Music is fragmented across YouTube, Spotify playlists, regional catalogs like JioSaavn, and local files. Existing apps either lock you into one ecosystem or sacrifice polish. I wanted:

1. **One search bar** — unified discovery across providers
2. **Premium mobile UX** — not a hacky wrapper
3. **Self-hosted control** — my server, my friends, no SaaS dependency
4. **Architecture that scales** — startup-quality codebase from day one

---

## What I Built (So Far)

### Milestone 1 — Infrastructure
- **Turborepo monorepo** with Bun workspaces: `apps/`, `services/`, `packages/`
- **Docker Compose** orchestrating Node API, Python extractor, JioSaavn API, MongoDB
- **Expo 54 mobile app** with NativeWind, monorepo-aware Metro bundler
- **Hono API** on Bun with health checks and dependency probing

### Milestone 5 — Unified Search
- Parallel provider fan-out with 8s timeout and graceful degradation
- Fuzzy dedup (title + artist) with playable-provider priority
- Authenticated public API: search, metadata, stream/download resolve

### Milestone 4 — Provider Layer
- Python extractor (yt-dlp) + Python Spotify service (SpotifyScraper)
- Node adapters with normalized DTOs and capability flags
- Provider registry; internal dev routes for isolated testing

### Milestone 3 — API Foundation
- JWT auth with refresh token rotation (MongoDB-backed sessions)
- Structured logging (pino) + request ID middleware
- Global error handler with Zod validation errors → 400
- MongoDB user repository with bcrypt passwords

### Milestone 2 — Shared Foundation
- **`@vibevault/types`** — Zod schemas as single source of truth for all API contracts (TrackRef, StreamManifest, search results, auth DTOs)
- **`@vibevault/provider-core`** — `MusicProvider` interface + registry; runtime-agnostic adapter pattern
- **`@vibevault/config`** — validated server env, feature flags, shared constants
- **`@vibevault/ui`** — design tokens from a Spotify-inspired design system + Tailwind preset
- **`@vibevault/utils`** — duration formatting, dedup keys, pagination helpers

---

## Architecture Highlights (What Interviewers Care About)

### 1. Provider Adapter Pattern

**Problem:** YouTube (yt-dlp), Spotify (scraper), and JioSaavn (REST API) have completely different APIs and runtimes.

**Solution:** Every provider implements one `MusicProvider` contract. The mobile app and search orchestrator only see normalized DTOs (`TrackRef`, `TrackMetadata`, `StreamManifest`). Adding Apple Music later = one new adapter + registry entry.

```
Mobile → API → ProviderRegistry → [Spotify | JioSaavn | YouTube adapters]
                                         ↓              ↓           ↓
                                       Node           Node       Python
```

**Why it matters:** Open/closed principle. Provider outages are isolated — one adapter failing doesn’t crash unified search.

### 2. Direct Streaming with Future-Proof Contract

**Decision:** Server extracts ephemeral URLs; client streams directly (no VPS byte-proxy).

**Tradeoff:** Saves bandwidth and CPU on a small VPS; URLs expire and some providers may block direct access.

**Mitigation:** `StreamManifest.deliveryMode` field lets us swap to proxied URLs later without changing the mobile API or player code.

### 3. Zod-First Shared Types

Schemas live in `@vibevault/types` and are imported by both API (validation) and mobile (form validation, type safety). One definition, zero drift.

### 4. Monorepo Boundaries

Strict dependency rules: `packages/` never imports `apps/`. Services communicate over HTTP only. Turbo caches builds across packages.

### 5. Design System as Code

`docs/DESIGN.md` defines the visual language. `@vibevault/ui` encodes tokens (colors, typography, spacing, shadows) consumed by NativeWind — no hardcoded hex in components.

---

## Tech Stack (Quick Reference)

| Layer | Technology | Why |
|-------|------------|-----|
| Mobile | Expo 54, Expo Router, NativeWind | DX, OTA updates, EAS builds |
| State | TanStack Query + Zustand | Server vs client state separation |
| Playback | react-native-track-player (planned) | Background audio, lock screen |
| API | Hono on Bun | Fast, typed, lightweight |
| Extraction | Python + yt-dlp | Industry standard for media URLs |
| Catalog | Self-hosted jiosaavn-api | Regional catalog without public dependency |
| DB | MongoDB | Flexible document model for library metadata |
| Infra | Docker Compose on VPS | Reproducible dev = prod |
| Tooling | Turborepo + Bun | Fast installs, cached builds |

---

## Engineering Practices I Applied

- **Discovery before code** — product decisions documented in ADRs before implementation
- **Milestone-driven delivery** — each milestone independently runnable
- **Documentation as artifact** — `ARCHITECTURE.md`, `MEMORY.md`, `DECISIONS.md` updated with code
- **Feature flags** from day one (`FF_PROXIED_STREAMING`, `FF_VIDEO_PLAYBACK`)
- **No hardcoded values** — env validation, design tokens, shared constants
- **Staff-engineer mindset** — challenged scope, documented tradeoffs (legal/ToS risk, Spotify playback gap)

---

## Hard Problems & How I’d Discuss Them

### Unified search across heterogeneous providers
Fan-out parallel requests with per-provider timeouts. Normalize to shared DTOs. Fuzzy dedup on title+artist. Graceful degradation when one provider is down.

### Spotify has metadata but no stream URLs
SpotifyScraper gives playlists and search metadata. Playback resolves through a separate provider (JioSaavn/YouTube matching) — decoupling metadata from streaming.

### Offline on device, orchestration on server
Downloads live on device filesystem (MMKV index). Server never stores user media — only resolves download URLs. Keeps VPS storage costs at zero.

### Premium UX in React Native
Spotify-inspired design system: dark immersion, album art as color source, pill geometry, Reanimated transitions, skeleton loaders, haptics. `react-native-track-player` for production playback — not `expo-av`.

---

## What’s Next (Roadmap Snapshot)

| Milestone | Focus |
|-----------|-------|
| M3 | JWT auth, MongoDB, API middleware |
| M4–M5 | Provider adapters + unified search |
| M6–M9 | Mobile shell, search UI, player |
| M10–M12 | Playlist import, downloads, favorites |
| M14 | VPS production deploy with Nginx + TLS |

---

## Sample Interview Q&A

**Q: Why a monorepo?**  
A: Shared Zod schemas between API and mobile eliminate contract drift. Provider interfaces live in one package consumed by the API. Turbo caches builds — changing a token rebuilds only affected packages.

**Q: Why not proxy streams through your server?**  
A: Bandwidth and CPU on a small VPS. Direct URLs are simpler for MVP. The `StreamManifest` contract has a `deliveryMode` field so we can add per-provider proxying without a mobile rewrite.

**Q: How do you handle provider failures?**  
A: Adapter isolation + `Promise.allSettled` in search orchestration. Partial results beat total failure. Each adapter has capability flags — we don’t call `resolveStream` on Spotify.

**Q: What would you do differently?**  
A: For a larger team, I’d add contract tests between packages earlier. I’d also evaluate Postgres if relational queries (collaborative playlists) become core — MongoDB is fine for MVP document shapes.

---

## One-Liner for Resume

> Built VibeVault — a self-hosted, multi-provider music platform (Expo, Hono, Python/yt-dlp, Docker) with unified search, provider-adapter architecture, and Zod-validated shared contracts in a Turborepo monorepo.
