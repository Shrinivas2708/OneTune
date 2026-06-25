import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, TextInput, View } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  onClear,
  autoFocus = false,
}: SearchInputProps) {
  const handleClear = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText("");
    onClear?.();
  };

  return (
    <View className="flex-row items-center rounded-vault-pill border border-vault-border-light bg-vault-surface-elevated px-4 py-3">
      <Ionicons color="#b3b3b3" name="search" size={20} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        className="ml-3 flex-1 font-inter text-base text-vault-text"
        placeholder="Songs, artists, albums…"
        placeholderTextColor="#7c7c7c"
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          className="ml-2 p-1"
          hitSlop={8}
          onPress={handleClear}
        >
          <Ionicons color="#b3b3b3" name="close-circle" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
