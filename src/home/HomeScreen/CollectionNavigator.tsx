import { useQuery } from '@tanstack/react-query'
import { FlatList, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { Text } from '@/ui'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }) => ({
    container: {
      gap: spacing[2],
      paddingInline: spacing[4],
    },

    chip: {
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[0],
      borderWidth: borderWidths[2],
      borderRadius: radii[4],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
  }),
)

export default function CollectionNavigator() {
  const { data: collections } = useQuery(collectionsQuery())

  return (
    <View>
      <FlatList
        data={collections}
        horizontal={true}
        contentContainerStyle={styles.container}
        renderItem={({ item: { name } }) => (
          <View style={styles.chip}>
            <Text size="label.medium">{name}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}
