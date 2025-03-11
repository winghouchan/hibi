import { useLingui } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { FlatList, Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { collection } from '@/collections/schema'
import { Text } from '@/ui'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }) => ({
    container: {
      gap: spacing[2],
      paddingInline: spacing[4],
    },

    chip: (active: boolean) => ({
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[active ? 1 : 0],
      borderWidth: borderWidths[2],
      borderRadius: radii[4],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    }),
  }),
)

type Props = {
  onChange?: (id?: typeof collection.$inferSelect.id) => void
  value?: typeof collection.$inferSelect.id
}

export default function CollectionFilter({ onChange, value }: Props) {
  const { t: translate } = useLingui()
  const { data: collections } = useQuery(collectionsQuery())

  return (
    <View>
      <FlatList
        data={[{ id: undefined, name: translate`All` }, ...(collections ?? [])]}
        horizontal={true}
        contentContainerStyle={styles.container}
        renderItem={({ item: { id, name } }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange?.(id)}
            style={styles.chip(id === value)}
          >
            <Text size="label.medium">{name}</Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}
