export default function getPluralRules(locale: string): {} | undefined {
  /**
   * Dynamic imports with paths determined at runtime are not supported by the
   * bundler (Metro). `require.context` is an experimental API that provides the
   * missing behaviour.
   *
   * @see {@link https://github.com/facebook/metro/issues/52#issuecomment-2072494624}
   */
  return require.context(
    '../../../node_modules/@formatjs/intl-pluralrules/locale-data',
    false,
    /\.js$/,
  )(`./${locale.split('-')[0]}.js`)
}
