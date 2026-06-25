import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { VaultButton, VaultHeading } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <Screen className="pt-4">
      <VaultHeading>Settings</VaultHeading>

      <View className="mt-8 gap-6">
        <View className="rounded-vault-lg bg-vault-surface-elevated p-5">
          <Text className="font-inter-semibold text-xs uppercase tracking-widest text-vault-muted">
            Account
          </Text>
          <Text className="mt-3 font-jakarta text-lg text-vault-text">
            {user?.displayName}
          </Text>
          <Text className="mt-1 font-inter text-sm text-vault-muted">
            {user?.email}
          </Text>
        </View>

        <VaultButton label="Sign out" onPress={handleLogout} variant="secondary" />
      </View>
    </Screen>
  );
}
