import { Text, View } from "react-native";
import { VaultHeading, VaultSubheading } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/stores/auth-store";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <Screen className="pt-4">
      <View className="gap-2">
        <VaultHeading>Good evening</VaultHeading>
        <VaultSubheading>
          {user?.displayName ? `Welcome, ${user.displayName}` : "Welcome to VibeVault"}
        </VaultSubheading>
      </View>

      <View className="mt-8 rounded-vault-lg bg-vault-surface-elevated p-5">
        <Text className="font-inter-semibold text-base text-vault-text">
          Unified search is next
        </Text>
        <Text className="mt-2 font-inter text-sm text-vault-muted">
          Your tab shell is ready. Milestone 7 will wire cross-provider search here.
        </Text>
      </View>
    </Screen>
  );
}
