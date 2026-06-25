import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Screen({ children, className = "", padded = true }: ScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-vault-background ${className}`}>
      <View className={`flex-1 ${padded ? "px-6" : ""}`}>{children}</View>
    </SafeAreaView>
  );
}

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-vault-background">
      <ActivityIndicator color="#1ed760" size="large" />
    </View>
  );
}
