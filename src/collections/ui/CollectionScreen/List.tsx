import { Link } from 'expo-router'
import { FlatList, FlatListProps, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { note, noteField } from '@/notes/schema'
import { Card } from '@/notes/ui'

type Props = Omit<
  FlatListProps<{
    id: (typeof note.$inferSelect)['id']
    fields: (typeof noteField.$inferSelect)[]
  }>,
  'renderItem'
>

const columnsByBreakpoint = {
  extraSmall: 2,
  small: 4,
  medium: 6,
  large: 6,
} as const

function isSupportedBreakpoint(
  breakpoint: string,
): breakpoint is keyof typeof columnsByBreakpoint {
  return breakpoint in columnsByBreakpoint
}

export default function List(props: Props) {
  const {
    theme,
    rt: { breakpoint = 'extraSmall' },
  } = useUnistyles()
  const columns = isSupportedBreakpoint(breakpoint)
    ? columnsByBreakpoint[breakpoint]
    : columnsByBreakpoint.extraSmall

  return (
    <FlatList
      alwaysBounceVertical={false}
      key={columns}
      numColumns={columns}
      contentContainerStyle={{
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        paddingLeft: theme.spacing[4] - theme.spacing[3] / 2,
        paddingRight: theme.spacing[4] - theme.spacing[3] / 2,
      }}
      renderItem={({ item: note }) => (
        <View
          style={{
            flex: 1,
            maxWidth: `${(1 / columns) * 100}%`,
            padding: theme.spacing[3] / 2,
          }}
        >
          <Link
            style={{ aspectRatio: 4 / 5 }}
            key={note.id}
            href={`/note/${note.id}`}
          >
            <Card fields={note.fields} />
          </Link>
        </View>
      )}
      {...props}
    />
  )
}
