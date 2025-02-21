import light from './light'

const themes = {
  light,
}

type Themes = typeof themes

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends Themes {}
}

export default themes
