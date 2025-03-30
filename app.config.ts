import { ExpoConfig } from 'expo/config'

const name = 'Hibi'
const identifier = 'co.hibi.app'

const nameByEnvironment = {
  development: `${name} (Dev)`,
  test: `${name} (Test)`,
  production: name,
}

const identifierByEnvironment = {
  development: `${identifier}.dev`,
  test: `${identifier}.test`,
  production: identifier,
}

export default {
  name: nameByEnvironment.production,
  slug: 'hibi',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'hibi',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  developmentClient: {
    silentLaunch: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: identifierByEnvironment.production,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: identifierByEnvironment.production,
  },
  plugins: [
    ['@sentry/react-native/expo'],
    [
      'expo-dev-client',
      {
        addGeneratedScheme: false,
      },
    ],
    'expo-font',
    'expo-localization',
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      './plugins/withAppVariants',
      {
        development: {
          android: {
            applicationId: identifierByEnvironment.development,
            appName: nameByEnvironment.development,
          },
          ios: {
            bundleIdentifier: identifierByEnvironment.development,
            displayName: nameByEnvironment.development,
          },
        },
        test: {
          developmentClient: false,
          android: {
            applicationId: identifierByEnvironment.test,
            appName: nameByEnvironment.test,
            productFlavorName: 'endToEndTest',
          },
          ios: {
            bundleIdentifier: identifierByEnvironment.test,
            displayName: nameByEnvironment.test,
          },
        },
      },
    ],
    ['./plugins/withExpoUpdates'],
  ],
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
} satisfies ExpoConfig
