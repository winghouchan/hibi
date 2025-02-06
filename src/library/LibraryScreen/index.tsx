import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { FlatList, Text, View } from 'react-native'
import { collectionsQuery } from '@/collections'

function NoCollections() {
  return <Trans>No collections</Trans>
}

export default function LibraryScreen() {
  const { data: collections } = useQuery(collectionsQuery)

  return (
    <View testID="library.screen" style={{ flex: 1 }}>
      {collections && (
        <FlatList
          data={collections}
          renderItem={({ item: { id, name } }) => (
            <Link
              key={id}
              href={`/collection/${id}`}
              testID="library.collection.list.item"
            >
              <Text>{name}</Text>
            </Link>
          )}
          testID="library.collection.list"
          ListEmptyComponent={NoCollections}
        />
      )}
    </View>
  )
}
