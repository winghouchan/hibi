import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }, runtime) => ({
  keyboardAvoidingView: {
    flex: 1,
    paddingBottom: runtime.insets.ime,
  },

  settings: {
    gap: spacing[2],
  },
}))

export default styles
