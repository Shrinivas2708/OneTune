import type { TrackMetadata, StreamManifest } from "@vibevault/types";
import type { AddTrack } from "react-native-track-player";
import { manifestCache, manifestCacheKey } from "@/lib/manifest-cache";

export function trackKey(track: TrackMetadata) {
  return manifestCacheKey(track.ref.providerId, track.ref.externalId);
}

export function toPlayerTrack(
  track: TrackMetadata,
  manifest: StreamManifest,
): AddTrack {
  return {
    id: trackKey(track),
    url: manifest.url,
    title: track.title,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album?.name,
    artwork: track.artworkUrl,
    duration: track.durationMs ? track.durationMs / 1000 : undefined,
    headers: manifest.headers,
    contentType: manifest.mimeType,
  };
}
