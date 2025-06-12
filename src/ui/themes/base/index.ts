import { size } from '../../tokens'
import * as typography from './typography'

const radii = [0, 4, 8, 12, 16, 20, 24, 28, 999, '50%'] as const

const borderWidths = {
  none: size[0],
  thin: size[1],
  thick: size[2],
} as const

const spacing = {
  none: size[0],
  condensed: size[8],
  normal: size[16],
  spacious: size[24],
} as const

export default {
  borderWidths,
  radii,
  size,
  spacing,
  ...typography,
}
