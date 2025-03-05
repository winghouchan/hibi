import { Trans, useLingui } from '@lingui/react/macro'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { Button } from '@/ui'

export default function ReviewFinished() {
  const { t: translate } = useLingui()
  const router = useRouter()

  return (
    <View testID="review.finished.screen">
      <Trans>Finished</Trans>
      <Button testID="review.finish" onPress={() => router.back()}>
        {translate`Finish`}
      </Button>
    </View>
  )
}
