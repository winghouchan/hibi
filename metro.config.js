/* eslint-env node */

const { getDefaultConfig } = require('expo/metro-config')

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

module.exports = config
