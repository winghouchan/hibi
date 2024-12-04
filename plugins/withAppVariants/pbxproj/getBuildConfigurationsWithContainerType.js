/**
 * @import { XcodeProject } from 'expo/config-plugins'
 */

/**
 * @typedef {Object} Configuration
 * @property {Object.<string, any>} buildSettings
 * @property {string} name
 */

/**
 * @typedef {Object.<string, BuildConfigurationWithContainerType>} BuildConfigurationsWithContainerType
 * @typedef {Object} BuildConfigurationWithContainerType
 * @property {'project' | 'target'} type
 * @property {Object.<string, Configuration>} configurations
 */

/**
 * Gets iOS build configurations with their type of 'container'.
 *
 * A 'container' holds a list of build configurations for either the project or
 * a target.
 *
 * @param {XcodeProject} project
 * @returns {BuildConfigurationsWithContainerType}
 */
function getBuildConfigurationsWithContainerType(project) {
  const buildConfigurationsList = project.pbxXCConfigurationList()
  const buildConfigurations = project.pbxXCBuildConfigurationSection()

  return Object.entries(buildConfigurationsList).reduce(
    (buildConfigurationListByType, [key, value]) => {
      if (typeof value === 'string' && key.endsWith('_comment')) {
        const [listUuid] = key.split('_')
        const type = value.includes('PBXProject') ? 'project' : 'target'

        return {
          ...buildConfigurationListByType,
          [listUuid]: {
            type,
            configurations: buildConfigurationsList[
              listUuid
            ].buildConfigurations.reduce(
              (
                buildConfigurationsForType,
                { value: buildConfigurationUuid },
              ) => ({
                ...buildConfigurationsForType,
                [buildConfigurationUuid]:
                  buildConfigurations[buildConfigurationUuid],
              }),
              {},
            ),
          },
        }
      } else {
        return buildConfigurationListByType
      }
    },
    {},
  )
}

module.exports = getBuildConfigurationsWithContainerType
