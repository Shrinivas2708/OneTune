import type { TrackMetadata } from "@vibevault/types";
import { ArtworkImage } from "@/components/ui/artwork-image";

interface TrackArtworkProps {
  track: TrackMetadata;
  size: number;
  radius?: number;
}

export function TrackArtwork({ track, size, radius = 8 }: TrackArtworkProps) {
  return (
    <ArtworkImage
      label={`${track.title} artwork`}
      radius={radius}
      size={size}
      uri={track.artworkUrl}
    />
  );
}
