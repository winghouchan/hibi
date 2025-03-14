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
import { Alert, Text } from 'react-native'
import { notesQuery } from '@/notes/operations'
import { NoteList } from '@/notes/ui'
import { Button } from '@/ui'
import { collectionQuery } from '../../operations'
import Layout from '../Layout'

export default function CollectionScreen() {
  const { t: translate } = useLingui()
  const navigation =
    useNavigation<NavigationProp<{ '(tabs)': undefined }>>('/(app)')
  const localSearchParams = useLocalSearchParams<{ id: string }>()
  const collectionId = Number(localSearchParams.id)
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery({ filter: { id: collectionId } }),
  )
  const { data: notes } = useQuery(
    notesQuery({
      filter: {
        collection:
          typeof collection?.id !== 'undefined' ? [collection.id] : undefined,
      },
    }),
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
            title: collection.name,
            headerTitle: ({ children }) => <Text>{children}</Text>,
            headerRight: () => (
              <Link href={`/collection/${collectionId}/edit`}>
                <Trans>Edit</Trans>
              </Link>
            ),
          }}
        />
        <Layout testID="library.collection.screen">
          <Layout.Main scrollable={false}>
            <NoteList
              data={notes}
              renderItem={({ item: note }) => (
                <Link key={note.id} href={`/note/${note.id}`}>
                  <NoteList.Item fields={note.fields} />
                </Link>
              )}
            />
          </Layout.Main>
          <Layout.Footer>
            <Link
              href={{
                pathname: '/note/new',
                params: {
                  collections: [collectionId],
                },
              }}
              testID="collection.add-note.link"
              asChild
            >
              <Button>{translate`Add note`}</Button>
            </Link>
          </Layout.Footer>
        </Layout>
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
