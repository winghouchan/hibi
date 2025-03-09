import { ScrollView, ScrollViewProps, View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props =
  | ({ scrollable?: true } & ScrollViewProps)
  | ({ scrollable: false } & ViewProps)

const styles = StyleSheet.create((theme, { insets }) => ({
  view: {
    flex: 1,
  },

  contentContainer: {
    gap: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingLeft: insets.left + theme.spacing[4],
    paddingRight: insets.right + theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
}))

function isScrollView(
  scrollable: boolean,
  props: ScrollViewProps | ViewProps,
): props is ScrollViewProps {
  return scrollable
}

export default function Main({ scrollable = true, style, ...props }: Props) {
  if (isScrollView(scrollable, props)) {
    const { contentContainerStyle, ...scrollViewProps } = props

    return (
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        style={[styles.view, style]}
        {...scrollViewProps}
      />
    )
  } else {
    return <View style={[styles.view, style]} {...props} />
  }
}
