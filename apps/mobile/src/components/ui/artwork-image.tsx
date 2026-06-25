import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";

interface ArtworkImageProps {
  uri?: string | null;
  size: number;
  radius?: number;
  label?: string;
}

export function ArtworkImage({ uri, size, radius = 8, label }: ArtworkImageProps) {
  if (uri) {
    return (
      <Image
        accessibilityLabel={label}
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        transition={200}
      />
    );
  }

  return (
    <View
      accessibilityLabel={label ?? "Artwork placeholder"}
      className="items-center justify-center bg-vault-artwork-placeholder"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Ionicons color="#4d4d4d" name="musical-notes" size={Math.round(size * 0.35)} />
    </View>
  );
}
