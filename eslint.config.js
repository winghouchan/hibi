const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const query = require('@tanstack/eslint-plugin-query')
const { defineConfig, globalIgnores } = require('eslint/config')
const expo = require('eslint-config-expo/flat')
const importExport = require('eslint-plugin-import')
const jest = require('eslint-plugin-jest')
const jestExtended = require('eslint-plugin-jest-extended')
const lingui = require('eslint-plugin-lingui')
const prettier = require('eslint-plugin-prettier/recommended')
const reactCompiler = require('eslint-plugin-react-compiler')
const testingLibrary = require('eslint-plugin-testing-library')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = defineConfig([
  expo,
  importExport.flatConfigs.recommended,
  ...query.configs['flat/recommended'],
  ...compat.extends('plugin:react-native-a11y/all'),
  reactCompiler.configs.recommended,
  globalIgnores([
    '**/android',
    '**/expo-env.d.ts',
    '**/ios',
    '**/node_modules',
  ]),
  {
    languageOptions: {
      ecmaVersion: 'latest',
    },

    rules: {
      /**
       * Disable check ensuring named imports correspond to a named export. When
       * enabled it returns false errors when importing type definitions. It is
       * safe to disable as TypeScript will raise an error if an import does not
       * correspond to a named export.
       */
      'import/named': 'off',

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],

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
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    extends: [
      jest.configs['flat/recommended'],
      jest.configs['flat/style'],
      jestExtended.configs['flat/all'],
      testingLibrary.configs['flat/react'],
    ],
  },
  {
    files: ['src/**/!(*.bench|*.spec|*.test).{js,jsx,ts,tsx}'],
    ignores: ['**/*.stories.*', 'src/ui/tokens/**'],

    plugins: {
      lingui,
    },

    rules: {
      'lingui/no-unlocalized-strings': [
        'error',
        {
          ignore: [
            '^(?![A-Z])\\S+$', // Single word strings that don't start with an uppercase letter
            'use no memo', // React Compiler opt-out directive
            'set null', // Foreign key action configuration option
          ],
          ignoreFunctions: [
            '*.mock',
            '*Error*',
            'handle*',
            'log.*',
            'LogBox.*',
            'tracer.*',
          ],
          ignoreNames: [
            'accessibilityRole',
            'initialRouteName',
            'queryKey',
            'screen',
            'size',
            'style',
            'testID',
          ],
        },
      ],
      'lingui/t-call-in-function': 'error',
      'lingui/no-single-variables-to-translate': 'error',
      'lingui/no-expression-in-message': 'error',
      'lingui/no-single-tag-to-translate': 'error',
      'lingui/no-trans-inside-trans': 'error',
    },
  },
  {
    files: ['eslint.config.*'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
      },
    },
  },
  prettier,
])
