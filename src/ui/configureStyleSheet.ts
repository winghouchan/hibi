import { StyleSheet } from 'react-native-unistyles'
import { breakpoint as breakpoints } from './tokens/base'
import * as themes from './tokens/functional'

type Breakpoints = typeof breakpoints
type Themes = typeof themes

declare module 'react-native-unistyles' {
  /* eslint-disable-next-line @typescript-eslint/no-empty-object-type --
   * `interface ... extends` is required for declaration merging */
  export interface UnistylesBreakpoints extends Breakpoints {}

  /* eslint-disable-next-line @typescript-eslint/no-empty-object-type --
   * `interface ... extends` is required for declaration merging */
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
