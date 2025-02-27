import { Trans } from '@lingui/macro'
import type { NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Stack, useFocusEffect, useNavigation } from 'expo-router'
import { View } from 'react-native'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { Button } from '@/ui'

export default function AppLayout() {
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
      <Stack screenOptions={{ headerShown: false }}>
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
                    <Trans component={null}>Back</Trans>
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
