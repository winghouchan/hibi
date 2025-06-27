import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }, runtime) => ({
  keyboardAvoidingView: {
    flex: 1,
    paddingBottom: runtime.insets.ime,
  },

  settings: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.condensed,
  },

  setting: {
    flex: 1,
  },
}))

export default styles
