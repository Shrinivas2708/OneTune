import type { HistoryArtist } from "@vibevault/types";
import { ScrollView, Text, View } from "react-native";

interface TopArtistsRowProps {
  artists: HistoryArtist[];
  title: string;
  emptyMessage?: string;
}

function formatPlayCount(count: number) {
  if (count === 1) return "1 play";
  return `${count} plays`;
}

export function TopArtistsRow({ artists, title, emptyMessage }: TopArtistsRowProps) {
  if (artists.length === 0) {
    if (!emptyMessage) return null;

    return (
      <View>
        <Text className="font-jakarta text-lg text-vault-text">{title}</Text>
        <Text className="mt-2 font-inter text-sm text-vault-muted">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="font-jakarta text-lg text-vault-text">{title}</Text>
      <ScrollView
        className="mt-3"
        contentContainerStyle={{ gap: 8 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {artists.map((artist) => (
          <View
            key={artist.name}
            className="min-w-[120px] rounded-vault-lg bg-vault-surface-elevated px-4 py-3"
          >
            <Text className="font-inter-semibold text-sm text-vault-text" numberOfLines={1}>
              {artist.name}
            </Text>
            <Text className="mt-1 font-inter text-xs text-vault-muted">
              {formatPlayCount(artist.playCount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
