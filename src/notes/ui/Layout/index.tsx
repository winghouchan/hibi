import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function NoteLayout() {
  const { i18n } = useLingui()

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
                <Trans component={null}>Back</Trans>
              </Button>
            </View>
          ) : null,
      })}
    >
      <Stack.Screen
        name="[id]/edit"
        options={{
          presentation: 'fullScreenModal',
          title: i18n.t(msg`Edit note`),
        }}
      />
    </Stack>
  )
}
