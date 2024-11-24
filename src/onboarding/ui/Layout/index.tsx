import { Trans } from '@lingui/macro'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useFocusEffect, useNavigation } from 'expo-router'
import { Button } from '@/ui'
import {
  isOnboardingCompleteQuery,
  onboardingCollectionQuery,
} from '../../operations'

export default function OnboardingLayout() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)
  const { data: onboardingCollection } = useQuery(onboardingCollectionQuery)
  const navigation = useNavigation<
    NavigationProp<{
      index: undefined
      onboarding: undefined
    }>
  >()

  const onFocus = () => {
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
  }

  useFocusEffect(onFocus)

  if (isOnboardingComplete) {
    return <Redirect href="/(app)/(tabs)" />
  }

  if (isOnboardingComplete === false) {
    return (
      <Stack
        screenOptions={({ navigation }) => ({
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Button
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <Trans>Back</Trans>
              </Button>
            ) : null,
        })}
      >
        <Stack.Screen name="notes/new" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="notes/edit/[id]"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    )
  }

  return null
}
