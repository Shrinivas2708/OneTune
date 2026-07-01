import { Ionicons } from "@expo/vector-icons";
import { createElement, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { usePlayerStore } from "@/stores/player-store";

export function VolumeControl() {
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);

  const handleChange = useCallback(
    (event: Event) => {
      const target = event.target as HTMLInputElement;
      const next = Number.parseFloat(target.value) / 100;
      setVolume(next);
    },
    [setVolume],
  );

  const toggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : 0.85);
  }, [setVolume, volume]);

  return (
    <View className="flex-row items-center gap-3 px-1">
      <Pressable accessibilityLabel="Toggle mute" accessibilityRole="button" onPress={toggleMute}>
        <Ionicons
          color="#b3b3b3"
          name={volume === 0 ? "volume-mute" : volume < 0.5 ? "volume-low" : "volume-medium"}
          size={18}
        />
      </Pressable>

      {createElement("input", {
        "aria-label": "Volume",
        max: 100,
        min: 0,
        type: "range",
        value: Math.round(volume * 100),
        onChange: handleChange,
        style: {
          flex: 1,
          height: 4,
          accentColor: "#1ed760",
          cursor: "pointer",
        },
      })}

      <Text className="w-8 text-right font-inter text-xs text-vault-muted">
        {Math.round(volume * 100)}
      </Text>
    </View>
  );
}
