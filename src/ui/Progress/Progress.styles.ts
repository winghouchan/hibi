import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create(({ color, radius, text }) => ({
  track: {
    backgroundColor: color.borders.default,
    borderRadius: radius.medium,
    height: text.label.small.fontSize,
    width: '100%',
  },

  indicator: (value: number) => ({
    backgroundColor: color.foreground.default,
    borderRadius: radius.medium,
    height: '100%',
    width: `${value}%`,
  }),
}))
