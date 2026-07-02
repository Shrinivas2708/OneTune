/**
 * Site download config — edit this when you deploy.
 *
 * Local dev:  run `bun run website:sync-apk` to copy the latest build into ./downloads/
 * Production: upload OneTune-1.0.0.apk to your host/CDN and set apkUrl to the full HTTPS URL.
 */
window.ONETUNE_SITE = {
  apkUrl: "./downloads/OneTune-1.0.0.apk",
  apkFileName: "OneTune-1.0.0.apk",
};
