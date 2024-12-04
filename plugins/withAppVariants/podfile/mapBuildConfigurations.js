/**
 * @import { Variants } from '..'
 */

const { annotateGeneratedCode } = require('../utils')

/**
 * Maps custom build configurations to debug and release build types.
 *
 * @see {@link https://guides.cocoapods.org/syntax/podfile.html#project | Cocoapods documentation}
 *
 * @param {string} podfile The Podfile contents to modify.
 * @param {string} projectName The name of the project. Used by Cocoapods to identify the `project` and `target`.
 * @param {Variants} variants The variants configured in the app config.
 * @returns {string} The new Podfile contents. The original contents is not mutated.
 */
function mapBuildConfigurations(podfile, projectName, variants) {
  const podfileTarget = `target '${projectName}' do`

  return podfile.replace(
    new RegExp(podfileTarget),
    annotateGeneratedCode.begin('#') +
      `project '${projectName}',\n` +
      `  'Debug' => :debug,\n` +
      `  'Release' => :release,\n` +
      Object.keys(variants).reduce((state, variant, index, array) => {
        const variantTitleCase = `${variant.slice(0, 1).toUpperCase()}${variant.slice(1)}`

        return (
          state +
          `  '${variantTitleCase}-Debug' => :debug,\n` +
          `  '${variantTitleCase}-Release' => :release` +
          `${index !== array.length - 1 ? ',\n' : '\n'}`
        )
      }, '') +
      annotateGeneratedCode.end('#') +
      '\n' +
      podfileTarget,
  )
}

module.exports = mapBuildConfigurations
