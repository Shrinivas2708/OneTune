import type { TrackMetadata } from "@vibevault/types";
import { upgradeArtworkUrl } from "@vibevault/utils";

type ArtworkSource = Pick<TrackMetadata, "artworkUrl" | "album">;

export function getTrackArtworkUri(track: ArtworkSource): string | undefined {
  const uri = track.artworkUrl ?? track.album?.artworkUrl ?? undefined;
  return uri ? upgradeArtworkUrl(uri) : undefined;
}
