const getBuildConfigurationsWithContainerType = require('./getBuildConfigurationsWithContainerType')

/**
 * Adds a `DISPLAY_NAME` build setting to each build configuration for a target.
 *
 * The `DISPLAY_NAME` is used to set the app's display name (`CFBundleDisplayName` in `Info.plist`).
 *
 * @param {XcodeProject} project
 * @param {string} displayName
 * @returns {void}
 *
 * @modifies project
 */
function addDisplayNameToTargetBuildConfigurations(project, displayName) {
  /**
   * Build configurations grouped by their configuration list and type.
   */
  const buildConfigurationsWithContainerType =
    getBuildConfigurationsWithContainerType(project)

  Object.values(buildConfigurationsWithContainerType).forEach(
    ({ type, configurations }) => {
      if (type === 'target') {
        Object.values(configurations).forEach((configuration) => {
          configuration.buildSettings.DISPLAY_NAME = displayName
        })
      }
    },
  )
}

module.exports = addDisplayNameToTargetBuildConfigurations
