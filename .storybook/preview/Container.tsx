import { ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const style = StyleSheet.create((theme) => ({
  view: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing[4],
    justifyContent: 'center',
    padding: theme.spacing[4],
  },
}))

/**
 * Must be an arrow function otherwise changes to Story `args` do not cause
 * re-renders (for some undetermined reason).
 */
export default (Story: React.ComponentType) => {
  return (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={style.content}
      style={style.view}
    >
      <Story />
    </ScrollView>
  )
}
