import { useLingui } from '@lingui/react/macro'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { ComponentRef, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { CollectionFilter } from '@/collections/ui'
import { notesQuery } from '@/notes/operations'
import { NoteList } from '@/notes/ui'
import { Heading, Icon } from '@/ui'
import CreateMenu from '../CreateMenu'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  screen: {
    flex: 1,
    gap: spacing.normal,
    paddingTop: insets.top,
  },

  padding: {
    paddingLeft: insets.left + spacing.normal,
    paddingRight: insets.right + spacing.normal,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  headerInlineEnd: {
    flexDirection: 'row',
    gap: spacing.normal,
  },

  listContent: {
    paddingVertical: spacing.normal,
  },
}))

export default function LibraryScreen() {
  const { t: translate } = useLingui()
  const createMenuRef = useRef<ComponentRef<typeof CreateMenu>>(null)
  const [collection, setCollection] = useState<number | undefined>(undefined)
  const {
    data: notes,
    fetchNextPage: fetchMoreNotes,
    isFetchingNextPage: isFetchingMoreNotes,
  } = useSuspenseInfiniteQuery(
    notesQuery(
      collection
        ? { filter: { collection: [collection] }, order: { id: 'desc' } }
        : { order: { id: 'desc' } },
    ),
  )

  return (
    <>
      <CreateMenu collection={collection} ref={createMenuRef} />
      <View testID="library.screen" style={styles.screen}>
        <View style={[styles.header, styles.padding]}>
          <Heading size="medium">{translate`Library`}</Heading>
          <View style={styles.headerInlineEnd}>
            {typeof collection !== 'undefined' && (
              <Link
                accessibilityLabel={translate`Edit the currently selected collection`}
                href={`/collections/${collection}/edit`}
                testID="library.collection.edit.link"
              >
                <Icon name="edit" />
              </Link>
            )}
            <Pressable
              accessibilityLabel={translate`Open menu to create collection or note`}
              accessibilityRole="button"
              testID="library.create.menu.button"
              onPress={() => {
                createMenuRef.current?.open()
              }}
            >
              <Icon name="plus" />
            </Pressable>
          </View>
        </View>
        <CollectionFilter onChange={setCollection} value={collection} />
        <NoteList
          data={notes}
          onEndReached={() => !isFetchingMoreNotes && fetchMoreNotes()}
          renderItem={({ item: note }) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              testID="library.collection.note.link"
            >
              <NoteList.Item fields={note.fields} />
            </Link>
          )}
        />
      </View>
    </>
  )
}
