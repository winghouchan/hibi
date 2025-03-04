import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ spacing }) => ({
  pressable: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'space-between',
  },
}))

export default styles
