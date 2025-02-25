import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { SplashScreen, Stack } from 'expo-router'
import { ComponentProps, useEffect, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { log } from '@/telemetry'

type StackProps = ComponentProps<typeof Stack>

export default function Navigator() {
  const { i18n } = useLingui()
  const { isSuccess: hasCheckedOnboardingState } = useQuery(
    isOnboardingCompleteQuery,
  )
  const [isNavigatorReady, setIsNavigatorReady] = useState(false)

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
       * screen hidden) after the transition has ended.
       */
      if (Platform.OS === 'ios' && !isNavigatorReady) {
        setIsNavigatorReady(true)
      }
    },
  }

  const screenOptions: StackProps['screenOptions'] = {
    headerShown: false,
  }

  const hideSplashScreen = () => {
    if (hasCheckedOnboardingState && isNavigatorReady) {
      SplashScreen.hideAsync().then(() => {
        log.info('Splash screen hidden')
      })
    }
  }

  useEffect(hideSplashScreen, [hasCheckedOnboardingState, isNavigatorReady])

  return (
    <Stack screenListeners={screenListeners} screenOptions={screenOptions}>
      <Stack.Screen
        name="storybook"
        options={({ navigation }) => ({
          title: i18n.t(msg`Storybook`),
          presentation: 'fullScreenModal',
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
  )
}
