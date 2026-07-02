# OneTune — Development Guide

> Step-by-step workflow for local development on Windows (backend + Android).

---

## Prerequisites

Install these once:

| Tool | Purpose |
|------|---------|
| [Bun](https://bun.sh) | Package manager / scripts |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | API + MongoDB + providers |
| [Android Studio](https://developer.android.com/studio) | Emulator, SDK, optional APK builds |
| [Platform tools (ADB)](https://developer.android.com/studio/releases/platform-tools) | Install APK on a physical phone |
| Git | Clone repo |

**Android setup checklist**

1. Android Studio → **SDK Manager** → install **Android SDK Platform 35** (or latest) and **Build-Tools**.
2. Enable **USB debugging** on your phone (Developer options).
3. Connect phone via USB → accept the debugging prompt.
4. Verify ADB sees the device:

```powershell
adb devices
```

You should see your device as `device` (not `unauthorized`).

> **Expo Go is not supported.** The app uses `react-native-track-player`, `react-native-mmkv`, and `expo-dev-client`. You need a native dev build (`expo run:android`).

---

## 1. First-time setup

### Step 1 — Clone and install

```powershell
git clone <repo-url> onetune
cd onetune
bun install
cp .env.example .env
```

### Step 2 — Start the backend

Start Docker Desktop, then:

```powershell
docker compose up --build -d
```

### Step 3 — Verify API

```powershell
curl http://localhost:3000/health
```

Expected: JSON with `"status":"ok"` (or similar).

### Step 4 — Configure mobile API URL

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_NO_METRO_WORKSPACE_ROOT=1
```

Use the table below if you're not on the emulator.

| Target | `EXPO_PUBLIC_API_URL` |
|--------|------------------------|
| Android emulator | `http://10.0.2.2:3000` |
| Physical phone (same Wi‑Fi) | `http://<your-pc-lan-ip>:3000` |
| Web only (`w` in Metro) | `http://localhost:3000` |

Find your LAN IP: `ipconfig` → IPv4 address. Allow inbound TCP **3000** in Windows Firewall if the phone can't reach the API.

---

## 2. Daily development workflow

### Terminal 1 — Backend

```powershell
cd onetune
docker compose up
```

Leave running. Use `docker compose up -d` if you prefer background.

### Terminal 2 — Mobile (Metro)

```powershell
cd onetune\apps\mobile
npx expo start --dev-client
```

- Press **`a`** to open on Android emulator.
- On a **physical phone**: scan the QR code (same Wi‑Fi as PC). Use `--tunnel` if LAN discovery fails.

### Optional — API hot reload outside Docker

```powershell
cd onetune\apps\api
bun run dev
```

Set `MONGODB_URI=mongodb://localhost:27017/onetune` in root `.env` if running API on the host.

---

## 3. Native dev build (first time + after native changes)

JS-only changes reload from Metro (`r` in the terminal). **Playback, downloads, and notification controls** need a real native build.

### Step 1 — Build and install dev client

```powershell
cd onetune\apps\mobile
npx expo run:android
```

- First run takes **10–20 minutes** (Gradle downloads, native compile).
- Installs a **development build** on emulator or connected phone.
- Starts Metro automatically when done.

### Step 2 — Connect to Metro on later sessions

If the app is already installed:

```powershell
cd onetune\apps\mobile
npx expo start --dev-client
```

Open the app on the device — it loads JS from Metro.

### When to run `expo run:android` again

| Change | Action |
|--------|--------|
| React/TS UI, hooks, API calls | Metro reload (`r`) |
| New npm package **without** native code | Metro reload |
| New native module, SDK bump, `android/` prebuild, Kotlin patches | `npx expo run:android` |
| `patches/react-native-track-player*` updated | `npx expo run:android` |

---

## 4. ADB quick reference

```powershell
# List devices
adb devices

# Install an APK
adb install -r apps\mobile\android\app\build\outputs\apk\release\app-release.apk

# Install dev debug APK
adb install -r apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk

# View app logs (filter by React Native)
adb logcat *:S ReactNative:V ReactNativeJS:V

# Uninstall
adb uninstall com.onetune.app
```

Use `-r` to replace an existing install.

---

## 5. Native test checklist

After dev build is installed and Metro is running:

1. **Auth** — register, log in, kill app, reopen (session persists).
2. **Search** — query returns results (API reachable).
3. **Play** — tap track → mini-player → audio plays.
4. **Queue** — add to queue, skip, auto-advance.
5. **Library** — likes, history, downloads, import; back button returns to library index.
6. **Downloads** — download track → airplane mode → play offline.
7. **Notification controls** — play/pause/skip from shade or lock screen.

---

## 6. Web vs native

| Feature | Web (`w` in Metro) | Native dev build |
|---------|-------------------|------------------|
| Auth, search, UI | ✅ | ✅ |
| Playback, queue | ❌ | ✅ |
| Downloads, offline | ❌ | ✅ |
| Lock screen / notification controls | ❌ | ✅ |

---

## 7. Common commands

| Command | Description |
|---------|-------------|
| `bun install` | Install workspace dependencies |
| `bun run typecheck` | TypeScript check all packages |
| `docker compose up -d` | Backend in background |
| `docker compose down` | Stop backend |
| `docker compose logs -f api` | Follow API logs |
| `cd apps/mobile && npx expo start --dev-client` | Metro for dev client |
| `cd apps/mobile && npx expo run:android` | Build + install dev client |
| `bun run website:dev` | Marketing site (Vite dev server) |
| `bun run website:sync-apk` | Copy APK → `website/public/downloads/` |
| `bun run website:build` | Production site → `website/dist/` |

---

## 8. Test API without the app

```powershell
curl http://localhost:3000/health
.\scripts\test-auth.ps1
.\scripts\test-search.ps1
```

Dev-only provider routes (`NODE_ENV=development`):

```powershell
.\scripts\test-providers.ps1
```

---

## 9. Environment files

| File | Purpose |
|------|---------|
| `.env` (repo root) | API secrets, MongoDB, JWT — Docker |
| `.env.example` | Template (committed) |
| `apps/mobile/.env` | `EXPO_PUBLIC_API_URL` for Metro / Gradle |
| `website/.env` | Optional `VITE_APK_URL` for landing page builds |

---

## 11. Marketing website (React)

The public landing page is in `website/` — **React 19 + Vite + TypeScript**, separate from the Expo app.

### Dev

```powershell
cd onetune
bun run website:dev
```

### Wire up APK downloads

```powershell
cd apps\mobile && bun run build:android:standalone
cd ..\.. && bun run website:sync-apk
```

Configure in `website/src/config.ts` or `website/.env`:

```env
VITE_APK_URL=/downloads/OneTune-1.0.0.apk
VITE_APK_FILE_NAME=OneTune-1.0.0.apk
```

Use a full HTTPS URL in production. Deploy output: `bun run website:build` → `website/dist/`.

See [DEPLOYMENT.md §4](./DEPLOYMENT.md#4-marketing-website) for hosting.

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Phone can't reach API | Use LAN IP, not `localhost`; check firewall port 3000 |
| `adb devices` empty | USB debugging on; try another cable; install USB driver |
| `unauthorized` in adb | Accept prompt on phone |
| Metro won't connect | Same Wi‑Fi; try `npx expo start --dev-client --tunnel` |
| Playback / notification controls broken after native patch | Run `npx expo run:android` again (not just Metro reload) |
| Generic / Expo icon instead of OneTune | `npx expo prebuild --platform android --clean` then `npx expo run:android` — launcher icons were missing from `android/res` |
| Shared file shows as `app-release.apk` | Normal Gradle default; release builds also output `OneTune-1.0.0-release.apk` after standalone/rebundle script |
| Gradle / file lock on Clean | `cd apps/mobile/android && .\gradlew.bat --stop`; delete `android/app/build` manually |
| `Unable to resolve module ./index.js` from repo root | Set `EXPO_NO_METRO_WORKSPACE_ROOT=1` in `apps/mobile/.env` |

Backend and production APK issues: [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production APK build, ADB install, backend deploy |
| [API.md](./API.md) | Endpoints |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Code structure |
| [website/](../website/) | React marketing site source |
