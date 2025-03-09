import { useLingui } from '@lingui/react/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { nextReviewQuery } from '@/reviews/operations'
import { Button } from '@/ui'
import CollectionNavigator from './CollectionNavigator'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }, { insets, screen }) => ({
    screen: {
      flex: 1,
      gap: spacing[4],
      paddingTop: insets.top + spacing[2],
    },

    padding: {
      paddingHorizontal: spacing[4],
    },

    callout: {
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[0],
      borderWidth: borderWidths[2],
      borderRadius: radii[4],
      height: (screen.height - insets.top - spacing[7] * 2) / 2,
      justifyContent: 'flex-end',
      padding: spacing[4],
    },
  }),
)

export default function HomeScreen() {
  const { t: translate } = useLingui()
  const { data } = useInfiniteQuery(nextReviewQuery({ onlyDue: true }))
  const hasDueReview = data?.pages[0] !== null

  return (
    <View testID="home.screen" style={styles.screen}>
      <CollectionNavigator />
      <View style={styles.padding}>
        <View style={styles.callout}>
          {hasDueReview && (
            <Link testID="home.screen.cta" href="/review" asChild>
              <Button>{translate`Start review`}</Button>
            </Link>
          )}
        </View>
      </View>
    </View>
  )
}
