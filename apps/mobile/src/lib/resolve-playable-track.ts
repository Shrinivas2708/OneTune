import type { TrackMetadata } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import {
  getCachedPlayableResult,
  getInFlightMatch,
  matchCacheKey,
  setInFlightMatch,
  cachePlayableResult,
} from "@/lib/playable-cache";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { searchResultToTrack } from "@/stores/player-store";
import { trackKey } from "@/services/player-helpers";
import type { SearchResult, TrackMetadata as TrackMeta } from "@vibevault/types";
import { isPlayableProvider } from "@vibevault/utils";

const PRELOAD_AHEAD = 3;
const preloadInFlight = new Set<string>();

export async function resolvePlayableResult(
  input: SearchResult | TrackMeta,
): Promise<SearchResult> {
  const result =
    "providerId" in input ? input : trackToSearchResult(input);

  if (isPlayableProvider(result.providerId)) {
    return result;
  }

  const cached = getCachedPlayableResult(result);
  if (cached) {
    return cached;
  }

  const matchKey = matchCacheKey({
    title: result.title,
    artists: result.artists,
    durationMs: result.durationMs,
  });

  const pending = getInFlightMatch(matchKey);
  if (pending) {
    return pending;
  }

  const request = musicApi
    .matchTrack({
      title: result.title,
      artists: result.artists,
      durationMs: result.durationMs,
    })
    .then((matched) => {
      cachePlayableResult(result, matched);
      return matched;
    });

  setInFlightMatch(matchKey, request);
  return request;
}

export async function resolvePlayableTrack(
  track: TrackMeta,
): Promise<TrackMeta> {
  const result = await resolvePlayableResult(track);
  return searchResultToTrack(result);
}

export async function preloadQueueTracks(queue: TrackMetadata[]) {
  const batch = queue.slice(0, PRELOAD_AHEAD);

  await Promise.all(
    batch.map(async (track) => {
      const sourceKey = trackKey(track);
      if (preloadInFlight.has(sourceKey)) return;

      preloadInFlight.add(sourceKey);
      try {
        const playable = searchResultToTrack(
          await resolvePlayableResult(trackToSearchResult(track)),
        );
        const streamKey = trackKey(playable);
        const cached = manifestCache.get(streamKey);

        if (!cached || isStreamExpired(cached.expiresAt)) {
          const manifest = await musicApi.resolveStream({
            trackRef: playable.ref,
          });
          manifestCache.set(streamKey, manifest);
        }
      } catch {
        // Best-effort preload.
      } finally {
        preloadInFlight.delete(sourceKey);
      }
    }),
  );
}
