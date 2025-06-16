import { useSuspenseQuery } from '@tanstack/react-query'
import { Redirect, Stack } from 'expo-router'
import { Suspense } from 'react'
import { isOnboardingCompleteQuery } from '@/onboarding'
import ErrorBoundary from './ErrorBoundary'

export default function AppLayout() {
  const { data: isOnboardingComplete } = useSuspenseQuery(
    isOnboardingCompleteQuery,
  )

  if (isOnboardingComplete) {
    return (
      <Stack
        screenOptions={{ headerShown: false }}
        screenLayout={({ children }) => (
          <ErrorBoundary>
            <Suspense>{children}</Suspense>
          </ErrorBoundary>
        )}
      >
        <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
      </Stack>
    )
  } else {
    return <Redirect href="/(not-onboarded)" />
  }
}
