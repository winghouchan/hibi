import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radius, spacing }, runtime) => ({
    keyboardAvoidingView: {
      flex: 1,
      paddingBottom: runtime.insets.ime,
    },

    settings: {
      backgroundColor: colors.background.default,
      borderColor: colors.borders.default,
      borderWidth: borderWidths.thick,
      borderRadius: radius[16],
      gap: spacing.condensed,
      padding: spacing.normal,
    },
  }),
)

export default styles
