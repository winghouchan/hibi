import { useHeaderHeight } from '@react-navigation/elements'
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  ScrollView,
  ScrollViewProps,
  View,
  ViewProps,
} from 'react-native'
import style from './style'

function Layout({ style: _style, ...props }: KeyboardAvoidingViewProps) {
  const headerHeight = useHeaderHeight()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={
        Platform.OS === 'android' ? headerHeight / 2 : headerHeight
      }
      style={[style.screen, _style]}
      {...props}
    />
  )
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
