import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const style = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing[4],
  },
}))

/**
 * Must be an arrow function otherwise changes to Story `args` do not cause
 * re-renders (for some undetermined reason).
 */
export default (Story: React.ComponentType) => {
  return (
    <View style={style.container}>
      <Story />
    </View>
  )
}
