import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ToastType, useToastStore } from "@/stores/toast-store";

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  error: "alert-circle",
  success: "checkmark-circle",
  info: "information-circle",
};

const STYLES: Record<
  ToastType,
  { accent: string; background: string; border: string; text: string }
> = {
  error: {
    accent: "#ff6b7a",
    background: "#2a1218",
    border: "#f3727f",
    text: "#ffffff",
  },
  success: {
    accent: "#1ed760",
    background: "#102418",
    border: "#1db954",
    text: "#ffffff",
  },
  info: {
    accent: "#6eb6ff",
    background: "#101d2e",
    border: "#539df5",
    text: "#ffffff",
  },
};

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!message) return null;

  const palette = STYLES[type];

  return (
    <View
      className="absolute inset-x-4 z-50"
      pointerEvents="box-none"
      style={{ top: insets.top + 12 }}
    >
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-vault-lg px-4 py-3.5"
        style={{
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: 1,
          shadowColor: "#000000",
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
        onPress={dismiss}
      >
        <Ionicons color={palette.accent} name={ICON[type]} size={22} />
        <Text
          className="flex-1 font-inter-semibold text-sm leading-5"
          style={{ color: palette.text }}
        >
          {message}
        </Text>
      </Pressable>
    </View>
  );
}
