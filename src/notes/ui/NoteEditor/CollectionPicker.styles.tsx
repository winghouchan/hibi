import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ colors, radius, spacing }) => ({
  background: {
    backgroundColor: colors.background.default,
    borderRadius: radius[16],
  },
  handle: {
    backgroundColor: colors.background.default,
    borderRadius: radius[16],
  },
  header: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.normal,
  },
  list: {
    flex: 1,
  },
  sheet: {
    flex: 1,
  },
}))

export default styles
