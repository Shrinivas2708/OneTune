import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Alert, Pressable, RefreshControl, Text, View } from "react-native";
import { LibraryTrackRow } from "@/components/library/library-track-row";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { SubScreenHeader } from "@/components/ui/sub-screen-header";
import { TrackListSkeleton } from "@/components/ui/skeleton";
import { useClearHistory, useHistory } from "@/hooks/use-history";
import { useScrollBottomInset } from "@/hooks/use-scroll-bottom-inset";
import { formatArtists } from "@/lib/track-format";
import { getErrorMessage } from "@/lib/error-message";

function formatPlayedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const { data, error, isLoading, refetch, isRefetching } = useHistory();
  const clearHistory = useClearHistory();
  const bottomInset = useScrollBottomInset();

  const errorMessage = error ? getErrorMessage(error, "Could not load history.") : null;
  const hasHistory = (data?.length ?? 0) > 0;

  const confirmClearHistory = () => {
    Alert.alert(
      "Clear history?",
      "This removes all recently played tracks. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearHistory.mutate(),
        },
      ],
    );
  };

  return (
    <Screen className="pt-2" padded={false}>
      <SubScreenHeader
        backHref="/(tabs)/library"
        right={
          hasHistory ? (
            <Pressable
              accessibilityLabel="Clear history"
              accessibilityRole="button"
              className="rounded-vault-lg bg-vault-surface-elevated p-2.5"
              disabled={clearHistory.isPending}
              onPress={confirmClearHistory}
            >
              <Ionicons color="#f3727f" name="trash-outline" size={20} />
            </Pressable>
          ) : null
        }
        subtitle="Recently played tracks."
        title="History"
      />

      <View className="mt-4 min-h-0 flex-1 px-4">
        {isLoading ? <TrackListSkeleton /> : null}

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void refetch()} />
        ) : null}

        {!isLoading && !errorMessage && !hasHistory ? (
          <Text className="px-6 text-center font-inter text-sm text-vault-muted">
            Nothing played yet. Your listening history will show up here.
          </Text>
        ) : null}

        {!isLoading && !errorMessage && data && data.length > 0 ? (
          <FlashList
            contentContainerStyle={{ paddingBottom: bottomInset }}
            data={data}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                tintColor="#1ed760"
                onRefresh={() => void refetch()}
              />
            }
            renderItem={({ item }) => (
              <LibraryTrackRow
                showFavorite
                subtitle={`${formatArtists(item.track)} · ${formatPlayedAt(item.playedAt)}`}
                track={item.track}
              />
            )}
            showsVerticalScrollIndicator
          />
        ) : null}
      </View>
    </Screen>
  );
}
