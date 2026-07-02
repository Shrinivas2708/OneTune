import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";

interface SubScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** When set, back always navigates here instead of `router.back()` (fixes cross-tab entry). */
  backHref?: string;
}

export function SubScreenHeader({ title, subtitle, right, backHref }: SubScreenHeaderProps) {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (backHref) {
      router.navigate(backHref as never);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/library");
  }, [backHref, router]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBack,
      );

      return () => subscription.remove();
    }, [goBack]),
  );

  return (
    <View className="flex-row items-start gap-2 px-4 py-2">
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="-ml-1 p-1"
        hitSlop={8}
        onPress={goBack}
      >
        <Ionicons color="#ffffff" name="chevron-back" size={28} />
      </Pressable>

      <View className="min-w-0 flex-1">
        <Text className="font-jakarta text-xl text-vault-text">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 font-inter text-sm text-vault-muted">{subtitle}</Text>
        ) : null}
      </View>

      {right ? <View className="mt-1">{right}</View> : null}
    </View>
  );
}
