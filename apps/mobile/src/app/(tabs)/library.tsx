import { Text, View } from "react-native";
import { VaultHeading, VaultSubheading } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";

export default function LibraryScreen() {
  return (
    <Screen className="pt-4">
      <VaultHeading>Your Library</VaultHeading>
      <VaultSubheading>Playlists and downloads land in later milestones.</VaultSubheading>

      <View className="mt-8 items-center justify-center rounded-vault-lg bg-vault-surface p-10">
        <Text className="font-inter text-sm text-vault-muted">
          Nothing here yet
        </Text>
      </View>
    </Screen>
  );
}
