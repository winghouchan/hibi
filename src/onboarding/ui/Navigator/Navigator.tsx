import { CommonActions } from '@react-navigation/native'
import { type StackNavigatorProps } from '@react-navigation/stack'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { ComponentProps, Suspense } from 'react'
import { CardStyleInterpolators, Stack } from '@/ui'
import {
  isOnboardingCompleteQuery,
  onboardingCollectionQuery,
} from '../../operations'
import ErrorBoundary from './ErrorBoundary'
import Header from './Header'

/**
 * Options for modal screens in the onboarding flow
 *
 * The onboarding navigator uses the JS based stack navigator which does not
 * have a fullscreen modal presentation. `animation` set to `slide_from_bottom`
 * replicates the fullscreen modal presentation style.
 */
const fullscreenModalOptions: ComponentProps<typeof Stack.Screen>['options'] = {
  animation: 'slide_from_bottom',
  cardStyleInterpolator: undefined,
  headerMode: 'screen',
  headerShown: true,
}

export default function OnboardingNavigator() {
  const { data: isOnboardingComplete } = useSuspenseQuery(
    isOnboardingCompleteQuery,
  )
  const { data: onboardingCollection } = useSuspenseQuery(
    onboardingCollectionQuery,
  )

  const screenLayout: StackNavigatorProps['screenLayout'] = ({ children }) => (
    <ErrorBoundary>
      <Suspense>{children}</Suspense>
    </ErrorBoundary>
  )

  const screenListeners: StackNavigatorProps['screenListeners'] = ({
    navigation,
    route,
  }) => ({
    state: ({ data: { state } }) => {
      /**
       * Did the navigation occur via a deep link?
       *
       * The navigation into the onboarding journey occurred via a deep link if
       * the first item in the history is not the welcome screen (at `index`).
       */
      const isDeepLink = state.routes[0].name !== 'index'

      if (isDeepLink && isOnboardingComplete === false) {
        if (route.name === 'onboarding/collection') {
          navigation.dispatch((state) => {
            const routes = [{ name: 'index' }, ...state.routes]

            return CommonActions.reset({
              ...state,
              index: routes.length - 1,
              routes,
            })
          })
        } else if (onboardingCollection === null) {
          /**
           * All subsequent routes require an onboarding collection to exist.
           * This block handles the case where the onboarding collection does not
           * exist, sending the user to the welcome screen.
           */
          navigation.reset({ index: 0, routes: [{ name: 'index' }] })
        } else {
          /**
           * All subsequent routes require an onboarding collection to exist.
           * This block handles the case where the onboarding collection does
           * exist, updating the route history to allow for back navigation.
           */
          navigation.dispatch((state) => {
            const noteEditorRoutes = [
              'onboarding/notes/new',
              'onboarding/notes/[id]/edit',
            ]

            const routes = [
              { name: 'index' },
              { name: 'onboarding/collection' },
              ...(noteEditorRoutes.includes(route.name)
                ? [{ name: 'onboarding/notes/index' }]
                : []),
              ...state.routes,
            ]

            const newState = {
              ...state,
              index: routes.length - 1,
              routes,
            }

            return CommonActions.reset(newState)
          })
        }
      }
    },
  })

  const screenOptions: StackNavigatorProps['screenOptions'] = {
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalSlide,
    gestureEnabled: true,
    headerMode: 'float',
    header: (props) => <Header {...props} />,
  }

  if (isOnboardingComplete) {
    return <Redirect href="/(onboarded)/(tabs)" />
  } else {
    return (
      <Stack
        screenLayout={screenLayout}
        screenListeners={screenListeners}
        screenOptions={screenOptions}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/notes/new"
          options={fullscreenModalOptions}
        />
        <Stack.Screen
          name="onboarding/notes/[id]/edit"
          options={fullscreenModalOptions}
        />
      </Stack>
    )
  }
}
