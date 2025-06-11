import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing }, runtime) => ({
    keyboardAvoidingView: {
      flex: 1,
      paddingBottom: runtime.insets.ime,
    },

    settings: {
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[0],
      borderWidth: borderWidths[2],
      borderRadius: radii[4],
      gap: spacing.condensed,
      padding: spacing.normal,
    },
  }),
)

export default styles
