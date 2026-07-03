import type { TrackMetadata } from "@vibevault/types";
import { upgradeArtworkUrl } from "@vibevault/utils";

type ArtworkSource = Pick<TrackMetadata, "artworkUrl" | "album" | "ref">;

function youtubeThumbnailFromRef(ref?: TrackMetadata["ref"]) {
  if (ref?.providerId !== "youtube") {
    return undefined;
  }

  const id = ref.externalId?.trim();
  if (!id || id.startsWith("http")) {
    return undefined;
  }

  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function getTrackArtworkUri(track: ArtworkSource): string | undefined {
  const uri =
    track.artworkUrl ??
    track.album?.artworkUrl ??
    youtubeThumbnailFromRef(track.ref) ??
    undefined;
  return uri ? upgradeArtworkUrl(uri) : undefined;
}
