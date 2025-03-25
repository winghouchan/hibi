import * as Sentry from '@sentry/react-native'

export default function configureTelemetry() {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_TELEMETRY_DSN,
    integrations: (integrations) => {
      if (__DEV__) {
        integrations.push(Sentry.spotlightIntegration())
      }

      return integrations
    },
    profilesSampleRate: 1.0,
    spotlight: __DEV__,
    tracesSampleRate: 1.0,
  })
}
