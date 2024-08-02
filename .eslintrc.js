// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'plugin:import/recommended', 'prettier'],
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
}
