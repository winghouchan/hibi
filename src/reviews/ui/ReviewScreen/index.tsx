import { Trans } from '@lingui/macro'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ReviewScreen() {
  return (
    <SafeAreaView testID="review.screen">
      <Trans>Review Screen</Trans>
    </SafeAreaView>
  )
}
