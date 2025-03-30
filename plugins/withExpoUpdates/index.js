/**
 * @import { ExpoConfig } from 'expo/config'
 */

const { withPlugins, withPodfileProperties } = require('expo/config-plugins')

/**
 * Updates the Podfile properties file
 *
 * @param {ExpoConfig} config
 * @returns {ExpoConfig}
 */
function updatePodfileProperties(config) {
  return withPodfileProperties(config, (config) => {
    config.modResults = {
      ...config.modResults,

      /**
       * Directs Expo Updates to use a third-party SQLite Pod instead of Expo
       * SQLite. This is necessary because the application uses OP SQLite which
       * builds its own version of SQLite.
       *
       * @see {@link https://op-engineering.github.io/op-sqlite/docs/installation#expo-updates}
       */
      'expo.updates.useThirdPartySQLitePod': 'true',
    }

    return config
  })
}

/**
 * Configures build properties for Expo Updates.
 *
 * Expo Updates has some properties only configurable through a config plugin.
 *
 * @param {ExpoConfig} config
 * @returns {ExpoConfig}
 */
function withExpoUpdates(config) {
  return withPlugins(config, [updatePodfileProperties])
}

module.exports = withExpoUpdates
