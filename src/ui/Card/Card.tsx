import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = ViewProps

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }) => ({
    view: {
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderColor: colors.borders.default,
      borderRadius: radii[4],
      borderWidth: borderWidths.thin,
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
