// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'plugin:import/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:react-native-a11y/all',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          ['builtin', 'external', 'internal'],
          'parent',
          'sibling',
          'index',
        ],
      },
    ],

    'prettier/prettier': 'error',

    /**
     * Disable the requirement for accessibility hints.
     *
     * Accessibility hints are only needed when the accessibility label by itself
     * does not provide enough context.
     *
     * @see {@link https://reactnative.dev/docs/accessibility#accessibilityhint | React Native documentation on the `accessibilityHint` prop}
     * @see {@link https://github.com/FormidableLabs/eslint-plugin-react-native-a11y/blob/b945d94a440f75f103bc4bc81ed494682b501ee0/docs/rules/has-accessibility-hint.md | eslint-plugin-react-native-a11y documentation on the `has-accessibility-hint` rule}
     */
    'react-native-a11y/has-accessibility-hint': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      plugins: ['jest', 'jest-extended'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-extended/all',
        'plugin:testing-library/react',
      ],
    },
    {
      files: ['src/**/!(*.spec|*.test).{js,jsx,ts,tsx}'],
      plugins: ['lingui'],
      rules: {
        'lingui/no-unlocalized-strings': [
          'error',
          { ignoreFunction: ['Error', 'TypeError'] },
        ],
        'lingui/t-call-in-function': 'error',
        'lingui/no-single-variables-to-translate': 'error',
        'lingui/no-expression-in-message': 'error',
        'lingui/no-single-tag-to-translate': 'error',
        'lingui/no-trans-inside-trans': 'error',
      },
    },
  ],
}
