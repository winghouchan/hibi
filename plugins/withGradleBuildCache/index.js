const { withGradleProperties } = require('expo/config-plugins')

function withGradleConfigurationCache(config) {
  return withGradleProperties(config, (config) => {
    /**
     * Enables the Gradle build cache
     * @see {@link https://docs.gradle.org/8.13/userguide/build_cache.html#sec:build_cache_enable}
     */
    config.modResults = config.modResults.concat([
      {
        type: 'empty',
      },
      {
        type: 'comment',
        value: `Enable build caching. Speeds up Gradle's build phase.\n# See https://docs.gradle.org/8.13/userguide/build_cache.html.`,
      },
      {
        type: 'property',
        key: 'org.gradle.caching',
        value: 'true',
      },
    ])

    return config
  })
}

module.exports = withGradleConfigurationCache
