import { StorybookConfig } from '@storybook/react-native-web-vite'

const main: StorybookConfig = {
  stories: ['../../src/**/*.mdx', '../../src/**/*.stories.?(ts|tsx|js|jsx)'],

  addons: ['@storybook/addon-essentials'],

  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      pluginReactOptions: {
        /**
         * Babel configuration for Storybook on web.
         *
         * ⚠️ There is also a Babel configuration in the project root. The
         * configuration here is a subset of the root configuration – just
         * enough to get Storybook working. The two configurations will need
         * to be kept in sync.
         *
         * @todo Figure out how to share the Babel config in the project root.
         */
        babel: {
          plugins: ['react-native-unistyles/plugin'],
        },
      },
    },
  },

  typescript: {
    reactDocgen: 'react-docgen',
  },
}

export default main
