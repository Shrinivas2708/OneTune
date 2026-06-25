import type { SavedPlaylistSummary } from "@vibevault/types";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ArtworkImage } from "@/components/ui/artwork-image";

interface PlaylistCardProps {
  playlist: SavedPlaylistSummary;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link asChild href={`/(tabs)/library/${playlist.id}`}>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-vault-lg bg-vault-surface-elevated px-3 py-3"
      >
        <ArtworkImage
          label={`${playlist.name} artwork`}
          radius={8}
          size={56}
          uri={playlist.artworkUrl}
        />

        <View className="min-w-0 flex-1">
          <Text className="font-inter-semibold text-base text-vault-text" numberOfLines={1}>
            {playlist.name}
          </Text>
          <Text className="mt-1 font-inter text-sm text-vault-muted">
            {playlist.trackCount} tracks · Spotify
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
