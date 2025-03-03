import { StyleSheet } from 'react-native-unistyles'
import themes from './themes'
import breakpoints from './themes/breakpoints'

export default function configureStyleSheet() {
  StyleSheet.configure({
    settings: {
      initialTheme: 'light',
    },
    breakpoints,
    themes,
  })
}
