import * as Application from "expo-application";
import { useEffect, useRef } from "react";
import { Alert, Linking } from "react-native";

interface ReleaseManifest {
  version: string;
  downloadUrl: string;
  websiteUrl: string;
  releaseNotes?: string;
}

const DEFAULT_MANIFEST_URL = "https://onetune.shribuilds.in/release.json";

function compareVersions(installed: string, latest: string) {
  const installedParts = installed.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const latestParts = latest.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(installedParts.length, latestParts.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (installedParts[index] ?? 0) - (latestParts[index] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

async function fetchReleaseManifest(): Promise<ReleaseManifest | null> {
  try {
    const response = await fetch(DEFAULT_MANIFEST_URL, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ReleaseManifest;
    if (!json.version || !json.downloadUrl) return null;

    return json;
  } catch {
    return null;
  }
}

export function useAppUpdatePrompt(enabled: boolean) {
  const hasPrompted = useRef(false);

  useEffect(() => {
    if (!enabled || hasPrompted.current) return;

    const timer = setTimeout(() => {
      void (async () => {
        const installedVersion = Application.nativeApplicationVersion;
        if (!installedVersion) return;

        const manifest = await fetchReleaseManifest();
        if (!manifest) return;

        if (compareVersions(installedVersion, manifest.version) >= 0) return;

        hasPrompted.current = true;

        Alert.alert(
          "Update available",
          manifest.releaseNotes ??
            `OneTune ${manifest.version} is available. You are on ${installedVersion}.`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "Open website",
              onPress: () => {
                void Linking.openURL(manifest.websiteUrl);
              },
            },
            {
              text: "Download APK",
              onPress: () => {
                void Linking.openURL(manifest.downloadUrl);
              },
            },
          ],
        );
      })();
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled]);
}
