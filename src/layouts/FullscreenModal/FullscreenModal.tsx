import { useLingui } from '@lingui/react/macro'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function FullscreenModal() {
  const { t: translate } = useLingui()

  return (
    <>
      <Stack.Screen options={{ presentation: 'fullScreenModal' }} />
      <Stack
        screenOptions={({ navigation }) => ({
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
        })}
      />
    </>
  )
}
