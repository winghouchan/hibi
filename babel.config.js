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
          ]
        : []),
    ],
  }
}
