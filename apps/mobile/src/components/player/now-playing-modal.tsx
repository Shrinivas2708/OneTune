import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FavoriteButton } from "@/components/library/favorite-button";
import { usePlaybackControls } from "@/hooks/use-playback-controls";
import { formatArtists } from "@/lib/track-format";
import { getTrackArtworkUri } from "@/lib/track-artwork";
import { usePlayerUiStore } from "@/stores/player-ui-store";
import { usePlayerStore } from "@/stores/player-store";
import { PlaybackButtons } from "./playback-buttons";
import { LoopToggle } from "./loop-toggle";
import { ProgressBar } from "./progress-bar";
import { QueueSheet } from "./queue-sheet";
import { TrackArtwork } from "./track-artwork";

export function NowPlayingModal() {
  const insets = useSafeAreaInsets();
  const isOpen = usePlayerUiStore((state) => state.isNowPlayingOpen);
  const isQueueOpen = usePlayerUiStore((state) => state.isQueueOpen);
  const closeNowPlaying = usePlayerUiStore((state) => state.closeNowPlaying);
  const toggleQueue = usePlayerUiStore((state) => state.toggleQueue);
  const closeQueue = usePlayerUiStore((state) => state.closeQueue);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const {
    isPlaying,
    position,
    duration,
    queue,
    hasNext,
    hasPrevious,
    toggle,
    skipToNext,
    skipToPrevious,
    seekTo,
    playQueueIndex,
    repeatMode,
    toggleRepeatMode,
  } = usePlaybackControls();

  if (!currentTrack) {
    return null;
  }

  const artworkUri = getTrackArtworkUri(currentTrack);
  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? StatusBar.currentHeight ?? 28 : 0,
    12,
  );
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Modal
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      transparent
      visible={isOpen}
      onRequestClose={closeNowPlaying}
    >
      <GestureHandlerRootView style={styles.flex}>
        <View className="flex-1 bg-vault-background">
          {artworkUri ? (
            <Image
              contentFit="cover"
              source={{ uri: artworkUri }}
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}
          <BlurView intensity={90} style={StyleSheet.absoluteFillObject} tint="dark" />
          <View className="absolute inset-0 bg-black/55" />

          <View
            className="flex-1"
            collapsable={false}
            style={{ paddingTop: topInset, paddingBottom: bottomInset }}
          >
            <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
              <Pressable
                accessibilityLabel="Close now playing"
                accessibilityRole="button"
                className="p-2"
                onPress={closeNowPlaying}
              >
                <Ionicons color="#ffffff" name="chevron-down" size={28} />
              </Pressable>

              <Pressable
                accessibilityLabel="Toggle queue"
                accessibilityRole="button"
                className="p-2"
                onPress={toggleQueue}
              >
                <Ionicons
                  color={isQueueOpen ? "#1ed760" : "#ffffff"}
                  name="list"
                  size={24}
                />
              </Pressable>
            </View>

            <View className="min-h-0 flex-1 justify-center px-8">
              <View className="items-center">
                <TrackArtwork size={260} track={currentTrack} radius={12} />
                <View className="mt-6 w-full items-center gap-2">
                  <Text
                    className="text-center font-jakarta text-2xl text-vault-text"
                    numberOfLines={2}
                  >
                    {currentTrack.title}
                  </Text>
                  <View className="flex-row items-center justify-center gap-2">
                    <Text
                      className="text-center font-inter text-base text-vault-muted"
                      numberOfLines={1}
                    >
                      {formatArtists(currentTrack)}
                    </Text>
                    <FavoriteButton size={20} track={currentTrack} />
                  </View>
                </View>
              </View>
            </View>

            <View collapsable={false}>
              {isQueueOpen ? (
                <QueueSheet
                  queue={queue}
                  onClose={closeQueue}
                  onSelect={(index) => {
                    playQueueIndex(index);
                    closeQueue();
                  }}
                />
              ) : (
                <View className="gap-5 px-6 pt-2">
                  <ProgressBar
                    duration={duration}
                    large
                    position={position}
                    onSeek={seekTo}
                  />
                  <View className="flex-row items-center justify-between px-2">
                    <LoopToggle mode={repeatMode} onToggle={toggleRepeatMode} />
                    <PlaybackButtons
                      hasNext={hasNext}
                      hasPrevious={hasPrevious}
                      isPlaying={isPlaying}
                      size="full"
                      onNext={skipToNext}
                      onPrevious={skipToPrevious}
                      onToggle={toggle}
                    />
                    <View className="w-10" />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
