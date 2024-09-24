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
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      plugins: ['jest', 'jest-extended'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-extended/all',
      ],
    },
  ],
}
