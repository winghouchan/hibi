import { Trans, useLingui } from '@lingui/react/macro'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import {
  Link,
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import { Text } from '@/ui'
import { collectionQuery } from '../../operations'

export default function CollectionScreen() {
  const { t: translate } = useLingui()
  const navigation =
    useNavigation<NavigationProp<{ '(tabs)': undefined }>>('/(app)')
  const localSearchParams = useLocalSearchParams<{ id: string }>()
  const collectionId = Number(localSearchParams.id)
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery({ filter: { id: collectionId } }),
  )

  useEffect(() => {
    if (!collection && !isFetchingCollection) {
      Alert.alert(translate`The collection doesn't exist`, '', [
        {
          text: translate`OK`,
          style: 'default',
          onPress: () => {
            router.back()
          },
        },
      ])
    }
  }, [collection, isFetchingCollection, translate])

  useFocusEffect(() => {
    const state = navigation.getState()

    if (state?.routes?.[0]?.state?.routes?.[1]?.name !== 'library/index') {
      navigation.reset({
        routes: [
          {
            name: '(tabs)',
            state: {
              index: 1,
              routes: [{ name: 'index' }, { name: 'library/index' }],
            },
          },
          {
            name: 'collection',
            index: 0,
            params: localSearchParams,
            state: {
              routes: [{ name: '[id]/index', params: localSearchParams }],
            },
          },
        ] as PartialRoute<Route<'(tabs)', undefined>>[],
      })
    }
  })

  if (collection) {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Link href={`/collection/${collectionId}/edit`}>
                <Trans>Edit</Trans>
              </Link>
            ),
          }}
        />
        <ScrollView style={{ flex: 1 }} testID="library.collection.screen">
          <Text>{collection.name}</Text>
          {collection.notes.map((note) => (
            <Link
              key={note.id}
              href={`/note/${note.id}`}
              testID="library.collection.note.link"
            >
              {JSON.stringify(note, null, 2)}
            </Link>
          ))}
          <Link
            href={{
              pathname: '/note/new',
              params: {
                collections: [collectionId],
              },
            }}
            testID="collection.add-note.link"
          >
            <Trans>Add note</Trans>
          </Link>
        </ScrollView>
      </>
    )
  } else {
    /**
     * If the collection is `undefined`, it has not been successfully queried
     * yet. If the query is still in-progress, it typically takes less than 1
     * second to complete so no loading state is shown. If the query failed,
     * an alert is shown by the data provider component.
     *
     * If the collection is `null`, it does not exist. An alert is displayed
     * by the effect hook above.
     */
    return null
  }
}
