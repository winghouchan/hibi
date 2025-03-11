import { useLingui } from '@lingui/react/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { nextReviewQuery } from '@/reviews/operations'
import { Button } from '@/ui'
import CollectionFilter from './CollectionFilter'

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
  const [collection, setCollection] = useState<number | undefined>(undefined)
  const { data } = useInfiniteQuery(
    nextReviewQuery({
      ...(collection && { collections: [collection] }),
      onlyDue: true,
    }),
  )
  const hasDueReview = data?.pages[0] !== null

  return (
    <View testID="home.screen" style={styles.screen}>
      <CollectionFilter onChange={setCollection} value={collection} />
      <View style={styles.padding}>
        <View style={styles.callout}>
          {hasDueReview && (
            <Link
              testID="home.screen.cta"
              href={{
                pathname: '/review',
                params: {
                  ...(collection && { collections: [collection] }),
                },
              }}
              asChild
            >
              <Button>{translate`Start review`}</Button>
            </Link>
          )}
        </View>
      </View>
    </View>
  )
}
