// Dynamic Expo config — sets API URL and Android cleartext per EAS profile.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  const usesCleartext = apiUrl.startsWith("http://");
  const isStandaloneBuild = process.env.EXPO_STANDALONE_BUILD === "1";

  let plugins = (appJson.plugins ?? []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === "expo-build-properties"),
  );

  if (isStandaloneBuild) {
    plugins = plugins.filter(
      (plugin) =>
        plugin !== "expo-dev-client" &&
        !(Array.isArray(plugin) && plugin[0] === "expo-dev-client"),
    );
  }

  plugins.push([
    "expo-build-properties",
    {
      android: {
        usesCleartextTraffic: usesCleartext,
      },
    },
  ]);
  plugins.push("./plugins/with-worklets-monorepo.js");

  return {
    ...appJson,
    extra: {
      ...appJson.extra,
      apiUrl,
    },
    plugins,
  };
};
