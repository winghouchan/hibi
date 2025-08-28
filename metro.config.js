/* eslint-env node */

const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const withStorybook = require('@storybook/react-native/metro/withStorybook')
const path = require('path')

const config = getSentryExpoConfig(__dirname)

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
  configPath: path.resolve(__dirname, './.storybook/native'),
  enabled: process.env.NODE_ENV === 'development',
  onDisabledRemoveStorybook: true,
})
