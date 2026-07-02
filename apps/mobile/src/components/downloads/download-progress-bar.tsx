import { Text, View } from "react-native";

interface DownloadProgressBarProps {
  progress: number;
  className?: string;
  showPercent?: boolean;
}

export function DownloadProgressBar({
  progress,
  className = "",
  showPercent = false,
}: DownloadProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const percent = Math.round(clamped * 100);

  return (
    <View className={className}>
      <View className="h-1.5 overflow-hidden rounded-vault-pill bg-vault-surface-elevated">
        <View
          className="h-full rounded-vault-pill bg-vault-accent"
          style={{ width: `${percent}%` }}
        />
      </View>
      {showPercent ? (
        <Text className="mt-1 font-inter text-[10px] text-vault-muted">{percent}%</Text>
      ) : null}
    </View>
  );
}
