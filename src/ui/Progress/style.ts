import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme) => ({
  track: {
    backgroundColor: theme.colors.secondary[0].shadow,
    borderRadius: theme.radii[3],
    height: theme.text.label.small.fontSize,
    width: '100%',
  },

  indicator: (value: number) => ({
    backgroundColor: theme.colors.secondary[0].foreground,
    borderRadius: theme.radii[3],
    height: '100%',
    width: `${value}%`,
  }),
}))
