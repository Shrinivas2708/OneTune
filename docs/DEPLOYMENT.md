# VibeVault — Deployment Guide

> How to run VibeVault locally and on a VPS. Update this file when infrastructure changes.

---

## Overview

VibeVault runs as a **Docker Compose** stack. All backend services are containerized; the mobile app is built separately with **Expo / EAS** and points at your API URL.

```
                    ┌─────────────┐
   Mobile (Expo) ──►│  API :3000  │◄── public (VPS)
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐    ┌────────────┐    ┌──────────┐
   │ MongoDB  │    │ Extractor  │    │ Spotify  │
   │  :27017  │    │   :8001    │    │  :8003   │
   └──────────┘    └────────────┘    └──────────┘
                           │
                    ┌────────────┐
                    │ JioSaavn   │
                    │   :3000    │
                    └────────────┘
         (internal Docker network only)
```

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Docker | 24+ | Docker Desktop (Windows/Mac) or Docker Engine (Linux) |
| Docker Compose | v2 | Included with modern Docker |
| Bun | 1.2+ | Local dev / building API outside Docker (optional) |
| Git | any | Clone repository |

**VPS minimum (recommended):** 2 vCPU, 4 GB RAM, 40 GB SSD, Ubuntu 22.04+

---

## Environment Variables

Copy `.env.example` to `.env` at the repository root:

```sh
cp .env.example .env
```

### Required for production

| Variable | Example | Description |
|----------|---------|-------------|
| `JWT_SECRET` | long random string (32+ chars) | Signs access/refresh tokens — **never use default in prod** |
| `NODE_ENV` | `production` | Disables `/v1/internal/*` dev routes |
| `MONGODB_URI` | `mongodb://mongodb:27017/vibevault` | Mongo connection (Docker service name) |

### Service URLs (Docker internal)

| Variable | Default (Compose) | Description |
|----------|-------------------|-------------|
| `EXTRACTOR_URL` | `http://extractor:8001` | yt-dlp Python service |
| `JIOSAAVN_URL` | `http://jiosaavn:3000` | Self-hosted jiosaavn-api |
| `SPOTIFY_URL` | `http://spotify:8003` | SpotifyScraper Python service |
| `PORT` | `3000` | API listen port |

### Mobile

| Variable | Example | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `https://api.yourdomain.com` | API base URL in Expo app |

### Feature flags (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `FF_VIDEO_PLAYBACK` | `false` | Video player toggle (future) |
| `FF_SPOTIFY_IMPORT` | `true` | Spotify playlist import |
| `FF_PROXIED_STREAMING` | `false` | Proxy streams through VPS (future) |

---

## Local Deployment (Development)

### 1. Start the stack

```powershell
# Windows
docker compose up --build -d
```

```sh
# macOS / Linux
docker compose up --build -d
```

### 2. Verify health

```sh
curl http://localhost:3000/health
curl http://localhost:3000/health/deps
```

Expected: `status: ok` (deps may show `degraded` if a provider container is still starting).

### 3. View logs

```sh
docker compose logs -f api
docker compose logs -f extractor
docker compose logs -f spotify
docker compose logs -f jiosaavn
```

### 4. Stop

```sh
docker compose down
```

To remove MongoDB data:

```sh
docker compose down -v
```

---

## VPS Deployment (Production)

> **Milestone 14** will add Nginx + TLS. Until then, this is the target layout.

### 1. Server setup

```sh
# Ubuntu example
sudo apt update && sudo apt upgrade -y
sudo apt install -y git docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# re-login for group to apply
```

### 2. Clone and configure

```sh
git clone <your-repo-url> vibevault
cd vibevault
cp .env.example .env
```

Edit `.env` for production:

```env
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
MONGODB_URI=mongodb://mongodb:27017/vibevault
```

Generate a secret:

```sh
openssl rand -base64 48
```

### 3. Start services

```sh
docker compose up --build -d
```

### 4. Firewall

Only expose what clients need:

| Port | Exposure | Service |
|------|----------|---------|
| 3000 | Public (temporary) or via Nginx | API |
| 27017 | **Never public** | MongoDB |
| 8001, 8003, jiosaavn 3000 | **Internal only** | Provider services |

```sh
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
# Do NOT open 27017, 8001, 8003 publicly
sudo ufw enable
```

### 5. Nginx + TLS (planned — M14)

Reverse proxy pattern:

```
https://api.yourdomain.com  →  vibevault-api:3000
```

- Let's Encrypt via Certbot
- Rate limiting on `/v1/search`
- `client_max_body_size` for future uploads

### 6. MongoDB backups

```sh
docker exec vibevault-mongodb mongodump --db vibevault --out /data/backup
docker cp vibevault-mongodb:/data/backup ./backup-$(date +%F)
```

Schedule with cron. Store backups off-server.

---

## Docker Services Reference

| Container | Image / Build | Host port | Internal port |
|-----------|---------------|-----------|---------------|
| `vibevault-api` | `docker/api.Dockerfile` | **3000** | 3000 |
| `vibevault-mongodb` | `mongo:7` | 27017* | 27017 |
| `vibevault-extractor` | `docker/extractor.Dockerfile` | — | 8001 |
| `vibevault-spotify` | `docker/spotify.Dockerfile` | — | 8003 |
| `vibevault-jiosaavn` | `docker/jiosaavn.Dockerfile` | — | 3000 |

\*MongoDB is exposed on localhost for local dev tooling. **Do not expose on a public VPS.**

### Build times

First `docker compose up --build` can take **5–15 minutes** (JioSaavn clones upstream and builds; Spotify installs `spotifyscraper`).

### Health checks

Compose waits for all provider health checks before starting the API. If the API won't start:

```sh
docker compose ps
docker compose logs jiosaavn
docker compose logs spotify
```

---

## Mobile App Deployment (EAS)

The mobile app is **not** in Docker Compose.

### Development build

```sh
cd apps/mobile
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android
```

Set `EXPO_PUBLIC_API_URL` in `eas.json` or EAS secrets to your VPS API URL.

### Production build

```sh
npx eas-cli build --profile production --platform all
```

### OTA updates (later)

```sh
npx eas-cli update --branch production
```

---

## Updating a Running Deployment

```sh
git pull
docker compose up --build -d
docker image prune -f
```

Zero-downtime deploys (rolling updates) are out of scope for MVP — brief API restart is expected.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Docker Desktop Linux engine` error | Docker not running | Start Docker Desktop |
| API stuck on `depends_on` | JioSaavn/Spotify slow to build | `docker compose logs jiosaavn` — wait or rebuild |
| `401` on `/v1/search` | Auth required, no token | Register/login — see [API.md](./API.md) |
| `503` on `/health/deps` | Provider container down | Check extractor, spotify, jiosaavn logs |
| Spotify search fails | SpotifyScraper / network | `docker compose logs spotify` |
| yt-dlp errors | Video unavailable / region block | Try different track; check extractor logs |

---

## Security Checklist (Production)

- [ ] Change `JWT_SECRET` from default
- [ ] Set `NODE_ENV=production`
- [ ] Do not expose MongoDB or provider ports publicly
- [ ] Use HTTPS (Nginx + TLS) before sharing with friends
- [ ] Restrict VPS access (SSH keys, firewall)
- [ ] Treat as **private use** — scraping carries ToS/legal risk
- [ ] Rotate `JWT_SECRET` if compromised (invalidates all sessions)

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Local dev workflow |
| [API.md](./API.md) | Endpoints and auth |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Code structure |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design |
