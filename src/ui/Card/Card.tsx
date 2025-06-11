import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = ViewProps

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
      gap: spacing.condensed,
      height: '100%',
      overflow: 'hidden',
      paddingVertical: spacing.spacious,
      paddingHorizontal: spacing.spacious,
      width: '100%',
    },
  }),
)

export default function Card({ children, style, ...props }: Props) {
  return (
    <View style={[styles.view, style]} {...props}>
      {children}
    </View>
  )
}
