import type { TrackMetadata } from "@vibevault/types";

type ArtworkSource = Pick<TrackMetadata, "artworkUrl" | "album">;

export function getTrackArtworkUri(track: ArtworkSource): string | undefined {
  return track.artworkUrl ?? track.album?.artworkUrl ?? undefined;
}
