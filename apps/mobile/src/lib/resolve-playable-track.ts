import type { SearchResult, TrackMetadata as TrackMeta } from "@vibevault/types";
import { isPlayableProvider } from "@vibevault/utils";
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
import { musicApi } from "@/lib/music-api";

const PRELOAD_AHEAD = 2;
const preloadInFlight = new Set<string>();

function isUnknownArtist(name: string) {
  return !name.trim() || /^unknown artist$/i.test(name.trim());
}

function youtubeThumbnail(externalId: string) {
  const id = externalId.trim();
  if (!id || id.startsWith("http")) {
    return undefined;
  }

  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function mergePlayableMetadata(
  source: SearchResult,
  match: SearchResult,
): SearchResult {
  const artists = match.artists.every((artist) => isUnknownArtist(artist.name))
    ? source.artists
    : match.artists;

  return {
    ...match,
    artists: artists.length > 0 ? artists : match.artists,
    artworkUrl:
      match.artworkUrl ??
      source.artworkUrl ??
      youtubeThumbnail(match.ref.externalId),
    album: match.album ?? source.album,
  };
}

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
      const merged = mergePlayableMetadata(result, matched);
      cachePlayableResult(result, merged);
      return merged;
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

export async function preloadQueueTracks(queue: TrackMeta[]) {
  const batch = queue.slice(0, PRELOAD_AHEAD);

  for (const track of batch) {
    const sourceKey = trackKey(track);
    if (preloadInFlight.has(sourceKey)) continue;

    preloadInFlight.add(sourceKey);
    try {
      // Match only — stream URLs are resolved when a track is about to play.
      await resolvePlayableResult(trackToSearchResult(track));
    } catch {
      // Best-effort preload.
    } finally {
      preloadInFlight.delete(sourceKey);
    }
  }
}
