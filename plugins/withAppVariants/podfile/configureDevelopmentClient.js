const { annotateGeneratedCode } = require('../utils')

const singleQuote = (value) => `'${value}'`

/**
 * Configures the Expo development client.
 *
 * @param {string} podfile
 * @param {string[]} variantsWithDevelopmentClient
 * @returns {string}
 */
function configureDevelopmentClient(podfile, variantsWithDevelopmentClient) {
  const variantsWithDevelopmentClientString = `${variantsWithDevelopmentClient.map(singleQuote).join(', ')}`

  return (
    podfile
      /**
       * Expo appends `-D EXPO_CONFIGURATION_DEBUG` to debug build configurations'
       * `OTHER_SWIFT_FLAGS` setting ([reference][1]) to enable the development
       * client in debug builds ([reference][2]). To disable the development client
       * in a custom configuration, this flag is removed from build configurations
       * of variants that do not have the development client enabled after all Pods
       * are integrated.
       *
       * [1]: https://github.com/expo/expo/blob/435ee85db4ffee39e0ef470a784b43d78910c66f/packages/expo-modules-autolinking/scripts/ios/project_integrator.rb#L108-L133
       * [2]: https://github.com/expo/expo/blob/fdfc47a61a6461c81cb7acf4c7e185238393ec9c/packages/expo-modules-autolinking/src/platforms/apple.ts#L262-L278
       */
      .replace(
        /([ ]*)post_install(?:.|\n|\r)*\1end/m,
        `$&\n\n` +
          `$1${annotateGeneratedCode.begin('#')}` +
          `$1post_integrate do\n` +
          `$1  require 'xcodeproj'\n` +
          `\n` +
          `$1  xcode_project = Xcodeproj::Project.open("#{__dir__}/Hibi.xcodeproj")\n` +
          `\n` +
          `$1  xcode_project.targets.each do |target|\n` +
          `$1    target.build_configurations.each do |build_configuration|\n` +
          `$1      build_configuration\n` +
          `$1        .build_settings['OTHER_SWIFT_FLAGS']\n` +
          `$1        .sub!('-D EXPO_CONFIGURATION_DEBUG', '') if [${variantsWithDevelopmentClientString}].exclude?(build_configuration.name)\n` +
          `$1    end\n` +
          `$1  end\n` +
          `\n` +
          `$1  xcode_project.save\n` +
          `$1end\n` +
          `$1${annotateGeneratedCode.end('#')}`,
      )
  )
}

module.exports = configureDevelopmentClient
