import * as typography from './typography'

const borderWidths = [0, 1, 2, 4] as const

const radii = [0, 4, 8, 12, 16, 20, 24, 28, 999, '50%'] as const

const sizes = [0, 1, 2, 4, 6, 8] as const

const spacing = [0, 4, 8, 12, 16, 24, 32, 48] as const

const boxShadows = [
  {
    blurRadius: radii[0],
    inset: false,
    offsetX: 0,
    offsetY: 0,
    spreadDistance: 0,
  },
  {
    blurRadius: radii[0],
    inset: false,
    offsetX: 0,
    offsetY: 4,
    spreadDistance: 0,
  },
] as const

export default {
  borderWidths,
  boxShadows,
  radii,
  sizes,
  spacing,
  ...typography,
}
