import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

interface VaultInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function VaultInput({ label, error, className = "", ...props }: VaultInputProps) {
  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-xs uppercase tracking-widest text-vault-muted">
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        className={`rounded-vault-pill bg-vault-surface-elevated px-4 py-3.5 font-inter text-base text-vault-text ${className}`}
        placeholderTextColor="#727272"
        {...props}
      />
      {error ? (
        <Text className="font-inter text-sm text-vault-negative">{error}</Text>
      ) : null}
    </View>
  );
}
