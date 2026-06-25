export type FeatureFlags = {
  enableVideoPlayback: boolean;
  enableSpotifyImport: boolean;
  enableProxiedStreaming: boolean;
};

function envBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === "true";
}

export function parseFeatureFlags(
  env: Record<string, string | undefined> = process.env,
): FeatureFlags {
  return {
    enableVideoPlayback: envBool(env.FF_VIDEO_PLAYBACK, false),
    enableSpotifyImport: envBool(env.FF_SPOTIFY_IMPORT, true),
    enableProxiedStreaming: envBool(env.FF_PROXIED_STREAMING, false),
  };
}

export const featureFlags = parseFeatureFlags();
