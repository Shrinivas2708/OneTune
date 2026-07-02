import Constants from "expo-constants";

function normalizeApiUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const embeddedApiUrl = Constants.expoConfig?.extra?.apiUrl;

const rawApiUrl =
  (typeof embeddedApiUrl === "string" && embeddedApiUrl.length > 0
    ? embeddedApiUrl
    : undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000";

/** Baked into the app at build/prebuild time via app.config.js → extra.apiUrl */
export const API_URL = normalizeApiUrl(rawApiUrl);
