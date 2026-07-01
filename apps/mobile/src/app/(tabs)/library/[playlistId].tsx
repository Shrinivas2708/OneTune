import { FlashList } from "@shopify/flash-list";
import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from "react-native";
import { ProviderBadge } from "@/components/search/provider-badge";
import { DownloadButton } from "@/components/downloads/download-button";
import { AddToQueueButton } from "@/components/player/add-to-queue-button";
import { ArtworkImage } from "@/components/ui/artwork-image";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { PlaylistDetailSkeleton } from "@/components/ui/skeleton";
import { usePlayTrack } from "@/hooks/use-play-track";
import { usePlaylist } from "@/hooks/use-playlists";
import { formatArtists } from "@/lib/track-format";
import { getErrorMessage } from "@/lib/error-message";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { trackKey, usePlayerStore } from "@/stores/player-store";
import { formatDuration } from "@vibevault/utils";

function PlaylistTrackRow({
  track,
  isActive,
  isResolving,
  onPress,
}: {
  track: TrackMetadata;
  isActive: boolean;
  isResolving: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center gap-3 rounded-vault-lg px-2 py-2 ${isActive ? "bg-vault-surface-elevated" : ""}`}
      onPress={onPress}
    >
      <ArtworkImage label={`${track.title} artwork`} radius={8} size={48} uri={track.artworkUrl} />

      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-inter-semibold text-base text-vault-text" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="font-inter text-sm text-vault-muted" numberOfLines={1}>
          {formatArtists(track)}
        </Text>
        <ProviderBadge providerId={track.ref.providerId} />
      </View>

      <View className="min-w-[44px] items-end flex-row gap-1">
        <AddToQueueButton result={trackToSearchResult(track)} size={20} />
        <DownloadButton track={track} />
        {isResolving ? (
          <ActivityIndicator color="#1ed760" size="small" />
        ) : track.durationMs !== undefined ? (
          <Text className="font-inter text-sm text-vault-muted">
            {formatDuration(track.durationMs)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { data, error, isLoading, refetch, isRefetching } = usePlaylist(playlistId ?? "");
  const playTrack = usePlayTrack();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isResolving = usePlayerStore((state) => state.isResolving);

  const resolvingKey =
    isResolving && playTrack.variables
      ? trackKey(trackToSearchResult(playTrack.variables))
      : null;

  const activeKey = currentTrack ? trackKey(currentTrack) : null;

  if (isLoading) {
    return (
      <Screen className="pt-2" padded={false}>
        <PlaylistDetailSkeleton />
      </Screen>
    );
  }

  if (!data || error) {
    return (
      <Screen className="pt-4">
        <ErrorState
          message={error ? getErrorMessage(error, "Playlist not found.") : "Playlist not found."}
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen className="pt-2" padded={false}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()}>
          <Ionicons color="#ffffff" name="chevron-back" size={28} />
        </Pressable>
        <Text className="flex-1 font-jakarta text-lg text-vault-text" numberOfLines={1}>
          {data.name}
        </Text>
      </View>

      <View className="items-center px-6 py-4">
        <ArtworkImage label={`${data.name} artwork`} radius={12} size={160} uri={data.artworkUrl} />
        <Text className="mt-4 text-center font-jakarta text-2xl text-vault-text">
          {data.name}
        </Text>
        <Text className="mt-1 font-inter text-sm text-vault-muted">
          {data.trackCount} tracks
        </Text>
      </View>

      <View className="min-h-[200px] flex-1 px-4">
        <FlashList
          data={data.tracks}
          keyExtractor={(item) => trackKey(item)}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              tintColor="#1ed760"
              onRefresh={() => void refetch()}
            />
          }
          renderItem={({ item }) => (
            <PlaylistTrackRow
              isActive={trackKey(item) === activeKey}
              isResolving={trackKey(item) === resolvingKey}
              track={item}
              onPress={() => playTrack.mutate(trackToSearchResult(item))}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}
