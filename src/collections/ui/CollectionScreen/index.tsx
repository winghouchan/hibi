import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { collectionQuery } from '../../operations'

export default function CollectionScreen() {
  const { i18n } = useLingui()
  const { id: collectionId } = useLocalSearchParams<{ id: string }>()
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery(Number(collectionId)),
  )

  useEffect(() => {
    if (!collection && !isFetchingCollection) {
      Alert.alert(i18n.t(msg`The collection doesn't exist`), '', [
        {
          text: i18n.t(msg`OK`),
          style: 'default',
          onPress: () => {
            router.back()
          },
        },
      ])
    }
  }, [collection, i18n, isFetchingCollection])

  return collection && !isFetchingCollection ? (
    <View style={{ flex: 1 }} testID="library.collection.screen">
      {collection && (
        <ScrollView contentContainerStyle={{ flex: 1 }} style={{ flex: 1 }}>
          <Text>{collection?.name}</Text>
          <Text>{JSON.stringify(collection, null, 2)}</Text>
        </ScrollView>
      )}
    </View>
  ) : null
}
