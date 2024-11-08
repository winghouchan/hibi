import { Trans } from '@lingui/macro'
import type {
  NavigationProp,
  NavigationState,
  PartialState,
} from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import {
  Redirect,
  Stack,
  useFocusEffect,
  useNavigation,
  usePathname,
} from 'expo-router'
import { Button } from '@/ui'
import { isOnboardingCompleteQuery } from '../../operations'

export default function OnboardingLayout() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)
  const navigation = useNavigation<
    NavigationProp<{
      index: undefined
      onboarding: undefined
    }>
  >()
  const pathname = usePathname()

  useFocusEffect(() => {
    const state = navigation.getState()
    const newState = {
      index: 1,
      routes: [],
    } as PartialState<
      NavigationState<{
        index: undefined
        onboarding: undefined
      }>
    >
    const isDeeplink = state.routes[0].name === 'onboarding'

    if (isDeeplink) {
      newState.routes.push({
        name: 'index',
      })

      if (pathname === '/onboarding/collection') {
        newState.routes.push({
          name: 'onboarding',
          state: {
            index: 0,
            routes: [{ name: 'collection' }],
          },
        })

        navigation.reset(newState)
      }

      if (pathname === '/onboarding/notes') {
        newState.routes.push({
          name: 'onboarding',
          state: {
            index: 1,
            routes: [{ name: 'collection' }, { name: 'notes/index' }],
          },
        })

        navigation.reset(newState)
      }

      if (pathname === '/onboarding/notes/new') {
        newState.routes.push({
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

        navigation.reset(newState)
      }

      if (pathname.startsWith('/onboarding/notes/edit')) {
        newState.routes.push({
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

        navigation.reset(newState)
      }
    }
  })

  if (isOnboardingComplete) {
    return <Redirect href="/(app)" />
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
