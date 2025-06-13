import { radius as baseRadius, size } from '../../base'
import * as typography from './typography'

const borderWidth = {
  none: size[0],
  thin: size[1],
  thick: size[2],
} as const

const radius = {
  none: baseRadius[0],
  small: baseRadius[8],
  medium: baseRadius[12],
  large: baseRadius[16],
  full: baseRadius.full,
} as const

const spacing = {
  none: size[0],
  condensed: size[8],
  normal: size[16],
  spacious: size[24],
} as const

export default {
  borderWidth,
  radius,
  size,
  spacing,
  ...typography,
}
