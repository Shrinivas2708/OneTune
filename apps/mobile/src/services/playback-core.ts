import type { TrackMetadata, StreamManifest } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import { resolvePlayableResult } from "@/lib/resolve-playable-track";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { trackKey } from "@/services/player-helpers";
import { searchResultToTrack, usePlayerStore } from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";
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

export interface QueueTransitionOptions {
  syncQueue: boolean;
  quiet?: boolean;
}

export type QueueTransitionFn = (
  track: TrackMetadata,
  token: number,
  options: QueueTransitionOptions,
) => Promise<boolean>;

const MAX_QUEUE_SKIP_ATTEMPTS = 25;

export async function advanceQueue(
  transition: QueueTransitionFn,
  token: number,
): Promise<void> {
  let skipped = 0;

  for (let attempt = 0; attempt < MAX_QUEUE_SKIP_ATTEMPTS; attempt += 1) {
    if (!isActivePlaybackGeneration(token)) {
      return;
    }

    const queue = usePlayerStore.getState().queue;
    if (queue.length === 0) {
      usePlayerStore.getState().setIsPlaying(false);
      return;
    }

    const track = queue[0]!;
    const success = await transition(track, token, {
      syncQueue: true,
      quiet: true,
    });

    if (success) {
      if (skipped > 0) {
        showToast(
          `Skipped ${skipped} unavailable track${skipped === 1 ? "" : "s"}`,
          "info",
        );
      }
      return;
    }

    if (!isActivePlaybackGeneration(token)) {
      return;
    }

    const head = usePlayerStore.getState().queue[0];
    if (head && trackKey(head) === trackKey(track)) {
      removeTrackAndSkippedFromQueue(track);
    }

    skipped += 1;
  }

  const message = "Could not play any queued tracks.";
  usePlayerStore.getState().setIsPlaying(false);
  usePlayerStore.getState().setResolveError(message);
  showToast(message);
}

export function removeTrackAndSkippedFromQueue(track: TrackMetadata) {
  const key = trackKey(track);
  const queue = usePlayerStore.getState().queue;
  const index = queue.findIndex((item) => trackKey(item) === key);

  if (index >= 0) {
    usePlayerStore.setState({ queue: queue.slice(index + 1) });
  }
}
