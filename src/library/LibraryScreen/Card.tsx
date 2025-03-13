import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { noteField } from '@/notes/schema'
import { Text } from '@/ui'

type Props = {
  fields: (typeof noteField.$inferSelect)[][]
}

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }) => ({
    view: {
      alignItems: 'center',
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[0],
      borderRadius: radii[4],
      borderWidth: borderWidths[2],
      boxShadow: [
        {
          blurRadius: 8,
          color: colors.secondary[0].shadow,
          inset: false,
          offsetX: 0,
          offsetY: 0,
          spreadDistance: 0,
        },
      ],
      gap: spacing[2],
      height: '100%',
      overflow: 'hidden',
      paddingVertical: spacing[6],
      paddingHorizontal: spacing[5],
      width: '100%',
    },
  }),
)

export default function Card({ fields }: Props) {
  return (
    <View style={styles.view}>
      {fields[0].map((field) => (
        <Text key={field.id}>{field.value}</Text>
      ))}
      {fields[1].map((field) => (
        <Text key={field.id}>{field.value}</Text>
      ))}
    </View>
  )
}
