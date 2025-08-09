const {
  withAppBuildGradle,
  withPlugins,
  withGradleProperties,
} = require('expo/config-plugins')

function updateAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents
      .replace(
        /([ ]*)entryFile =.*/,
        `$1entryFile = providers.exec {\n` +
          `$1    commandLine "node", "-e", "require('expo/scripts/resolveAppEntry')", projectRoot, "android", "absolute"\n` +
          `$1    workingDir rootDir\n` +
          `$1}.standardOutput.asText.map { path ->\n` +
          `$1    file(path.trim())\n` +
          `$1}.get()\n`,
      )
      .replace(
        /([ ]*)reactNativeDir =.*/,
        `$1reactNativeDir = providers.exec {\n` +
          `$1    commandLine "node", "--print", "require.resolve('react-native/package.json')"\n` +
          `$1    workingDir rootDir\n` +
          `$1}.standardOutput.asText.map { path ->\n` +
          `$1    new File(path.trim()).getParentFile().getAbsoluteFile()\n` +
          `$1}.get()\n`,
      )
      .replace(
        /([ ]*)hermesCommand =.*/,
        `$1hermesCommand = providers.exec {\n` +
          `$1    commandLine "node", "--print", "require.resolve('react-native/package.json')"\n` +
          `$1    workingDir rootDir\n` +
          `$1}.standardOutput.asText.map { path ->\n` +
          `$1    new File(path.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"\n` +
          `$1}.get()\n`,
      )
      .replace(
        /([ ]*)codegenDir =.*/,
        `$1codegenDir = providers.exec {\n` +
          `$1    commandLine "node", "--print", "require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })"\n` +
          `$1    workingDir rootDir\n` +
          `$1}.standardOutput.asText.map { path ->\n` +
          `$1    new File(path.trim()).getParentFile().getAbsoluteFile()\n` +
          `$1}.get()`,
      )
      .replace(
        /([ ]*)cliFile =.*/,
        `$1cliFile = providers.exec {\n` +
          `$1    commandLine "node", "--print", "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })"\n` +
          `$1    workingDir rootDir\n` +
          `$1}.standardOutput.asText.map { path ->\n` +
          `$1    new File(path.trim())\n` +
          `$1}.get()\n`,
      )
      .replace(
        /^apply from: new File.*@sentry\/react-native\/package.json.*$/m,
        `def sentryGradleFile = providers.exec {\n` +
          `    commandLine "node", "--print", "require('path').dirname(require.resolve('@sentry/react-native/package.json'))"\n` +
          `}.standardOutput.asText.map { path ->\n` +
          `    new File("\$\{path.trim()\}/sentry.gradle")\n` +
          `}.get()\n` +
          `\n` +
          `apply from: sentryGradleFile\n`,
      )

    return config
  })
}

function updateGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.concat([
      {
        type: 'empty',
      },
      {
        type: 'comment',
        value: `Enable configuration caching. Speeds up Gradle's configuration phase.\n# See https://docs.gradle.org/8.13/userguide/configuration_cache.html.`,
      },
      {
        type: 'property',
        key: 'org.gradle.configuration-cache',
        value: 'true',
      },
    ])

    return config
  })
}

function withGradleConfigurationCache(config) {
  return withPlugins(config, [updateAppBuildGradle, updateGradleProperties])
}

module.exports = withGradleConfigurationCache
