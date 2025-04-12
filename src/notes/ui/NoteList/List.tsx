import { FlatList, FlatListProps, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Note, noteField } from '@/notes/schema'

type Props = FlatListProps<{
  id: Note['id']
  fields: (typeof noteField.$inferSelect)[][]
}>

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

const styles = StyleSheet.create(({ spacing }) => ({
  contentContainer: {
    paddingLeft: spacing[4] - spacing[3] / 2,
    paddingRight: spacing[4] - spacing[3] / 2,
  },

  item: {
    aspectRatio: 4 / 5,
    flex: 1,
    maxWidth: {
      extraSmall: `${(1 / columnsByBreakpoint.extraSmall) * 100}%`,
      small: `${(1 / columnsByBreakpoint.small) * 100}%`,
      medium: `${(1 / columnsByBreakpoint.medium) * 100}%`,
      large: `${(1 / columnsByBreakpoint.large) * 100}%`,
    },
    padding: spacing[3] / 2,
  },
}))

export default function List({ renderItem, ...props }: Props) {
  const {
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
      contentContainerStyle={styles.contentContainer}
      renderItem={(...args) => (
        <View style={styles.item}>{renderItem?.(...args)}</View>
      )}
      {...props}
    />
  )
}
