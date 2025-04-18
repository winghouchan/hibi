import { useLingui } from '@lingui/react/macro'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { Collection } from '@/collections/schema'
import { Text } from '@/ui'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }) => ({
    container: {
      gap: spacing[2],
      paddingInline: spacing[4],
    },

    chip: (selected: boolean) => ({
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[selected ? 1 : 0],
      borderWidth: borderWidths[2],
      borderRadius: radii[4],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    }),
  }),
)

type Props = {
  onChange?: (id?: Collection['id']) => void
  value?: Collection['id']
}

export default function CollectionFilter({ onChange, value }: Props) {
  const { t: translate } = useLingui()
  const {
    data: collections,
    fetchNextPage: fetchMoreCollections,
    isFetchingNextPage: isFetchingMoreCollections,
  } = useSuspenseInfiniteQuery(collectionsQuery())
  const [, startTransition] = useTransition()

  return (
    <View>
      <FlatList
        accessibilityRole="tablist"
        data={[{ id: undefined, name: translate`All` }, ...(collections ?? [])]}
        horizontal={true}
        contentContainerStyle={styles.container}
        onEndReached={() =>
          !isFetchingMoreCollections && fetchMoreCollections()
        }
        renderItem={({ item: { id, name } }) => {
          const selected = id === value
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() =>
                startTransition(() => {
                  onChange?.(id)
                })
              }
              style={styles.chip(selected)}
            >
              <Text size="label.medium">{name}</Text>
            </Pressable>
          )
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}
