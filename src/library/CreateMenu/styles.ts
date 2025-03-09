import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  view: {
    flex: 1,
    gap: spacing[2],
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
  },
}))

export default styles
