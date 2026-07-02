# OneTune — Deployment Guide

> Backend on Docker (local / VPS / Render) and **Android APK built locally** (CLI or Android Studio + ADB).

---

## Choose your path

| Path | Best for | Section |
|------|----------|---------|
| **Render + MongoDB Atlas** | Managed cloud API | [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md) |
| **Docker Compose (local)** | Development | [Local backend](#1-local-backend-development) |
| **VPS + Nginx + TLS** | Self-hosted production API | [VPS production](#2-vps-production-backend) |
| **Standalone Android APK** | Install app on phones | [Mobile APK (local build)](#3-mobile-apk-local-build) |
| **Marketing website** | Public landing + APK download | [Website deploy](#4-marketing-website) |

---

## Architecture

```
  Phone (APK) ──► https://api.yourdomain.com
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  :80 / :443 (VPS only)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  API :3000  │
                    └──────┬──────┘
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   MongoDB          Extractor          JioSaavn / Spotify
```

The mobile app is **not** in Docker. Build the APK on your PC and install with **ADB** or Android Studio.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Docker 24+ | Backend |
| Bun 1.2+ | Optional local API dev |
| Android Studio | SDK, emulator, optional GUI builds |
| ADB | `platform-tools` on PATH |
| JDK 17 | Bundled with Android Studio |

---

## Environment variables

Copy root env:

```powershell
cp .env.example .env
```

### Backend (production)

| Variable | Example | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `openssl rand -base64 48` | **Required** in prod |
| `MONGODB_URI` | `mongodb://mongodb:27017/onetune` | Docker service name |
| `OneTune_DOMAIN` | `api.yourdomain.com` | VPS TLS only |
| `USE_HTTPS` | `true` | VPS TLS only |

### Mobile (baked into APK at build time)

| Variable | Example | Where |
|----------|---------|-------|
| `EXPO_PUBLIC_API_URL` | `https://api.onetune.shribuilds.in` | `apps/mobile/.env` or shell before build |
| `EXPO_NO_METRO_WORKSPACE_ROOT` | `1` | Required on Windows monorepo |
| `EXPO_STANDALONE_BUILD` | `1` | Set automatically by standalone script |

**No trailing slash** on the API URL.

`apps/mobile/app.config.js` disables Android cleartext when the URL uses `https://`.

---

## 1. Local backend (development)

### Step 1 — Start stack

```powershell
docker compose up --build -d
```

### Step 2 — Verify

```powershell
curl http://localhost:3000/health
curl http://localhost:3000/health/deps
```

### Step 3 — Stop

```powershell
docker compose down
```

Remove Mongo data: `docker compose down -v`

---

## 2. VPS production (backend)

### Step 1 — Server setup

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y git docker.io docker-compose-plugin curl
sudo usermod -aG docker $USER
```

### Step 2 — Clone and configure

```sh
git clone <repo-url> onetune && cd onetune
cp .env.example .env
```

Edit `.env` — set `JWT_SECRET`, `OneTune_DOMAIN`, `CERTBOT_EMAIL`, `MONGODB_URI`.

DNS: **A record** `api.yourdomain.com` → VPS IP.

### Step 3 — Start production stack

```sh
docker compose -f docker-compose.prod.yml up --build -d
curl http://api.yourdomain.com/health
```

### Step 4 — TLS

```sh
chmod +x scripts/init-letsencrypt.sh scripts/renew-letsencrypt.sh
./scripts/init-letsencrypt.sh
# Set USE_HTTPS=true in .env, then:
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

### Step 5 — Firewall

```sh
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw enable
```

Do **not** expose MongoDB or provider ports publicly.

### Deploy updates

```sh
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

Backups: `./scripts/backup-mongodb.sh`

Full Render walkthrough: [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md).

---

## 3. Mobile APK (local build)

Two build types:

| Type | Command | Use case |
|------|---------|----------|
| **Dev client** | `npx expo run:android` | Daily dev + Metro hot reload |
| **Standalone release** | `bun run build:android:standalone` | Production APK, no dev menu |

---

### 3.1 Standalone release APK (CLI) — recommended

Use this for a **production-like APK** (no “Development build / connect to server” screen).

#### Step 1 — Set production API URL

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://api.onetune.shribuilds.in
EXPO_NO_METRO_WORKSPACE_ROOT=1
```

Or pass for one build:

```powershell
$env:EXPO_PUBLIC_API_URL="https://api.onetune.shribuilds.in"
```

#### Step 2 — Build APK

```powershell
cd onetune\apps\mobile
bun run build:android:standalone
```

This runs `expo prebuild` (standalone, no dev client) + `gradlew assembleRelease`.

Output:

```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

First build: **15–30 minutes**. Later builds are faster.

#### Step 3 — Install via ADB

```powershell
adb devices
adb install -r apps\mobile\android\app\build\outputs\apk\release\app-release.apk
```

Enable **Install unknown apps** on the phone if prompted.

---

### 3.2 Standalone release APK (Android Studio)

#### Step 1 — Generate native project (if needed)

```powershell
cd onetune\apps\mobile
$env:EXPO_STANDALONE_BUILD="1"
$env:EXPO_NO_METRO_WORKSPACE_ROOT="1"
$env:EXPO_PUBLIC_API_URL="https://api.onetune.shribuilds.in"
npx expo prebuild --platform android --clean
```

#### Step 2 — Open in Android Studio

- **File → Open** → `onetune/apps/mobile/android`
- Wait for Gradle sync.

#### Step 3 — Build release APK

- **Build → Select Build Variant** → `release`
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**

APK path: `android/app/build/outputs/apk/release/app-release.apk`

> Use **Build APK(s)**, not the green **Run ▶** button (Run installs a debug/dev variant).

#### Step 4 — Install

Drag APK to emulator, or:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

---

### 3.3 Rebundle APK after API URL or JS changes

Gradle caches the JS bundle. If you changed `.env` or JS but the APK still hits the old API:

```powershell
cd onetune\apps\mobile
bun run build:android:rebundle
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

Use this for **JS/config-only** changes when `android/` already exists.

For **native** changes (new native module, Kotlin patches): run full `build:android:standalone` or `expo run:android`.

---

### 3.4 Dev client APK (Metro workflow)

For development with hot reload:

```powershell
cd onetune\apps\mobile
npx expo run:android
```

Installs debug dev client. Start Metro:

```powershell
npx expo start --dev-client
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for the full dev workflow.

---

## 4. Marketing website

The landing page is a **React + Vite** static site in `website/`. Build output goes to `website/dist/`.

### 4.1 Local preview

```powershell
cd onetune
bun run website:dev
```

### 4.2 Ship with the latest APK

```powershell
cd onetune\apps\mobile
bun run build:android:standalone

cd onetune
bun run website:sync-apk
bun run website:build
```

`website:sync-apk` copies `OneTune-1.0.0.apk` into `website/public/downloads/` (included in the Vite build).

### 4.3 Configure download URL

Edit `website/src/config.ts` or set env at build time (`website/.env`):

```env
VITE_APK_URL=https://yourdomain.com/downloads/OneTune-1.0.0.apk
VITE_APK_FILE_NAME=OneTune-1.0.0.apk
```

### 4.4 Deploy static files

Upload **`website/dist/`** to any static host (Nginx, Cloudflare Pages, Netlify, Vercel, GitHub Pages, etc.).

| Host | Notes |
|------|--------|
| Same domain as API | e.g. `https://onetune.example.com` for site, `https://api.onetune.example.com` for API |
| APK on CDN | Set `VITE_APK_URL` to the CDN URL before `website:build` |
| Nginx | `root /var/www/onetune;` pointing at `dist/` contents |

No server runtime required — pure HTML/CSS/JS after `vite build`.

---

## 5. Docker services reference

### Development (`docker-compose.yml`)

| Service | Host port |
|---------|-----------|
| API | **3000** |
| MongoDB | 27017 |

### Production (`docker-compose.prod.yml`)

| Service | Host port |
|---------|-----------|
| Nginx | **80, 443** |
| API / Mongo / providers | internal only |

---

## 6. Security checklist (production)

- [ ] Strong `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] MongoDB not exposed publicly
- [ ] HTTPS before sharing with users
- [ ] Firewall: 22, 80, 443 only
- [ ] Scheduled cert renewal + MongoDB backups

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| APK says offline / wrong API | Rebake: `bun run build:android:rebundle`; check `EXPO_PUBLIC_API_URL` has no trailing `/` |
| Dev client shows “connect to server” | Expected for dev build — use standalone script for prod APK |
| `//v1/auth` route not found | Trailing slash on API URL — remove it |
| Notification controls don't work | Native patch needs rebuild (`expo run:android` or standalone) |
| Gradle Clean file lock | `gradlew --stop`; delete `android/app/build` |
| `Unable to resolve ./index.js` | `EXPO_NO_METRO_WORKSPACE_ROOT=1` |
| nginx won't start with HTTPS | Run `init-letsencrypt.sh` first |
| Mobile can't reach API | HTTPS URL in release APK; LAN IP for local dev |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Daily dev, Metro, `expo run:android`, website dev |
| [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md) | Render + Atlas |
| [API.md](./API.md) | Endpoints |
| [website/](../website/) | React landing page source |
