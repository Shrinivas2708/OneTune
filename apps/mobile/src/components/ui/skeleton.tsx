import { View } from "react-native";

interface SkeletonBoxProps {
  className?: string;
  style?: { width?: number | `${number}%`; height?: number };
}

export function SkeletonBox({ className = "", style }: SkeletonBoxProps) {
  return <View className={`rounded-vault-sm bg-vault-surface-card ${className}`} style={style} />;
}

function TrackSkeletonRow() {
  return (
    <View className="flex-row items-center gap-3 px-2 py-2">
      <SkeletonBox className="h-12 w-12 rounded-vault-md" />
      <View className="flex-1 gap-2">
        <SkeletonBox style={{ width: "75%", height: 16 }} />
        <SkeletonBox style={{ width: "50%", height: 12 }} />
        <SkeletonBox style={{ width: 64, height: 12 }} />
      </View>
    </View>
  );
}

function PlaylistSkeletonRow() {
  return (
    <View className="flex-row items-center gap-3 rounded-vault-lg bg-vault-surface-elevated px-3 py-3">
      <SkeletonBox className="h-14 w-14 rounded-vault-md" />
      <View className="flex-1 gap-2">
        <SkeletonBox style={{ width: "70%", height: 16 }} />
        <SkeletonBox style={{ width: "40%", height: 12 }} />
      </View>
    </View>
  );
}

interface ListSkeletonProps {
  count?: number;
}

export function TrackListSkeleton({ count = 8 }: ListSkeletonProps) {
  return (
    <View className="gap-1 pt-2">
      {Array.from({ length: count }, (_, index) => (
        <TrackSkeletonRow key={index} />
      ))}
    </View>
  );
}

export function PlaylistListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <View className="gap-2 pt-2">
      {Array.from({ length: count }, (_, index) => (
        <PlaylistSkeletonRow key={index} />
      ))}
    </View>
  );
}

export function PlaylistDetailSkeleton() {
  return (
    <View className="flex-1">
      <View className="items-center px-6 py-4">
        <SkeletonBox className="h-40 w-40 rounded-vault-lg" />
        <SkeletonBox className="mt-4" style={{ width: 200, height: 28 }} />
        <SkeletonBox className="mt-2" style={{ width: 80, height: 14 }} />
      </View>
      <TrackListSkeleton count={6} />
    </View>
  );
}
