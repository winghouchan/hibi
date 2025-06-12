import { radius, size } from '../../tokens'
import * as typography from './typography'

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
  radius,
  size,
  spacing,
  ...typography,
}
