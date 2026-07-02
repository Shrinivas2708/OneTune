import { FlashList } from "@shopify/flash-list";
import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from "react-native";
import { ProviderBadge } from "@/components/search/provider-badge";
import { DownloadButton } from "@/components/downloads/download-button";
import { DownloadProgressBar } from "@/components/downloads/download-progress-bar";
import { PlaylistActions } from "@/components/library/playlist-actions";
import { AddToQueueButton } from "@/components/player/add-to-queue-button";
import { ArtworkImage } from "@/components/ui/artwork-image";
import { getTrackArtworkUri } from "@/lib/track-artwork";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { PlaylistDetailSkeleton } from "@/components/ui/skeleton";
import { useDownloadStatus } from "@/hooks/use-download-status";
import { usePlayTrack } from "@/hooks/use-play-track";
import { usePlaylist } from "@/hooks/use-playlists";
import { useScrollBottomInset } from "@/hooks/use-scroll-bottom-inset";
import { formatArtists } from "@/lib/track-format";
import { getErrorMessage } from "@/lib/error-message";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { trackKey, usePlayerStore } from "@/stores/player-store";
import { formatDuration } from "@vibevault/utils";
import type { SavedPlaylist } from "@vibevault/types";

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
  const { isDownloaded, isDownloading, progress } = useDownloadStatus(track);

  return (
    <View className="px-2">
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center gap-3 rounded-vault-lg px-2 py-2.5 ${isActive ? "bg-vault-surface-elevated" : ""}`}
        onPress={onPress}
      >
        <ArtworkImage label={`${track.title} artwork`} radius={8} size={48} uri={getTrackArtworkUri(track)} />

        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-inter-semibold text-base text-vault-text" numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="font-inter text-sm text-vault-muted" numberOfLines={1}>
            {formatArtists(track)}
          </Text>
          <View className="flex-row items-center gap-2">
            <ProviderBadge providerId={track.ref.providerId} />
            {isDownloaded ? (
              <Text className="font-inter-semibold text-[11px] text-vault-accent">Offline</Text>
            ) : null}
          </View>
        </View>

        <View className="min-w-[44px] items-end flex-row gap-1">
          <AddToQueueButton result={trackToSearchResult(track)} size={20} />
          <DownloadButton showProgress track={track} />
          {isResolving ? (
            <ActivityIndicator color="#1ed760" size="small" />
          ) : track.durationMs !== undefined ? (
            <Text className="font-inter text-sm text-vault-muted">
              {formatDuration(track.durationMs)}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {isDownloading ? (
        <View className="px-4 pb-2">
          <DownloadProgressBar progress={progress} showPercent />
        </View>
      ) : null}
    </View>
  );
}

function PlaylistListHeader({
  playlist,
  tracks,
}: {
  playlist: SavedPlaylist;
  tracks: TrackMetadata[];
}) {
  return (
    <View className="pb-2">
      <View className="flex-row items-center gap-4 px-4 py-3">
        <ArtworkImage
          label={`${playlist.name} artwork`}
          radius={12}
          size={96}
          uri={
            playlist.artworkUrl ??
            (tracks[0] ? getTrackArtworkUri(tracks[0]) : undefined)
          }
        />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-jakarta text-xl text-vault-text" numberOfLines={2}>
            {playlist.name}
          </Text>
          <Text className="font-inter text-sm text-vault-muted">
            {playlist.trackCount} tracks
          </Text>
        </View>
      </View>
      <PlaylistActions tracks={tracks} />
    </View>
  );
}

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { data, error, isLoading, refetch, isRefetching } = usePlaylist(playlistId ?? "");
  const playTrack = usePlayTrack();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isResolving = usePlayerStore((state) => state.isResolving);
  const bottomInset = useScrollBottomInset();

  const resolvingKey =
    isResolving && playTrack.variables
      ? trackKey(trackToSearchResult(playTrack.variables))
      : null;

  const activeKey = currentTrack ? trackKey(currentTrack) : null;

  const listHeader = useMemo(
    () => (data ? <PlaylistListHeader playlist={data} tracks={data.tracks} /> : null),
    [data],
  );

  const renderItem = useCallback(
    ({ item }: { item: TrackMetadata }) => (
      <PlaylistTrackRow
        isActive={trackKey(item) === activeKey}
        isResolving={trackKey(item) === resolvingKey}
        track={item}
        onPress={() => playTrack.mutate(trackToSearchResult(item))}
      />
    ),
    [activeKey, playTrack, resolvingKey],
  );

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

      <View className="min-h-0 flex-1">
        <FlashList
          contentContainerStyle={{ paddingBottom: bottomInset }}
          data={data.tracks}
          estimatedItemSize={76}
          keyExtractor={(item) => trackKey(item)}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              tintColor="#1ed760"
              onRefresh={() => void refetch()}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator
        />
      </View>
    </Screen>
  );
}
