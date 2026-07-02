const { withAppBuildGradle } = require("expo/config-plugins");

/** Name release/debug APKs OneTune-{version}-{buildType}.apk for sharing. */
function withAndroidApkName(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes('outputFileName = "OneTune-')) {
      return mod;
    }

    mod.modResults.contents = mod.modResults.contents.replace(
      /(\n    defaultConfig \{[\s\S]*?\n    \})/,
      `$1
    applicationVariants.configureEach { variant ->
        variant.outputs.configureEach { output ->
            output.outputFileName = "OneTune-\${variant.versionName}-\${variant.buildType.name}.apk"
        }
    }`,
    );

    return mod;
  });
}

module.exports = withAndroidApkName;
