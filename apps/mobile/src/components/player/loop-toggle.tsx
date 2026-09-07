import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import type { RepeatMode } from "@/stores/player-store";

interface LoopToggleProps {
  mode: RepeatMode;
  onToggle: () => void;
}

export function LoopToggle({ mode, onToggle }: LoopToggleProps) {
  const isActive = mode === "one";

  return (
    <Pressable
      accessibilityLabel={isActive ? "Disable loop" : "Loop current track"}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="h-10 w-10 items-center justify-center"
      hitSlop={8}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <Ionicons
        color={isActive ? "#1ed760" : "#ffffff"}
        name={isActive ? "repeat" : "repeat-outline"}
        size={22}
      />
    </Pressable>
  );
}
