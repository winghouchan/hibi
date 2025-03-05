import { useLingui } from '@lingui/react/macro'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function NoteLayout() {
  const { t: translate } = useLingui()

  return (
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
    >
      <Stack.Screen
        name="[id]/edit"
        options={{
          presentation: 'fullScreenModal',
          title: translate`Edit note`,
        }}
      />
    </Stack>
  )
}
