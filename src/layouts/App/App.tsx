import { useLingui } from '@lingui/react/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Redirect, Stack } from 'expo-router'
import { Suspense } from 'react'
import { View } from 'react-native'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { Button } from '@/ui'
import ErrorBoundary from './ErrorBoundary'

export default function AppLayout() {
  const { t: translate } = useLingui()
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
        <Stack.Screen
          name="review"
          options={({ navigation }) => ({
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <View>
                  <Button
                    action="neutral"
                    onPress={() => {
                      navigation.goBack()
                    }}
                    priority="low"
                    size="small"
                  >
                    {translate`Back`}
                  </Button>
                </View>
              ) : null,
            headerShown: true,
            presentation: 'fullScreenModal',
          })}
        />
      </Stack>
    )
  } else {
    return <Redirect href="/(not-onboarded)" />
  }
}
