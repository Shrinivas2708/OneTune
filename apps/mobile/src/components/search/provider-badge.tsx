import type { ProviderId } from "@vibevault/types";
import { Text, View } from "react-native";

const PROVIDER_LABELS: Record<ProviderId, string> = {
  youtube: "YouTube",
  jiosaavn: "JioSaavn",
  spotify: "Spotify",
};

const PROVIDER_COLORS: Record<ProviderId, string> = {
  youtube: "#ff4444",
  jiosaavn: "#1ed760",
  spotify: "#1db954",
};

interface ProviderBadgeProps {
  providerId: ProviderId;
}

export function ProviderBadge({ providerId }: ProviderBadgeProps) {
  return (
    <View
      className="rounded-vault-sm px-1.5 py-0.5"
      style={{ backgroundColor: `${PROVIDER_COLORS[providerId]}22` }}
    >
      <Text
        className="font-inter-semibold text-micro uppercase tracking-wider"
        style={{ color: PROVIDER_COLORS[providerId] }}
      >
        {PROVIDER_LABELS[providerId]}
      </Text>
    </View>
  );
}
