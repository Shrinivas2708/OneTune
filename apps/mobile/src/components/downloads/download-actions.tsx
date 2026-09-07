import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";
import type { DownloadRecord } from "@/types/download-record";
import { useDownloadStore } from "@/stores/download-store";

interface DownloadActionsProps {
  records: DownloadRecord[];
}

function formatTotalSize(records: DownloadRecord[]) {
  const total = records.reduce((sum, record) => sum + (record.sizeBytes ?? 0), 0);
  if (total <= 0) return null;

  if (total >= 1024 * 1024 * 1024) {
    return `${(total / (1024 * 1024 * 1024)).toFixed(1)} GB offline`;
  }

  if (total >= 1024 * 1024) {
    return `${(total / (1024 * 1024)).toFixed(1)} MB offline`;
  }

  return `${Math.max(1, Math.round(total / 1024))} KB offline`;
}

export function DownloadActions({ records }: DownloadActionsProps) {
  const deleteDownload = useDownloadStore((state) => state.deleteDownload);

  const handleDeleteAll = () => {
    Alert.alert(
      "Remove all downloads?",
      "This deletes every offline track from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove all",
          style: "destructive",
          onPress: () => {
            void Promise.all(records.map((record) => deleteDownload(record.id)));
          },
        },
      ],
    );
  };

  const sizeLabel = formatTotalSize(records);

  return (
    <View className="mb-4 px-2">
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-inter-semibold text-sm text-vault-text">
            {records.length} {records.length === 1 ? "track" : "tracks"} saved
          </Text>
          {sizeLabel ? (
            <Text className="mt-1 font-inter text-xs text-vault-muted">{sizeLabel}</Text>
          ) : null}
        </View>

        <Pressable
          accessibilityLabel="Remove all downloads"
          accessibilityRole="button"
          className="flex-row items-center gap-1 rounded-vault-lg bg-vault-surface-elevated px-3 py-2"
          onPress={handleDeleteAll}
        >
          <Ionicons color="#f3727f" name="trash-outline" size={16} />
          <Text className="font-inter-semibold text-xs text-vault-negative">Remove all</Text>
        </Pressable>
      </View>
    </View>
  );
}
