import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme) => ({
  track: {
    backgroundColor: theme.color.borders.default,
    borderRadius: theme.radius.medium,
    height: theme.text.label.small.fontSize,
    width: '100%',
  },

  indicator: (value: number) => ({
    backgroundColor: theme.color.foreground.default,
    borderRadius: theme.radius.medium,
    height: '100%',
    width: `${value}%`,
  }),
}))
