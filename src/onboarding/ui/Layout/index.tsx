import { ScrollView, ScrollViewProps, View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import style from './style'

/**
 * This style sheet needs to be defined here otherwise the bottom padding will
 * not dynamically update when the keyboard opens/closes. Root cause yet to be
 * determined. The `insets` also cannot be destructured from `runtime`.
 *
 * @see {@link} https://github.com/jpudysz/react-native-unistyles/issues/623
 */
const { screen } = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
    paddingBottom: runtime.insets.ime,
  },
}))

function Layout({ style: _style, ...props }: ViewProps) {
  return <View style={[screen, _style]} {...props} />
}

function Main({
  contentContainerStyle: _contentContainerStyle,
  style: _style,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={[style.content, _contentContainerStyle]}
      style={[style.main, _style]}
      {...props}
    />
  )
}

function Footer({ style: _style, ...props }: ViewProps) {
  return <View style={[style.footer, _style]} {...props} />
}

Layout.Main = Main
Layout.Footer = Footer

export default Layout
