/**
 * @import { ExpoConfig } from 'expo/config'
 */

const {
  withPlugins,
  withXcodeProject,
  withPodfile,
  withInfoPlist,
  withAppBuildGradle,
  withSettingsGradle,
  withDangerousMod,
} = require('expo/config-plugins')
const { mkdir, writeFile } = require('node:fs/promises')
const xmlBuilder = require('xmlbuilder')
const {
  addProductFlavors,
  configureDevelopmentClient: configureDevelopmentClientForAndroid,
} = require('./gradle')
const {
  addBuildConfigurations,
  addDisplayNameToTargetBuildConfigurations,
} = require('./pbxproj')
const {
  configureDevelopmentClient: configureDevelopmentClientForIos,
  mapBuildConfigurations,
} = require('./podfile')
const { getVariantsWithDevelopmentClient } = require('./utils')

/**
 * @typedef {Object.<string, Options>} Variants
 */

/**
 * @typedef {Object} Options
 *
 * @property {boolean=} developmentClient
 *   Whether the [Expo Dev Client][1] is enabled for this variant. When `true`
 *   or `undefined`, the development client is enabled for the debug build type.
 *   When `false`, the development client is disabled for the debug build type.
 *   The development client is always disabled for the release build type.
 *
 *   [1]: https://docs.expo.dev/versions/latest/sdk/dev-client/
 *
 * @property {AndroidOptions=} android Options for Android
 *
 * @property {IosOptions=} ios Options for iOS
 */

/**
 * @typedef {Object} AndroidOptions
 *
 * @property {string=} applicationId
 *   The application identifier. It should be the same as `ios.bundleIdentifier`.
 *
 * @property {string=} appName
 *   The name of the app. It will be displayed in places such as below the app icon
 *   on a home screen, alongside the app icon in an app list, or above the app's screen
 *   in an app switcher.
 *
 * @property {string=} productFlavorName
 *   The name of the [product flavor][1] (as set in the Gradle file). As an example,
 *   it can be used to give an alternative name for a 'test' variant as Android product
 *   flavors cannot start with "test" ([reference][2]).
 *
 *   [1]: https://developer.android.com/build/build-variants#product-flavors
 *   [2]: https://android.googlesource.com/platform/tools/build/+/22477ac/gradle/src/main/groovy/com/android/build/gradle/AndroidPlugin.groovy#89
 */

/**
 * @typedef {Object} IosOptions
 *
 * @property {string=} bundleIdentifier
 *   The bundle identifier. It should be the same as `android.applicationId`.
 *
 * @property {string=} displayName
 *   The name of the app. It will be displayed in places such as below the app icon
 *   on a home screen, alongside the app icon in an app list, or above the app's screen
 *   in an app switcher.
 */

/**
 * Updates the Xcode project's `pbxproj` file
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function updateXcodeProject(config, variants) {
  return withXcodeProject(config, async (config) => {
    /**
     * The `.pbxproj` file parsed into a JavaScript object along with utility
     * functions to read and mutate the data.
     */
    const project = config.modResults

    /**
     * By default, the app's display name is hard-coded into the Info.plist. This
     * means app variants would all have the same display name. Adding a display
     * name setting to each build configuration is the first step in allowing for
     * different display names in different variants. The second step is updating
     * the Info.plist file to read the setting from the build configuration, see
     * the `updateInfoPlist` function.
     */
    addDisplayNameToTargetBuildConfigurations(project, config.name)

    /**
     * Add build configurations for each variant.
     */
    Object.entries(variants).forEach(addBuildConfigurations(project))

    return config
  })
}

/**
 * Updates the Podfile
 *
 * @see {@link https://guides.cocoapods.org/syntax/podfile.html | Podfile documentation}
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function updatePodfile(config, variants) {
  return withPodfile(config, async (config) => {
    const variantsWithDevelopmentClient =
      getVariantsWithDevelopmentClient(variants)

    /**
     * Cocoapods does not understand custom build configurations without an explicit
     * map between custom build configurations and the build configurations it does
     * understand ([reference][1]).
     *
     * [1]: https://guides.cocoapods.org/syntax/podfile.html#project
     */
    config.modResults.contents = mapBuildConfigurations(
      config.modResults.contents,
      config.name,
      variants,
    )

    /**
     * By default, the Expo development client is enabled for all debug builds.
     * This may not be what is desired (for example: end-to-end tests on an app
     * built with the debug build type should have the development client disabled
     * to allow for testing deep links as deep links do not function with the
     * development client ([reference][1])). As a result, a custom configuration
     * is applied below.
     *
     * [1]: https://docs.expo.dev/develop/development-builds/development-workflows/#app-specific-deep-links
     */
    config.modResults.contents = configureDevelopmentClientForIos(
      config.modResults.contents,
      variantsWithDevelopmentClient,
    )

    return config
  })
}

/**
 * Updates the Info.plist file
 *
 * @see {@link https://developer.apple.com/documentation/bundleresources/information_property_list | Apple documentation on the Info.plist file}
 *
 * @param {ExpoConfig} config
 * @returns {ExpoConfig}
 */
function updateInfoPlist(config) {
  return withInfoPlist(config, async (config) => {
    /**
     * `DISPLAY_NAME` is set in each variant's build configuration. See the `updateXcodeProject` function.
     */
    config.modResults.CFBundleDisplayName = '$(DISPLAY_NAME)'

    /**
     * Allows the app to be opened using the product bundle identifier for the variant as the URL scheme.
     */
    config.modResults.CFBundleURLTypes = [
      { CFBundleURLSchemes: ['hibi', '$(PRODUCT_BUNDLE_IDENTIFIER)'] },
    ]

    return config
  })
}

/**
 * Updates the app module build Gradle file
 *
 * @see {@link https://developer.android.com/build#module-level | Android documentation on the module-level build Gradle file}
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function updateAppGradle(config, variants) {
  return withAppBuildGradle(config, async (config) => {
    const { language } = config.modResults

    if (language === 'groovy') {
      config.modResults.contents = addProductFlavors(
        config.modResults.contents,
        config.android.package,
        variants,
      )
    } else {
      throw new Error(
        `android/app/build.gradle not updated. Cannot handle ${language} files.`,
      )
    }

    return config
  })
}

/**
 * Updates the Gradle settings file
 *
 * @see {@link https://developer.android.com/build#settings-file | Android documentation on the Gradle settings file}
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function updateSettingsGradle(config, variants) {
  return withSettingsGradle(config, async (config) => {
    /**
     * By default, the Expo development client is enabled for all debug builds.
     * This may not be what is desired (for example: end-to-end tests on an app
     * built with the debug build type should have the development client disabled
     * to allow for testing deep links as deep links do not function with the
     * development client ([reference][1])). As a result, a custom configuration
     * is applied below.
     *
     * [1]: https://docs.expo.dev/develop/development-builds/development-workflows/#app-specific-deep-links
     */
    config.modResults.contents = configureDevelopmentClientForAndroid(
      config.modResults.contents,
      variants,
    )

    return config
  })
}

/**
 * Updates the Android source sets
 *
 * @see {@link https://developer.android.com/build#sourcesets | Android documentation on source sets}
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function updateSourceSets(config, variants) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      /**
       * By default, the app's display name is hard-coded into the `strings.xml`
       * file for each app variant. This means app variants would all have the
       * same display name. Below, each variant has their own `strings.xml` file
       * created with their configured display name.
       */
      await Promise.all(
        Object.entries(variants).map(async ([variant, { android }]) => {
          const stringResources = xmlBuilder
            .create('resources', { headless: true })
            .ele(
              'string',
              { name: 'app_name' },
              android?.appName || config.name,
            )
            .end({ pretty: true })

          const directoryPath = `${config.modRequest.platformProjectRoot}/app/src/${android?.productFlavorName || variant}/res/values`

          await mkdir(directoryPath, { recursive: true })

          await writeFile(`${directoryPath}/strings.xml`, stringResources)
        }),
      )

      return config
    },
  ])
}

/**
 * Configures app variants
 *
 * Allows for unique app display names and bundle/package identifiers and any
 * other configuration between app variants such as development vs test vs production.
 *
 * @param {ExpoConfig} config
 * @param {Variants} variants
 * @returns {ExpoConfig}
 */
function withAppVariants(config, variants) {
  return withPlugins(config, [
    [updateXcodeProject, variants],
    [updatePodfile, variants],
    updateInfoPlist,
    [updateAppGradle, variants],
    [updateSettingsGradle, variants],
    [updateSourceSets, variants],
  ])
}

module.exports = withAppVariants
