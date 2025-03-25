import { useReactNavigationDevTools } from '@dev-plugins/react-navigation'
import { Trans, useLingui } from '@lingui/react/macro'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { SplashScreen, useNavigationContainerRef } from 'expo-router'
import { ComponentProps, Suspense, useEffect, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { log, telemetryInstrumentation } from '@/telemetry'
import { CardStyleInterpolators, Stack } from '@/ui'
import ErrorBoundary from './ErrorBoundary'

type StackProps = ComponentProps<typeof Stack>

export default function Navigator() {
  const { t: translate } = useLingui()
  const { theme } = useUnistyles()
  const [isNavigatorReady, setIsNavigatorReady] = useState(false)

  const screenLayout: StackProps['screenLayout'] = ({ children }) => (
    <ErrorBoundary>
      <Suspense>{children}</Suspense>
    </ErrorBoundary>
  )

  const screenListeners: StackProps['screenListeners'] = {
    state: () => {
      /**
       * If the app is opened via a deep link, the screen may be animated in on
       * iOS. As a result, on iOS, the navigator is assumed not to be ready yet
       * on the `state` event, which is fired before the `transitionEnd` event.
       *
       * On Android, the `transitionEnd` event does not fire until after the
       * splash screen is hidden. As a result, the navigator is inferred to be
       * ready (and the splash screen hidden) on the first `state` event.
       */
      if (Platform.OS !== 'ios' && !isNavigatorReady) {
        setIsNavigatorReady(true)
      }
    },
    transitionEnd: () => {
      /**
       * If the app is opened via a deep link, the screen may be animated in on
       * iOS. As a result, the navigator is inferred to be ready (and the splash
       * screen hidden) after the transition has ended. The transition end event
       * may be fired when the animation has not fully complete. As a result, an
       * additional timeout is applied.
       */
      if (Platform.OS === 'ios' && !isNavigatorReady) {
        setTimeout(() => {
          setIsNavigatorReady(true)
        }, 400)
      }
    },
  }

  const screenOptions: StackProps['screenOptions'] = {
    headerShown: false,
  }

  const hideSplashScreen = () => {
    if (isNavigatorReady) {
      SplashScreen.hideAsync().then(() => {
        log.info('Splash screen hidden')
      })
    }
  }

  const navigatorTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.neutral[0].background,
    },
  }

  const navigationContainerRef = useNavigationContainerRef()

  useReactNavigationDevTools(navigationContainerRef)

  useEffect(hideSplashScreen, [isNavigatorReady])

  useEffect(() => {
    if (navigationContainerRef) {
      telemetryInstrumentation.navigation.registerNavigationContainer(
        navigationContainerRef,
      )
    }
  }, [navigationContainerRef])

  return (
    <ThemeProvider value={navigatorTheme}>
      <Stack
        screenLayout={screenLayout}
        screenListeners={screenListeners}
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="onboarding"
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalSlide,
          }}
        />
        <Stack.Screen
          name="storybook"
          options={({ navigation }) => ({
            animation: 'slide_from_bottom',
            title: translate`Storybook`,
            headerMode: 'screen',
            headerShown: true,
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.goBack()}
                >
                  <Trans>Close</Trans>
                </Pressable>
              ) : null,
          })}
        />
      </Stack>
    </ThemeProvider>
  )
}
