import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable } from "react-native";
import { isNativePlaybackSupported } from "@/lib/platform";
import { useDownloadStore } from "@/stores/download-store";
import { isDownloadableTrack } from "@/types/download-record";

interface DownloadButtonProps {
  track: TrackMetadata;
  size?: number;
}

export function DownloadButton({ track, size = 22 }: DownloadButtonProps) {
  const startDownload = useDownloadStore((state) => state.startDownload);
  const isDownloaded = useDownloadStore((state) => state.isDownloaded(track));
  const job = useDownloadStore((state) => state.getJob(track));

  if (!isNativePlaybackSupported || !isDownloadableTrack(track)) {
    return null;
  }

  const isDownloading = job?.status === "downloading";

  const handlePress = () => {
    if (isDownloaded || isDownloading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void startDownload(track);
  };

  if (isDownloading) {
    return <ActivityIndicator color="#1ed760" size="small" />;
  }

  return (
    <Pressable
      accessibilityLabel={isDownloaded ? "Downloaded" : "Download track"}
      accessibilityRole="button"
      className="p-2"
      disabled={isDownloaded}
      hitSlop={8}
      onPress={handlePress}
    >
      <Ionicons
        color={isDownloaded ? "#1ed760" : "#b3b3b3"}
        name={isDownloaded ? "checkmark-circle" : "download-outline"}
        size={size}
      />
    </Pressable>
  );
}
