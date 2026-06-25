import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { usePlaybackControls } from "@/hooks/use-playback-controls";
import { formatArtists } from "@/lib/track-format";
import { usePlayerUiStore } from "@/stores/player-ui-store";
import { usePlayerStore } from "@/stores/player-store";
import { PlaybackButtons } from "./playback-buttons";
import { ProgressBar } from "./progress-bar";
import { TrackArtwork } from "./track-artwork";

export function MiniPlayer() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const openNowPlaying = usePlayerUiStore((state) => state.openNowPlaying);
  const {
    isPlaying,
    position,
    duration,
    hasNext,
    hasPrevious,
    toggle,
    skipToNext,
    skipToPrevious,
    seekTo,
  } = usePlaybackControls();

  if (!currentTrack) {
    return null;
  }

  return (
    <View className="border-t border-vault-border bg-vault-surface">
      <View className="px-3 pt-2">
        <ProgressBar
          duration={duration}
          position={position}
          onSeek={seekTo}
        />
      </View>

      <View className="flex-row items-center gap-3 px-3 py-2">
        <Pressable
          accessibilityRole="button"
          className="min-w-0 flex-1 flex-row items-center gap-3"
          onPress={openNowPlaying}
        >
          <TrackArtwork size={48} track={currentTrack} />
          <View className="min-w-0 flex-1">
            <Text className="font-inter-semibold text-sm text-vault-text" numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text className="font-inter text-xs text-vault-muted" numberOfLines={1}>
              {formatArtists(currentTrack)}
            </Text>
          </View>
        </Pressable>

        <PlaybackButtons
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isPlaying={isPlaying}
          size="mini"
          onNext={skipToNext}
          onPrevious={skipToPrevious}
          onToggle={toggle}
        />
      </View>
    </View>
  );
}
