import { useLingui } from '@lingui/react/macro'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { nextReviewsQuery } from '@/reviews/operations'
import { Button, Icon, Text } from '@/ui'
import useActiveCollection from './useActiveCollection'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }, { insets, screen }) => ({
    screen: {
      flex: 1,
      gap: spacing[4],
      paddingTop: insets.top + spacing[2],
    },

    padding: {
      gap: spacing[4],
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
  const collection = useActiveCollection()
  const { data } = useSuspenseInfiniteQuery(
    nextReviewsQuery({
      filter: {
        collections: [collection.id],
        due: true,
      },
    }),
  )
  const hasDueReview = data[0] !== null

  return (
    <View testID="home.screen" style={styles.screen}>
      <View style={styles.padding}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Link
              href="/(onboarded)/(modal)/collections"
              testID="home.collection-menu.link"
            >
              <Text>{collection.name}</Text>
            </Link>
          </View>
          <View>
            <Link
              href={{
                pathname: '/notes/new',
                params: { collections: [collection.id] },
              }}
              testID="home.note.create.button"
              asChild
            >
              <Pressable accessibilityLabel={translate`Add note`}>
                <Icon name="plus" />
              </Pressable>
            </Link>
          </View>
        </View>
        <View style={styles.callout}>
          {hasDueReview && (
            <Link
              testID="home.screen.cta"
              href={{
                pathname: '/review',
                params: { collections: [collection.id] },
              }}
              asChild
            >
              <Button>{translate`Start review`}</Button>
            </Link>
          )}
        </View>
        {typeof collection !== 'undefined' && (
          <Link
            href={{
              pathname: '/collections/[id]/edit',
              params: {
                id: collection.id,
              },
            }}
            testID="home.collection.edit"
            asChild
          >
            <Button
              action="neutral"
              priority="medium"
            >{translate`Edit collection`}</Button>
          </Link>
        )}
      </View>
    </View>
  )
}
