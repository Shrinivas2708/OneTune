import { ActivityIndicator, Modal, Text, View } from "react-native";

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator color="#1ed760" size="large" />
      {message ? (
        <Text className="mt-4 px-6 text-center font-inter text-sm text-vault-muted">
          {message}
        </Text>
      ) : null}
    </View>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View className="flex-1 items-center justify-center bg-black/70">
        <View className="min-w-[200px] items-center rounded-vault-xl bg-vault-surface-elevated px-8 py-6">
          <ActivityIndicator color="#1ed760" size="large" />
          {message ? (
            <Text className="mt-4 text-center font-inter text-sm text-vault-text">
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
