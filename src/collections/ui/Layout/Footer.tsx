import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme, { insets }) => ({
  view: {
    paddingLeft: insets.left + theme.spacing[4],
    paddingRight: insets.right + theme.spacing[4],
    paddingBottom: insets.bottom,
  },
}))

export default function Footer({ style, ...props }: ViewProps) {
  return <View style={[styles.view, style]} {...props} />
}
