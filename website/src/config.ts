/**
 * Site download config.
 *
 * Source of truth: website/public/release.json (updated by GitHub Actions on git tag).
 * ApkLink loads that file at runtime. Env vars below are fallbacks only.
 */
export const siteConfig = {
  apkUrl:
    import.meta.env.VITE_APK_URL ??
    "https://github.com/Shrinivas2708/OneTune/releases/download/v1.0.0/OneTune-1.0.0.apk",
  apkFileName: import.meta.env.VITE_APK_FILE_NAME ?? "OneTune-1.0.0.apk",
} as const;

export const adminConfig = {
  apiUrl:
    import.meta.env.VITE_API_URL ?? "https://api.onetune.shribuilds.in",
} as const;
