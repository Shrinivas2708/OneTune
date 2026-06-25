import type { TrackMetadata } from "@vibevault/types";

export function formatArtists(track: TrackMetadata) {
  return track.artists.map((artist) => artist.name).join(", ");
}
