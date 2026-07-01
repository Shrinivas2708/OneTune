import { Ionicons } from "@expo/vector-icons";
import { createElement, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { usePlayerStore } from "@/stores/player-store";

interface VerticalVolumeControlProps {
  /** Slider track length in pixels */
  height?: number;
  showPercent?: boolean;
}

export function VerticalVolumeControl({
  height = 112,
  showPercent = true,
}: VerticalVolumeControlProps) {
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
    <View className="items-center gap-2 px-1 py-1">
      {showPercent ? (
        <Text className="font-inter-semibold text-[11px] text-vault-muted">
          {Math.round(volume * 100)}
        </Text>
      ) : null}

      <View
        className="items-center justify-center"
        style={{ height, width: 28 }}
      >
        {createElement("input", {
          "aria-label": "Volume",
          "aria-orientation": "vertical",
          "aria-valuetext": `${Math.round(volume * 100)} percent`,
          max: 100,
          min: 0,
          type: "range",
          value: Math.round(volume * 100),
          onChange: handleChange,
          onInput: handleChange,
          style: {
            width: height,
            height: 24,
            margin: 0,
            transform: "rotate(-90deg)",
            accentColor: "#1ed760",
            cursor: "pointer",
          },
        })}
      </View>

      <Pressable
        accessibilityLabel={volume === 0 ? "Unmute" : "Mute"}
        accessibilityRole="button"
        hitSlop={8}
        onPress={toggleMute}
      >
        <Ionicons color="#ffffff" name={iconName} size={18} />
      </Pressable>
    </View>
  );
}
