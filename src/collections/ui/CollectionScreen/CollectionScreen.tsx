import { Trans, useLingui } from '@lingui/react/macro'
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Link,
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router'
import { Alert, Text } from 'react-native'
import { notesQuery } from '@/notes/operations'
import { NoteList } from '@/notes/ui'
import { Button } from '@/ui'
import { collectionQuery } from '../../operations'
import Layout from '../Layout'

export default function CollectionScreen() {
  const { t: translate } = useLingui()
  const localSearchParams = useLocalSearchParams<{ id: string }>()
  const collectionId = Number(localSearchParams.id)
  const { data: collection } = useSuspenseQuery(
    collectionQuery({ filter: { id: collectionId } }),
  )
  const {
    data: notes,
    fetchNextPage: fetchMoreNotes,
    isFetchingNextPage: isFetchingMoreNotes,
  } = useSuspenseInfiniteQuery(
    notesQuery({
      filter: {
        collection:
          typeof collection?.id !== 'undefined' ? [collection.id] : undefined,
      },
      order: {
        id: 'desc',
      },
    }),
  )

  useFocusEffect(() => {
    if (!collection) {
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
  })

  if (collection) {
    return (
      <>
        <Stack.Screen
          options={{
            title: collection.name,
            headerTitle: ({ children }) => <Text>{children}</Text>,
            headerRight: () => (
              <Link href={`/collections/${collectionId}/edit`}>
                <Trans>Edit</Trans>
              </Link>
            ),
          }}
        />
        <Layout testID="library.collection.screen">
          <Layout.Main scrollable={false}>
            <NoteList
              data={notes}
              onEndReached={() => !isFetchingMoreNotes && fetchMoreNotes()}
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
     * If the collection is `null`, it does not exist. An alert is displayed by
     * the effect hook above.
     */
    return null
  }
}
