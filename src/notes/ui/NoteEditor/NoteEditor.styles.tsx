import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidth, color, radius, spacing }, runtime) => ({
    keyboardAvoidingView: {
      flex: 1,
      paddingBottom: runtime.insets.ime,
    },

    settings: {
      backgroundColor: color.background.default,
      borderColor: color.borders.default,
      borderWidth: borderWidth.thick,
      borderRadius: radius.large,
      gap: spacing.condensed,
      padding: spacing.normal,
    },
  }),
)

export default styles
