import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ToastType, useToastStore } from "@/stores/toast-store";

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  error: "alert-circle",
  success: "checkmark-circle",
  info: "information-circle",
};

const COLOR: Record<ToastType, string> = {
  error: "#f3727f",
  success: "#1ed760",
  info: "#539df5",
};

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!message) return null;

  return (
    <View
      className="absolute inset-x-4 z-50"
      pointerEvents="box-none"
      style={{ top: insets.top + 8 }}
    >
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-vault-lg bg-vault-surface-elevated px-4 py-3"
        onPress={dismiss}
      >
        <Ionicons color={COLOR[type]} name={ICON[type]} size={22} />
        <Text className="flex-1 font-inter text-sm text-vault-text">{message}</Text>
      </Pressable>
    </View>
  );
}
