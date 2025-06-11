import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }, runtime) => ({
  screen: {
    flex: 1,
    paddingLeft: runtime.insets.left + spacing.normal,
    paddingRight: runtime.insets.right + spacing.normal,
    paddingBottom: runtime.insets.bottom,
  },
}))

export default styles
