import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme, { insets }) => {
  return {
    header: {
      flexDirection: 'row',
      gap: theme.spacing.normal,
      paddingTop: insets.top + theme.spacing.condensed,
      paddingLeft: insets.left + theme.spacing.normal,
      paddingRight: insets.right + theme.spacing.normal,
      paddingBottom: theme.spacing.condensed,
    },

    progress: {
      justifyContent: 'center',
      flex: 1,
    },
  }
})
