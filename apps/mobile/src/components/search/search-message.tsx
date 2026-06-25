import { Text, View } from "react-native";

interface SearchMessageProps {
  title: string;
  subtitle?: string;
}

export function SearchMessage({ title, subtitle }: SearchMessageProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-center font-jakarta text-lg text-vault-text">{title}</Text>
      {subtitle ? (
        <Text className="mt-2 text-center font-inter text-sm text-vault-muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
