// Dynamic Expo config — sets API URL and Android cleartext per EAS profile.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  const usesCleartext = apiUrl.startsWith("http://");

  const plugins = (appJson.plugins ?? []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === "expo-build-properties"),
  );

  plugins.push([
    "expo-build-properties",
    {
      android: {
        usesCleartextTraffic: usesCleartext,
      },
    },
  ]);

  return {
    ...appJson,
    extra: {
      ...appJson.extra,
      apiUrl,
    },
    plugins,
  };
};
