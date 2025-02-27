import { Trans } from '@lingui/macro'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function CollectionLayout() {
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
    />
  )
}
