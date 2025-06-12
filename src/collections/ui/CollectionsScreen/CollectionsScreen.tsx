import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { FlatList, Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { Collection } from '@/collections/schema'
import {
  activeCollectionQuery,
  setActiveCollectionMutation,
} from '@/home/operations'
import { Text } from '@/ui'

const styles = StyleSheet.create((theme) => ({
  list: {
    padding: theme.spacing.normal,
  },

  item: (selected: boolean) => ({
    alignItems: 'center',
    borderRadius: theme.radius[12],
    borderWidth: selected ? 1 : 0,
    height: 48,
    flexDirection: 'row',
  }),
}))

export default function CollectionsScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: activeCollection } = useSuspenseQuery(activeCollectionQuery)
  const {
    data: collections,
    fetchNextPage: fetchMoreCollections,
    isFetchingNextPage: isFetchingMoreCollections,
  } = useSuspenseInfiniteQuery(collectionsQuery())
  const { mutateAsync: setActiveCollection } = useMutation(
    setActiveCollectionMutation,
  )

  const onSelect = async (id: Collection['id']) => {
    const data = await setActiveCollection(id)
    queryClient.setQueryData(activeCollectionQuery.queryKey, data)
    setTimeout(router.back, 0) // Allows the list to re-render with the new selection before navigating back
  }

  return (
    <FlatList
      accessibilityRole="menu"
      alwaysBounceVertical={false}
      data={collections}
      keyExtractor={({ id }) => `${id}`}
      onEndReached={() => !isFetchingMoreCollections && fetchMoreCollections()}
      renderItem={({ item: { id, name } }) => {
        const selected = id === activeCollection.id

        return (
          <Pressable
            accessibilityRole="menuitem"
            accessibilityState={{ selected }}
            onPress={() => onSelect(id)}
            style={styles.item(selected)}
          >
            <Text>{name}</Text>
          </Pressable>
        )
      }}
      style={styles.list}
    />
  )
}
