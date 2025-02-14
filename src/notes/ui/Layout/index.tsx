import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Stack } from 'expo-router'
import { Button } from '@/ui'

export default function NoteLayout() {
  const { i18n } = useLingui()

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
