import { Platform } from "react-native";

/** True for standalone release builds on native — not dev client or web. */
export function isProductionBuild() {
  if (__DEV__) return false;
  return Platform.OS === "android" || Platform.OS === "ios";
}
