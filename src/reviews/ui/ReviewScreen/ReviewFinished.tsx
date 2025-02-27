import { Trans } from '@lingui/macro'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function ReviewFinished() {
  const router = useRouter()

  return (
    <View testID="review.finished.screen">
      <Trans>Finished</Trans>
      <Button testID="review.finish" onPress={() => router.back()}>
        <Trans component={null}>Finish</Trans>
      </Button>
    </View>
  )
}
