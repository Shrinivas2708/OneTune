import type { ReactNode } from "react";
import { View } from "react-native";

interface AmbientGlowProps {
  children: ReactNode;
}

export function AmbientGlow({ children }: AmbientGlowProps) {
  return <View className="flex-1 bg-vault-background">{children}</View>;
}
