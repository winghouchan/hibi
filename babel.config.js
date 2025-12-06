/**
 * Babel configuration for the project
 *
 * ⚠️ There is also a Babel configuration for Storybook on web (see `.storybook/web/main.ts`).
 * That configuration is a subset of the configuration here – just enough to get Storybook
 * working. The two configurations will need to be kept in sync.
 *
 * @todo Figure out how to share the Babel config with the Storybook specific config.
 */
module.exports = function (api) {
  /**
   * Cache the config based on the value of `NODE_ENV`. Use `NODE_ENV` as the
   * configuration varies depending on the value.
   */
  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      /**
       * Enables bundling of SQL migration files
       *
       * @see {@link https://orm.drizzle.team/docs/get-started-sqlite#install-babel-plugin}
       */
      ['inline-import', { extensions: ['.sql'] }],

      /**
       * Enables transformation of JS objects and JSX elements into ICU MessageFormat messages
       *
       * @see {@link https://lingui.dev/ref/macro}
       */
      '@lingui/babel-plugin-lingui-macro',

      ...(api.env((name) => name !== 'test')
        ? // Only apply the following configuration when `NODE_ENV` is not `'test'`
          [
            /**
             * Allows Unistyles to process components and their style sheets
             *
             * @see {@link https://www.unistyl.es/v3/start/how-unistyles-works}
             * @see {@link https://www.unistyl.es/v3/other/babel-plugin}
             */
            ['react-native-unistyles/plugin', { root: 'src' }],
          ]
        : []),

      ...(api.env('test')
        ? // Additionally apply the following configuration when `NODE_ENV` is `'test'`
          [
            /**
             * Enables the usage of ESM dynamic imports instead of CJS require
             *
             * @see {@link https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options}
             * @see {@link https://www.npmjs.com/package/babel-plugin-dynamic-import-node}
             */
            ['dynamic-import-node', { noInterop: true }],

            /**
             * Enables the usage of the `require.context` function
             *
             * The `require.context` function enables the behaviour of dynamically
             * importing from a path determined at runtime (`await import(variable)`).
             * It is used because Metro bundler has no support for the ESM syntax.
             * To get `require.context` working in Jest tests, this Babel plugin
             * is required.
             *
             * @see {@link https://github.com/facebook/metro/issues/52}
             */
            ['require-context-hook'],
          ]
        : []),
    ],
  }
}
