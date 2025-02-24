import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme, { insets }) => {
  return {
    header: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      paddingTop: insets.top + theme.spacing[2],
      paddingLeft: insets.left + theme.spacing[4],
      paddingRight: insets.right + theme.spacing[4],
      paddingBottom: theme.spacing[2],
    },

    progress: {
      justifyContent: 'center',
      flex: 1,
    },
  }
})
