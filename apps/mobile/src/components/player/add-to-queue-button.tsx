import type { SearchResult } from "@vibevault/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import { playerEngine } from "@/services/player-engine";

interface AddToQueueButtonProps {
  result: SearchResult;
  size?: number;
}

export function AddToQueueButton({ result, size = 22 }: AddToQueueButtonProps) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void playerEngine.addToQueue(result);
  };

  return (
    <Pressable
      accessibilityLabel="Add to queue"
      accessibilityRole="button"
      hitSlop={8}
      onPress={handlePress}
    >
      <Ionicons color="#b3b3b3" name="add-circle-outline" size={size} />
    </Pressable>
  );
}
