import type { TrackMetadata } from "@vibevault/types";
import { Image } from "expo-image";
import { View } from "react-native";

interface TrackArtworkProps {
  track: TrackMetadata;
  size: number;
  radius?: number;
}

export function TrackArtwork({ track, size, radius = 8 }: TrackArtworkProps) {
  if (track.artworkUrl) {
    return (
      <Image
        accessibilityLabel={`${track.title} artwork`}
        contentFit="cover"
        source={{ uri: track.artworkUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  return (
    <View
      className="bg-vault-artwork-placeholder"
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}
