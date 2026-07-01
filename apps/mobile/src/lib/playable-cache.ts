import type { SearchResult } from "@vibevault/types";
import { normalizeTrackKey } from "@vibevault/utils";
import { trackKey } from "@/services/player-helpers";
import { searchResultToTrack } from "@/stores/player-store";
import type { TrackMetadata } from "@vibevault/types";
import { isPlayableProvider } from "@vibevault/utils";
import { trackToSearchResult } from "@/lib/track-to-search-result";

const matchCache = new Map<string, SearchResult>();
const inFlight = new Map<string, Promise<SearchResult>>();

function cacheKeyForMetadata(input: SearchResult | TrackMetadata): string {
  const result = "providerId" in input ? input : trackToSearchResult(input);

  if (!isPlayableProvider(result.providerId)) {
    return `meta:${result.ref.providerId}:${result.ref.externalId}`;
  }

  return trackKey(searchResultToTrack(result));
}

function cacheKeyForMatch(input: MatchTrackInput): string {
  const artist = input.artists[0]?.name ?? "";
  return `match:${normalizeTrackKey(input.title, artist)}`;
}

interface MatchTrackInput {
  title: string;
  artists: { name: string }[];
  durationMs?: number | null;
}

export function getCachedPlayableResult(
  input: SearchResult | TrackMetadata,
): SearchResult | undefined {
  return matchCache.get(cacheKeyForMetadata(input));
}

export function cachePlayableResult(
  input: SearchResult | TrackMetadata,
  result: SearchResult,
) {
  matchCache.set(cacheKeyForMetadata(input), result);
  matchCache.set(cacheKeyForMatch({
    title: result.title,
    artists: result.artists,
    durationMs: result.durationMs,
  }), result);
}

export function getInFlightMatch(key: string) {
  return inFlight.get(key);
}

export function setInFlightMatch(key: string, promise: Promise<SearchResult>) {
  inFlight.set(key, promise);
  void promise.finally(() => {
    if (inFlight.get(key) === promise) {
      inFlight.delete(key);
    }
  });
}

export function matchCacheKey(input: MatchTrackInput) {
  return cacheKeyForMatch(input);
}
