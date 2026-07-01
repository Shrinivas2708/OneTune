import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable } from "react-native";
import { isNativePlaybackSupported } from "@/lib/platform";
import { getErrorMessage } from "@/lib/error-message";
import { resolvePlayableTrack } from "@/lib/resolve-playable-track";
import { showToast } from "@/stores/toast-store";
import { useDownloadStore } from "@/stores/download-store";

interface DownloadButtonProps {
  track: TrackMetadata;
  size?: number;
}

export function DownloadButton({ track, size = 22 }: DownloadButtonProps) {
  const startDownload = useDownloadStore((state) => state.startDownload);
  const isDownloaded = useDownloadStore((state) => state.isDownloaded(track));
  const job = useDownloadStore((state) => state.getJob(track));

  if (!isNativePlaybackSupported) {
    return null;
  }

  const isDownloading = job?.status === "downloading";

  const handlePress = () => {
    if (isDownloaded || isDownloading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void resolvePlayableTrack(track)
      .then((playable) => startDownload(playable))
      .catch((error) => {
        showToast(getErrorMessage(error, "Download failed."));
      });
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
