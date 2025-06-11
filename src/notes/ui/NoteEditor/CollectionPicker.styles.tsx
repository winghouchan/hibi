import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ colors, radii, spacing }) => ({
  background: {
    backgroundColor: colors.neutral[0].background,
    borderRadius: radii[4],
  },
  handle: {
    backgroundColor: colors.neutral[0].background,
    borderRadius: radii[4],
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
