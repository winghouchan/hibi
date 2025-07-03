import { Pressable, PressableProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ size }) => ({
  pressable: {
    height: size[40],
    flexDirection: 'row',
  },
}))

export default function Option({ children, ...props }: PressableProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.pressable} {...props}>
      {children}
    </Pressable>
  )
}
