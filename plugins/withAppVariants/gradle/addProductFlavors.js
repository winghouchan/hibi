/**
 * @import { Variants } from '..'
 */

const { annotateGeneratedCode } = require('../utils')

/**
 * Adds Android product flavors to the app module build Gradle file.
 *
 * @see {@link https://developer.android.com/build/build-variants#product-flavors | Android documentation on product flavors}
 *
 * @param {string} appGradle The contents of the app module build Gradle file.
 * @param {string} applicationId The application ID.
 * @param {Variants} variants The variants configured in the app config.
 * @returns {string} The new app module build Gradle file contents. The original contents is not mutated.
 */
function addProductFlavors(appGradle, applicationId, variants) {
  /**
   * `$&` represents the full match of the regular expression. The full match
   * identifies the location within the contents that the product flavors should
   * be appended to. As the string [`replace` method][1] is used, the match is
   * replaced with itself plus the product flavors appended to it.
   *
   * `$1` represents the first capture group in the regular expression, capturing
   * the indentation of sibling code blocks. It is used to ensure the same level
   * of indentation as the sibling code blocks.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
   */
  return appGradle.replace(
    /([ ]*)buildTypes {(?:.|\n|\r)*?\n\1}/m,
    '$&\n' +
      `\n` +
      `$1${annotateGeneratedCode.begin('//')}` +
      `$1flavorDimensions 'env'\n` +
      `$1productFlavors {\n` +
      Object.entries(variants).reduce(
        (state, [variant, { android }]) =>
          state +
          `$1    ${android?.productFlavorName || variant} {\n` +
          `$1        dimension 'env'\n` +
          `$1        applicationId '${android.applicationId}'\n` +
          `$1    }\n`,
        '',
      ) +
      `$1    production {\n` +
      `$1        dimension 'env'\n` +
      `$1        applicationId '${applicationId}'\n` +
      `$1    }\n` +
      `$1}\n` +
      `$1${annotateGeneratedCode.end('//')}`,
  )
}

module.exports = addProductFlavors
