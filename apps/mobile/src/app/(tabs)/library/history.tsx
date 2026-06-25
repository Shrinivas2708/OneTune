import { FlashList } from "@shopify/flash-list";
import { RefreshControl, Text, View } from "react-native";
import { LibraryTrackRow } from "@/components/library/library-track-row";
import { VaultHeading, VaultSubheading } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { TrackListSkeleton } from "@/components/ui/skeleton";
import { useHistory } from "@/hooks/use-history";
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

  const errorMessage = error ? getErrorMessage(error, "Could not load history.") : null;

  return (
    <Screen className="pt-4" padded={false}>
      <View className="px-6">
        <VaultHeading>History</VaultHeading>
        <VaultSubheading>Recently played tracks.</VaultSubheading>
      </View>

      <View className="mt-6 min-h-[200px] flex-1 px-4">
        {isLoading ? <TrackListSkeleton /> : null}

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void refetch()} />
        ) : null}

        {!isLoading && !errorMessage && (data?.length ?? 0) === 0 ? (
          <Text className="px-6 text-center font-inter text-sm text-vault-muted">
            Nothing played yet. Your listening history will show up here.
          </Text>
        ) : null}

        {!isLoading && !errorMessage && data && data.length > 0 ? (
          <FlashList
            data={data}
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
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>
    </Screen>
  );
}
