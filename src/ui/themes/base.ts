const colors = {
  black: 'black',
  white: 'white',
  transparent: 'transparent',
} as const

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36] as const

const radii = [0, 4, 8, 12, 16, 20, 24, 28, 999, '50%'] as const

const spacing = [0, 4, 8, 12, 16, 24, 32, 48] as const

export default {
  colors,
  fontSizes,
  radii,
  spacing,
}
