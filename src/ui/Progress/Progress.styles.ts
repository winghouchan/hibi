import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme) => ({
  track: {
    backgroundColor: theme.colors.borders.default,
    borderRadius: theme.radius[12],
    height: theme.text.label.small.fontSize,
    width: '100%',
  },

  indicator: (value: number) => ({
    backgroundColor: theme.colors.foreground.default,
    borderRadius: theme.radius[12],
    height: '100%',
    width: `${value}%`,
  }),
}))
