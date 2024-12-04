/**
 * @import { Options } from '..'
 */

const getBuildConfigurationsWithContainerType = require('./getBuildConfigurationsWithContainerType')

/**
 * @callback addBuildConfigurationsForVariant
 * @param {[string, Options]} parameters
 * @returns {void}
 *
 * @modifies project
 */

/**
 * Returns a function to add build configurations for a variant.
 *
 * @param {XcodeProject} project
 * @returns {addBuildConfigurationsForVariant}
 *
 * @modifies project
 */
function addBuildConfigurations(project) {
  /**
   * The build configuration lists from the `.pbxproj`.
   *
   * See the block demarcated by the following comments in the `.pbxproj` file:
   *
   * ```
   * Begin XCConfigurationList section
   * ...
   * End XCConfigurationList section
   * ```
   */
  const buildConfigurationsList = project.pbxXCConfigurationList()

  /**
   * The build configurations from the `.pbxproj`.
   *
   * See the block demarcated by the following comments in the `.pbxproj` file:
   *
   * ```
   * Begin XCBuildConfiguration section
   * ...
   * End XCBuildConfiguration section
   * ```
   */
  const buildConfigurations = project.pbxXCBuildConfigurationSection()

  /**
   * Build configurations grouped by their configuration list and type.
   */
  const buildConfigurationsWithContainerType =
    getBuildConfigurationsWithContainerType(project)

  return ([variant, { ios }]) => {
    const buildVariantName = `${variant.slice(0, 1).toUpperCase()}${variant.slice(1)}`

    /**
     * Build configurations for variants are created by duplicating existing build
     * configurations for each build type (debug/release) and each container type
     * (project/target) then applying any custom configurations.
     */
    Object.entries(buildConfigurationsWithContainerType).forEach(
      ([listUuid, { type, configurations }]) => {
        Object.values(configurations).forEach((configuration) => {
          const newUuid = project.generateUuid()
          const name = `${buildVariantName}-${configuration.name}`

          buildConfigurations[newUuid] = {
            ...configuration,
            buildSettings: {
              ...configuration.buildSettings,

              ...(type === 'target' && {
                ...(ios?.bundleIdentifier && {
                  PRODUCT_BUNDLE_IDENTIFIER: ios.bundleIdentifier,
                }),

                ...(ios?.displayName && {
                  DISPLAY_NAME: `"${ios.displayName}"`,
                }),
              }),
            },
            name,
          }

          buildConfigurationsList[listUuid].buildConfigurations.push({
            value: newUuid,
            comment: name,
          })
        })
      },
    )
  }
}

module.exports = addBuildConfigurations
