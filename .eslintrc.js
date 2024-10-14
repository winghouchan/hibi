// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'plugin:import/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
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
