import { Text, View } from "react-native";
import { VaultButton } from "./button";

interface ErrorStateProps {
  message: string;
  subtitle?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, subtitle, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center px-6 py-10">
      <Text className="text-center font-inter-semibold text-base text-vault-negative">
        {message}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-center font-inter text-sm text-vault-muted">
          {subtitle}
        </Text>
      ) : null}
      {onRetry ? (
        <View className="mt-4 w-full">
          <VaultButton label="Retry" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
