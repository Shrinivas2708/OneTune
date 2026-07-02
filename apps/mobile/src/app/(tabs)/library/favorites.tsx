import { FlashList } from "@shopify/flash-list";
import { RefreshControl, Text, View } from "react-native";
import { LibraryTrackRow } from "@/components/library/library-track-row";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { SubScreenHeader } from "@/components/ui/sub-screen-header";
import { TrackListSkeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { useScrollBottomInset } from "@/hooks/use-scroll-bottom-inset";
import { getErrorMessage } from "@/lib/error-message";

export default function FavoritesScreen() {
  const { data, error, isLoading, refetch, isRefetching } = useFavorites();
  const bottomInset = useScrollBottomInset();

  const errorMessage = error ? getErrorMessage(error, "Could not load favorites.") : null;

  return (
    <Screen className="pt-2" padded={false}>
      <SubScreenHeader
        backHref="/(tabs)/library"
        subtitle="Tracks you liked — tap ♥ on any song to save it here."
        title="Likes"
      />

      <View className="mt-4 min-h-0 flex-1 px-4">
        {isLoading ? <TrackListSkeleton /> : null}

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void refetch()} />
        ) : null}

        {!isLoading && !errorMessage && (data?.length ?? 0) === 0 ? (
          <Text className="px-6 text-center font-inter text-sm text-vault-muted">
            No favorites yet. Tap the heart on any track to save it here.
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
              <LibraryTrackRow showFavorite track={item.track} />
            )}
            showsVerticalScrollIndicator
          />
        ) : null}
      </View>
    </Screen>
  );
}
