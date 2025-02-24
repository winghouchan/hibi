import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create((theme) => ({
  track: {
    backgroundColor: theme.colors.neutral[3],
    borderRadius: theme.radii[3],
    height: theme.fontSizes[0],
    width: '100%',
  },

  indicator: (value: number) => ({
    backgroundColor: theme.colors.neutral[7],
    borderRadius: theme.radii[3],
    height: '100%',
    width: `${value}%`,
  }),
}))
