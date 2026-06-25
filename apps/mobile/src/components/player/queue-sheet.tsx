import type { TrackMetadata } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { formatArtists } from "@/lib/track-format";
import { trackKey } from "@/stores/player-store";
import { TrackArtwork } from "./track-artwork";

interface QueueSheetProps {
  queue: TrackMetadata[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function QueueSheet({
  queue,
  currentIndex,
  onSelect,
  onClose,
}: QueueSheetProps) {
  return (
    <View className="max-h-[50%] rounded-t-vault-xl bg-vault-surface-elevated px-4 pb-6 pt-3">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-jakarta text-lg text-vault-text">Up next</Text>
        <Pressable accessibilityLabel="Close queue" accessibilityRole="button" onPress={onClose}>
          <Ionicons color="#b3b3b3" name="chevron-down" size={24} />
        </Pressable>
      </View>

      <View className="gap-1">
        {queue.map((track, index) => {
          const isActive = index === currentIndex;
          return (
            <Pressable
              key={trackKey(track)}
              accessibilityRole="button"
              className={`flex-row items-center gap-3 rounded-vault-lg px-2 py-2 ${isActive ? "bg-vault-surface-card" : ""}`}
              onPress={() => onSelect(index)}
            >
              <TrackArtwork size={44} track={track} radius={6} />
              <View className="min-w-0 flex-1">
                <Text
                  className={`font-inter-semibold text-sm ${isActive ? "text-vault-accent" : "text-vault-text"}`}
                  numberOfLines={1}
                >
                  {track.title}
                </Text>
                <Text className="font-inter text-xs text-vault-muted" numberOfLines={1}>
                  {formatArtists(track)}
                </Text>
              </View>
              {isActive ? (
                <Ionicons color="#1ed760" name="volume-medium" size={18} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
