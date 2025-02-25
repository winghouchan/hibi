/* eslint-env node */

const withStorybook = require('@storybook/react-native/metro/withStorybook')
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('sql')

/**
 * Allows for the usage of `require.context`, which enables behaviour like
 * dynamic imports with paths determined at runtime (`await import(variable)`),
 * which currently has no support in Metro.
 *
 * @see {@link https://github.com/facebook/metro/issues/52}
 */
config.transformer.unstable_allowRequireContext = true

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.storybook'),
})
