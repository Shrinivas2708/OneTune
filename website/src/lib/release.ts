export interface ReleaseManifest {
  version: string;
  downloadUrl: string;
  websiteUrl: string;
  releaseNotes?: string;
}

const fallback: ReleaseManifest = {
  version: "1.0.0",
  downloadUrl:
    import.meta.env.VITE_APK_URL ??
    "https://github.com/Shrinivas2708/OneTune/releases/download/v1.0.0/OneTune-1.0.0.apk",
  websiteUrl: import.meta.env.VITE_WEBSITE_URL ?? "https://onetune.shribuilds.in",
};

let cached: ReleaseManifest | null = null;

export async function getReleaseManifest(): Promise<ReleaseManifest> {
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch("/release.json", {
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const json = (await response.json()) as ReleaseManifest;
      if (json.version && json.downloadUrl) {
        cached = json;
        return json;
      }
    }
  } catch {
    // Use fallback below.
  }

  cached = fallback;
  return fallback;
}

export function apkFileNameFromUrl(url: string) {
  const segment = url.split("/").pop();
  return segment && segment.endsWith(".apk") ? segment : "OneTune.apk";
}
