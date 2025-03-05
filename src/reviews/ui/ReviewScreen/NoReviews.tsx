import { Trans } from '@lingui/react/macro'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function NoReviews() {
  return (
    <View testID="review.no-reviews">
      <Trans>No reviews due</Trans>
      <Link href="/" testID="review.no-reviews.cta.button">
        <Trans>Go home</Trans>
      </Link>
    </View>
  )
}
