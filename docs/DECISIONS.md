# OneTune — Architecture Decision Log

> Record of significant technical decisions. Each entry is immutable once accepted; superseded decisions are marked, not deleted.

---

## ADR-001: Expo as Mobile Framework

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Need a cross-platform iOS + Android client with premium UX, OTA updates, and strong ecosystem.

**Decision:** Use Expo (latest stable SDK) with EAS Development Builds from day one. Do not use bare React Native unless Expo becomes a hard blocker.

**Consequences:**
- Native modules (track-player) require dev builds, not Expo Go
- OTA updates available via EAS
- Expo Router for file-based navigation

---

## ADR-002: Turborepo + Bun Monorepo

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Multiple apps, services, and shared packages need clean boundaries and fast builds.

**Decision:** Turborepo orchestration with Bun workspaces. Package manager is Bun.

**Structure:** `apps/`, `services/`, `packages/`, `docker/`, `scripts/`, `docs/`

**Consequences:**
- Shared types and provider contracts live in `packages/`
- Turbo caches build outputs across packages
- Root `package.json` defines workspaces

---

## ADR-003: Node API + Python Extractor Split

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** yt-dlp is Python-native. API needs TypeScript for type safety with mobile shared packages.

**Decision:**
- `apps/api` — Node/TypeScript: auth, orchestration, provider registry, MongoDB
- `services/extractor` — Python: yt-dlp extraction only
- Services communicate via HTTP; no cross-runtime imports

**Consequences:**
- Stream resolution for YouTube crosses a network boundary (internal Docker network)
- Python service is stateless and horizontally scalable if needed

---

## ADR-004: MongoDB as Primary Database

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Document-shaped data (users, playlists, history, favorites) with flexible schema during early development.

**Decision:** MongoDB self-hosted in Docker Compose alongside API.

**Alternatives considered:**
- PostgreSQL — stronger relational guarantees; deferred
- SQLite — simpler ops but poor multi-process concurrency on VPS

**Consequences:**
- Use Mongoose or native driver with Zod validation at API boundary
- Migrations managed via explicit migration scripts in `apps/api`

---

## ADR-005: Direct Client Streaming (Option A)

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** VPS bandwidth and CPU are limited. Proxying every stream byte is expensive.

**Decision:** API returns ephemeral stream URLs; mobile client streams directly from source CDN.

**Future-proofing:** `StreamManifest.deliveryMode` field allows switching to proxied URLs without mobile API changes.

**Consequences:**
- Stream URLs expire — client must re-resolve
- Some providers may block direct client URLs over time → proxy layer can be enabled per-provider

---

## ADR-006: Device-Only Download Storage

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** VPS storage is expensive; downloads are personal listening copies.

**Decision:** Downloaded files stored on device filesystem. Server provides download URLs only. MMKV indexes local files.

**Consequences:**
- Downloads do not sync across user devices
- Offline playback is fully client-side after download completes

---

## ADR-007: Provider Adapter Architecture

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Multiple music sources with different capabilities, runtimes, and APIs.

**Decision:** All providers implement a shared contract in `@OneTune/provider-core`. Application code never branches on provider-specific logic.

**Initial providers:**
| Provider | Library/Service | Runtime |
|----------|-----------------|---------|
| YouTube | yt-dlp | Python (extractor) |
| Spotify | SpotifyScraper | Node |
| JioSaavn | jiosaavn-api | Node (self-hosted service) |

**Consequences:**
- Adding a provider = new adapter + registry entry
- Unified search fans out to all search-capable adapters in parallel

---

## ADR-008: Self-Hosted JioSaavn API

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Need reliable JioSaavn catalog without depending on public hosted instances.

**Decision:** Run [sumitkolhe/jiosaavn-api](https://github.com/sumitkolhe/jiosaavn-api) as `services/jiosaavn` in Docker Compose. API talks to it over internal network.

**Consequences:**
- Additional container in compose stack
- JioSaavn adapter in Node API is a thin HTTP client

---

## ADR-009: react-native-track-player for Playback

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Need background playback, lock screen controls, queue management at production quality.

**Decision:** Use `react-native-track-player` from the playback milestone. Do not build on `expo-av` as the primary player.

**Consequences:**
- Requires EAS dev build with native module
- Playback service runs as native background service on iOS/Android

---

## ADR-010: Open-Source Font Substitutes

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** `DESIGN.md` references Spotify proprietary fonts (SpotifyMixUI, CircularSp).

**Decision:** Use open-source alternatives. Never ship proprietary fonts without explicit licensed copies from the project owner.

**Mapping:**
| Design reference | OneTune implementation |
|-----------------|---------------------------|
| SpotifyMixUITitle | **Plus Jakarta Sans** (700) |
| SpotifyMixUI | **Inter** (400, 600, 700) |
| Fallback stack | System fonts per platform |

Tokens defined in `packages/ui`.

---

## ADR-011: Unified Search in MVP (Non-Negotiable)

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Earlier proposal deferred unified search for a faster MVP.

**Decision:** Unified cross-provider search ships in the first usable version. It is the product identity.

**MVP feature set:**
- Authentication
- Unified search across providers
- Streaming + queue + player
- Spotify playlist import
- Device downloads + offline playback
- Favorites + history

**Consequences:**
- Longer initial build timeline
- Search orchestration and provider normalization are Milestone priorities

---

## ADR-012: VPS Self-Hosted Deployment

**Status:** Accepted  
**Date:** 2025-06-25

**Context:** Private server for friends/household with individual accounts.

**Decision:** Deploy full Docker Compose stack on a VPS. No LAN-only restriction. Nginx + TLS added after core services are stable.

**Consequences:**
- All services containerized from day one
- Mobile app configured with server URL via env/config

---

## ADR-013: Scraper-Based Providers (No Official APIs)

**Status:** Accepted  
**Date:** 2025-06-25  
**Risk:** High — legal and ToS implications

**Context:** No official Spotify/YouTube streaming APIs for this use case.

**Decision:** Use open-source scrapers (SpotifyScraper, yt-dlp) and third-party APIs (JioSaavn). No official provider OAuth integrations in MVP.

**Consequences:**
- Providers can break without notice — adapter isolation is critical
- Not suitable for App Store distribution as a commercial scraping product
- Intended for private, self-hosted use among known users

---

## ADR-014: Engineering Standards

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:** From day one, enforce:
- Feature flags (`@OneTune/config`)
- Environment-based configuration (no hardcoded values)
- Centralized structured logging
- Typed API responses with Zod validation
- Shared design tokens (`@OneTune/ui`)
- Clean package dependency boundaries

---

## ADR-015: Documentation as First-Class Artifact

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:** All project documentation lives in `docs/`:
- `ARCHITECTURE.md` — living system memory
- `DESIGN.md` — UI/UX source of truth
- `DECISIONS.md` — this file
- `ROADMAP.md` — milestones

Update docs as part of every milestone, not as an afterthought.

---

## ADR-016: Zod-First Shared Packages (M2)

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:** All API contracts defined as Zod schemas in `@OneTune/types`. Server env validated in `@OneTune/config/server` (API-only export). Provider contract completed in `@OneTune/provider-core`.

**Package exports:**
| Package | Key exports |
|---------|-------------|
| `@OneTune/types` | TrackRef, StreamManifest, SearchResult, auth DTOs, apiSuccessSchema |
| `@OneTune/config` | constants, featureFlags |
| `@OneTune/config/server` | parseServerEnv, env |
| `@OneTune/provider-core` | MusicProvider, ProviderRegistry, ProviderError |
| `@OneTune/ui` | design tokens, tailwind preset |
| `@OneTune/utils` | formatDuration, normalizeTrackKey, buildPaginationMeta |

**Consequences:**
- Mobile imports types + ui + config (never config/server)
- API validates requests/responses with shared schemas in M3+

---

## ADR-017: API Foundation — Hono + MongoDB + JWT (M3)

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:**
- **Hono** middleware pipeline with global error handler and `X-Request-Id`
- **pino** for structured JSON logging
- **MongoDB** native driver (not Mongoose) — `users` + `refreshSessions` collections
- **jose** for JWT (HS256); access 15min, refresh 7d with rotation
- **Bun.password** bcrypt for password hashing
- **@hono/zod-validator** for request validation

**Auth flow:** Register/login issues access + refresh tokens. Refresh rotates JTI in `refreshSessions`. Logout deletes session by JTI.

**Consequences:**
- Refresh tokens are revocable server-side
- Access tokens are stateless (short-lived)
- `scripts/test-auth.ps1` for smoke testing

---

## ADR-018: Provider Services Split (M4)

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:** Provider runtimes split across dedicated services:
- `services/extractor` — yt-dlp (YouTube search, stream, download, playlist)
- `services/spotify` — SpotifyScraper (metadata, search, playlist import)
- `services/jiosaavn` — upstream jiosaavn-api (catalog, stream URLs)

Node adapters in `apps/api/src/providers/` normalize all responses to `@OneTune/types` DTOs.

**Internal routes** (`/v1/internal/providers/*`) exposed only when `NODE_ENV !== production`.

**Consequences:**
- SpotifyScraper runs in Python (correct runtime for the library)
- Adding a provider = new service (if needed) + adapter + registry entry
- Provider failures isolated via `ProviderUnavailableError` per adapter

---

## ADR-019: Unified Search Orchestration (M5)

**Status:** Accepted  
**Date:** 2025-06-25

**Decision:**
- `SearchOrchestrator` fans out to all `listSearchable()` providers in parallel
- Per-provider timeout: 8s (`SEARCH_PROVIDER_TIMEOUT_MS`)
- Failed providers recorded in `providersFailed`; partial results returned
- Dedup by `normalizeTrackKey(title, artist)` — prefers jiosaavn > youtube > spotify
- Public routes under `/v1/search`, `/v1/tracks`, `/v1/stream/resolve`, `/v1/downloads/resolve` require JWT auth
