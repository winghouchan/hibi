import { Trans } from '@lingui/react/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { nextReviewQuery } from '@/reviews/operations'

const styles = StyleSheet.create((theme, { insets }) => ({
  screen: {
    flex: 1,
    paddingTop: insets.top,
  },
}))

export default function HomeScreen() {
  const { data } = useInfiniteQuery(nextReviewQuery({ onlyDue: true }))
  const hasDueReview = data?.pages[0] !== null

  return (
    <View testID="home.screen" style={styles.screen}>
      <Trans>Hibi</Trans>
      {hasDueReview && (
        <Link testID="home.screen.cta.button" href="/review">
          <Trans>Start review</Trans>
        </Link>
      )}
    </View>
  )
}
