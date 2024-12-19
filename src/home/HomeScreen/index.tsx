import { Trans } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { nextReviewQuery } from '@/reviews'

export default function HomeScreen() {
  const { data } = useInfiniteQuery(nextReviewQuery({ onlyDue: true }))
  const hasDueReview = data?.pages[0] !== null

  return (
    <View testID="home.screen">
      <Trans>Hibi</Trans>
      {hasDueReview && (
        <Link testID="home.screen.cta.button" href="/review">
          <Trans>Start review</Trans>
        </Link>
      )}
    </View>
  )
}
