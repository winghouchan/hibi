import { useLingui } from '@lingui/react/macro'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { Collection } from '@/collections/schema'
import { Text } from '@/ui'

const styles = StyleSheet.create(({ borderWidth, color, radius, spacing }) => ({
  container: {
    gap: spacing.condensed,
    paddingInline: spacing.spacious,
  },

  chip: (selected: boolean) => ({
    backgroundColor: color.background.default,
    borderColor: selected ? color.borders.emphasis : color.borders.default,
    borderWidth: borderWidth.thick,
    borderRadius: radius[16],
    paddingHorizontal: spacing.spacious,
    paddingVertical: spacing.condensed,
  }),
}))

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
