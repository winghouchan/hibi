import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme, { insets }) => ({
  main: {
    flex: 1,
  },

  content: {
    paddingTop: theme.spacing[2],
    paddingLeft: insets.left + theme.spacing[4],
    paddingRight: insets.right + theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },

  footer: {
    paddingTop: theme.spacing[2],
    paddingLeft: insets.left + theme.spacing[4],
    paddingRight: insets.right + theme.spacing[4],
    paddingBottom: insets.bottom,
  },
}))
