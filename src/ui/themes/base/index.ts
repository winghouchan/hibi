import * as typography from './typography'

const borderWidths = [0, 1, 2, 4] as const

const radii = [0, 4, 8, 12, 16, 20, 24, 28, 999, '50%'] as const

const sizes = {
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 12,
  6: 16,
  7: 20,
  8: 24,
  9: 32,
  10: 40,
} as const

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

const spacing = {
  none: sizes[0],
  condensed: sizes[4],
  normal: sizes[6],
  spacious: sizes[8],
} as const

export default {
  borderWidths,
  boxShadows,
  radii,
  sizes,
  spacing,
  ...typography,
}
