/**
 * @import { Variants } from '..'
 */

const { annotateGeneratedCode } = require('../utils')

/**
 * Configures the Expo development client.
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/dev-client/}
 *
 * @param {string} settingsGradle
 * @param {Variants} variants
 * @returns {string}
 */
function configureDevelopmentClient(settingsGradle, variants) {
  return (
    settingsGradle
      /**
       * Expo links Expo native packages using the `useExpoModules` function. This
       * function has an interface to exclude packages ([reference][1]). It is used
       * to exclude the development client and its dependencies when the variant
       * being built is one that has `developmentClient` configured to `false`.
       *
       * [1]: https://docs.expo.dev/modules/autolinking/#exclude
       */
      .replace(
        /expoAutolinking.useExpoModules\(\)/,
        `\n` +
          annotateGeneratedCode.begin('//') +
          `def variantsWithoutDevClient = [` +
          `${Object.entries(variants).reduce(
            (
              variantsWithoutDevClient,
              [variant, { android, developmentClient }],
            ) => {
              const name = android?.productFlavorName || variant

              return developmentClient === false
                ? `${variantsWithoutDevClient === '' ? '' : `${variantsWithoutDevClient}, `}'${name.slice(0, 1).toUpperCase()}${name.slice(1)}'`
                : variantsWithoutDevClient
            },
            '',
          )}` +
          `]\n` +
          `\n` +
          `if (gradle.startParameter.taskNames.any { taskName ->\n` +
          `  variantsWithoutDevClient.any { variant -> taskName.contains(variant) }\n` +
          `}) {\n` +
          `  expoAutolinking.exclude = ["expo-dev-client", "expo-dev-launcher", "expo-dev-menu", "expo-dev-menu-interface"]\n` +
          `}\n` +
          `\n` +
          `expoAutolinking.useExpoModules()\n` +
          annotateGeneratedCode.end('//'),
      )
  )
}

module.exports = configureDevelopmentClient
