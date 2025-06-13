import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ color, radius, spacing }) => ({
  background: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
  },
  handle: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
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
