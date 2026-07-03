const fs = require("fs");
const path = require("path");
const {
  withAppBuildGradle,
  withDangerousMod,
  withGradleProperties,
  withMainApplication,
} = require("expo/config-plugins");

const STANDALONE_AUTOLINK_EXCLUDE = [
  "expo-dev-client",
  "expo-dev-launcher",
  "expo-dev-menu",
  "expo-dev-menu-interface",
];

/** Production APK: use bundled index.js instead of dev-client Metro entry. */
function withStandaloneAndroid(config) {
  return withMainApplication(config, (mod) => {
    mod.modResults.contents = mod.modResults.contents.replace(
      'override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"',
      'override fun getJSMainModuleName(): String = "index"',
    );
    return mod;
  });
}

/** Drop dev-client modules from Gradle autolinking (package.json exclude is always-on). */
function withStandaloneAutolinkingExclude(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const settingsGradle = path.join(
        modConfig.modRequest.platformProjectRoot,
        "settings.gradle",
      );
      let contents = fs.readFileSync(settingsGradle, "utf8");

      if (!contents.includes("expoAutolinking.exclude")) {
        const excludeLine = `expoAutolinking.exclude = ${JSON.stringify(STANDALONE_AUTOLINK_EXCLUDE)}`;
        contents = contents.replace(
          "expoAutolinking.useExpoModules()",
          `${excludeLine}\n\nexpoAutolinking.useExpoModules()`,
        );
        fs.writeFileSync(settingsGradle, contents);
      }

      return modConfig;
    },
  ]);
}

/** Monorepo: Gradle must bundle from apps/mobile, not the workspace root. */
function withMonorepoGradleRoot(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes("\n    root = file(\"../../\")")) {
      return mod;
    }

    if (mod.modResults.contents.includes('// root = file("../../")')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        '// root = file("../../")',
        'root = file("../../")',
      );
      return mod;
    }

    mod.modResults.contents = mod.modResults.contents.replace(
      "/* Folders */",
      `/* Folders */
    root = file("../../")`,
    );

    return mod;
  });
}

/** Windows monorepo builds: fewer ABIs + no parallel Gradle reduces file-lock OOMs. */
function withStandaloneGradleProperties(config) {
  return withGradleProperties(config, (mod) => {
    const keys = new Set(["org.gradle.parallel", "reactNativeArchitectures"]);
    mod.modResults = mod.modResults.filter(
      (item) => item.type !== "property" || !keys.has(item.key),
    );
    mod.modResults.push(
      { type: "property", key: "org.gradle.parallel", value: "false" },
      {
        type: "property",
        key: "reactNativeArchitectures",
        value: "arm64-v8a",
      },
    );
    return mod;
  });
}

module.exports = function withStandaloneAndroidPlugin(config) {
  if (process.env.EXPO_STANDALONE_BUILD !== "1") {
    return config;
  }

  config = withStandaloneAndroid(config);
  config = withMonorepoGradleRoot(config);
  config = withStandaloneGradleProperties(config);
  config = withStandaloneAutolinkingExclude(config);
  return config;
};
