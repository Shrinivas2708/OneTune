const { withAppBuildGradle } = require("expo/config-plugins");

/** Help Reanimated 4 resolve react-native-worklets in a Bun/Turbo monorepo. */
function withWorkletsMonorepo(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes("REACT_NATIVE_WORKLETS_NODE_MODULES_DIR")) {
      return mod;
    }

    const snippet = `
// Monorepo: Reanimated resolves react-native-worklets from the workspace root.
def resolveWorkletsPackageDir() {
    def candidates = [
        new File(rootDir, "../node_modules/react-native-worklets"),
        new File(rootDir, "../../../node_modules/react-native-worklets"),
        new File(rootDir, "../../../../node_modules/react-native-worklets"),
        new File(rootDir, "../../../../../node_modules/react-native-worklets"),
    ]
    for (def dir : candidates) {
        if (dir.exists()) {
            return dir
        }
    }
    def resolved = ["node", "--print", "require.resolve('react-native-worklets/package.json')"]
        .execute(null, rootDir)
        .text
        .trim()
    return new File(resolved).getParentFile()
}
project.ext.REACT_NATIVE_WORKLETS_NODE_MODULES_DIR = resolveWorkletsPackageDir()
`;

    mod.modResults.contents = `${snippet}\n${mod.modResults.contents}`;
    return mod;
  });
}

module.exports = withWorkletsMonorepo;
