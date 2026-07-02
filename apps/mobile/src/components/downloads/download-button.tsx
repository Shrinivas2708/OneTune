import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import { DownloadProgressBar } from "@/components/downloads/download-progress-bar";
import { useDownloadStatus } from "@/hooks/use-download-status";
import { getErrorMessage } from "@/lib/error-message";
import { isNativePlaybackSupported } from "@/lib/platform";
import { showToast } from "@/stores/toast-store";
import { useDownloadStore } from "@/stores/download-store";

interface DownloadButtonProps {
  track: TrackMetadata;
  size?: number;
  showProgress?: boolean;
}

export function DownloadButton({
  track,
  size = 22,
  showProgress = false,
}: DownloadButtonProps) {
  const startDownload = useDownloadStore((state) => state.startDownload);
  const { isDownloaded, isDownloading, isFailed, progress } = useDownloadStatus(track);

  if (!isNativePlaybackSupported) {
    return null;
  }

  const handlePress = () => {
    if (isDownloaded || isDownloading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void startDownload(track).catch((error) => {
      showToast(getErrorMessage(error, "Download failed."), "error");
    });
  };

  return (
    <View className={showProgress ? "min-w-[44px]" : ""}>
      <Pressable
        accessibilityLabel={
          isDownloaded
            ? "Downloaded"
            : isDownloading
              ? "Downloading"
              : "Download track"
        }
        accessibilityRole="button"
        className="items-center p-2"
        disabled={isDownloaded || isDownloading}
        hitSlop={8}
        onPress={handlePress}
      >
        {isDownloading ? (
          <Ionicons color="#1ed760" name="download" size={size} />
        ) : (
          <Ionicons
            color={isDownloaded ? "#1ed760" : isFailed ? "#f3727f" : "#b3b3b3"}
            name={
              isDownloaded
                ? "checkmark-circle"
                : isFailed
                  ? "alert-circle"
                  : "download-outline"
            }
            size={size}
          />
        )}
        {isDownloaded ? (
          <Text className="mt-0.5 font-inter-semibold text-[10px] text-vault-accent">
            Saved
          </Text>
        ) : isDownloading ? (
          <Text className="mt-0.5 font-inter-semibold text-[10px] text-vault-accent">
            {Math.round(progress * 100)}%
          </Text>
        ) : null}
      </Pressable>

      {showProgress && isDownloading ? (
        <DownloadProgressBar className="px-2" progress={progress} />
      ) : null}
    </View>
  );
}
