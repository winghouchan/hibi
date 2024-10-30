import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack } from 'expo-router'
import { isOnboardingCompleteQuery } from '../isOnboardingComplete'

export default function OnboardingLayout() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)

  if (isOnboardingComplete) {
    return <Redirect href="/(app)" />
  }

  if (isOnboardingComplete === false) {
    return (
      <Stack>
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
