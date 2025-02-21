import { StyleSheet } from 'react-native-unistyles'
import themes from './themes'

export default function configureStyleSheet() {
  StyleSheet.configure({
    settings: {
      initialTheme: 'light',
    },
    themes,
  })
}
