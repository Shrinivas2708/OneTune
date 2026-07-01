import type { TrackMetadata, StreamManifest } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import { resolvePlayableResult } from "@/lib/resolve-playable-track";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { trackKey } from "@/services/player-helpers";
import { searchResultToTrack, usePlayerStore } from "@/stores/player-store";
import {
  beginPlaybackTransition,
  isActivePlaybackGeneration,
} from "./playback-session";

export { beginPlaybackTransition, isActivePlaybackGeneration };

export async function resolveStreamManifest(
  track: TrackMetadata,
): Promise<StreamManifest> {
  const key = trackKey(track);
  const cached = manifestCache.get(key);

  if (cached && !isStreamExpired(cached.expiresAt)) {
    return cached;
  }

  const manifest = await musicApi.resolveStream({ trackRef: track.ref });
  manifestCache.set(key, manifest);
  return manifest;
}

export interface PreparedTrack {
  playable: TrackMetadata;
  manifest: StreamManifest;
}

export async function prepareTrackTransition(
  track: TrackMetadata,
  token: number,
): Promise<PreparedTrack | null> {
  const playable = searchResultToTrack(
    await resolvePlayableResult(trackToSearchResult(track)),
  );

  if (!isActivePlaybackGeneration(token)) {
    return null;
  }

  const manifest = await resolveStreamManifest(playable);

  if (!isActivePlaybackGeneration(token)) {
    return null;
  }

  return { playable, manifest };
}

export function removeTrackAndSkippedFromQueue(track: TrackMetadata) {
  const key = trackKey(track);
  const queue = usePlayerStore.getState().queue;
  const index = queue.findIndex((item) => trackKey(item) === key);

  if (index >= 0) {
    usePlayerStore.setState({ queue: queue.slice(index + 1) });
  }
}
