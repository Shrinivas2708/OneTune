import { FlashList } from "@shopify/flash-list";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { DownloadRow } from "@/components/downloads/download-row";
import { VaultHeading, VaultSubheading } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { useDownloadStore } from "@/stores/download-store";

export default function DownloadsScreen() {
  const hydrate = useDownloadStore((state) => state.hydrate);
  const isHydrated = useDownloadStore((state) => state.isHydrated);
  const records = useDownloadStore((state) => state.records);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Screen className="pt-4" padded={false}>
      <View className="px-6">
        <VaultHeading>Downloads</VaultHeading>
        <VaultSubheading>Play offline — no network required.</VaultSubheading>
      </View>

      <View className="mt-6 min-h-[200px] flex-1 px-4">
        {!isHydrated ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1ed760" size="large" />
          </View>
        ) : null}

        {isHydrated && records.length === 0 ? (
          <View className="items-center px-6 py-10">
            <Text className="text-center font-inter text-sm text-vault-muted">
              No downloads yet. Download tracks from Search to listen offline.
            </Text>
          </View>
        ) : null}

        {isHydrated && records.length > 0 ? (
          <FlashList
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
