import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = ViewProps

const styles = StyleSheet.create(({ borderWidth, color, radius, spacing }) => ({
  view: {
    alignItems: 'center',
    backgroundColor: color.background.default,
    borderColor: color.borders.default,
    borderRadius: radius[16],
    borderWidth: borderWidth.thin,
    gap: spacing.condensed,
    height: '100%',
    overflow: 'hidden',
    paddingVertical: spacing.spacious,
    paddingHorizontal: spacing.spacious,
    width: '100%',
  },
}))

export default function Card({ children, style, ...props }: Props) {
  return (
    <View style={[styles.view, style]} {...props}>
      {children}
    </View>
  )
}
