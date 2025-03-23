import { useLingui } from '@lingui/react/macro'
import { CommonActions, type NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Redirect, useFocusEffect, useNavigation } from 'expo-router'
import { View } from 'react-native'
import { Button, CardStyleInterpolators, Stack } from '@/ui'
import {
  isOnboardingCompleteQuery,
  onboardingCollectionQuery,
} from '../../operations'
import ErrorBoundary from './ErrorBoundary'
import Header from './Header'

export default function OnboardingNavigator() {
  const { t: translate } = useLingui()
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)
  const { data: onboardingCollection } = useQuery(onboardingCollectionQuery)
  const navigation = useNavigation<
    NavigationProp<{
      index: undefined
      onboarding: undefined
    }>
  >()

  const onFocus = () => {
    /**
     * `setTimeout` fixes issue where `navigation.reset` has no effect when the
     * new architecture is enabled. The cause and resolution is not fully understood.
     */
    setTimeout(() => {
      const state = navigation.getState()

      /**
       * Name of the first screen in the onboarding navigator. If the screen was
       * opened with a deep link, it will also be the current screen.
       */
      const routeName = state.routes[0].state?.routes[0].name ?? ''

      /**
       * Did the navigation occur via a deep link?
       *
       * The navigation into the onboarding journey occurred via a deep link if
       * the first item in the history has the name `onboarding` as opposed to
       * `index` which represents the welcome screen.
       */
      const isDeepLink = state.routes[0].name === 'onboarding'

      if (isDeepLink && isOnboardingComplete === false) {
        if (routeName === 'collection') {
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
        } else if (onboardingCollection) {
          /**
           * All subsequent routes require an onboarding collection to exist.
           * This block handles the case where the onboarding collection does
           * exist, updating the route history to allow for back navigation.
           */

          navigation.dispatch((state) => {
            const routes = [
              { name: 'collection' },
              ...(routeName === 'notes/new' || routeName === 'notes/[id]/edit'
                ? [{ name: 'notes/index' }]
                : []),
              ...(state.routes[0].state?.routes ?? []),
            ]

            const newState = {
              ...state,
              index: 1,
              routes: [
                { name: 'index' },
                {
                  ...state.routes[0],
                  state: {
                    ...state.routes[0].state,
                    index: routes.length - 1,
                    routes,
                  },
                },
              ],
            }

            return CommonActions.reset(newState)
          })
        }
      }
    }, 0)
  }

  useFocusEffect(onFocus)

  if (isOnboardingComplete) {
    return <Redirect href="/(app)/(tabs)" />
  }

  if (isOnboardingComplete === false) {
    return (
      <Stack
        initialRouteName="index"
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalSlide,
          gestureEnabled: true,
          headerMode: 'float',
          header: (props) => <Header {...props} />,
        }}
        screenLayout={({ children }) => (
          <ErrorBoundary>{children}</ErrorBoundary>
        )}
      >
        <Stack.Screen
          name="notes/new"
          options={({ navigation }) => ({
            animation: 'slide_from_bottom',
            cardStyleInterpolator: undefined,
            header: undefined,
            headerMode: 'screen',
            headerShown: true,
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <View>
                  <Button
                    action="neutral"
                    priority="low"
                    onPress={() => {
                      navigation.goBack()
                    }}
                    size="small"
                  >
                    {translate`Close`}
                  </Button>
                </View>
              ) : null,
            title: translate`Create note`,
          })}
        />
        <Stack.Screen
          name="notes/[id]/edit"
          options={({ navigation }) => ({
            animation: 'slide_from_bottom',
            cardStyleInterpolator: undefined,
            header: undefined,
            headerMode: 'screen',
            headerShown: true,
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <View>
                  <Button
                    action="neutral"
                    priority="low"
                    onPress={() => {
                      navigation.goBack()
                    }}
                    size="small"
                  >
                    {translate`Close`}
                  </Button>
                </View>
              ) : null,
            title: translate`Edit note`,
          })}
        />
      </Stack>
    )
  }

  return null
}
