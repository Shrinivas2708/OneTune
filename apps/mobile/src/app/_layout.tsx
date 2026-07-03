import "../global.css";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PlayerSync } from "@/components/player/player-sync";
import { LoadingScreen } from "@/components/ui/screen";
import { ToastHost } from "@/components/ui/toast-host";
import { useAppUpdatePrompt } from "@/hooks/use-app-update-prompt";
import { isProductionBuild } from "@/lib/app-release";
import { AppProviders } from "@/providers/app-providers";
import { useAuthStore } from "@/stores/auth-store";
import { useDownloadStore } from "@/stores/download-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateDownloads = useDownloadStore((state) => state.hydrate);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_700Bold,
  });

  const [splashHidden, setSplashHidden] = useState(false);
  useAppUpdatePrompt(isProductionBuild() && splashHidden);

  useEffect(() => {
    void hydrate();
    void hydrateDownloads();
  }, [hydrate, hydrateDownloads]);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      void SplashScreen.hideAsync().then(() => setSplashHidden(true));
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-vault-background">
      <AppProviders>
        <PlayerSync />
        <ToastHost />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#121212" },
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
