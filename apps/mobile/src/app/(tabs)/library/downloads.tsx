import { FlashList } from "@shopify/flash-list";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { DownloadRow } from "@/components/downloads/download-row";
import { Screen } from "@/components/ui/screen";
import { SubScreenHeader } from "@/components/ui/sub-screen-header";
import { TrackListSkeleton } from "@/components/ui/skeleton";
import { useScrollBottomInset } from "@/hooks/use-scroll-bottom-inset";
import { useDownloadStore } from "@/stores/download-store";

export default function DownloadsScreen() {
  const hydrate = useDownloadStore((state) => state.hydrate);
  const isHydrated = useDownloadStore((state) => state.isHydrated);
  const records = useDownloadStore((state) => state.records);
  const bottomInset = useScrollBottomInset();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Screen className="pt-2" padded={false}>
      <SubScreenHeader
        backHref="/(tabs)/library"
        subtitle="Play offline — no network required."
        title="Downloads"
      />

      <View className="mt-4 min-h-[200px] flex-1 px-4">
        {!isHydrated ? <TrackListSkeleton /> : null}

        {isHydrated && records.length === 0 ? (
          <View className="items-center px-6 py-10">
            <Text className="text-center font-inter text-sm text-vault-muted">
              No downloads yet. Download tracks from Search to listen offline.
            </Text>
          </View>
        ) : null}

        {isHydrated && records.length > 0 ? (
          <FlashList
            contentContainerStyle={{ paddingBottom: bottomInset }}
            data={records}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DownloadRow record={item} />}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>
    </Screen>
  );
}
