import { Link } from 'expo-router'
import { FlatList, FlatListProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { note } from '@/notes/schema'

type Props = Omit<FlatListProps<typeof note.$inferSelect>, 'renderItem'>

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  content: {
    paddingBottom: spacing[4],
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
  },
}))

export default function List({ data }: Props) {
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={data}
      renderItem={({ item: note }) => (
        <Link
          key={note.id}
          href={`/note/${note.id}`}
          testID="library.collection.note.link"
        >
          {JSON.stringify(note, null, 2)}
        </Link>
      )}
    />
  )
}
