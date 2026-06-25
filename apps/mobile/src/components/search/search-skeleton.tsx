import { View } from "react-native";

function SkeletonRow() {
  return (
    <View className="flex-row items-center gap-3 px-2 py-2">
      <View className="h-12 w-12 rounded-vault-md bg-vault-surface-card" />
      <View className="flex-1 gap-2">
        <View className="h-4 rounded-vault-sm bg-vault-surface-card" style={{ width: "75%" }} />
        <View className="h-3 rounded-vault-sm bg-vault-surface-card" style={{ width: "50%" }} />
        <View className="h-3 w-16 rounded-vault-sm bg-vault-surface-card" />
      </View>
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View className="gap-1 pt-2">
      {Array.from({ length: 8 }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </View>
  );
}
