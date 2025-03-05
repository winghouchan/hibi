import { ScrollView, ScrollViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme, { insets }) => ({
  view: {
    flex: 1,
  },

  contentContainer: {
    gap: theme.spacing[2],
    paddingTop: theme.spacing[2],
    paddingLeft: insets.left + theme.spacing[4],
    paddingRight: insets.right + theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
}))

export default function Main({
  contentContainerStyle,
  style,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      style={[styles.view, style]}
      {...props}
    />
  )
}
