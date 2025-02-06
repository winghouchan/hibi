import { Trans } from '@lingui/macro'
import { Stack } from 'expo-router'
import { Button } from '@/ui'

export default function CollectionLayout() {
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
    />
  )
}
