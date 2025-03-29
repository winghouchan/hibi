import { useLingui } from '@lingui/react/macro'
import type { NavigationProp } from '@react-navigation/native'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Stack, useFocusEffect, useNavigation } from 'expo-router'
import { Suspense } from 'react'
import { View } from 'react-native'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { Button } from '@/ui'
import ErrorBoundary from './ErrorBoundary'

export default function AppLayout() {
  const { t: translate } = useLingui()
  const navigation = useNavigation<NavigationProp<{ index: undefined }>>()
  const { data: isOnboardingComplete } = useSuspenseQuery(
    isOnboardingCompleteQuery,
  )

  useFocusEffect(() => {
    if (!isOnboardingComplete) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    }
  })

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
    return null
  }
}
