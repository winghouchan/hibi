import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }, runtime) => ({
  screen: {
    flex: 1,
    paddingLeft: runtime.insets.left + spacing[4],
    paddingRight: runtime.insets.right + spacing[4],
    paddingBottom: runtime.insets.bottom,
  },
}))

export default styles
