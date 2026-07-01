import { Ionicons } from "@expo/vector-icons";
import { createElement, useCallback } from "react";
import { Pressable, View } from "react-native";
import { usePlayerStore } from "@/stores/player-store";

export function InlineVolumeControl() {
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);

  const handleChange = useCallback(
    (event: Event) => {
      const target = event.target as HTMLInputElement;
      setVolume(Number.parseFloat(target.value) / 100);
    },
    [setVolume],
  );

  const toggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : 0.85);
  }, [setVolume, volume]);

  const iconName =
    volume === 0 ? "volume-mute" : volume < 0.35 ? "volume-low" : "volume-high";

  return (
    <View className="w-24 flex-row items-center gap-2">
      <Pressable
        accessibilityLabel={volume === 0 ? "Unmute" : "Mute"}
        accessibilityRole="button"
        hitSlop={8}
        onPress={toggleMute}
      >
        <Ionicons color="#b3b3b3" name={iconName} size={20} />
      </Pressable>

      {createElement("input", {
        "aria-label": "Volume",
        "aria-valuetext": `${Math.round(volume * 100)} percent`,
        max: 100,
        min: 0,
        type: "range",
        value: Math.round(volume * 100),
        onChange: handleChange,
        onInput: handleChange,
        style: {
          flex: 1,
          width: "100%",
          height: 20,
          margin: 0,
          accentColor: "#1ed760",
          cursor: "pointer",
          background: "transparent",
        },
      })}
    </View>
  );
}
