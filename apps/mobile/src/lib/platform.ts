import { Platform } from "react-native";

export const isNativePlaybackSupported =
  Platform.OS === "ios" || Platform.OS === "android";
