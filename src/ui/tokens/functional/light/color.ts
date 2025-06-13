import { color } from '../../base'

export default {
  background: {
    default: color.neutral[0],
    inverse: color.neutral[10],
    muted: color.neutral[1],
    transparent: color.transparent,
  },

  foreground: {
    danger: color.red[7],
    default: color.neutral[10],
    inverse: color.neutral[0],
    muted: color.neutral[5],
  },

  borders: {
    danger: color.red[7],
    default: color.neutral[3],
    emphasis: color.neutral[4],
  },
} as const
