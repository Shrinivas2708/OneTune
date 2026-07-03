import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getErrorMessage } from "@/lib/error-message";
import { isNativePlaybackSupported } from "@/lib/platform";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { downloadManager } from "@/services/download-manager";
import { playerEngine } from "@/services/player-engine";
import { usePlayerStore } from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";
import { useDownloadStore } from "@/stores/download-store";

interface PlaylistActionsProps {
  tracks: TrackMetadata[];
}

function shuffleTracks<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function PlaylistActions({ tracks }: PlaylistActionsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const startDownload = useDownloadStore((state) => state.startDownload);

  const handlePlay = async (shuffle = false) => {
    if (isPlaying || tracks.length === 0) return;

    setIsPlaying(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const ordered = shuffle ? shuffleTracks(tracks) : tracks;
      const [first, ...rest] = ordered;

      usePlayerStore.getState().setQueue(rest);
      const local = downloadManager.getLocalRecordForTrack(first);
      if (local) {
        await playerEngine.playDownloadedTrack(local.track, { keepQueue: true });
      } else {
        await playerEngine.playSearchResult(trackToSearchResult(first), {
          keepQueue: true,
        });
      }
      showToast(
        rest.length > 0
          ? `Playing — ${rest.length} more in queue`
          : "Playing playlist",
      );
    } catch (error) {
      showToast(getErrorMessage(error, "Could not play playlist."));
    } finally {
      setIsPlaying(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!isNativePlaybackSupported || isDownloading || tracks.length === 0) {
      return;
    }

    setIsDownloading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let started = 0;
    let failed = 0;

    try {
      for (const track of tracks) {
        try {
          await startDownload(track);
          started += 1;
        } catch {
          failed += 1;
        }
      }

      if (started === 0) {
        showToast("No downloadable tracks found");
        return;
      }

      showToast(
        failed > 0
          ? `Downloading ${started} tracks (${failed} skipped)`
          : `Downloading ${started} tracks`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View className="flex-row gap-2 px-4">
      <Pressable
        accessibilityLabel="Play playlist"
        accessibilityRole="button"
        className="min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-vault-xl bg-vault-accent px-4 py-3"
        disabled={isPlaying || tracks.length === 0}
        onPress={() => void handlePlay(false)}
      >
        {isPlaying ? (
          <ActivityIndicator color="#000000" size="small" />
        ) : (
          <Ionicons color="#000000" name="play" size={18} />
        )}
        <Text className="font-inter-semibold text-sm text-black">Play</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Shuffle playlist"
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center rounded-full bg-vault-surface-elevated"
        disabled={isPlaying || tracks.length === 0}
        onPress={() => void handlePlay(true)}
      >
        <Ionicons color="#ffffff" name="shuffle" size={20} />
      </Pressable>

      {isNativePlaybackSupported ? (
        <Pressable
          accessibilityLabel="Download playlist"
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full bg-vault-surface-elevated"
          disabled={isDownloading || tracks.length === 0}
          onPress={() => void handleDownloadAll()}
        >
          {isDownloading ? (
            <ActivityIndicator color="#1ed760" size="small" />
          ) : (
            <Ionicons color="#ffffff" name="download-outline" size={20} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
