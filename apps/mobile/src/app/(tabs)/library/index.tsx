import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, Text, View, Pressable } from "react-native";
import { PlaylistCard } from "@/components/library/playlist-card";
import { VaultButton, VaultHeading, VaultSubheading } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PlaylistListSkeleton } from "@/components/ui/skeleton";
import { Screen } from "@/components/ui/screen";
import { useFavorites } from "@/hooks/use-favorites";
import { useHistory } from "@/hooks/use-history";
import { usePlaylists } from "@/hooks/use-playlists";
import { useScrollBottomInset } from "@/hooks/use-scroll-bottom-inset";
import { getErrorMessage } from "@/lib/error-message";
import { useDownloadStore } from "@/stores/download-store";
import type { SavedPlaylistSummary } from "@vibevault/types";

interface LibraryShortcutProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  onPress: () => void;
}

function LibraryShortcut({ title, subtitle, icon, tint, onPress }: LibraryShortcutProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-4 rounded-vault-lg bg-vault-surface px-4 py-3.5 active:bg-vault-surface-elevated"
      onPress={onPress}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-vault-lg"
        style={{ backgroundColor: `${tint}20` }}
      >
        <Ionicons color={tint} name={icon} size={22} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-inter-semibold text-base text-vault-text">{title}</Text>
        <Text className="mt-1 font-inter text-sm text-vault-muted">{subtitle}</Text>
      </View>
      <Ionicons color="#666" name="chevron-forward" size={18} />
    </Pressable>
  );
}

function LibraryListHeader({
  favoritesCount,
  historyCount,
  downloadCount,
  onNavigate,
}: {
  favoritesCount: number;
  historyCount: number;
  downloadCount: number;
  onNavigate: (href: string) => void;
}) {
  return (
    <View className="px-6 pb-2 pt-2">
      <Text className="font-inter text-sm uppercase tracking-[2px] text-vault-accent">
        Collection
      </Text>
      <VaultHeading>Your Library</VaultHeading>
      <VaultSubheading>Playlists, favorites, and offline vault.</VaultSubheading>

      <View className="mt-6 gap-3">
        <LibraryShortcut
          icon="heart"
          subtitle={`${favoritesCount} saved tracks`}
          tint="#f3727f"
          title="Likes"
          onPress={() => onNavigate("/library/favorites")}
        />
        <LibraryShortcut
          icon="time"
          subtitle={`${historyCount} recently played`}
          tint="#ffa42b"
          title="History"
          onPress={() => onNavigate("/library/history")}
        />
        <LibraryShortcut
          icon="download-outline"
          subtitle={`${downloadCount} saved for offline`}
          tint="#539df5"
          title="Downloads"
          onPress={() => onNavigate("/library/downloads")}
        />
        <VaultButton
          label="Import music"
          variant="secondary"
          uppercase={false}
          onPress={() => onNavigate("/library/import")}
        />
      </View>

      <Text className="mb-1 mt-8 font-jakarta text-lg text-vault-text">Playlists</Text>
    </View>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const { data, error, isLoading, refetch, isRefetching } = usePlaylists();
  const { data: favorites } = useFavorites();
  const { data: history } = useHistory(50);
  const downloadCount = useDownloadStore((state) => state.records.length);
  const bottomInset = useScrollBottomInset();

  const errorMessage = error ? getErrorMessage(error, "Could not load your library.") : null;
  const playlists = data ?? [];

  const listHeader = useMemo(
    () => (
      <LibraryListHeader
        downloadCount={downloadCount}
        favoritesCount={favorites?.length ?? 0}
        historyCount={history?.length ?? 0}
        onNavigate={(href) => router.push(href as never)}
      />
    ),
    [downloadCount, favorites?.length, history?.length, router],
  );

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View className="px-4">
          <PlaylistListSkeleton />
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View className="px-2">
          <ErrorState
            message={errorMessage}
            subtitle="Check that the API is running and try again."
            onRetry={() => void refetch()}
          />
        </View>
      );
    }

    return (
      <View className="items-center px-6 py-10">
        <Ionicons color="#1ed760" name="albums-outline" size={36} />
        <Text className="mt-4 text-center font-inter-semibold text-base text-vault-text">
          No playlists yet
        </Text>
        <Text className="mt-2 text-center font-inter text-sm text-vault-muted">
          Import a Spotify playlist to build your collection.
        </Text>
      </View>
    );
  }, [errorMessage, isLoading, refetch]);

  return (
    <Screen className="pt-0" padded={false}>
      <FlashList
        contentContainerStyle={{ paddingBottom: bottomInset }}
        data={isLoading || errorMessage ? [] : playlists}
        estimatedItemSize={88}
        keyExtractor={(item: SavedPlaylistSummary) => item.id}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            tintColor="#1ed760"
            onRefresh={() => void refetch()}
          />
        }
        renderItem={({ item }) => (
          <View className="px-4">
            <PlaylistCard playlist={item} />
          </View>
        )}
        showsVerticalScrollIndicator
      />
    </Screen>
  );
}
