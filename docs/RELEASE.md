# OneTune — App release guide

> Ship a new Android APK, update the website download link, and notify users on old versions — without running `website:sync-apk` by hand.

---

## How it works


| Piece                         | What it does                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `website/public/release.json` | Single source of truth: version, APK URL, website URL                                                                        |
| **Website**                   | `ApkLink` loads `release.json` at runtime — download link stays current                                                      |
| **Mobile app**                | On every launch (standalone release APK), fetches `release.json` and shows an update alert if the installed version is older |
| **GitHub Action**             | On `git push --tags v`*, updates `release.json`, commits to `main`, and creates a GitHub Release                             |


Example manifest:

```json
{
  "version": "1.0.1",
  "downloadUrl": "https://github.com/Shrinivas2708/OneTune/releases/download/v1.0.1/OneTune-1.0.1.apk",
  "websiteUrl": "https://onetune.shribuilds.in",
  "releaseNotes": "Bug fixes and queue improvements."
}
```

---



## One-time setup

1. Push this repo and ensure **GitHub Actions** are enabled.
2. Deploy the marketing site so `https://your-domain/release.json` is publicly reachable.
3. Optional: set GitHub repo variable `WEBSITE_URL` (Settings → Secrets and variables → Actions → Variables), e.g. `https://onetune.shribuilds.in`. Used when the release workflow writes `release.json`.
4. Ship at least **one APK** that includes the in-app update prompt (users on older builds without it will not see the alert until they install manually once).

---



## Release day (every version)



### 1. Bump the version (you edit these — not `release.json`)

`website/public/release.json` is updated **automatically** when you push a git tag. You only bump versions in the mobile app **before** building the APK.

All version strings for a release should match (e.g. `1.0.1` everywhere below). The git tag uses a `v` prefix: `v1.0.1`.

#### Required


| File                                   | What to change              | Why                                                                                                          |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/mobile/app.json`                 | `"version": "1.0.1"`        | In-app update check reads this at build time                                                                 |
| `apps/mobile/app.json`                 | `"runtimeVersion": "1.0.1"` | Expo Updates (keep in sync with `version`)                                                                   |
| `apps/mobile/android/app/build.gradle` | `versionName "1.0.1"`       | Android user-facing version; APK filename uses this → `OneTune-1.0.1-release.apk`                            |
| `apps/mobile/android/app/build.gradle` | `versionCode 2`             | **Must increase by 1 every release** (`1` → `2` → `3` …). Android requires this to install over an older APK |




#### Recommended (keep in sync)


| File                                                      | What to change                                       |
| --------------------------------------------------------- | ---------------------------------------------------- |
| `apps/mobile/android/app/src/main/res/values/strings.xml` | `<string name="expo_runtime_version">1.0.1</string>` |




#### Do not bump


| File                          | Note                                     |
| ----------------------------- | ---------------------------------------- |
| `website/public/release.json` | Updated by GitHub Action on tag push     |
| `apps/mobile/package.json`    | Monorepo package version — not the app   |
| Git tag                       | Created in step 3 — not edited in a file |




#### Example: `1.0.0` → `1.0.1`

`apps/mobile/app.json`

```json
"version": "1.0.1",
...
"runtimeVersion": "1.0.1",
```

`apps/mobile/android/app/build.gradle` (inside `defaultConfig { ... }`)

```gradle
versionCode 2
versionName "1.0.1"
```

`apps/mobile/android/app/src/main/res/values/strings.xml`

```xml
<string name="expo_runtime_version">1.0.1</string>
```



#### Quick checklist before build

- [ ] `app.json` → `version` and `runtimeVersion` match the new release
- [ ] `build.gradle` → `versionName` matches
- [ ] `build.gradle` → `versionCode` is higher than the last release
- [ ] `strings.xml` → `expo_runtime_version` matches (optional but good)
- [ ] You have **not** hand-edited `website/public/release.json` (tag push handles it)



### 2. Build the release APK

Close **Android Studio** first. On Windows, pause **Defender** real-time scan on the repo if builds fail with “Unable to delete file”.

```powershell
cd C:\Users\DELL\vibevault\apps\mobile
bun run build:android:standalone
```

The script uses **`bunx expo prebuild`** (SDK 54, not `npx expo`), excludes dev-client modules, stops Gradle, clears stale caches, and builds from the real `C:\` path (no SUBST drive).

If a previous build mapped a short drive, unmap it first: `subst P: /d` (and `O:` etc. if needed).

Output (typical):

```
apps\mobile\android\app\build\outputs\apk\release\OneTune-1.0.1-release.apk
apps\mobile\android\app\build\outputs\apk\release\OneTune-1.0.1.apk   ← for GitHub upload
```

The build script reads the version from `app.json` and finds `OneTune-<version>-release.apk` automatically. It also copies **`OneTune-1.0.1.apk`** (no `-release` suffix) for GitHub Releases upload.

### 3. Commit, tag, and push

```powershell
cd C:\Users\DELL\vibevault
git add .
git commit -m "release: v1.0.1"
git tag v1.0.1
git push origin main --tags
```

Use semver tags with a `v` **prefix**: `v1.0.1`, `v1.1.0`, etc.

### 4. Wait for GitHub Actions

Workflow: `[.github/workflows/release.yml](../.github/workflows/release.yml)`

On tag push it will:

- Write `website/public/release.json` with the new version and GitHub download URL
- Commit that file to `main`
- Create a **GitHub Release** for the tag

Check **Actions** in GitHub if anything fails.

### 5. Upload the APK to GitHub Releases

1. Open **GitHub → Releases** → the release for your tag (e.g. `v1.0.1`).
2. Attach the APK asset named `OneTune-1.0.1.apk` (version must match the tag).

The download URL in `release.json` follows this pattern:

```
https://github.com/<org>/<repo>/releases/download/v1.0.1/OneTune-1.0.1.apk
```

If the asset name does not match, the website and in-app “Download APK” links will 404.

### 6. Redeploy the website (if needed)

If your site does **not** auto-deploy from `main`, rebuild and deploy:

```powershell
bun run website:build
# deploy website/dist/ to your static host
```

Verify:

- `https://your-domain/release.json` shows the new version
- The APK download button points to the new GitHub Release asset



### 7. Optional: add release notes

Edit `website/public/release.json` on `main` and set `releaseNotes`, or let the next tag workflow overwrite it and edit after the Action runs. The mobile alert shows this text when present.

---



## What users see

- **Standalone release APK** (not dev client): on **every launch**, the app fetches `release.json`.
- If installed version < manifest version → alert: **Update available** with **Open website** and **Download APK**.
- After they install the new APK, the prompt stops.

Dev builds (`__DEV__`) and non-standalone environments skip the check.

---



## Verify a release

```powershell
# Manifest
Invoke-RestMethod https://onetune.shribuilds.in/release.json

# APK URL returns 200 (after upload)
$manifest = Invoke-RestMethod https://onetune.shribuilds.in/release.json
Invoke-WebRequest -Method Head -Uri $manifest.downloadUrl
```

Install an old APK on a device, bump `release.json` version only, relaunch — you should see the update alert.

---



## Automation options


| Option                                | Effort | What it automates                                         |
| ------------------------------------- | ------ | --------------------------------------------------------- |
| **Git tag + GitHub Action** (current) | Low    | `release.json`, GitHub Release page, website link pattern |
| **Build APK in CI**                   | Medium | Add Android build to the workflow — no manual APK upload  |
| **Google Play**                       | High   | Store listing + in-app updates (not sideload)             |
| **Expo EAS Update**                   | Medium | JS-only OTA — does **not** replace full APK upgrades      |


To go fully hands-off later, extend `.github/workflows/release.yml` with an Android build job and attach the APK in the same workflow.

---



## Troubleshooting


| Problem                              | Fix                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Update prompt never appears          | Rebuild APK after fix: version must come from **Android versionName** (`expo-application`), not embedded `app.json`. Alert runs ~1s after splash hides. Phone must be **older** than `release.json` (e.g. 1.0.2 installed, site shows 1.0.3). |
| APK link 404                         | Asset on GitHub Release must be named `OneTune-{version}.apk` matching the tag                              |
| Website still shows old link         | Hard refresh; confirm `release.json` deployed; check `ApkLink` loads `/release.json`                        |
| Action did not update `release.json` | Tag must match `v*`; Actions enabled; workflow has `contents: write`                                        |
| **Workflow never ran after first tag** | If `.github/workflows/release.yml` was added in the **same commit** as the tag, GitHub skips the run. Push this fix to `main`, then either **re-push the tag** (`git push --delete origin v1.0.1` then `git push origin v1.0.1`) or run **Actions → Release → Run workflow** with tag `v1.0.1` |
| `v1.0.0` tag never triggered release   | That tag predates the workflow file — only tags pushed **after** the workflow exists on `main` will auto-run |
| Update prompt shows wrong version    | Bump `app.json` `version` before building; rebuild APK — `build.gradle` alone does not fix the in-app check |
| Android won’t install over old APK   | `versionCode` in `build.gradle` must be greater than the installed build                                    |
| Windows Gradle “Unable to delete file” | Close Android Studio; run `cd android; .\gradlew.bat --stop`; pause Defender on repo; rerun build script |
| `different roots P:\` vs `C:\`       | Run `subst P: /d` (and other SUBST letters); always build on real path — script clears SUBST automatically |
| `expo-dev-client` in release build   | Use `bun run build:android:standalone` (sets `EXPO_STANDALONE_BUILD=1` + excludes dev modules in Gradle)     |
| Reanimated / CMake `.o` not found    | Enable Windows long paths (admin + reboot) or move repo to a shorter path like `C:\vv\vibevault`              |
| Manifest fetch fails in app          | Ensure `https://your-domain/release.json` is HTTPS and publicly reachable                                   |


---



## Related docs


| Doc                                            | Purpose                                |
| ---------------------------------------------- | -------------------------------------- |
| [DEPLOYMENT.md](./DEPLOYMENT.md)               | APK build, ADB install, website deploy |
| [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md) | API on Render                          |
| [DEVELOPMENT.md](./DEVELOPMENT.md)             | Local dev + dev client                 |


