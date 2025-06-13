import { StyleSheet } from 'react-native-unistyles'
import { breakpoint as breakpoints } from './tokens/base'
import * as themes from './tokens/functional'

type Breakpoints = typeof breakpoints
type Themes = typeof themes

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends Breakpoints {}
  export interface UnistylesThemes extends Themes {}
}

export default function configureStyleSheet() {
  StyleSheet.configure({
    settings: {
      initialTheme: 'light',
    },
    breakpoints,
    themes,
  })
}
