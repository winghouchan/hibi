import { useLingui } from '@lingui/react/macro'
import type { NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Stack, useFocusEffect, useNavigation } from 'expo-router'
import { View } from 'react-native'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { Button } from '@/ui'
import ErrorBoundary from './ErrorBoundary'

export default function AppLayout() {
  const { t: translate } = useLingui()
  const navigation = useNavigation<NavigationProp<{ index: undefined }>>()
  const { data: isOnboardingComplete, isFetching } = useQuery(
    isOnboardingCompleteQuery,
  )

  useFocusEffect(() => {
    if (!isFetching && isOnboardingComplete === false) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    }
  })

  if (!isFetching && isOnboardingComplete) {
    return (
      <Stack
        screenOptions={{ headerShown: false }}
        screenLayout={({ children }) => (
          <ErrorBoundary>{children}</ErrorBoundary>
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
  }

  return null
}
