import type { SearchResult, TrackMetadata } from "@vibevault/types";
import { isPlayableProvider } from "@vibevault/utils";
import { musicApi } from "@/lib/music-api";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { searchResultToTrack } from "@/stores/player-store";

export async function resolvePlayableResult(
  input: SearchResult | TrackMetadata,
): Promise<SearchResult> {
  const result =
    "providerId" in input ? input : trackToSearchResult(input);

  if (isPlayableProvider(result.providerId)) {
    return result;
  }

  return musicApi.matchTrack({
    title: result.title,
    artists: result.artists,
    durationMs: result.durationMs,
  });
}

export async function resolvePlayableTrack(
  track: TrackMetadata,
): Promise<TrackMetadata> {
  const result = await resolvePlayableResult(track);
  return searchResultToTrack(result);
}
