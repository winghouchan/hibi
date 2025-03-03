import breakpoints from './breakpoints'
import light from './light'

const themes = {
  light,
}

type Breakpoints = typeof breakpoints
type Themes = typeof themes

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends Breakpoints {}
  export interface UnistylesThemes extends Themes {}
}

export default themes
