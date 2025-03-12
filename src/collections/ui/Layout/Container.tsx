import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme, runtime) => ({
  view: {
    flex: 1,
    paddingBottom: runtime.insets.ime,
  },
}))

export default function Container({ style, ...props }: ViewProps) {
  return <View style={[styles.view, style]} {...props} />
}
