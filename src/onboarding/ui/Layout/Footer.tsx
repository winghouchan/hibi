import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme, { insets }) => ({
  view: {
    paddingLeft: insets.left + theme.spacing.normal,
    paddingRight: insets.right + theme.spacing.normal,
    paddingBottom: insets.bottom,
  },
}))

export default function Footer({ style, ...props }: ViewProps) {
  return <View style={[styles.view, style]} {...props} />
}
