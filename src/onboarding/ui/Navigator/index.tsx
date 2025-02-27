import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Redirect, useFocusEffect, useNavigation, Stack } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'
import {
  isOnboardingCompleteQuery,
  onboardingCollectionQuery,
} from '../../operations'
import Header from './Header'

export default function OnboardingNavigator() {
  const { i18n } = useLingui()
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
       * Pathname of the current screen
       *
       * It is pulled from the navigation state as the `usePathname` from
       * `expo-router` sometimes returns `/onboarding` which is (assumed to be)
       * from the parent navigator.
       */
      const pathname = state.routes[0].state?.routes[0].path || ''

      /**
       * Did the navigation occur via a deep link?
       *
       * The navigation into the onboarding journey occurred via a deep link if
       * the first item in the history has the name `onboarding` as opposed to
       * `index` which represents the welcome screen.
       */
      const isDeepLink = state.routes[0].name === 'onboarding'

      if (isDeepLink && isOnboardingComplete === false) {
        /**
         * New route history state.
         *
         * The first item is the welcome screen.
         */
        const routes: PartialRoute<
          Route<'index' | 'onboarding', object | undefined>
        >[] = [{ name: 'index' }]

        if (pathname === 'onboarding/collection') {
          routes.push({
            name: 'onboarding',
            state: {
              index: 0,
              routes: [{ name: 'collection' }],
            },
          })

          navigation.reset({ index: 1, routes })
        } else if (onboardingCollection === null) {
          /**
           * All subsequent routes require an onboarding collection to exist.
           * This block handles the case where the onboarding collection does not
           * exist, sending the user to the welcome screen.
           */

          navigation.reset({ index: 0, routes })
        } else if (onboardingCollection) {
          /**
           * All subsequent routes require an onboarding collection to exist.
           * This block handles the case where the onboarding collection does
           * exist, updating the route history to allow for back navigation.
           */

          if (pathname === 'onboarding/notes') {
            routes.push({
              name: 'onboarding',
              state: {
                index: 1,
                routes: [{ name: 'collection' }, { name: 'notes/index' }],
              },
            })

            navigation.reset({ index: 1, routes })
          }

          if (pathname === 'onboarding/notes/new') {
            routes.push({
              name: 'onboarding',
              state: {
                index: 2,
                routes: [
                  { name: 'collection' },
                  { name: 'notes/index' },
                  { name: 'notes/new' },
                ],
              },
            })

            navigation.reset({ index: 1, routes })
          }

          if (pathname.startsWith('onboarding/notes/edit')) {
            routes.push({
              name: 'onboarding',
              state: {
                index: 2,
                routes: [
                  { name: 'collection' },
                  { name: 'notes/index' },
                  {
                    name: 'notes/edit/[id]',
                    params: state.routes[0].state?.routes[0].params,
                  },
                ],
              },
            })

            navigation.reset({ index: 1, routes })
          }
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
        layout={({ children, navigation, state }) => {
          const currentRoute = state.routes[state.index]

          return (
            <View style={{ flex: 1 }}>
              {!['notes/edit/[id]', 'notes/new'].includes(
                currentRoute.name,
              ) && <Header navigation={navigation} state={state} />}
              {children}
            </View>
          )
        }}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="notes/new"
          options={({ navigation }) => ({
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
                    <Trans component={null}>Close</Trans>
                  </Button>
                </View>
              ) : null,
            presentation: 'fullScreenModal',
            title: i18n.t(msg`Create note`),
          })}
        />
        <Stack.Screen
          name="notes/edit/[id]"
          options={({ navigation }) => ({
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
                    <Trans component={null}>Close</Trans>
                  </Button>
                </View>
              ) : null,
            presentation: 'fullScreenModal',
            title: i18n.t(msg`Edit note`),
          })}
        />
      </Stack>
    )
  }

  return null
}
