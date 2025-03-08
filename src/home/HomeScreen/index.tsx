import { Trans } from '@lingui/react/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { nextReviewQuery } from '@/reviews/operations'
import CollectionNavigator from './CollectionNavigator'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  screen: {
    flex: 1,
    gap: spacing[4],
    paddingTop: insets.top + spacing[4],
  },
}))

export default function HomeScreen() {
  const { data } = useInfiniteQuery(nextReviewQuery({ onlyDue: true }))
  const hasDueReview = data?.pages[0] !== null

  return (
    <View testID="home.screen" style={styles.screen}>
      <CollectionNavigator />
      {hasDueReview && (
        <Link testID="home.screen.cta.button" href="/review">
          <Trans>Start review</Trans>
        </Link>
      )}
    </View>
  )
}
